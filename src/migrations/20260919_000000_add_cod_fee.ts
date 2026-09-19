import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "cod_fee" numeric;
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_cod_fee" numeric;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cod_fee" numeric;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "cod_fee";
    ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_cod_fee";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "cod_fee";
  `)
}
