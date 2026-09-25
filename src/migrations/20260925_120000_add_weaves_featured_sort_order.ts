import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Adds `featured` and `sortOrder` to the weaves collection so admins can
 * curate which weaves appear as "Quick:" chips on category pages.
 *
 * `featured` gates visibility; `sortOrder` controls the order among
 * featured weaves (lower first). Both are indexed because the category
 * page queries featured weaves sorted by sortOrder.
 */
export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "weaves"
      ADD COLUMN IF NOT EXISTS "featured" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "sort_order" numeric DEFAULT 0;

    CREATE INDEX IF NOT EXISTS "weaves_featured_idx" ON "weaves" ("featured");
    CREATE INDEX IF NOT EXISTS "weaves_sort_order_idx" ON "weaves" ("sort_order");
  `)

  // Every existing row lands on the DEFAULT 0, which would leave all of them
  // tied and make the admin-curated chip order arbitrary. Seed a stable
  // sequence from creation order so ordering is deterministic from the start.
  // Re-running is harmless: rows already carrying a distinct value are kept,
  // and genuine ties are broken by id.
  await payload.db.drizzle.execute(`
    UPDATE "weaves" SET "sort_order" = s.n
    FROM (
      SELECT id, ROW_NUMBER() OVER (ORDER BY "created_at" ASC, id ASC) AS n
      FROM "weaves"
    ) s
    WHERE "weaves".id = s.id
      AND "weaves"."sort_order" = 0;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    DROP INDEX IF EXISTS "weaves_sort_order_idx";
    DROP INDEX IF EXISTS "weaves_featured_idx";

    ALTER TABLE "weaves"
      DROP COLUMN IF EXISTS "sort_order",
      DROP COLUMN IF EXISTS "featured";
  `)
}
