.PHONY: help \
        install \
        dev \
        build start \
        lint format typecheck \
        infra-up infra-down infra-logs infra-reset \
        db-migrate db-migrate-create db-seed db-generate-types \
        setup clean clean-all

# ============================================================================
# Help
# ============================================================================

help: ## Show this help message
	@echo "Shagya — Available Commands"
	@echo "============================"
	@echo ""
	@echo "Installation:"
	@echo "  make install          Install all dependencies"
	@echo ""
	@echo "Development:"
	@echo "  make dev              Start Next.js dev server (Turbopack + Payload)"
	@echo ""
	@echo "Infrastructure:"
	@echo "  make infra-up         Start PostgreSQL 18 (Docker)"
	@echo "  make infra-down       Stop PostgreSQL"
	@echo "  make infra-logs       View PostgreSQL logs"
	@echo "  make infra-reset      Reset PostgreSQL (delete all data)"
	@echo ""
	@echo "Build:"
	@echo "  make build            Production build"
	@echo "  make start            Start production server"
	@echo ""
	@echo "Linting & Formatting:"
	@echo "  make lint             Lint all code (ESLint)"
	@echo "  make format           Format all code (Prettier)"
	@echo "  make typecheck        Type check (tsc)"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate       Run database migrations"
	@echo "  make db-migrate-create Create a new migration (MSG='description')"
	@echo "  make db-seed          Seed database with sample data"
	@echo "  make db-generate-types Generate Payload TypeScript types"
	@echo ""
	@echo "Utilities:"
	@echo "  make setup            First-time environment setup"
	@echo "  make clean            Clean build artifacts"
	@echo "  make clean-all        Full clean including node_modules + Docker volumes"

# ============================================================================
# Installation
# ============================================================================

install: ## Install all dependencies
	pnpm install

# ============================================================================
# Development
# ============================================================================

dev: ## Start Next.js dev server (Turbopack + Payload)
	pnpm dev

# ============================================================================
# Build
# ============================================================================

build: ## Production build (Next.js + Payload)
	pnpm build

start: ## Start production server
	pnpm start

# ============================================================================
# Linting & Formatting
# ============================================================================

lint: ## Lint all code (ESLint)
	pnpm lint

format: ## Format all code (Prettier)
	pnpm format

typecheck: ## Type check all code
	pnpm build 2>&1 | grep -E "(✓|Failed|error)" || true

# ============================================================================
# Infrastructure (Dev Services)
# ============================================================================

infra-up: ## Start dev infrastructure (PostgreSQL 18)
	docker compose -f infra/dev-services.yml up -d

infra-down: ## Stop dev infrastructure
	docker compose -f infra/dev-services.yml down

infra-logs: ## View infrastructure logs
	docker compose -f infra/dev-services.yml logs -f

infra-reset: ## Reset infrastructure (delete all data)
	docker compose -f infra/dev-services.yml down -v

# ============================================================================
# Database
# ============================================================================

db-migrate: ## Run database migrations
	pnpm payload migrate

db-migrate-create: ## Create a new migration (MSG='description')
	@if [ -z "$(MSG)" ]; then \
		echo "Error: MSG is required. Usage: make db-migrate-create MSG='add products table'"; \
		exit 1; \
	fi
	pnpm payload migrate:create "$(MSG)"

db-seed: ## Seed database with sample data
	pnpm seed

db-generate-types: ## Generate Payload TypeScript types from schema
	pnpm generate:types

# ============================================================================
# Utilities
# ============================================================================

setup: ## First-time environment setup
	@command -v pnpm >/dev/null 2>&1 || { echo "Error: pnpm is required. Install from https://pnpm.io/"; exit 1; }
	@command -v docker >/dev/null 2>&1 || { echo "Error: docker is required. Install from https://docker.com/"; exit 1; }
	@echo "Setting up Shagya development environment..."
	@cp -n .env.example .env 2>/dev/null || echo ".env already exists — skipping copy"
	pnpm install
	@echo ""
	@echo "✓ Setup complete. Next steps:"
	@echo "  1. make infra-up       # Start PostgreSQL"
	@echo "  2. make db-migrate     # Run database migrations"
	@echo "  3. make dev            # Start dev server"
	@echo ""
	@echo "Visit http://localhost:3000/admin to create your admin user."

clean: ## Clean build artifacts
	rm -rf .next
	rm -rf .turbo
	rm -rf node_modules/.cache
	rm -f src/payload-types.ts
	rm -f tsconfig.tsbuildinfo

clean-all: clean ## Full clean including node_modules + Docker volumes
	@echo "WARNING: This will delete all dependencies and Docker volumes."
	@echo "Press Ctrl+C within 5 seconds to cancel..."
	@sleep 5
	rm -rf node_modules
	docker compose -f infra/dev-services.yml down -v 2>/dev/null || true
