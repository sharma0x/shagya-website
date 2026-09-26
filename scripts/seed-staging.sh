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

DATABASE_URL="postgresql://shayga:${STAGING_DB_PASSWORD:-shayga_dev}@127.0.0.1:15432/shayga" \
R2_ENDPOINT="http://127.0.0.1:19000" \
R2_BUCKET="shayga-media" \
R2_REGION="us-east-1" \
R2_ACCESS_KEY_ID="minioadmin" \
R2_SECRET_ACCESS_KEY="minioadmin" \
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
