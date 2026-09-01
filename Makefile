.PHONY: help \
        install \
        dev \
        build start \
        lint format typecheck \
        test test-watch test-coverage test-e2e test-all ci-local \
        infra-up infra-down infra-logs infra-reset \
        provision-init provision-plan provision-apply provision-deploy \
        provision-allow-ip provision-deny-ip provision-allow-me provision-destroy \
        seed-local seed-preview seed-production \
        reset-local reset-preview-dangerous reset-production-dangerous \
        db-migrate db-migrate-create db-generate-types \
        release \
        setup clean clean-all \
        docker-build docker-up docker-down docker-reset docker-logs \
        prod-login prod-pull prod-migrate prod-up prod-down prod-restart prod-logs prod-deploy \
        prod-ssh prod-env-show prod-env-set prod-env-push prod-recreate prod-redeploy deploy \
        ghcr-build ghcr-push ghcr-build-push docker-build-ghcr docker-push-ghcr \
        docker-test-pull docker-test-image docker-test-logs docker-test-stop

# ============================================================================
# Help
# ============================================================================

help: ## Show this help message
	@echo "Shayga — Available Commands"
	@echo "============================"
	@echo ""
	@echo "Production VPS Deployment (GHCR + Docker Compose):"
	@echo "  make prod-deploy      Deploy full stack (pull image → migrate DB → start app)"
	@echo "  make prod-pull        Pull GHCR image (Usage: make prod-pull [TAG=latest])"
	@echo "  make prod-migrate     Run Payload & Better Auth migrations on prod DB"
	@echo "  make prod-up          Start production containers (Caddy + App)"
	@echo "  make prod-down        Stop production containers"
	@echo "  make prod-logs        Stream production container logs"
	@echo "  make prod-login       Login to GitHub Container Registry"
	@echo ""
	@echo "Local Image Build & Push (GHCR):"
	@echo "  make ghcr-build       Build production Docker image locally (Usage: make ghcr-build [TAG=latest])"
	@echo "  make ghcr-push        Push locally built image to GHCR (Usage: make ghcr-push [TAG=latest])"
	@echo "  make ghcr-build-push  Build and push custom-tagged image in one step"
	@echo ""
	@echo "Remote Deployment (from your machine → production VPS):"
	@echo "  make deploy           Build+push a tag, then deploy it to production (make deploy TAG=latest)"
	@echo "  make prod-redeploy    Pull + migrate + up a tag on the VPS (make prod-redeploy TAG=latest)"
	@echo "  make prod-env-set     Set env var(s) in production + recreate app (make prod-env-set R2_BUCKET=shayga-media)"
	@echo "  make prod-env-push    Replace the whole production env file + recreate app (make prod-env-push FILE=infra/.env.production)"
	@echo "  make prod-env-show    Show the production env file (or one var: make prod-env-show KEY=R2_BUCKET)"
	@echo "  make prod-recreate    Recreate the app containers (picks up env changes)"
	@echo "  make prod-ssh         SSH into the production VPS"
	@echo ""
	@echo "Local Container Image Testing:"
	@echo "  make docker-test-pull Pull image locally for testing (Usage: make docker-test-pull [TAG=testing])"
	@echo "  make docker-test-image Run image locally with env file (Usage: make docker-test-image [TAG=testing] [ENV_FILE=.env] [PORT=3000])"
	@echo "  make docker-test-logs View logs of local test container"
	@echo "  make docker-test-stop Stop and remove local test container"
	@echo ""
	@echo "Local CI Pipeline Simulation:"
	@echo "  make ci-local         Run full CI validation locally (format, lint, typecheck, test, build)"
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
	@echo "  make infra-minio-public Set MinIO bucket to public (download)"
	@echo ""
	@echo "Provision + Deploy (Terraform, infra/provision):"
	@echo "  make provision-init     Initialize Terraform for infra/provision"
	@echo "  make provision-plan     Plan RDS + VPS + deploy"
	@echo "  make provision-apply    Provision RDS + VPS and deploy"
	@echo "  make provision-deploy   Redeploy a tag to the existing VPS (EXISTING_VPS_ID=..., DOCKER_TAG=...)"
	@echo "  make provision-allow-ip Allow a public IP for RDS+SSH (IP=1.2.3.4)"
	@echo "  make provision-deny-ip  Remove a public IP from RDS+SSH (IP=1.2.3.4)"
	@echo "  make provision-allow-me Allow your current public IP for RDS+SSH"
	@echo "  make provision-destroy  DESTROY RDS + VPS (DANGEROUS, needs confirmation)"
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

ci-local: ## Run full CI pipeline validation locally (format check, lint, typecheck, tests, build)
	@echo "================================================="
	@echo "  Running Full CI Pipeline Locally"
	@echo "================================================="
	@echo ""
	@echo ">>> [1/5] Checking Formatting (Prettier)..."
	pnpm format:check
	@echo ""
	@echo ">>> [2/5] Running ESLint..."
	pnpm lint
	@echo ""
	@echo ">>> [3/5] Checking Types (TypeScript)..."
	pnpm typecheck
	@echo ""
	@echo ">>> [4/5] Running Unit & Component Tests..."
	pnpm test
	@echo ""
	@echo ">>> [5/5] Building Next.js & Payload..."
	PAYLOAD_SECRET=ci-secret-placeholder-32-chars-minimum-length BETTER_AUTH_SECRET=ci-secret-placeholder-32-chars-minimum-length NEXT_PUBLIC_SERVER_URL=http://localhost:3000 pnpm build
	@echo ""
	@echo "✓ All CI pipeline checks passed successfully!"

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

infra-minio-public: ## Set MinIO local bucket to public (download)
	docker exec shayga-minio sh -c "mc alias set local http://localhost:9000 minioadmin minioadmin && mc anonymous set download local/shayga-media"

# ============================================================================
# Provisioning + Deploy (Terraform — infra/provision, the canonical config)
# ============================================================================

TF_DIR ?= infra/provision
DOCKER_TAG ?= latest
EXISTING_VPS_ID ?=

# Sensitive values (db_password, ssh_public_key) live in
# infra/provision/terraform.tfvars (gitignored) and are auto-loaded by terraform.
# Admin IPs live in infra/provision/allowed_ips.txt (gitignored), one per line.

provision-init: ## Initialize Terraform for infra/provision
	cd $(TF_DIR) && terraform init

provision-plan: ## Plan provisioning + deploy (reads terraform.tfvars + allowed_ips.txt)
	cd $(TF_DIR) && terraform plan

provision-apply: ## Provision RDS + VPS and deploy (reads terraform.tfvars + allowed_ips.txt)
	cd $(TF_DIR) && terraform apply

provision-deploy: ## Redeploy a tag to the existing VPS (Usage: make provision-deploy EXISTING_VPS_ID=i-xxxx DOCKER_TAG=latest)
	@if [ -z "$(EXISTING_VPS_ID)" ]; then \
		echo "Error: EXISTING_VPS_ID is required (the EC2 instance ID)."; exit 1; \
	fi
	cd $(TF_DIR) && terraform apply -auto-approve \
		-var="create_rds=false" \
		-var="create_vps=false" \
		-var="existing_vps_instance_id=$(EXISTING_VPS_ID)" \
		-var="docker_tag=$(DOCKER_TAG)" \
		-replace=terraform_data.deploy

# --- IP allowlisting (allowed_ips.txt) ---------------------------------------
# These grant BOTH RDS (5432) and SSH (22) access to the given public IP.

provision-allow-ip: ## Allow a public IP for RDS+SSH (Usage: make provision-allow-ip IP=1.2.3.4)
	@if [ -z "$(IP)" ]; then echo "Error: IP is required, e.g. make provision-allow-ip IP=1.2.3.4"; exit 1; fi
	@grep -qxF "$(IP)" $(TF_DIR)/allowed_ips.txt || echo "$(IP)" >> $(TF_DIR)/allowed_ips.txt
	cd $(TF_DIR) && terraform apply -auto-approve

provision-deny-ip: ## Remove a public IP from RDS+SSH access (Usage: make provision-deny-ip IP=1.2.3.4)
	@if [ -z "$(IP)" ]; then echo "Error: IP is required, e.g. make provision-deny-ip IP=1.2.3.4"; exit 1; fi
	@grep -vx "$(IP)" $(TF_DIR)/allowed_ips.txt > $(TF_DIR)/allowed_ips.txt.tmp && mv $(TF_DIR)/allowed_ips.txt.tmp $(TF_DIR)/allowed_ips.txt
	cd $(TF_DIR) && terraform apply -auto-approve

provision-allow-me: ## Allow your current public IP for RDS+SSH
	@IP=$$(curl -s --max-time 10 https://checkip.amazonaws.com | tr -d ' \n'); \
	if grep -qxF "$$IP" $(TF_DIR)/allowed_ips.txt; then \
		echo "IP already allowed: $$IP"; \
	else \
		echo "$$IP" >> $(TF_DIR)/allowed_ips.txt; \
		echo "Allowed IP: $$IP"; \
	fi
	cd $(TF_DIR) && terraform apply -auto-approve

provision-destroy: ## DESTROY RDS + VPS (needs confirmation; blocked by prevent_destroy)
	@echo "⚠️  WARNING: This will DESTROY the RDS and VPS (a final RDS snapshot is taken)."
	@echo "⚠️  Resources have prevent_destroy=true. To proceed you must first set"
	@echo "⚠️  prevent_destroy = false in infra/provision/main.tf (3 places) and run"
	@echo "⚠️  'make provision-apply', then re-run this target."
	@read -p "Type 'DANGEROUS' to confirm: " ans && [ "$$ans" = "DANGEROUS" ]
	cd $(TF_DIR) && terraform destroy -auto-approve

# ============================================================================
# Seed (one-stop command — works on a completely fresh database)
# ============================================================================

# ============================================================================
# Database
# ============================================================================

db-migrate: ## Run pending database migrations
	pnpm payload migrate
	pnpm exec better-auth migrate --config src/lib/auth.ts -y

db-migrate-preview: ## Run pending database migrations against preview environment
	@if [ ! -f infra/.env.preview ]; then echo "❌ infra/.env.preview not found."; exit 1; fi
	pnpm exec dotenvx run -f infra/.env.preview -o -- pnpm payload migrate
	pnpm exec dotenvx run -f infra/.env.preview -o -- pnpm exec better-auth migrate --config src/lib/auth.ts -y

db-migrate-prod: ## Run pending database migrations against production environment
	@if [ ! -f infra/.env.production ]; then echo "❌ infra/.env.production not found."; exit 1; fi
	@echo "⚠️  WARNING: You are about to migrate PRODUCTION."
	@read -p "Are you sure? [y/N] " ans && [ $${ans:-N} = y ]
	pnpm exec dotenvx run -f infra/.env.production -o -- pnpm payload migrate
	pnpm exec dotenvx run -f infra/.env.production -o -- pnpm exec better-auth migrate --config src/lib/auth.ts -y

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
	@pnpm exec dotenvx run -f infra/.env.preview -o -- node --import tsx/esm scripts/seed.ts

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
	@pnpm exec dotenvx run -f infra/.env.production -o -- node --import tsx/esm scripts/seed.ts

db-sync-media-preview: ## Re-upload local images to preview R2 (sources infra/.env.preview)
	@if [ ! -f infra/.env.preview ]; then echo "❌ infra/.env.preview not found."; exit 1; fi
	pnpm exec dotenvx run -f infra/.env.preview -o -- node --import tsx/esm scripts/sync-media-to-r2.ts

db-sync-media-prod: ## Re-upload local images to production R2 (sources infra/.env.production)
	@if [ ! -f infra/.env.production ]; then echo "❌ infra/.env.production not found."; exit 1; fi
	@echo "⚠️  WARNING: You are about to sync media to PRODUCTION R2."
	@read -p "Are you sure? [y/N] " ans && [ $${ans:-N} = y ]
	pnpm exec dotenvx run -f infra/.env.production -o -- node --import tsx/esm scripts/sync-media-to-r2.ts

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
	pnpm exec dotenvx run -f infra/.env.preview -o -- node --import tsx/esm scripts/reset-infra.ts

reset-production-dangerous: ## Reset production infrastructure (nuke production DB + prod R2 bucket)
	@if [ ! -f infra/.env.production ]; then echo "❌ infra/.env.production not found."; exit 1; fi
	@echo "⚠️  WARNING: You are about to RESET PRODUCTION database and storage."
	@read -p "Are you sure? Type 'DANGEROUS' to confirm: " ans && [ "$$ans" = "DANGEROUS" ]
	@echo ""
	@echo "========================================"
	@echo "  Shayga — Reset Production Infrastructure"
	@echo "========================================"
	@echo ""
	pnpm exec dotenvx run -f infra/.env.production -o -- node --import tsx/esm scripts/reset-infra.ts

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

# ============================================================================
# Docker — Local Container Stack
# ============================================================================

docker-build: ## Build the local Docker image
	docker compose build

docker-up: ## Start all local services (app + postgres + minio + mailpit)
	docker compose up -d

docker-down: ## Stop all local services
	docker compose down

docker-reset: ## Stop all local services and delete volumes (fresh start)
	docker compose down -v

docker-logs: ## Tail logs from all local services
	docker compose logs -f

# ============================================================================
# Production VPS Operations (GHCR + Docker Compose + Caddy)
# ============================================================================

PROD_COMPOSE = docker compose -f docker-compose.prod.yml
TAG ?= latest
IMAGE_TAG ?= $(TAG)
DOCKER_IMAGE ?= ghcr.io/sharma0x/shagya-website
ENV_FILE ?= $(if $(wildcard .env.production),.env.production,.env)
PORT ?= 3000

prod-login: ## Log in to GitHub Container Registry (requires GH_TOKEN / GITHUB_TOKEN)
	@echo "Logging into GitHub Container Registry..."
	@if [ -z "$$GH_TOKEN" ] && [ -z "$$GITHUB_TOKEN" ]; then \
		echo "Error: GH_TOKEN or GITHUB_TOKEN environment variable required."; \
		exit 1; \
	fi
	@echo "$${GH_TOKEN:-$$GITHUB_TOKEN}" | docker login ghcr.io -u "$${GH_USER:-sharma0x}" --password-stdin

prod-pull: ## Pull production Docker image (Usage: make prod-pull [TAG=latest] [ENV_FILE=.env])
	@if [ ! -f $(ENV_FILE) ]; then echo "❌ Environment file '$(ENV_FILE)' not found."; exit 1; fi
	ENV_FILE=$(ENV_FILE) IMAGE_TAG=$(IMAGE_TAG) DOCKER_IMAGE=$(DOCKER_IMAGE) $(PROD_COMPOSE) pull app

prod-migrate: ## Run migrations safely against database in a one-off container (Usage: make prod-migrate [ENV_FILE=.env])
	@if [ ! -f $(ENV_FILE) ]; then echo "❌ Environment file '$(ENV_FILE)' not found."; exit 1; fi
	@echo "Running Payload & Better Auth migrations on database using $(ENV_FILE)..."
	ENV_FILE=$(ENV_FILE) IMAGE_TAG=$(IMAGE_TAG) DOCKER_IMAGE=$(DOCKER_IMAGE) $(PROD_COMPOSE) run --rm --no-deps app sh -c "npx payload migrate && npx better-auth migrate --config src/lib/auth.ts -y"

prod-up: ## Start production stack (Caddy + App replicas + Redis) (Usage: make prod-up [ENV_FILE=.env])
	@if [ ! -f $(ENV_FILE) ]; then echo "❌ Environment file '$(ENV_FILE)' not found."; exit 1; fi
	ENV_FILE=$(ENV_FILE) IMAGE_TAG=$(IMAGE_TAG) DOCKER_IMAGE=$(DOCKER_IMAGE) $(PROD_COMPOSE) up -d --remove-orphans

prod-down: ## Stop production stack
	$(PROD_COMPOSE) down

prod-restart: ## Restart production services
	$(PROD_COMPOSE) restart

prod-logs: ## View live logs from production services
	$(PROD_COMPOSE) logs -f

prod-deploy: ## One-stop deployment: Pull image -> Run migrations -> Start containers
	@echo "================================================="
	@echo "  Deploying Shayga Production (Tag: $(IMAGE_TAG), Env: $(ENV_FILE))"
	@echo "================================================="
	@$(MAKE) prod-pull IMAGE_TAG=$(IMAGE_TAG) ENV_FILE=$(ENV_FILE)
	@$(MAKE) prod-migrate IMAGE_TAG=$(IMAGE_TAG) ENV_FILE=$(ENV_FILE)
	@$(MAKE) prod-up IMAGE_TAG=$(IMAGE_TAG) ENV_FILE=$(ENV_FILE)
	@echo ""
	@echo "✓ Deployment complete! Container status:"
	@$(PROD_COMPOSE) ps

# ============================================================================
# Local Image Build & GHCR Operations
# ============================================================================

ghcr-build: ## Build production Docker image locally with a custom tag (Usage: make ghcr-build [TAG=latest])
	@echo "Building Docker image $(DOCKER_IMAGE):$(TAG) (linux/amd64)..."
	docker build --platform linux/amd64 --build-arg NODE_ENV=production --build-arg NEXT_TELEMETRY_DISABLED=1 -t $(DOCKER_IMAGE):$(TAG) .

ghcr-push: ## Push locally built Docker image to GHCR (Usage: make ghcr-push [TAG=latest])
	@echo "Pushing $(DOCKER_IMAGE):$(TAG) to GHCR..."
	docker push $(DOCKER_IMAGE):$(TAG)

ghcr-build-push: ghcr-build ghcr-push ## Build and push custom-tagged Docker image in one command (Usage: make ghcr-build-push [TAG=latest])

# Aliases for backwards compatibility
docker-build-ghcr: ghcr-build
docker-push-ghcr: ghcr-push

# ============================================================================
# Production Deployment (remote via SSH) — run from your LOCAL machine
# ============================================================================

# SSH host of the production VPS
PROD_VPS ?= ubuntu@35.154.104.225
# The deploy script names the env file .env.production.<vps-id> (the EC2
# instance ID). Set to match. Find it: `make prod-ssh`, then `ls .env.production.*`
PROD_ENV_FILE ?= .env.production.i-0b8fdac5ef38c22ad
PROD_REMOTE_DIR ?= /opt/shayga

prod-ssh: ## SSH into the production VPS
	ssh $(PROD_VPS)

prod-env-show: ## Show the production env file (or one var: make prod-env-show KEY=R2_BUCKET)
	@if [ -n "$(KEY)" ]; then \
		ssh $(PROD_VPS) "grep '^$(KEY)=' $(PROD_REMOTE_DIR)/$(PROD_ENV_FILE)"; \
	else \
		ssh $(PROD_VPS) "cat $(PROD_REMOTE_DIR)/$(PROD_ENV_FILE)"; \
	fi

prod-env-set: ## Set env var(s) in production + recreate app (make prod-env-set KEY=value [KEY2=value2 ...])
	@if [ -z "$(MAKEOVERRIDES)" ]; then echo "Usage: make prod-env-set KEY=value (e.g. make prod-env-set R2_BUCKET=shayga-media)"; exit 1; fi
	@for pair in $(MAKEOVERRIDES); do \
		key=$${pair%%=*}; value=$${pair#*=}; \
		echo "Setting $$key=$$value ..."; \
		ssh $(PROD_VPS) "cd $(PROD_REMOTE_DIR) && { grep -q \"^$$key=\" $(PROD_ENV_FILE) && sed -i \"s|^$$key=.*|$$key=$$value|\" $(PROD_ENV_FILE) || printf '%s=%s\n' \"$$key\" \"$$value\" >> $(PROD_ENV_FILE); }"; \
	done
	@$(MAKE) prod-recreate

prod-env-push: ## Replace the whole production env file with a local one + recreate app (make prod-env-push FILE=infra/.env.production)
	@if [ -z "$(FILE)" ] || [ ! -f "$(FILE)" ]; then echo "Usage: make prod-env-push FILE=infra/.env.production"; exit 1; fi
	@echo "Replacing $(PROD_ENV_FILE) on $(PROD_VPS) with $(FILE)..."
	@scp $(FILE) $(PROD_VPS):$(PROD_REMOTE_DIR)/$(PROD_ENV_FILE)
	@$(MAKE) prod-recreate

prod-recreate: ## Recreate the app containers (picks up env-file changes)
	@ssh $(PROD_VPS) "cd $(PROD_REMOTE_DIR) && make prod-up ENV_FILE=$(PROD_ENV_FILE) IMAGE_TAG=$(IMAGE_TAG)"

prod-redeploy: ## Pull image + migrate + up on the production VPS (make prod-redeploy TAG=latest)
	@echo "Deploying $(IMAGE_TAG) to $(PROD_VPS)..."
	@ssh $(PROD_VPS) "cd $(PROD_REMOTE_DIR) && make prod-deploy ENV_FILE=$(PROD_ENV_FILE) IMAGE_TAG=$(IMAGE_TAG)"

deploy: ghcr-build-push prod-redeploy ## Build+push a tag, then deploy it to production (make deploy TAG=latest)

# ============================================================================
# Local Container Image Testing
# ============================================================================

docker-test-pull: ## Pull a specific image from GHCR to test locally (Usage: make docker-test-pull [TAG=testing])
	docker pull $(DOCKER_IMAGE):$(TAG)

docker-test-image: ## Run container locally for testing (Usage: make docker-test-image [TAG=testing] [ENV_FILE=.env] [PORT=3000])
	@if [ ! -f $(ENV_FILE) ]; then echo "❌ Environment file '$(ENV_FILE)' not found."; exit 1; fi
	@echo "Stopping any existing test container..."
	-docker rm -f shayga-test-app 2>/dev/null || true
	@echo "Starting $(DOCKER_IMAGE):$(TAG) with $(ENV_FILE) on port $(PORT)..."
	docker run -d \
		--name shayga-test-app \
		--env-file $(ENV_FILE) \
		-p $(PORT):3000 \
		$(DOCKER_IMAGE):$(TAG)
	@echo "✓ Test container is running at http://localhost:$(PORT)"
	@echo "  View logs: make docker-test-logs"
	@echo "  Stop container: make docker-test-stop"

docker-test-logs: ## View logs from the local test container
	docker logs -f shayga-test-app

docker-test-stop: ## Stop and remove the local test container
	-docker rm -f shayga-test-app 2>/dev/null || true
	@echo "✓ Test container stopped."

