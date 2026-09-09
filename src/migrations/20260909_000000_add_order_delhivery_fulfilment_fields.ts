import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delhivery_waybill" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delhivery_status" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delhivery_label_url" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delhivery_pickup_request_id" varchar;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delhivery_shipped_via_delhivery" boolean;

    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delhivery_manifest_response" jsonb;
  `)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "delhivery_manifest_response";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "delhivery_shipped_via_delhivery";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "delhivery_pickup_request_id";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "delhivery_label_url";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "delhivery_status";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "delhivery_waybill";
  `)
}
