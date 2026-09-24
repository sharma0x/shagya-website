import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // Drop NOT NULL constraint on product_code in products table.
  // In Payload CMS with versions.drafts, database columns must be nullable
  // so autosave can create initial draft documents without violating DB constraints.
  await payload.db.drizzle.execute(`
    ALTER TABLE "products" ALTER COLUMN "product_code" DROP NOT NULL;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "products" ALTER COLUMN "product_code" SET NOT NULL;
  `)
}
