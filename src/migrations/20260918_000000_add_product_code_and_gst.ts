import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // 1. Add product_code to products table (nullable first so existing rows don't fail)
  await payload.db.drizzle.execute(`
    ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "product_code" varchar;
  `)

  // 2. Add to _products_v (draft version history table)
  await payload.db.drizzle.execute(`
    ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_product_code" varchar;
  `)

  // 3. Auto-generate product codes for all existing products that don't have one.
  //    Format: SHG-XXXXX where XXXXX is zero-padded row number ordered by created_at.
  await payload.db.drizzle.execute(`
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS rn
      FROM products
      WHERE product_code IS NULL
    )
    UPDATE products
    SET product_code = 'SHG-' || LPAD(ranked.rn::text, 5, '0')
    FROM ranked
    WHERE products.id = ranked.id;
  `)

  // 4. Now that all rows have a value, add UNIQUE constraint and NOT NULL.
  await payload.db.drizzle.execute(`
    ALTER TABLE "products" ALTER COLUMN "product_code" SET NOT NULL;
  `)

  await payload.db.drizzle.execute(`
    DO $$ BEGIN
      ALTER TABLE "products" ADD CONSTRAINT "products_product_code_unique" UNIQUE ("product_code");
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)

  // 5. Add index for fast lookups
  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "products_product_code_idx" ON "products" USING btree ("product_code");
  `)

  // 6. Add productCode snapshot column to orders_items table
  await payload.db.drizzle.execute(`
    ALTER TABLE "orders_items" ADD COLUMN IF NOT EXISTS "product_code" varchar;
  `)

  // 6a. Add index on orders_items.product_code for search performance
  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "orders_items_product_code_idx" ON "orders_items" USING btree ("product_code");
  `)

  // 7. Add gst_number to site_settings
  await payload.db.drizzle.execute(`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "gst_number" varchar;
  `)

  // 8. Add gst_number to _site_settings_v (draft version history table)
  await payload.db.drizzle.execute(`
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_gst_number" varchar;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  // Reverse order

  await payload.db.drizzle.execute(`
    ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_gst_number";
  `)

  await payload.db.drizzle.execute(`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "gst_number";
  `)

  await payload.db.drizzle.execute(`
    DROP INDEX IF EXISTS "orders_items_product_code_idx";
  `)

  await payload.db.drizzle.execute(`
    ALTER TABLE "orders_items" DROP COLUMN IF EXISTS "product_code";
  `)

  await payload.db.drizzle.execute(`
    DROP INDEX IF EXISTS "products_product_code_idx";
  `)

  await payload.db.drizzle.execute(`
    ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_product_code_unique";
  `)

  await payload.db.drizzle.execute(`
    ALTER TABLE "products" ALTER COLUMN "product_code" DROP NOT NULL;
  `)

  await payload.db.drizzle.execute(`
    ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_product_code";
  `)

  await payload.db.drizzle.execute(`
    ALTER TABLE "products" DROP COLUMN IF EXISTS "product_code";
  `)
}
