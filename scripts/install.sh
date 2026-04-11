#!/usr/bin/env bash
set -euo pipefail

# prepturk Install Script for Debian/Ubuntu
# Usage: sudo bash scripts/install.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  log_error "This script must be run as root (use sudo)"
  exit 1
fi

log_info "Starting prepturk installation..."

# Step 1: Check system requirements
log_info "Checking system requirements..."

if ! command -v docker &> /dev/null; then
  log_error "Docker is not installed. Install Docker first:"
  log_error "  curl -fsSL https://get.docker.com | sh"
  exit 1
fi

if ! docker compose version &> /dev/null; then
  log_error "Docker Compose is not installed or not available."
  log_error "Install Docker Compose plugin:"
  log_error "  apt-get install docker-compose-plugin"
  exit 1
fi

DOCKER_VERSION=$(docker --version | grep -oP '\d+\.\d+\.\d+' | head -1)
log_info "Docker version: $DOCKER_VERSION"

COMPOSE_VERSION=$(docker compose version | grep -oP '\d+\.\d+\.\d+' | head -1)
log_info "Docker Compose version: $COMPOSE_VERSION"

# Step 2: Create .env from .env.example
if [ ! -f .env ]; then
  log_info "Creating .env from .env.example..."
  cp .env.example .env

  # Generate a secure secret key
  SECRET_KEY=$(openssl rand -hex 32)
  sed -i "s/APP_SECRET_KEY=change-this-to-a-secure-random-string/APP_SECRET_KEY=${SECRET_KEY}/" .env

  # Set production defaults
  sed -i "s/APP_ENV=development/APP_ENV=production/" .env
  sed -i "s/LOG_LEVEL=INFO/LOG_LEVEL=WARNING/" .env
  sed -i "s/SESSION_COOKIE_SECURE=false/SESSION_COOKIE_SECURE=true/" .env

  log_info ".env file created with secure defaults."
else
  log_warn ".env already exists, skipping creation."
fi

# Step 3: Create necessary directories
log_info "Creating directories..."
mkdir -p storage/{originals,extracted,previews,thumbnails,vault,exports}
mkdir -p data
mkdir -p backups
mkdir -p content/manifests/province-packs
mkdir -p content/manifests/sources
mkdir -p content/manifests/taxonomy

chown -R 1000:1000 storage data 2>/dev/null || true

log_info "Directories created."

# Step 4: Pull and start services
log_info "Pulling Docker images..."
docker compose pull

log_info "Starting services..."
docker compose up -d

# Step 5: Wait for services to be healthy
log_info "Waiting for services to be healthy..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  HEALTHY_COUNT=$(docker compose ps --format json 2>/dev/null | grep -c '"healthy"' || true)
  TOTAL_COUNT=$(docker compose ps --format json 2>/dev/null | grep -c '"running"' || true)

  if [ "$HEALTHY_COUNT" -ge 2 ] 2>/dev/null; then
    log_info "Services are healthy ($HEALTHY_COUNT/$TOTAL_COUNT)"
    break
  fi

  RETRY_COUNT=$((RETRY_COUNT + 1))
  sleep 5
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  log_warn "Some services may not be fully healthy yet. Check with: docker compose ps"
fi

# Step 6: Run database initialization
log_info "Running database initialization..."
docker compose exec -T api python -c "
import asyncio
import sys
sys.path.insert(0, '/app')
from app.db.engine import get_engine
from app.db.models.base import Base

async def init():
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print('Database tables created.')

asyncio.run(init())
" 2>/dev/null || log_warn "Database init skipped (tables may already exist)"

# Step 7: Print success message
echo ""
log_info "============================================"
log_info "  prepturk installed successfully!"
log_info "============================================"
log_info ""
log_info "Access the application at:"
log_info "  Frontend: http://localhost:3000"
log_info "  API:      http://localhost:8000"
log_info "  Docs:     http://localhost:8000/docs"
log_info ""
log_info "Manage with:"
log_info "  docker compose ps       # Check status"
log_info "  docker compose logs -f  # View logs"
log_info "  docker compose down     # Stop services"
log_info ""
log_info "============================================"
