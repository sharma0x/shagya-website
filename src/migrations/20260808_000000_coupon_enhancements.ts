import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "per_user_usage_limit" numeric;
   ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "coupon_id" integer;
   DO $$ BEGIN
    ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_fk" FOREIGN KEY ("coupon_id") REFERENCES "coupons"("id") ON DELETE set null;
   EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  `)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" DROP CONSTRAINT IF EXISTS "orders_coupon_id_fk";
   ALTER TABLE "orders" DROP COLUMN IF EXISTS "coupon_id";
   ALTER TABLE "coupons" DROP COLUMN IF EXISTS "per_user_usage_limit";
  `)
}
