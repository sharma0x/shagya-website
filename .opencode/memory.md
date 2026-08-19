# Shayga — Agent Memory

## Vitest on this Windows machine needs --pool=forks (2026-08-19)

**Symptom:** `pnpm vitest run` (any file selection) hangs then fails with `[vitest-pool-runner]: Timeout waiting for worker to respond` — "no tests" run at all.
**Fix:** Always run `pnpm vitest run --pool=forks` locally. CI (ubuntu) is unaffected. Full suite ~110s with forks.

## migrate:create re-detects columns from hand-written migrations (2026-08-19)

**Symptom:** `pnpm payload migrate:create <name>` includes `ADD COLUMN` statements for columns that already exist in the DB (e.g. `pages_blocks_hero_images.link` from `20260819_120000_add_hero_slide_links.ts`).
**Root cause:** That migration was hand-written and has **no `.json` snapshot** — Payload's migrate:create diffs against the drizzle snapshot chain, not the live DB, so un-snapshotted columns keep reappearing.
**Fix:** Review every generated migration against the DB (`docker exec shayga-pg psql -U shayga -d shayga -c "\d <table>"`), strip statements for already-applied columns, then run it. The new migration's own `.json` snapshot records the columns, so the chain self-heals for future migrate:creates.
- Local PG runs on port **5433** (not the 5432 documented in AGENTS.md) — `.env` already points there.

## Per-Color Stock Model (2026-08-19)

- `colorVariants[].stock` is the source of truth; top-level `quantity` is auto-derived as the sum of enabled variants in Products `beforeChange` (never hand-edit both).
- Cart variant payload shape: `{ color: { id, slug, name, hex, stock } }` — `stock` is the add-time snapshot; `id` is the Colors doc ID (serialized on the PDP). `cartQtyCap()` (src/lib/cart-merge.ts) reads `variant.color.stock` first (it survives merging, where `product` is normalized to a bare ID and loses `trackQuantity`).
- Order items record `color` (rel → colors) + `colorName` (text snapshot). `/api/razorpay/verify` resolves color ID via `variant.color.id` with a slug-lookup fallback (makeColorResolver).
- Decrement on `status → confirmed` goes through `applyStockDecrement()` (src/lib/stock.ts), grouped per product in Orders `runSideEffects`. Unmatched colors (legacy orders) skip variant decrement but still bump `purchaseCount`.
- `galleryForColor(product, slug)` (src/lib/product-utils.ts) replaces `liftVariantGallery` wherever a cart/order line's color is known — `liftVariantGallery` always shows the FIRST variant's image (wrong-color bug).

## MinIO bucket needs public read policy for direct media URLs (2026-08-19)

**Symptom:** Homepage renders but zero images load; browser console shows 403s on `http://localhost:9000/shayga-media/*.jpg`. Server-side `mc ls` also says "Access Denied" until you set an explicit alias.
**Root cause:** develop's media CDN change (commit 984ef95) switched media URLs from Payload's `/api/media/file/*` route to direct S3 endpoint URLs via `generateFileURL` (`R2_ENDPOINT` fallback in dev = MinIO). Payload's route authenticated server-side; direct browser GETs hit the bucket anonymously, and `minio-create-bucket` in docker-compose only ran `mc mb` — no public policy.
**Fix:**
```bash
docker exec shayga-minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec shayga-minio mc anonymous set download local/shayga-media
```
- Durable fix committed: `minio-create-bucket` service in docker-compose.yml now runs `mc anonymous set download` after `mc mb`, so `make infra-reset` / fresh setups are covered.
- Real R2/CDN (prod) is already public — this is dev-local-only.
- Note: `mc`'s built-in `local` alias inside the minio container lacks creds for S3 ops (healthcheck `mc ready local` passes regardless) — always `mc alias set` explicitly before policy/list commands.

## RDS SG must match current public IP (recurring) (2026-08-16)

**Symptom:** After PC/network change, app containers log `cannot connect to Postgres ... Connection terminated due to connection timeout` (NOT refused — AWS SG drops packets silently) and `/api/media/*` returns 500 `"There was an error initializing Payload"` on affected replicas. Homepage may still serve cached content.
**Root cause:** `infra/terraform/rds-postgres.tf` SG rule `aws_security_group.rds_sg` only allows the current `vps_ip` (`${var.vps_ip}/32`). Home/ISP public IPs change unpredictably (verified twice: `152.57.37.243` → `49.36.137.176`).
**Fix:**
```bash
IP=$(curl -s https://api.ipify.org)
DBPASS=$(jq -r '.resources[] | select(.instances[0].attributes.password? != null) | .instances[0].attributes.password' infra/terraform/terraform.tfstate | grep -v null | head -1)
terraform -chdir=infra/terraform apply -auto-approve -var="db_password=$DBPASS" -var="vps_ip=$IP"
ENV_FILE=.env IMAGE_TAG=testing DOCKER_IMAGE=ghcr.io/sharma0x/shagya-website docker compose -f docker-compose.prod.yml restart app
```
- Containers egress via the Docker Desktop host NAT, so the host's public IP is what the SG must allow.
- `nc -vz -w 5 <rds-endpoint> 5432` is the fast reachability check; a timeout (not `refused`) = SG blocked.

## Docker Stack Media 500 — `localhost` endpoints in env (2026-08-14)

**Symptom:** Seeded data, but `<img>` shows only alt text. `/api/media/file/*` returns **500**.
**Root cause:** `R2_ENDPOINT=http://localhost:9000` in the env file used by the prod-compose stack (`ENV_FILE=.env`). Inside a container `localhost` = the container itself → s3Storage `ECONNREFUSED ::1:9000 / 127.0.0.1:9000` → media route 500. Objects were fine in MinIO (452 jpgs) and docs fine in RDS.
**Fix:** env values must be reachable from INSIDE the container: `R2_ENDPOINT=http://host.docker.internal:9000`, `MAILPIT_SMTP_HOST=host.docker.internal`, `MAILPIT_API_URL=http://host.docker.internal:8025/api/v1`. Then recreate: `ENV_FILE=.env docker compose -f docker-compose.prod.yml up -d`.
**Gotchas:**
- `host.docker.internal` resolves inside Docker Desktop containers but NOT on the macOS host itself — a single `.env` value can't serve both `make dev` (host) and the compose stack (container). If both are used, need separate env files.
- Compose recreates app containers automatically when `.env` content changes (config hash).
- `.env.production` doesn't exist at repo root; stack must be launched with `ENV_FILE=.env` (make's `prod-up` defaults to `.env` only when `.env.production` is absent — passed explicitly to be safe).

## Payload Local API Relationship Population (2026-08-06)

**`payload.find`/`findByID` populate relationship fields by default (depth >= 1) unless `depth: 0`.**

- `carts.docs[0].items[].product` comes back as a **populated object** (not the raw id) in route handlers.
- Never build keys as `` `${item.product}` `` — it stringifies to `[object Object]` and silently breaks dedupe/merge logic.
- Always normalize: `typeof p === 'object' ? p.id : p`, and treat `null`/`undefined`/empty-object variants as equivalent ("no variant").
- Cart merge bug CLO-92: `POST /api/cart` merge keys mismatched (object vs id) → duplicate line items in `carts_items`. Fixed via pure helper `src/lib/cart-merge.ts` (`mergeCartItems`/`cartMergeKey`), unit-tested in `src/lib/__tests__/cart-merge.test.ts`.
- Client also dedupes: `src/lib/store/cart.ts` calls `dedupeCartItems` in `addItem`/`loadFromServer`; `isSameVariant` treats `{}`/`null` as equal (PDP vs homepage add paths).
- `POST /api/cart` returns **401 for anonymous sessions** (requireAuth) — anonymous cart sync is a no-op by design; cart lives in localStorage until login.
- `dedupeCartItems` generic constraint: `variant` must be **optional** in the mergeable type or TS inference falls back to the constraint (type errors).
- Note: full vitest suite has ~31 pre-existing failures (Header, search, AddressForm, collection-field-count, auth-sync) that exist at HEAD — unrelated to cart work.

## Payload Migration System (2026-07-26)

**ALWAYS use migrations, never hand-craft SQL tables.**

- `push: false` in `payload.config.ts` — do NOT enable push for schema changes
- Workflow: `pnpm payload generate:db-schema` → `pnpm payload migrate:create` → review → `make db-migrate`
- If `migrate:create` fails (Payload 3.85 drizzle introspection bug), write migration `.ts` manually in `src/migrations/`
- Use generated schema file (`src/payload-generated-schema.ts`) as source of truth for column types
- Key gotcha: `_parent_id` type depends on parent table's PK type — `varchar` for `pages_blocks_hero.id` (varchar PK), `integer` for `_pages_v_blocks_hero.id` (serial PK)
- Always wrap constraints in `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN null; END $$;` for idempotency
- `payload_migrations` table tracks applied migrations — no duplicate application

## PDP Trust Signals — Admin-Editable (2026-08-08)

- Product page trust signals ("Handloom verified" etc.) live in **Site Settings global → `trustSignals`** array (icon select: shield/truck/refresh/badge/package/sparkles, title, detail). Editable at `/admin/globals/site-settings`.
- PDP renders them below the buy actions via `PDPClientSection`'s `belowActions` slot; `page.tsx` maps icon strings → lucide components via `TRUST_ICONS` (Record keyed by the generated `SiteSetting` type — adding an icon option in the global fails typecheck until mapped).
- `defaultValue` pre-fills the 3 original signals; an admin deleting all rows intentionally hides the section (frontend falls back to `DEFAULT_TRUST` only when the global was never saved).
- Fixed stale pre-existing failure: `SiteSettings.test.ts` field-count assertion now matches reality (22 fields).

## DB Reset Flow

1. `make infra-reset` (nukes Docker volumes)
2. `make infra-up`
3. `make db-migrate` (applies all migrations)
4. `make seed-local` (seeds data)

## Address Deduplication Logic (2026-08-09)

- `src/lib/address-utils.ts` provides `isSameAddress(a, b)` and `deduplicateAddresses(addresses)`.
- Normalizes case and whitespace for `fullName`, `phone`, `line1`, `line2`, `city`, `state`, `pincode`, and `country`.
- `/api/razorpay/verify`: Checks existing customer addresses before calling `payload.create` to save order's shipping address.
- `POST /api/addresses`: Checks if customer already has matching address doc. If match found, updates `isDefault` if requested and returns existing address doc instead of creating duplicate database row.
- `GET /api/addresses`: Filters customer addresses using `deduplicateAddresses` to prevent returning legacy duplicate rows.

## Payload Drafts: Publishing Gotcha (2026-08-16)

- **`payload.update({ collection, id, data, draft: false })` does NOT publish.** The `draft` param only controls validation + where data is written (versions table vs main table). To publish, you MUST pass `_status: 'published'` in `data`.
- `_status` (Payload's injected draft status) is separate from any custom `status` select field. Setting the custom field does nothing to visibility.
- Anonymous read access filters on `_status: { equals: 'published' }` (see `src/collections/Posts.ts`). Drafts are invisible on the frontend.
- **Seed bug fixed**: `scripts/seed.ts` created posts without `_status` → all seeded posts stayed drafts → blog showed "No journal entries published yet". Fix: pass `_status: post.status === 'published' ? 'published' : 'draft'` in the create data.
- One-off publish utility: `scripts/publish-posts.ts` → run `node --env-file=.env --import tsx/esm scripts/publish-posts.ts` (targets whatever `DATABASE_URL` is in `.env` = RDS).

## VPS Deploy — Caddy HTTPS on a bare Elastic IP (2026-08-16)

- **Browsers send NO SNI for IP-literal URLs**, so Caddy falls back to the default (first) site block. If that block is the domain (no cert yet) the IP request fails with `000`. Fix: set a global `default_sni {$PUBLIC_IP}` so no-SNI connections get the IP site's cert.
- Public CAs (Let's Encrypt) **will not issue certs for bare IPs** — use Caddy `tls internal` (self-signed) on the IP site. Browser shows "Not secure"; only a domain gives a trusted lock.
- `/opt/shayga` is created by root in user_data → `sudo chown -R ubuntu:ubuntu /opt/shayga` before `scp`-ing files, and `sudo usermod -aG docker ubuntu` (docker group applies on next SSH login).
- App port `3000` is `expose:`d only (internal); verify reachability through Caddy (port 80/443), not `localhost:3000`.
- Deploy files on VPS: `docker-compose.prod.yml`, `Caddyfile`, `Makefile`, `.env.production` (from `infra/.env.production`). `make prod-deploy IMAGE_TAG=testing ENV_FILE=.env.production`.
- `NEXT_PUBLIC_SERVER_URL` is read **at runtime, server-side** (`src/lib/env.ts` `getServerURL`) for Payload `serverURL` + CORS/CSRF + Better Auth `trustedOrigins`/`rpID`. It's NOT inlined client-side except via `ProductShareButton` (build-time, effectively undefined in CI image).
- **Dual-origin (domain + IP)**: set `NEXT_PUBLIC_SERVER_URL` to the canonical domain and add `EXTRA_ALLOWED_ORIGINS=https://<IP>`; `getAllowedOrigins()` (env.ts) appends it. Otherwise admin/CSRF/checkout via the non-serverURL origin 403s.
- Caddy env vars come from the container env; caddy service uses `env_file: ${ENV_FILE:-.env.production}` so `{$PUBLIC_IP}` / `{$DOMAIN_NAME}` resolve. Don't put `environment:` overrides on caddy — they take precedence over env_file.
