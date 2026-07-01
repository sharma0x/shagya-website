.PHONY: help \
        install \
        dev \
        build start \
        lint format typecheck \
        test test-watch test-coverage test-e2e test-all \
        infra-up infra-down infra-logs infra-reset \
        seed \
        db-migrate db-migrate-create db-seed db-generate-types \
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
	@echo "  make seed             Seed database: download images → seed data + credentials"
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
	@echo "  make db-seed          Seed only (no infra/migration steps)"
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

SEED_EMAIL = admin@shayga.in
ifneq ($(SEED_ADMIN_EMAIL),)
  SEED_EMAIL = $(SEED_ADMIN_EMAIL)
endif

SEED_PASSWORD = admin123
ifneq ($(SEED_ADMIN_PASSWORD),)
  SEED_PASSWORD = $(SEED_ADMIN_PASSWORD)
endif

seed: ## Seed database: download images → seed data → print credentials
	@echo ""
	@echo "========================================"
	@echo "  Shayga — Seed Database"
	@echo "========================================"
	@echo ""
	@echo "Step 1/2  Downloading seed images (skips existing)..."
	@bash scripts/download-images.sh
	@echo ""
	@echo "Step 2/2  Seeding database with dummy data..."
	@SEED_ADMIN_EMAIL="$(SEED_EMAIL)" SEED_ADMIN_PASSWORD="$(SEED_PASSWORD)" pnpm seed
	@echo ""
	@echo "========================================"
	@echo "  Seed complete!"
	@echo "========================================"
	@echo "  App:      http://localhost:3000"
	@echo "  Admin:    http://localhost:3000/admin"
	@echo "  Email:    $(SEED_EMAIL)"
	@echo "  Password: $(SEED_PASSWORD)"
	@echo "========================================"
	@echo ""

# ============================================================================
# Database
# ============================================================================

db-migrate: ## Run pending database migrations
	pnpm payload migrate
	pnpm dlx @better-auth/cli migrate --config src/lib/auth.ts -y

db-migrate-preview: ## Run pending database migrations against preview environment
	@if [ ! -f .env.preview ]; then echo "❌ .env.preview not found."; exit 1; fi
	@set -a && . ./.env.preview && set +a && pnpm payload migrate
	@set -a && . ./.env.preview && set +a && pnpm dlx @better-auth/cli migrate --config src/lib/auth.ts -y

db-migrate-prod: ## Run pending database migrations against production environment
	@if [ ! -f .env.production ]; then echo "❌ .env.production not found."; exit 1; fi
	@echo "⚠️  WARNING: You are about to migrate PRODUCTION."
	@read -p "Are you sure? [y/N] " ans && [ $${ans:-N} = y ]
	@set -a && . ./.env.production && set +a && pnpm payload migrate
	@set -a && . ./.env.production && set +a && pnpm dlx @better-auth/cli migrate --config src/lib/auth.ts -y

db-migrate-create: ## Create a new migration (MSG='description')
	@if [ -z "$(MSG)" ]; then \
		echo "Error: MSG is required. Usage: make db-migrate-create MSG='add products table'"; \
		exit 1; \
	fi
	pnpm payload migrate:create "$(MSG)"

db-seed: ## Seed database with sample data (uses .env)
	@set -a && [ -f .env ] && . ./.env; set +a && pnpm seed

db-seed-preview: ## Seed preview DB + R2 (sources .env.preview, no --env-file override)
	@if [ ! -f .env.preview ]; then \
		echo "❌ .env.preview not found."; \
		exit 1; \
	fi
	@set -a && . ./.env.preview && set +a && \
		node --import tsx/esm scripts/seed.ts

db-sync-media-preview: ## Re-upload local images to preview R2 (sources .env.preview)
	@if [ ! -f .env.preview ]; then \
		echo "❌ .env.preview not found."; \
		exit 1; \
	fi
	@set -a && . ./.env.preview && set +a && \
		node --import tsx/esm scripts/sync-media-to-r2.ts

db-generate-types: ## Generate Payload TypeScript types from schema
	pnpm generate:types

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
