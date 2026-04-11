.PHONY: dev up down build test lint format seed backup restore clean

# Development
dev:
	@bash scripts/dev.sh

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

restart:
	docker compose down && docker compose up -d

# Testing
test:
	@echo "Running backend tests..."
	cd apps/api && python -m pytest tests/ -v --tb=short
	@echo "Running worker tests..."
	cd apps/worker && python -m pytest tests/ -v --tb=short
	@echo "Running frontend tests..."
	cd apps/web && npm test -- --watchAll=false

test-quick:
	cd apps/api && python -m pytest tests/ -v --tb=short -x
	cd apps/worker && python -m pytest tests/ -v --tb=short -x

# Linting & Formatting
lint:
	@echo "Linting backend..."
	cd apps/api && ruff check .
	@echo "Linting worker..."
	cd apps/worker && ruff check .
	@echo "Linting frontend..."
	cd apps/web && npm run lint

format:
	@echo "Formatting backend..."
	cd apps/api && ruff check --fix . && ruff format .
	@echo "Formatting worker..."
	cd apps/worker && ruff check --fix . && ruff format .
	@echo "Formatting frontend..."
	cd apps/web && npm run format

# Database
db-migrate:
	cd apps/api && alembic upgrade head

db-reset:
	cd apps/api && alembic downgrade base && alembic upgrade head

# Seeding
seed:
	@bash scripts/seed_demo.sh

# Backup & Restore
backup:
	@bash scripts/backup.sh

restore:
	@bash scripts/restore.sh

# Installation
install:
	@bash scripts/install.sh

update:
	@bash scripts/update.sh

# Province Packs
pack-ankara:
	@python scripts/build_province_pack.py ankara
pack-istanbul:
	@python scripts/build_province_pack.py istanbul
pack-izmir:
	@python scripts/build_province_pack.py izmir
pack-hatay:
	@python scripts/build_province_pack.py hatay
pack-kahramanmaras:
	@python scripts/build_province_pack.py kahramanmaras
pack-van:
	@python scripts/build_province_pack.py van

# Cleanup
clean:
	docker compose down -v
	docker system prune -f
	rm -rf .next node_modules apps/api/__pycache__ apps/worker/__pycache__

# Health check
health:
	@curl -s http://localhost:3000/api/health | python -m json.tool

# Logs
logs:
	docker compose logs -f

logs-api:
	docker compose logs -f api

logs-web:
	docker compose logs -f web

logs-worker:
	docker compose logs -f worker
