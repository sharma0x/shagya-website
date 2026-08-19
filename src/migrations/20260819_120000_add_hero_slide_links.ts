import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs) {
  // Add per-slide link column to hero images array (CLO-103)
  await payload.db.drizzle.execute(
    `ALTER TABLE "pages_blocks_hero_images" ADD COLUMN IF NOT EXISTS "link" varchar;`,
  )
  await payload.db.drizzle.execute(
    `ALTER TABLE "_pages_v_blocks_hero_images" ADD COLUMN IF NOT EXISTS "link" varchar;`,
  )
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(
    `ALTER TABLE "pages_blocks_hero_images" DROP COLUMN IF EXISTS "link";`,
  )
  await payload.db.drizzle.execute(
    `ALTER TABLE "_pages_v_blocks_hero_images" DROP COLUMN IF EXISTS "link";`,
  )
}
