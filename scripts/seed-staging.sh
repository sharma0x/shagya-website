#!/usr/bin/env bash
# Seed the staging stack (docker-compose.staging.yml).
#
# The deploy workflow runs migrations but never seeds, so a fresh staging
# database is completely empty — no products, pages, media or blog posts, which
# makes it impossible to actually exercise the storefront. This applies the
# same seed used locally, against the staging Postgres and the in-stack RustFS.
#
# Credentials come from .env.staging; the R2_* values are overridden to match
# the local RustFS, since .env.staging points at the real Cloudflare R2 bucket
# and seeding here must never write to remote storage.
#
# Usage: bash scripts/seed-staging.sh
set -euo pipefail

cd "$(dirname "$0")/.."

STAGING_ENV=.env.staging
[ -f "$STAGING_ENV" ] || { echo "❌ $STAGING_ENV not found"; exit 1; }

# The app container cannot run the seeder: the runner image is built with
# `pnpm install --prod`, so tsx and the other devDependencies the seed script
# needs are not present inside it. Run it from the host repo instead, against
# the published staging ports.
echo "==> Seeding staging database (from host)..."

docker compose -f docker-compose.staging.yml up -d postgres storage

echo "==> Waiting for postgres..."
for _ in $(seq 1 30); do
  if docker compose -f docker-compose.staging.yml exec -T postgres \
       pg_isready -U shayga -d shayga >/dev/null 2>&1; then break; fi
  sleep 2
done

# Wait for the host-forwarded ports to accept connections before connecting.
for p in 15432 19000; do
  for _ in $(seq 1 30); do
    nc -z 127.0.0.1 "$p" >/dev/null 2>&1 && break
    sleep 1
  done
done

# Build the connection string from .env.staging rather than hardcoding the
# password — a credential literal in a tracked file is a secret-scanner finding
# even when it is only a local dev password. The host/port are rewritten to the
# published staging ports; the user and password come from the env file.
STAGING_DB_USER=$(node -e '
  const fs = require("fs")
  const line = fs.readFileSync(".env.staging", "utf8").split("\n").find((l) => l.startsWith("DATABASE_URL="))
  const u = new URL(line.slice("DATABASE_URL=".length))
  process.stdout.write(`${u.username}:${decodeURIComponent(u.password)}`)
')
DB_USER="${STAGING_DB_USER%%:*}"
DB_PASS="${STAGING_DB_USER#*:}"

# The seeder needs the repo's devDependencies (tsx) and an .env to satisfy the
# seed script's `--env-file=.env`. The CI runner does a bare `actions/checkout`,
# so neither exists there — install them when missing. On a normal dev machine
# both are already present, so this is a no-op.
if [ ! -d node_modules ] || [ ! -f .env ]; then
  echo "==> Installing dependencies for the seeder (bare checkout)..."
  pnpm install --frozen-lockfile

  # The seed script is invoked with --env-file=.env. Every value it needs is
  # already exported below, so an empty file is enough to satisfy the flag.
  [ -f .env ] || : > .env
fi

DATABASE_URL="postgresql://${DB_USER}:${DB_PASS}@127.0.0.1:15432/shayga" \
R2_ENDPOINT="http://127.0.0.1:19000" \
R2_BUCKET="shayga-media" \
R2_REGION="us-east-1" \
R2_ACCESS_KEY_ID="${R2_ACCESS_KEY_ID:-$(grep -m1 '^R2_ACCESS_KEY_ID=' "$STAGING_ENV" | cut -d= -f2-)}" \
R2_SECRET_ACCESS_KEY="${R2_SECRET_ACCESS_KEY:-$(grep -m1 '^R2_SECRET_ACCESS_KEY=' "$STAGING_ENV" | cut -d= -f2-)}" \
SEED_ADMIN_EMAIL="${SEED_ADMIN_EMAIL:-staging@shayga.local}" \
SEED_ADMIN_PASSWORD="${SEED_ADMIN_PASSWORD:-staging-admin-123}" \
  pnpm seed

echo ""
echo "==> Verifying..."
for t in products pages media collections; do
  n=$(docker compose -f docker-compose.staging.yml exec -T postgres \
        psql -U shayga -d shayga -tAc "select count(*) from ${t};" | tr -d '[:space:]')
  echo "  ${t}: ${n}"
done
