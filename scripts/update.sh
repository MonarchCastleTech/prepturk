#!/usr/bin/env bash
set -euo pipefail

# prepturk Update Script
# Usage: bash scripts/update.sh

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)

log_info "Starting prepturk update..."

# Step 1: Backup current state
log_info "Creating pre-update backup..."
BACKUP_DIR="backups/pre-update-${TIMESTAMP}"
mkdir -p "$BACKUP_DIR"

# Backup database
log_info "Dumping database..."
docker compose exec -T db pg_dump -U "${POSTGRES_USER:-prepturk}" "${POSTGRES_DB:-prepturk}" > "$BACKUP_DIR/db_dump.sql" 2>/dev/null || {
  log_warn "Database dump failed, continuing anyway..."
}

# Backup storage
if [ -d "storage" ]; then
  log_info "Archiving storage..."
  tar czf "$BACKUP_DIR/storage.tar.gz" storage/ 2>/dev/null || log_warn "Storage archive failed"
fi

# Backup current .env
if [ -f .env ]; then
  cp .env "$BACKUP_DIR/.env.backup"
fi

log_info "Backup saved to: $BACKUP_DIR"

# Step 2: Pull latest changes (if in git repo)
if [ -d .git ]; then
  log_info "Pulling latest changes from git..."
  git fetch origin

  CURRENT_BRANCH=$(git branch --show-current)
  log_info "Current branch: $CURRENT_BRANCH"

  git pull origin "$CURRENT_BRANCH" || log_warn "Git pull failed, continuing with existing code"
else
  log_warn "Not a git repository, skipping git pull"
fi

# Step 3: Build images
log_info "Building Docker images..."
docker compose build

# Step 4: Start updated services
log_info "Starting updated services..."
docker compose up -d

# Step 5: Wait for services
log_info "Waiting for services to start..."
sleep 10

# Step 6: Run pending migrations
log_info "Running database migrations..."
docker compose exec -T api python -c "
import asyncio
import sys
sys.path.insert(0, '/app')

async def run_migrations():
    from app.db.migrations.env import run_migrations
    await run_migrations()
    print('Migrations completed.')

asyncio.run(run_migrations())
" 2>/dev/null || {
  log_warn "Migration script failed, attempting alembic upgrade..."
  docker compose exec -T api alembic upgrade head 2>/dev/null || log_warn "Alembic migration also failed"
}

# Step 7: Verify services
log_info "Verifying services..."
sleep 5

API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health 2>/dev/null || echo "000")

if [ "$API_HEALTH" = "200" ]; then
  log_info "API is healthy (HTTP $API_HEALTH)"
else
  log_warn "API health check returned HTTP $API_HEALTH"
  log_warn "Check logs with: docker compose logs api"
fi

# Step 8: Print success message
echo ""
log_info "============================================"
log_info "  prepturk updated successfully!"
log_info "============================================"
log_info ""
log_info "Pre-update backup: $BACKUP_DIR"
log_info ""
log_info "Access the application at:"
log_info "  Frontend: http://localhost:3000"
log_info "  API:      http://localhost:8000"
log_info ""
log_info "If something went wrong, restore backup:"
log_info "  bash scripts/restore.sh $BACKUP_DIR"
log_info ""
log_info "============================================"
