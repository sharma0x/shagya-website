import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "header_eyebrow" varchar;
    ALTER TABLE "pages" ADD COLUMN IF NOT EXISTS "header_tagline" varchar;
  `)

  await payload.db.drizzle.execute(`
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_header_eyebrow" varchar;
    ALTER TABLE "_pages_v" ADD COLUMN IF NOT EXISTS "version_header_tagline" varchar;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "header_eyebrow";
    ALTER TABLE "pages" DROP COLUMN IF EXISTS "header_tagline";
  `)

  await payload.db.drizzle.execute(`
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_header_eyebrow";
    ALTER TABLE "_pages_v" DROP COLUMN IF EXISTS "version_header_tagline";
  `)
}
