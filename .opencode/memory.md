# Shayga — Agent Memory

## Touch-swipe product gallery via Embla (2026-08-27)

- **`embla-carousel-react` is a direct dep** (added `pnpm add embla-carousel-react@8.6.0`); it also ships transitively via `shadcn` but pnpm strict mode means `src/` imports need it declared directly.
- `ProductGallery.tsx` wraps the PDP main image in an Embla carousel so it swipes on touch. Key bits:
  - `useEmblaCarousel({ containScroll: 'trimSnaps', watchDrag: cb })` — `watchDrag` callback gates dragging. Cast `event as PointerEvent` and only return true for `pointerType === 'touch' | 'pen'` so **desktop mouse hover-zoom still works** (mouse drag disabled). TS union on the embla event type has no `pointerType` on the `TouchEvent` variant — must cast.
  - Sync dots/thumbnails/arrows to swipe state via `emblaApi.on('select')`/`on('reInit')` → `setActiveIdx(selectedScrollSnap())`. Do **not** call `onSelect()` synchronously in the effect body — this repo's ESLint `react-hooks/set-state-in-effect` errors on it (differs from upstream shadcn carousel.tsx).
  - Reset when `imageUrls` changes (variant switch): `setActiveIdx(0)` + `emblaApi?.scrollTo(0, true)`.
  - Render container: `<div ref={emblaRef} class="overflow-hidden">` → `<div class="flex touch-pan-y">` → slides `min-w-0 shrink-0 grow-0 basis-full`. `touch-pan-y` lets vertical page scroll still work.
  - Only the active slide mounts `<ProductImageZoom>`; inactive slides render a plain `SkeletonImage` to avoid dead magnifier lens while offscreen.
  - Arrows were `opacity-0 group-hover:opacity-100` (invisible on touch) → added `max-sm:opacity-100` so mobile users see them even without hover.

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

## Product `occasion` text → `occasions` relationship (2026-09-01)

- `Products.ts` field renamed `occasion` (text) → `occasions` (relationship, `relationTo: 'occasions'`, `hasMany: true`). Field count unchanged (32), so `Products.test.ts` count assertion still holds.
- `payload migrate:create` **hung on an interactive prompt** (`occasions_id` create vs rename) — killed with `pkill -f "payload migrate:create"` and wrote the migration `.ts` by hand in `src/migrations/` following the coupons_rels pattern: add `products_rels.occasions_id` (+FK `products_rels_occasions_fk` + index `products_rels_occasions_id_idx`), same for `_products_v_rels`, then `DROP COLUMN products.occasion` / `_products_v.version_occasion`. Down reverses.
- **Filtering a hasMany relationship**: single value `where.occasions = { contains: <id> }` (proven repo pattern in `collections/[slug]/page.tsx`), multiple values `where.occasions = { in: <ids> }`. Resolve slug → id first via `payload.find({ collection: 'occasions', where: { slug: { in: slugs } } })`.
- Occasion browsing is unified on `/category/all?occasion=<slug>` (category page `buildWhere`/`CategoryProductsStream` resolves slugs). Legacy `/category/bridal` + `/category/festive` slugs still map to occasions `bridal`/`festive`.
- Filter sidebar + search no longer offer an `occasion` checkbox (removed `OCCASION_OPTIONS` from `FilterSidebar.tsx`, `occasion` from `build-where-clause.ts` multiFilters and `use-filters.ts` FILTER_LABELS).
- PDP displays occasion names from the populated `product.occasions` array (depth 2): `(product.occasions||[]).map(o => typeof o === 'object' ? o.name : null).filter(Boolean).join(', ')`.
- Homepage "Shop by Occasion" is now dynamic: `HomeOccasionsSection` fetches `occasions`, maps slug → icon via `OCCASION_ICONS`, links to `/category/all?occasion=<slug>`.
- Seed: `seed-data.ts` exports `occasions` (7 items), `seed.ts` `seedOccasions()` returns a slug→doc map consumed by `seedProducts()` (destructures `occasion` out of `...rest` so the removed field isn't passed through).

## Smart Collections blocks → homepage 500 (2026-09-02)

- **Symptom:** homepage returns "This page couldn't load / A server error occurred". Server log: `Failed query ... relation "collections_blocks_brand_rule" does not exist` (42P01). The homepage SSR query joins block tables for the `collections` collection.
- **Root cause:** commit `f6d68c3` added `isAutomated`/`matchType`/`rules` blocks (`brandRule`, `fabricRule`, `priceRule`, `tagRule`, `occasionRule`) to `Collections.ts` but **no migration was generated** — all 5 `collections_blocks_*` tables and the 2 columns were missing in the DB. `payload-generated-schema.ts` was also stale.
- **Fix:** `pnpm payload generate:db-schema` (regenerates schema from config) → `migrate:create` hung on the known interactive Drizzle prompt (`occasions_id` create vs rename — pre-existing applied migration) → killed it and wrote the migration `.ts` **by hand** (`20260902_000000_add_smart_collections_rules.ts`): 7 enum types (`enum_collections_match_type`, per-block operator/value enums), `ALTER collections ADD is_automated boolean DEFAULT false` + `ADD match_type enum DEFAULT 'all'`, then the 5 block tables with `_parent_id` FK → `collections.id` (integer, since collections PK is serial), `_path` text NOT NULL, `id` varchar PK, `block_name varchar`, relationship columns (`value_id integer` for brand/occasion, enum for fabric, `numeric` for price, `varchar` for tag), plus `_order`/`_parent_id`/`_path`/`value` indexes. Registered in `src/migrations/index.ts` (hand-written migrations have no `.json` snapshot — see 2026-08-19 note).
- `make db-migrate` applies it (66ms) and the homepage returns 200 again.

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

## Homepage Hero From Admin — Creation Workaround (2026-09-07)

- Root cause of "homepage shows static image": the Pages collection was **empty**. `src/app/(frontend)/page.tsx` fetches by `slug: 'home'`; with no doc it falls back to `/images/hero/hero-main.png`.
- **`/admin/collections/pages/create` is BROKEN** (the CLO-3 admin SSR bug): it server-redirects to the list with `?notFound=N`. Cannot create a Page (or upload media) through the admin create forms.
- Fix path (use it instead of fighting the admin UI): a local-API script like `scripts/create-home-hero.ts`, run with `node --env-file=.env --import tsx/esm scripts/create-home-hero.ts`. It uploads media via `payload.create({ collection:'media', data:{alt}, file:{data,name,mimetype,size} })` then upserts the Page.
- Upload a media file the right way: `data: { alt: '...' }` + `file: { data: <Buffer>, name, mimetype, size }` in one `payload.create` call. `overrideAccess: true` bypasses access control.
- To make a Page publicly visible: MUST set BOTH `status: 'published'` and `_status: 'published'` in the data (anonymous read filters on `_status`). Just the custom `status` field is ignored for visibility.
- **Editing an existing doc WORKS**: `/admin/collections/pages/<id>` renders the full form (Hero block, slide Images array, Background Image, reorder, links) — only *creating new* and *uploading brand-new media* via the admin UI are affected by CLO-3. If a media file already exists in the Media collection, you can pick it via "Choose from existing" and it works.
- Home page id 8 (slug `home`): slides hero-1.jpg + hero-2.jpg (Media ids 1,2), background hero-main.png (id 3), on MinIO at `/shayga-media/hero-*.jpg`.
- Dev server died mid-session (unresponsive → `lsof :3000` empty). Restart with `nohup pnpm dev > /tmp/shayga-dev.log 2>&1 &`. Autosave drafts don't survive a crash; published versions are safe.

## Pages Collection Scope + Seed `_status` Bug for Pages (2026-09-08)

- The `pages` collection is for **ALL static pages**, not just Home. `scripts/seed-data.ts` defines **26 pages** (`export const pages` at line ~1659): Home, About, FAQ, Contact, Privacy, Terms, Careers, Shipping & Returns, plus sub-page docs (delivery options, return policies, careers roles, impact/about sub-pages, etc.). Frontend routes (`/about`, `/faq`, `/privacy`, ...) fetch these by slug — no doc = placeholder/404.
- **Local DB was simply unseeded**, not intentionally empty: counts via local API → products=0, categories=0, collections=0, coupons=0 (tags=10, brands=5 = partial leftovers). `make seed-local` is the intended way to populate everything (download images → `scripts/seed.ts`).
- **Verified empirically (pages, matches the known Posts bug):** creating a Page with only `status: 'published'` but NO `_status` → returned doc has `_status: 'draft'` → **invisible** to anonymous REST (`GET /api/pages?...` → `totalDocs: 0`). `seedPages` in `scripts/seed.ts` (line ~627) passes `status` but NOT `_status`, so any seeded pages would ALSO be drafts. Same one-line fix the posts got: add `_status: page.status === 'published' ? 'published' : 'draft'` to the create data.
- Gotcha: local-API `payload.find` without `overrideAccess` may still return draft rows (observed `totalDocs=1`), while anonymous REST correctly returns 0. **REST is the source of truth for public visibility**, the same one the frontend uses.

## Delhivery Integration (2026-09-09)

- **Staging base rejects the live API token.** `https://staging-express.delhivery.com/c/api/pin-codes/json/` returns `Login or API Key Required` with the One Panel token; the token only works on prod `https://track.delhivery.com` (verified live). Staging E2E therefore requires `DELHIVERY_MODE=prod` (real prepaid order) or the portal's own sandbox proxy.
- **`createShipment` is form-encoded**: body `format=json&data=<urlencoded JSON>`, `Content-Type: application/x-www-form-urlencoded`. The `/api/c/w/create` endpoint returns `response[0].packages[].waybill`. Plain JSON bodies are rejected.
- **Vitest gotcha:** `vi.fn().mockResolvedValue(new Response(...))` returns the **same** Response object every call; the body is single-use, so a second read throws `Body is unusable` and the test fails with a bare TypeError (status undefined). Use `vi.fn().mockImplementation(() => Promise.resolve(new Response(body, { status })))` to build a fresh Response per call.
- **Payload v3 group field admin has no `collapsed` property** — TS rejects it (`FieldAdmin` union). Use `description` only.
- **Group fields → scalar columns on the parent table** (`orders.delhivery_waybill` varchar, `delhivery_manifest_response` jsonb, etc.), no rels table, no enums. Hand-write `ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS ...` migration (migrate:create hung on the known `occasions_id` interactive Drizzle prompt again — see 2026-09-01/09-02 notes).
- After adding collection fields, regenerate types **before** typechecking: `pnpm generate:types` (writes `src/payload-types.ts`); the `delhivery does not exist in ByIDOptions` errors disappear once types are refreshed.
- Payload `payload.update`/`event-logs` `json` fields need `as unknown as Record<string, unknown>` casts — `ShipmentResponse` has no string index signature.
- Orders collection endpoints precedent (`src/collections/Orders.ts`): register in `fields`-independent `endpoints` array using `req.routeParams?.id` + `req.payload`; enforce `Boolean(req.user)`. Webhook writes to `orders`/`event-logs` need `overrideAccess: true` (both collections require sessions to write).

## Deploy gotchas (2026-09-09, live prod deploy of Delhivery + live Razorpay)

- **Frontend root layout hits Payload (DB) at render** (`src/app/(frontend)/layout.tsx` fetches categories/fabric-types/brands/occasions). Any statically-prerendered route under it fails `next build` with `cannot connect to Postgres` during prerender IF the build stage has no `DATABASE_URL`. Fix: `export const dynamic = 'force-dynamic'` in the layout forces all child routes to render at request-time. This regressed in commit `5ea85ad` (drove mega menu from taxonomies) — the prior `:latest` image (2026-09-01) predates it, so its build worked.
- **GHCR push with a stale Docker Desktop credential fails** with `error from registry: unauthenticated: User cannot be authenticated with the token provided.` Fix: `gh auth token | docker login ghcr.io -u sharma0x --password-stdin` (gh CLI is authed with `write:packages`) — no need for `GH_TOKEN`/`make prod-login`.
- **`make prod-redeploy` flow after a successful local build+push**: it runs `prod-migrate` (reports "No migrations needed" — Payload applies pending migrations on app boot) then `docker compose up -d --remove-orphans` recreates `shayga-app-1`/`shayga-app-2`. Confirm the applied migration via `payload_migrations` table (query through `docker compose exec -T -e DBURL=... app node`) rather than trusting the migrate output.
- **Verify baked NEXT_PUBLIC key** in the built client bundle from inside the app container: `grep -rl rzp_live_... .next/static` (live key present, and no `rzp_test` bundle if the Dockerfile `ARG NEXT_PUBLIC_RAZORPAY_KEY_ID` + `ENV` bake and the Makefile `--build-arg` sourcing from `infra/.env.production` are wired).
- **Webhook-route health checks**: a GET on `POST`-only routes returns `405` (route exists), an empty POST returns `401` (signature check rejects) — both prove the route is live.

## Header taxonomies are client-fetched, NOT server layout (2026-09-09, deployed)

- `src/components/layout/Header.tsx` is a `'use client'` component that fetches taxonomy nav menus itself: `fetch('/api/categories?limit=100&depth=0')`, `/api/fabric-types`, `/api/brands`, `/api/occasions` — mirroring the existing `fetch('/api/globals/site-settings')` pattern in the same effect. State shape: `{ categories, fabricTypes, brands, occasions }`, each `docs[]`.
- **The (frontend)/layout.tsx must NOT call `getPayload(...).find(...)`.** A server-layout DB read forces every statically-prerendered client page to connect to Postgres during `next build`, which fails in the Docker builder stage (no `DATABASE_URL`). Commit `5ea85ad` (today) introduced this and broke the build; the fix was moving taxonomy reads to the client component and keeping the layout DB-free. This preserves static prerender / fast load (per product decision — don't add `export const dynamic = 'force-dynamic'` to fix it).
- The four taxonomy collections (`Categories`, `FabricTypes`, `Brands`, `Occasions`) have `read: () => true`, so anonymous REST `GET /api/<collection>` works for the client fetch.
- `payload.migrations` check on prod: `20260909_000000_add_order_delhivery_fulfilment_fields` is in batch 3 — confirm via `docker compose exec -T -e DBURL=... app node -e "..."` rather than trusting `prod-migrate` output ("No migrations needed").

## Live admin media upload via CDP (2026-09-10, production shayga.in)

- On the LIVE site the media create form WORKS in an authenticated browser session (the CLO-3 create-form bug is staging/dev-only). Route: `/admin/collections/media/create` → title "Creating - Media", renders "Creating new Media", the file field + Alt/Caption. Full flow proven: 10 images uploaded (Media ids 112–121) + 2 products created (26, 27) via this path.
- `chrome-devtools-axi upload` is BROKEN (v0.1.33): always `Invalid arguments for tool upload_file: Required at filePaths` regardless of target ref. **Do not use it.** Use Node CDP instead: `DOM.setFileInputFiles` on the hidden input `input.file-field__hidden-input` (has `style=display:none`, `aria-hidden=true`, `accept=image/*`) then dispatch `change` via `Runtime.evaluate`.
- Navigation races: after `Page.navigate` the React admin app hydrates late; the file input flickers in/out (SSR node → hydrated node) and a pending `beforeunload` dialog can block the DOM. Robust sequence: `chrome-devtools-axi open <create-url>` (handles this) → sleep 6s → Node CDP file-set (retry loop; success = hidden input disappears, preview shows) → set `alt` via eval on `input[name=alt]` (native setter + `input`/`change` events; axiom `fill` also works) → `eval "Array.from(document.querySelectorAll('form button')).find(x=>x.textContent.trim()==='Save').click()"` → sleep 9s → verify via `fetch('/api/media?limit=1&sort=-createdAt&depth=0')`.
- `chrome-devtools-axi dialog dismiss` clears stray beforeunload dialogs. chrome-devtools-axi must be invoked with `CHROME_DEVTOOLS_AXI_BROWSER_URL=http://127.0.0.1:9222` + `CHROME_DEVTOOLS_AXI_MCP_PATH="$(npm prefix -g)/lib/node_modules/chrome-devtools-mcp/build/src/bin/chrome-devtools-mcp.js"`.
- Creating products via the browser's own session: `eval "fetch('/api/products', {method:'POST', headers:{'Content-Type':'application/json'}, body: <JSON>})"` works and runs the beforeChange hook (auto slug, discountPercentage=40 from 2999→4999, quantity=sum of variant stock). Reusable scripts: `/var/folders/…/T/opencode/cdp-upload.mjs`, `add-flow.sh`, `create-product.mjs`.

## Product 23 hard-delete + archived enum fix in prod (2026-09-10)

- **Enum drift bug**: prod PG enum `enum_products_status`/`enum__products_v_version_status` lacked `archived`; saving a product sent `status: 'archived'` → `invalid input value for enum` (500) in admin. Payload migrations don't touch enums → hand-write `DO $$ ... ALTER TYPE ... ADD VALUE IF NOT EXISTS 'archived' EXCEPTION WHEN duplicate_object THEN null; END $$;` migration + register in `src/migrations/index.ts`. Verify applied via `payload_migrations` table, not migrate output.
- **Payload hard-delete of a doc is blocked by ANY NOT NULL FK reference** (Drizzle nullifies rels on delete): `orders_items.product_id` and `carts_items.product_id` are NOT NULL → `DrizzleQueryError: null value in column "product_id"` when deleting product 23. Fix: delete referencing rows first (3 order items, 1 cart item), then Payload delete succeeds and also cleans `_products_v` version rows. Order totals were deliberately left as recorded snapshots.
- **`npx payload run` gotchas**: script must use **top-level `await`** (un-awaited promise chains exit 0 silently before DB work finishes) and be invoked with an **absolute path** (`npx payload run /app/delete_product.ts`). Ad-hoc prod DB scripts must be `.cjs` with `require('/app/node_modules/pg')` + `process.env.DATABASE_URL` (ESM container). Copy into container via `docker compose -f docker-compose.prod.yml cp /tmp/x.cjs app:/tmp/x.cjs` then `exec -T app node /tmp/x.cjs`.

## Admin one-click Delhivery fulfilment UI (2026-09-10)

- Ship is a manual authenticated endpoint `POST /api/orders/:id/delhivery/ship` (guards: `confirmed`, prepaid, < ₹50,000, no waybill, complete address); no auto-ship on order create.
- UI added as a `type: 'ui'` field named `fulfilmentPanel` in Orders: `admin.position: 'sidebar'` renders `components.Field` (panel), `components.Cell` renders in the list column (UI fields appear in column selector by default), `label` only shows as the column header (UI field renderer returns null in edit view). Add the field name to `admin.defaultColumns` to show the column.
- Shared eligibility lives in `src/lib/delhivery/eligibility.ts` (`getShipEligibility` + `shipEligibilityForOrder`) mirroring the server guards.
- **Payload 3.86 `useFormFields(selector)` takes ONE arg** (selector over `[fields, dispatch]`), unlike older docs (`useFormFields(fn, paths)` → TS2554). Select via `WATCH_PATHS.map((p) => allFields[p])`.
- After endpoint actions, sync the form: `useForm().dispatchFields({ type: 'UPDATE', path, value })` (nested groups via `delhivery.waybill`) then `setModified(false)`. List rows refresh via `useListQuery().refineListData(query)`.

## Admin custom components need importMap regeneration (2026-09-10)

- Adding a new custom admin component (UI field Field/Cell, views, etc.) is NOT enough for prod — the checked-in `src/app/(payload)/admin/importMap.js` must be regenerated with `pnpm payload generate:importmap`, committed, and rebuilt. The Docker `next build` does NOT regenerate it in this setup.
- Symptom when skipped: build succeeds, component source strings appear in `.next/server/chunks` (config serialization), but there is NO client chunk in `.next/static` for the component (compare with a working component like SyncSmartCollectionButton), and the edit-view sidebar renders empty (`render-fields` div with no children). No console errors.
- Verify in a container: `grep -rl <ComponentName> .next/static | head` — must return a chunk. Also verify key parity after regenerating: extract map keys from old/new importMap.js and diff (regeneration may reorder/rewrite formatting).

## Delhivery waybill API returns a comma-separated JSON STRING (2026-09-10, prod fix)

- `GET https://track.delhivery.com/waybill/api/bulk/json/?count=N` returns a **bare JSON string**, NOT `{data: [...]}` and NOT an array: `count=1` → `"60528410000055"`, `count=3` → `"60528410000081,60528410000092,60528410000103"`. `fetchWaybill` must `split(',')` on the string. The old `res.data` parsing silently returned `[]` → ship failed with `502 No waybill returned by Delhivery`.
- The ship POST `POST /api/orders/:id/delhivery/ship` requires Payload cookie auth which is **Origin-gated**: curl without an `Origin: https://shayga.in` header gets `user: null` / `403 {"error":"Unauthorized"}`. Always include `origin` + the `payload-token` (and `payload-totp`) cookies when testing endpoints from the container.
- Cloudflare **replaces the origin's small 502 JSON with its own `shayga.in | 502 Bad gateway` HTML page**, so the admin panel showed the useless generic "Ship request failed." Fix pattern: read `res.text()` first, `JSON.parse` in a try/catch, and fall back to `Ship request failed (HTTP <status>).` when the body isn't JSON.

## Delhivery create.json response shape + manifest failure (2026-09-10, prod)

- `/api/cmu/create.json` returns `{ success: boolean, rmk?, packages: [{ waybill, status, remarks[], refnum }], ... }` — NOT `shipments[]`. Extract the waybill from `packages[0].waybill`. Guard: `success === false` OR any `packages[].status === 'Fail'` → the manifest was REJECTED; do NOT mark the order shipped (old code flipped status to shipped anyway → false shipped state).
- Real failure seen: remark `"Prepaid client manifest charge API failed due to insufficient balance"` → the Delhivery One account must have prepaid credit for Prepaid shipments. Add balance in the portal (one.delhivery.com), then retry ship. A fetched waybill may be consumed even if the manifest fails.
- Reset a falsely-shipped order via `PATCH /api/orders/:id` with `{ status:'confirmed', trackingId:null, trackingUrl:null, shippedAt:null, delhivery:{...nulls, shippedViaDelhivery:false} }` (readOnly is UI-only; REST accepts the group reset). Run from the authenticated browser session to satisfy the Origin-gated cookie auth.

## Delhivery label + pickup API quirks (2026-09-11, prod fix)

- **Packing slip** `GET /api/p/packing_slip?wbns=...&pdf=true&pdf_size=4R` returns `{ packages: [{ pdf_download_link: <signed S3 URL> }] }` — the URL lives in `packages[].pdf_download_link`, NOT `link`/`pdf_url`/`files[]`. `extractLabelUrl` must check packages first.
- **Pickup** `POST /fm/request/new/` returns `{ pickup_id, client_name, ... }` (key is `pickup_id`, not `pickup_request_id`). Returns HTTP 201 and is idempotent while a pickup is open for the location.
- **Timezone bug**: the old pickup default used `new Date().getHours()+1` + `toISOString().slice(0,10)` (UTC). Delhivery interprets pickup_time in **IST**, so the UTC next-hour was already past in India → `400 {"pickup_time":"Pickup time cannot be in past"}`. Fix: compute date+time in `Asia/Kolkata` via `Intl.DateTimeFormat` on `now + 1h` (`nextPickupSlotIST` in `fulfillment.ts`), always future, date-rollover safe.

## Order receipt PDFs with pdfmake 0.3 (2026-09-11)

- **`pdfmake@0.3.11` is a direct dep.** The 0.3 API differs from every old tutorial:
  - `import pdfmake from 'pdfmake'` returns a **shared singleton** (not `PdfPrinter`). No `PdfPrinter`/`createPdfKitDocument` anymore.
  - `pdfmake.createPdf(docDefinition).getBuffer()` → `Promise<Buffer>` (server). `.write(path)` also available.
  - No bundled TS types → `src/types/pdfmake.d.ts` declares the bits used (no `@types/pdfmake`, it's for the 0.2 API).
- **Fonts**: register bundled fonts by copying into the singleton virtual fs:
  ```ts
  import vfsFonts from 'pdfmake/build/vfs_fonts' // { 'Roboto-Regular.ttf': <base64>, ... }
  pdfmake.virtualfs.writeFileSync(name, new Uint8Array(Buffer.from(b64, 'base64')))
  pdfmake.setFonts({ Roboto: { normal: 'Roboto-Regular.ttf', bold: 'Roboto-Medium.ttf', ... } })
  ```
  Descriptors MUST be strings (vfs paths/URLs) — `Printer.resolveUrls` treats every descriptor as a URL and crashes on raw bytes.
- **jsdom/vitest gotcha**: store fonts as `new Uint8Array(Buffer...)`, NOT `Buffer` — pdfkit's `src instanceof Uint8Array` fails cross-realm in the jsdom test env and throws "Not a supported font format or standard PDF font".
- Call `setUrlAccessPolicy(() => false)` + `setLocalAccessPolicy(() => false)` to silence warnings and harden.
- Verify PDF content without a viewer: `gs -sDEVICE=txtwrite -o - file.pdf` (ghostscript) or render PNGs with `-sDEVICE=png16m`.
- Receipt auth pattern: `GET /api/orders/receipt?orderNumber=...&email=...` — session owners match via customers lookup; guests prove ownership by supplying the checkout email (case-insensitive compare against `order.customerEmail`). Order docs fetched with `depth: 1` so `item.product.name` resolves.

## Cart price snapshot bug (2026-09-12)

- Carts stored `unitPrice`/`product.basePrice` at add-time (localStorage + server carts + order items). An admin price change left cart, checkout summary AND the created order at the OLD price.
- Fix: price is now server-authoritative. `src/lib/cart-prices.ts` (`resolveCurrentPrices`) resolves each product's current `basePrice`; applied in `/api/cart` GET+POST, `/api/razorpay/create-order` and `/api/razorpay/verify` (both guest and logged-in). Client `useCart.refreshPrices()` re-prices against `/api/products?where[id][in]=...` when the drawer/checkout loads; `loadFromServer` prefers `product.basePrice`.

## Delhivery operational config moved to Site Settings (2026-09-12)

- Pickup location/pin, client name, seller name/address/phone/email are now CMS-managed (Site Settings → Delhivery Shipping group), NOT env vars. `getDelhiverySettings(payload)` reads them; `getDelhiveryConfig()` keeps only secrets/mode/baseUrl (apiToken, mode, webhookSecret). `migrate:create` hangs on the interactive `occasions_id` prompt — hand-write the migration (`ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS delhivery_* varchar` + `_site_settings_v` version_* cols), then `payload migrate` on deploy/boot applies it (watch the better-auth "No migrations needed" line — the payload Migrated line scrolls above).
- After removing env fallback, seed the CMS from the old env values (SQL UPDATE on site_settings) so shipping keeps working.

## CI/CD: next build needs a migrated Postgres (2026-09-12)
Root cause of all CI / Deploy-Staging failures: `next build` prerender of
`/account/addresses` connects to Postgres (`ECONNREFUSED 127.0.0.1:5432`,
`payloadInitError: true`) and the build fails. Verified locally: starting
`postgres:18-alpine` (shayga/shayga_dev/shayga), running
`pnpm exec payload migrate` then
`pnpm exec better-auth migrate --config src/lib/auth.ts -y` makes `pnpm build`
pass on an empty DB.
Pattern for build-time DB (now baked into workflows + Dockerfile):
- CI: GitHub Actions `services: postgres` container + `DATABASE_URL` env + run
  the two migrate commands before `pnpm build`.
- Docker build: `docker run -d --name shayga-builddb ... -p 0.0.0.0:5432:5432`
  then `docker build --network=host --build-arg DATABASE_URL=...`. Host network
  ONLY works on Linux runners; Docker Desktop Mac (VM) cannot reach host
  `127.0.0.1` from a build container. Keep image builds on hosted ubuntu runners.
- Dockerfile: add `ARG DATABASE_URL` + `ENV DATABASE_URL` in the **builder**
  stage only (never the runner stage — runtime URL comes from compose env_file),
  and run migrations between `COPY . .` and `next build`.
Release secret: repo has NO GH_TOKEN/NPM_TOKEN. `GH_SECRET` is the PAT — wire
release job checkout + semantic-release to `secrets.GH_SECRET`. NPM_TOKEN is
unneeded: release.config.cjs sets `npmPublish: false`.

## CI/CD: macOS self-hosted runner Docker gotchas (2026-09-12, staging verified)

- **`docker login` on the macOS staging runner fails** with `error saving
  credentials ... User interaction is not allowed. (-25308)` — Docker tries the
  osxkeychain helper, which can't prompt in a non-interactive runner. Setting
  `DOCKER_CONFIG` to a job-local dir is NOT enough on its own: with an empty/
  absent `credsStore` the Docker CLI still falls back to `osxkeychain` on macOS.
  **Fix:** write the GHCR auth straight into `$DOCKER_CONFIG/config.json` instead
  of `docker login` — `AUTH=$(printf '%s:%s' "$USER" "$TOKEN" | base64)` then
  `printf '{"auths":{"ghcr.io":{"auth":"%s"}}}' "$AUTH" > "$DOCKER_CONFIG/config.json"`.
  Plaintext `auths` needs no credential helper, so the keychain is never touched.
- **Setting `DOCKER_CONFIG` also hides the `docker compose` CLI plugin.** Plugins
  are discovered under `$DOCKER_CONFIG/cli-plugins`, not the system dirs, so
  `docker compose ...` dies with `unknown shorthand flag: 'f' in -f` (docker
  parses `-f` itself). **Fix:** symlink the plugin into the isolated config in the
  same step: `mkdir -p "$DOCKER_CONFIG/cli-plugins"` +
  `ln -sf ~/.docker/cli-plugins/docker-compose "$DOCKER_CONFIG/cli-plugins/docker-compose"`.
  (Docker Desktop installs that symlink under `~/.docker/cli-plugins/`.)
- `.docker-config/` is written into `github.workspace` — gitignore it.
- `deploy-prod` runs on Linux (EC2) where none of this applies; only the macOS
  `staging` runner needs the plaintext-auth + plugin-symlink dance.
- **Stale field-count tests block CI after CMS field additions.** `Pages.test.ts`
  (7→8, `header` group) and `SiteSettings.test.ts` (22→23) failed because the
  feature commits that added fields didn't update the count assertions. The
  earlier memory note claiming SiteSettings was "22 fields / matches reality"
  is superseded — it is 23 now.
