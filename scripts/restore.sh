#!/usr/bin/env bash
set -euo pipefail

# prepturk Restore Script
# Usage: bash scripts/restore.sh [backup_directory]

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_ROOT"

# Step 1: List available backups or use provided path
BACKUP_DIR="${1:-}"

if [ -z "$BACKUP_DIR" ]; then
  log_info "Available backups:"
  echo ""

  if [ ! -d "backups" ] || [ -z "$(ls -A backups 2>/dev/null)" ]; then
    log_error "No backups found in backups/ directory"
    exit 1
  fi

  BACKUP_NUM=1
  declare -a BACKUP_PATHS

  for dir in backups/backup-*; do
    if [ -d "$dir" ]; then
      BACKUP_DATE=$(echo "$dir" | grep -oP '\d{8}_\d{6}' || echo "unknown")
      BACKUP_SIZE=$(du -sh "$dir" 2>/dev/null | awk '{print $1}')
      echo "  $BACKUP_NUM) $dir ($BACKUP_SIZE) - $BACKUP_DATE"
      BACKUP_PATHS+=("$dir")
      BACKUP_NUM=$((BACKUP_NUM + 1))
    fi
  done

  if [ ${#BACKUP_PATHS[@]} -eq 0 ]; then
    log_error "No valid backup directories found"
    exit 1
  fi

  echo ""
  read -rp "Select backup to restore (1-$((BACKUP_NUM - 1))): " SELECTION

  if ! [[ "$SELECTION" =~ ^[0-9]+$ ]] || [ "$SELECTION" -lt 1 ] || [ "$SELECTION" -ge "$BACKUP_NUM" ]; then
    log_error "Invalid selection"
    exit 1
  fi

  BACKUP_DIR="${BACKUP_PATHS[$((SELECTION - 1))]}"
fi

# Verify backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
  log_error "Backup directory not found: $BACKUP_DIR"
  exit 1
fi

log_info "Selected backup: $BACKUP_DIR"

# Step 2: Verify checksums
log_info "Verifying backup integrity..."
if [ -f "$BACKUP_DIR/checksums.sha256" ]; then
  cd "$BACKUP_DIR"
  if sha256sum -c checksums.sha256 --quiet 2>/dev/null; then
    log_info "All checksums verified successfully"
  else
    log_error "Checksum verification failed! Backup may be corrupted."
    read -rp "Continue anyway? (y/N): " CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
      exit 1
    fi
  fi
  cd "$PROJECT_ROOT"
else
  log_warn "No checksums file found, skipping verification"
fi

# Step 3: Warning and confirmation
echo ""
log_warn "WARNING: This will overwrite your current database and storage!"
read -rp "Are you sure you want to continue? (type YES to confirm): " CONFIRM

if [ "$CONFIRM" != "YES" ]; then
  log_info "Restore cancelled"
  exit 0
fi

# Step 4: Stop services
log_info "Stopping services..."
docker compose stop api worker web 2>/dev/null || true

# Step 5: Restore database
log_info "Restoring database..."
PG_USER="${POSTGRES_USER:-prepturk}"
PG_DB="${POSTGRES_DB:-prepturk}"

# Find database dump file
DB_DUMP=""
if [ -f "$BACKUP_DIR/db_dump.dump" ]; then
  DB_DUMP="$BACKUP_DIR/db_dump.dump"
  log_info "Restoring from custom format dump..."
  docker compose exec -T db pg_restore -U "$PG_USER" -d "$PG_DB" --clean --if-exists < "$DB_DUMP" 2>/dev/null || {
    log_warn "pg_restore failed, trying alternative method..."
    docker compose exec -T db pg_restore -U "$PG_USER" -d "$PG_DB" < "$DB_DUMP" 2>/dev/null || true
  }
elif [ -f "$BACKUP_DIR/db_dump.sql" ]; then
  DB_DUMP="$BACKUP_DIR/db_dump.sql"
  log_info "Restoring from SQL dump..."
  docker compose exec -T db psql -U "$PG_USER" -d "$PG_DB" < "$DB_DUMP" 2>/dev/null || {
    log_warn "SQL restore had errors, continuing anyway"
  }
else
  log_error "No database dump file found!"
  exit 1
fi

log_info "Database restored from: $DB_DUMP"

# Step 6: Restore storage
if [ -f "$BACKUP_DIR/storage.tar.gz" ]; then
  log_info "Restoring storage directory..."
  tar xzf "$BACKUP_DIR/storage.tar.gz" -C "$PROJECT_ROOT" 2>/dev/null || {
    log_warn "Storage restore had errors"
  }
  log_info "Storage restored"
else
  log_warn "No storage archive found, skipping storage restore"
fi

# Step 7: Restore data
if [ -f "$BACKUP_DIR/data.tar.gz" ]; then
  log_info "Restoring data directory..."
  tar xzf "$BACKUP_DIR/data.tar.gz" -C "$PROJECT_ROOT" 2>/dev/null || {
    log_warn "Data restore had errors"
  }
  log_info "Data restored"
else
  log_warn "No data archive found, skipping data restore"
fi

# Step 8: Restore .env
if [ -f "$BACKUP_DIR/.env.backup" ]; then
  log_info "Restoring .env file..."
  cp "$BACKUP_DIR/.env.backup" "$PROJECT_ROOT/.env"
fi

# Step 9: Restart services
log_info "Restarting services..."
docker compose start api worker web 2>/dev/null || true

sleep 5

# Step 10: Verify restoration
log_info "Verifying restoration..."
API_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health 2>/dev/null || echo "000")

if [ "$API_HEALTH" = "200" ]; then
  log_info "API is healthy after restore (HTTP $API_HEALTH)"
else
  log_warn "API health check returned HTTP $API_HEALTH"
  log_warn "Check logs with: docker compose logs api"
fi

# Step 11: Print summary
echo ""
log_info "============================================"
log_info "  Restore completed!"
log_info "============================================"
log_info ""
log_info "Restored from: $BACKUP_DIR"
log_info ""
log_info "Access the application at:"
log_info "  Frontend: http://localhost:3000"
log_info "  API:      http://localhost:8000"
log_info ""
log_info "If you need to restore again, run this script and select a different backup."
log_info "============================================"
