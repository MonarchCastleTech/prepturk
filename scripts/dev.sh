#!/usr/bin/env bash
set -euo pipefail

# prepturk Development Script
# Usage: bash scripts/dev.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

log_info "Starting prepturk in development mode..."

# Create necessary directories
mkdir -p storage/{originals,extracted,previews,thumbnails,vault,exports}
mkdir -p data
mkdir -p backups

# Create .env if not exists
if [ ! -f .env ]; then
  log_info "Creating .env from .env.example..."
  cp .env.example .env
  SECRET_KEY=$(openssl rand -hex 32 2>/dev/null || echo "dev-secret-key-for-testing")
  sed -i.bak "s/APP_SECRET_KEY=change-this-to-a-secure-random-string/APP_SECRET_KEY=${SECRET_KEY}/" .env 2>/dev/null || true
  rm -f .env.bak
fi

# Start docker compose
log_info "Starting Docker Compose services..."
docker compose up -d --build

# Wait for services
log_info "Waiting for services to start..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health 2>/dev/null || echo "000")
  if [ "$API_HEALTH" = "200" ]; then
    log_info "API is ready (HTTP $API_HEALTH)"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  sleep 3
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  log_warn "API did not become healthy in time. Check logs: docker compose logs -f api"
fi

# Run database initialization
log_info "Initializing database..."
docker compose exec -T api python -c "
import asyncio
import sys
sys.path.insert(0, '/app')

async def init():
    from app.db.engine import get_engine
    from app.db.models.base import Base
    engine = get_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await engine.dispose()
    print('Database initialized.')

asyncio.run(init())
" 2>/dev/null || log_warn "Database init skipped"

# Seed demo data
log_info "Seeding demo data..."
bash "$PROJECT_ROOT/scripts/seed_demo.sh" || log_warn "Demo data seeding failed"

# Print dev status
echo ""
log_info "============================================"
log_info "  Development environment ready!"
log_info "============================================"
log_info ""
log_info "  Frontend:  http://localhost:3000"
log_info "  API:       http://localhost:8000"
log_info "  API Docs:  http://localhost:8000/docs"
log_info "  PgAdmin:   http://localhost:5432"
log_info ""
log_info "Useful commands:"
log_info "  docker compose logs -f api    # API logs"
log_info "  docker compose logs -f worker # Worker logs"
log_info "  docker compose logs -f web    # Frontend logs"
log_info "  docker compose down           # Stop all"
log_info "  docker compose restart api    # Restart API"
log_info ""
log_info "Watching for changes in:"
log_info "  apps/api/       - Backend code"
log_info "  apps/web/       - Frontend code"
log_info "  content/        - Content manifests"
log_info "============================================"

# Optional: follow logs if requested
if [ "${1:-}" = "--logs" ] || [ "${1:-}" = "-l" ]; then
  log_info "Following logs (Ctrl+C to stop)..."
  docker compose logs -f
fi
