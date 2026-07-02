.PHONY: help \
        install \
        dev \
        build start \
        lint format typecheck \
        test test-watch test-coverage test-e2e test-all \
        infra-up infra-down infra-logs infra-reset \
        seed-local seed-preview seed-production \
        reset-local reset-preview-dangerous reset-production-dangerous \
        db-migrate db-migrate-create db-generate-types \
        release \
        setup clean clean-all

# ============================================================================
# Help
# ============================================================================

help: ## Show this help message
	@echo "Shayga — Available Commands"
	@echo "============================"
	@echo ""
	@echo "Quick start:"
	@echo "  make seed-local       Seed local database (download images + seed data)"
	@echo "  make seed-preview     Seed preview database (download images + seed data)"
	@echo "  make seed-production  Seed production database (download images + seed data)"
	@echo ""
	@echo "  make reset-local      Reset local database & MinIO storage"
	@echo "  make reset-preview-dangerous Reset preview database & R2 storage"
	@echo "  make reset-production-dangerous Reset production database & R2 storage"
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
	@echo "Testing:"
	@echo "  make test             Run unit + component tests (Vitest)"
	@echo "  make test-watch       Run tests in watch mode"
	@echo "  make test-coverage    Run tests with coverage"
	@echo "  make test-e2e         Run E2E tests (Playwright)"
	@echo "  make test-all         Run all tests"
	@echo ""
	@echo "Database:"
	@echo "  make db-migrate       Run pending migrations"
	@echo "  make db-migrate-create Create a new migration (MSG='description')"
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
	pnpm typecheck

# ============================================================================
# Testing
# ============================================================================

test: ## Run unit + component tests (Vitest)
	pnpm test

test-watch: ## Run tests in watch mode
	pnpm test:watch

test-coverage: ## Run tests with coverage report
	pnpm test:coverage

test-e2e: ## Run end-to-end tests (Playwright)
	pnpm test:e2e

test-e2e-install: ## Install Playwright browsers
	pnpm test:e2e:install

test-all: ## Run all tests (unit + e2e)
	pnpm test:all

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
# Seed (one-stop command — works on a completely fresh database)
# ============================================================================

# ============================================================================
# Database
# ============================================================================

db-migrate: ## Run pending database migrations
	pnpm payload migrate
	pnpm dlx @better-auth/cli migrate --config src/lib/auth.ts -y

db-migrate-preview: ## Run pending database migrations against preview environment
	@if [ ! -f infra/.env.preview ]; then echo "❌ infra/.env.preview not found."; exit 1; fi
	pnpm dlx @dotenvx/dotenvx run -f infra/.env.preview -o -- pnpm payload migrate
	pnpm dlx @dotenvx/dotenvx run -f infra/.env.preview -o -- pnpm dlx @better-auth/cli migrate --config src/lib/auth.ts -y

db-migrate-prod: ## Run pending database migrations against production environment
	@if [ ! -f infra/.env.production ]; then echo "❌ infra/.env.production not found."; exit 1; fi
	@echo "⚠️  WARNING: You are about to migrate PRODUCTION."
	@read -p "Are you sure? [y/N] " ans && [ $${ans:-N} = y ]
	pnpm dlx @dotenvx/dotenvx run -f infra/.env.production -o -- pnpm payload migrate
	pnpm dlx @dotenvx/dotenvx run -f infra/.env.production -o -- pnpm dlx @better-auth/cli migrate --config src/lib/auth.ts -y

db-migrate-create: ## Create a new migration (MSG='description')
	@if [ -z "$(MSG)" ]; then \
		echo "Error: MSG is required. Usage: make db-migrate-create MSG='add products table'"; \
		exit 1; \
	fi
	pnpm payload migrate:create "$(MSG)"

seed-local: ## Seed local database: download images → seed data
	@echo ""
	@echo "========================================"
	@echo "  Shayga — Seed Local Database"
	@echo "========================================"
	@echo ""
	@echo "Step 1/2  Downloading seed images (skips existing)..."
	@bash scripts/download-images.sh
	@echo ""
	@echo "Step 2/2  Seeding database with dummy data..."
	@pnpm seed

seed-preview: ## Seed preview database: download images → seed data
	@if [ ! -f infra/.env.preview ]; then echo "❌ infra/.env.preview not found."; exit 1; fi
	@echo ""
	@echo "========================================"
	@echo "  Shayga — Seed Preview Database"
	@echo "========================================"
	@echo ""
	@echo "Step 1/2  Downloading seed images (skips existing)..."
	@bash scripts/download-images.sh
	@echo ""
	@echo "Step 2/2  Seeding database with dummy data..."
	@pnpm dlx @dotenvx/dotenvx run -f infra/.env.preview -o -- node --import tsx/esm scripts/seed.ts

seed-production: ## Seed production database: download images → seed data
	@if [ ! -f infra/.env.production ]; then echo "❌ infra/.env.production not found."; exit 1; fi
	@echo "⚠️  WARNING: You are about to seed PRODUCTION."
	@read -p "Are you sure? [y/N] " ans && [ $${ans:-N} = y ]
	@echo ""
	@echo "========================================"
	@echo "  Shayga — Seed Production Database"
	@echo "========================================"
	@echo ""
	@echo "Step 1/2  Downloading seed images (skips existing)..."
	@bash scripts/download-images.sh
	@echo ""
	@echo "Step 2/2  Seeding database with dummy data..."
	@pnpm dlx @dotenvx/dotenvx run -f infra/.env.production -o -- node --import tsx/esm scripts/seed.ts

db-sync-media-preview: ## Re-upload local images to preview R2 (sources infra/.env.preview)
	@if [ ! -f infra/.env.preview ]; then echo "❌ infra/.env.preview not found."; exit 1; fi
	pnpm dlx @dotenvx/dotenvx run -f infra/.env.preview -o -- node --import tsx/esm scripts/sync-media-to-r2.ts

db-sync-media-prod: ## Re-upload local images to production R2 (sources infra/.env.production)
	@if [ ! -f infra/.env.production ]; then echo "❌ infra/.env.production not found."; exit 1; fi
	@echo "⚠️  WARNING: You are about to sync media to PRODUCTION R2."
	@read -p "Are you sure? [y/N] " ans && [ $${ans:-N} = y ]
	pnpm dlx @dotenvx/dotenvx run -f infra/.env.production -o -- node --import tsx/esm scripts/sync-media-to-r2.ts

db-generate-types: ## Generate Payload TypeScript types from schema
	pnpm generate:types

reset-local: ## Reset local infrastructure (nuke local DB + local MinIO bucket)
	@echo ""
	@echo "========================================"
	@echo "  Shayga — Reset Local Infrastructure"
	@echo "========================================"
	@echo ""
	@node --env-file=.env --import tsx/esm scripts/reset-infra.ts

reset-preview-dangerous: ## Reset preview infrastructure (nuke preview DB + preview R2 bucket)
	@if [ ! -f infra/.env.preview ]; then echo "❌ infra/.env.preview not found."; exit 1; fi
	@echo "⚠️  WARNING: You are about to RESET PREVIEW database and storage."
	@read -p "Are you sure? Type 'DANGEROUS' to confirm: " ans && [ "$$ans" = "DANGEROUS" ]
	@echo ""
	@echo "========================================"
	@echo "  Shayga — Reset Preview Infrastructure"
	@echo "========================================"
	@echo ""
	pnpm dlx @dotenvx/dotenvx run -f infra/.env.preview -o -- node --import tsx/esm scripts/reset-infra.ts

reset-production-dangerous: ## Reset production infrastructure (nuke production DB + prod R2 bucket)
	@if [ ! -f infra/.env.production ]; then echo "❌ infra/.env.production not found."; exit 1; fi
	@echo "⚠️  WARNING: You are about to RESET PRODUCTION database and storage."
	@read -p "Are you sure? Type 'DANGEROUS' to confirm: " ans && [ "$$ans" = "DANGEROUS" ]
	@echo ""
	@echo "========================================"
	@echo "  Shayga — Reset Production Infrastructure"
	@echo "========================================"
	@echo ""
	pnpm dlx @dotenvx/dotenvx run -f infra/.env.production -o -- node --import tsx/esm scripts/reset-infra.ts

# ============================================================================
# Release (semantic-release)
# ============================================================================

release: ## Run semantic-release locally (requires GH_TOKEN env var)
	pnpm release

# ============================================================================
# Utilities
# ============================================================================

setup: ## First-time environment setup
	@command -v pnpm >/dev/null 2>&1 || { echo "Error: pnpm is required. Install from https://pnpm.io/"; exit 1; }
	@command -v docker >/dev/null 2>&1 || { echo "Error: docker is required. Install from https://docker.com/"; exit 1; }
	@echo "Setting up Shayga development environment..."
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
