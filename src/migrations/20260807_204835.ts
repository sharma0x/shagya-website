import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "standard_shipping_rate" numeric DEFAULT 150;
   ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "express_shipping_rate" numeric DEFAULT 350;
   ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "free_shipping_threshold" numeric DEFAULT 5000;
   ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_standard_shipping_rate" numeric DEFAULT 150;
   ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_express_shipping_rate" numeric DEFAULT 350;
   ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_free_shipping_threshold" numeric DEFAULT 5000;
  `)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "standard_shipping_rate";
   ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "express_shipping_rate";
   ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "free_shipping_threshold";
   ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_standard_shipping_rate";
   ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_express_shipping_rate";
   ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_free_shipping_threshold";
  `)
}
