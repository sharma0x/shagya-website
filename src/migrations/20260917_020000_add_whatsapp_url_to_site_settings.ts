import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "whatsapp_url" varchar;
  `)

  await payload.db.drizzle.execute(`
    ALTER TABLE "_site_settings_v" ADD COLUMN IF NOT EXISTS "version_whatsapp_url" varchar;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "whatsapp_url";
  `)

  await payload.db.drizzle.execute(`
    ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_whatsapp_url";
  `)
}
