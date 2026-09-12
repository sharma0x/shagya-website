import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "delhivery_pickup_location" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "delhivery_pickup_pin" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "delhivery_client_name" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "delhivery_seller_name" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "delhivery_seller_address" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "delhivery_seller_phone" varchar;
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "delhivery_seller_email" varchar;
  `)

  await payload.db.drizzle.execute(`
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_delhivery_pickup_location" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_delhivery_pickup_pin" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_delhivery_client_name" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_delhivery_seller_name" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_delhivery_seller_address" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_delhivery_seller_phone" varchar;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_delhivery_seller_email" varchar;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "delhivery_pickup_location";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "delhivery_pickup_pin";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "delhivery_client_name";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "delhivery_seller_name";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "delhivery_seller_address";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "delhivery_seller_phone";
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "delhivery_seller_email";
  `)

  await payload.db.drizzle.execute(`
    ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_delhivery_pickup_location";
    ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_delhivery_pickup_pin";
    ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_delhivery_client_name";
    ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_delhivery_seller_name";
    ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_delhivery_seller_address";
    ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_delhivery_seller_phone";
    ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_delhivery_seller_email";
  `)
}
