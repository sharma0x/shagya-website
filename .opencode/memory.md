# Shayga — Agent Memory

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
