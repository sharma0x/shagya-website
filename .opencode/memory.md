# Shayga — Agent Memory

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

## DB Reset Flow

1. `make infra-reset` (nukes Docker volumes)
2. `make infra-up`
3. `make db-migrate` (applies all migrations)
4. `make seed-local` (seeds data)
