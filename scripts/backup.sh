#!/usr/bin/env bash
set -euo pipefail

# prepturk Backup Script
# Usage: bash scripts/backup.sh

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
BACKUP_DIR="backups/backup-${TIMESTAMP}"

log_info "Starting backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"
log_info "Backup directory: $BACKUP_DIR"

# Step 1: Dump PostgreSQL database
log_info "Dumping PostgreSQL database..."
PG_USER="${POSTGRES_USER:-prepturk}"
PG_DB="${POSTGRES_DB:-prepturk}"

docker compose exec -T db pg_dump -U "$PG_USER" -Fc "$PG_DB" > "$BACKUP_DIR/db_dump.dump" 2>/dev/null || {
  log_warn "Binary dump failed, trying plain SQL..."
  docker compose exec -T db pg_dump -U "$PG_USER" "$PG_DB" > "$BACKUP_DIR/db_dump.sql" 2>/dev/null || {
    log_error "Database dump failed completely!"
    exit 1
  }
}

DB_SIZE=$(du -h "$BACKUP_DIR/db_dump"* 2>/dev/null | awk '{print $1}' | head -1)
log_info "Database dump size: ${DB_SIZE:-unknown}"

# Step 2: Archive storage directory
if [ -d "storage" ]; then
  log_info "Archiving storage directory..."
  tar czf "$BACKUP_DIR/storage.tar.gz" -C "$PROJECT_ROOT" storage/ 2>/dev/null || {
    log_warn "Storage archive failed"
  }
  STORAGE_SIZE=$(du -h "$BACKUP_DIR/storage.tar.gz" 2>/dev/null | awk '{print $1}')
  log_info "Storage archive size: ${STORAGE_SIZE:-unknown}"
else
  log_warn "Storage directory not found, skipping"
fi

# Step 3: Archive data directory
if [ -d "data" ]; then
  log_info "Archiving data directory..."
  tar czf "$BACKUP_DIR/data.tar.gz" -C "$PROJECT_ROOT" data/ 2>/dev/null || {
    log_warn "Data archive failed"
  }
  DATA_SIZE=$(du -h "$BACKUP_DIR/data.tar.gz" 2>/dev/null | awk '{print $1}')
  log_info "Data archive size: ${DATA_SIZE:-unknown}"
else
  log_warn "Data directory not found, skipping"
fi

# Step 4: Backup .env file
if [ -f .env ]; then
  cp .env "$BACKUP_DIR/.env.backup"
  log_info "Backed up .env file"
fi

# Step 5: Create checksums for all backup files
log_info "Creating checksums..."
cd "$BACKUP_DIR"
sha256sum * > checksums.sha256 2>/dev/null || true
cd "$PROJECT_ROOT"

# Step 6: Output backup manifest
MANIFEST_FILE="$BACKUP_DIR/manifest.json"
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | awk '{print $1}')
FILE_COUNT=$(ls -1 "$BACKUP_DIR" 2>/dev/null | wc -l)

cat > "$MANIFEST_FILE" << EOF
{
  "backup_timestamp": "${TIMESTAMP}",
  "backup_date": "$(date -Iseconds)",
  "project_root": "${PROJECT_ROOT}",
  "backup_directory": "${BACKUP_DIR}",
  "total_size": "${TOTAL_SIZE}",
  "file_count": ${FILE_COUNT},
  "files": [
$(for f in "$BACKUP_DIR"/*; do
  if [ -f "$f" ] && [ "$(basename "$f")" != "manifest.json" ]; then
    FNAME=$(basename "$f")
    FSIZE=$(du -h "$f" | awk '{print $1}')
    FHASH=$(sha256sum "$f" | awk '{print $1}')
    echo "    {\"filename\": \"${FNAME}\", \"size\": \"${FSIZE}\", \"sha256\": \"${FHASH}\"},"
  fi
done | sed '$ s/,$//')
  ],
  "database": {
    "user": "${PG_USER}",
    "name": "${PG_DB}",
    "dump_format": "custom_or_sql"
  },
  "checksums_file": "checksums.sha256"
}
EOF

log_info "Backup manifest written to: $MANIFEST_FILE"

# Step 7: Print summary
echo ""
log_info "============================================"
log_info "  Backup completed successfully!"
log_info "============================================"
log_info ""
log_info "Backup location: $BACKUP_DIR"
log_info "Total size: $TOTAL_SIZE"
log_info "Files: $FILE_COUNT"
log_info ""
log_info "Contents:"
ls -lh "$BACKUP_DIR" | tail -n +2
echo ""
log_info "To restore: bash scripts/restore.sh $BACKUP_DIR"
log_info "============================================"
