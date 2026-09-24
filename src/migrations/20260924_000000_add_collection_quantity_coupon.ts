import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_coupons_promotion_type" AS ENUM('standard', 'buy_quantity');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    ALTER TABLE "coupons"
      ADD COLUMN IF NOT EXISTS "promotion_type" "public"."enum_coupons_promotion_type" NOT NULL DEFAULT 'standard',
      ADD COLUMN IF NOT EXISTS "minimum_quantity" numeric DEFAULT 2;

    ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "discount_breakdown" jsonb,
      ADD COLUMN IF NOT EXISTS "payment_reference" varchar;
    CREATE UNIQUE INDEX IF NOT EXISTS "orders_payment_reference_idx" ON "orders" ("payment_reference") WHERE "payment_reference" IS NOT NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "orders_payment_reference_idx";
    ALTER TABLE "orders"
      DROP COLUMN IF EXISTS "payment_reference",
      DROP COLUMN IF EXISTS "discount_breakdown";
    ALTER TABLE "coupons" DROP COLUMN IF EXISTS "minimum_quantity";
    ALTER TABLE "coupons" DROP COLUMN IF EXISTS "promotion_type";
    DROP TYPE IF EXISTS "public"."enum_coupons_promotion_type";
  `)
}
