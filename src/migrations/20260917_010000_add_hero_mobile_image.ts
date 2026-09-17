import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs) {
  // Add optional mobile poster (upload relationship) to hero slides.
  // Column is integer FK to media.id — same shape as the existing image_id.
  await payload.db.drizzle.execute(
    `ALTER TABLE "pages_blocks_hero_images" ADD COLUMN IF NOT EXISTS "mobile_image_id" integer;`,
  )
  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "pages_blocks_hero_images_mobile_image_idx"
      ON "pages_blocks_hero_images" ("mobile_image_id");
  `)
  await payload.db.drizzle.execute(`
    DO $$ BEGIN
      ALTER TABLE "pages_blocks_hero_images" ADD CONSTRAINT "pages_blocks_hero_images_mobile_image_fk"
        FOREIGN KEY ("mobile_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)

  await payload.db.drizzle.execute(
    `ALTER TABLE "_pages_v_blocks_hero_images" ADD COLUMN IF NOT EXISTS "mobile_image_id" integer;`,
  )
  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_hero_images_mobile_image_idx"
      ON "_pages_v_blocks_hero_images" ("mobile_image_id");
  `)
  await payload.db.drizzle.execute(`
    DO $$ BEGIN
      ALTER TABLE "_pages_v_blocks_hero_images" ADD CONSTRAINT "_pages_v_blocks_hero_images_mobile_image_fk"
        FOREIGN KEY ("mobile_image_id") REFERENCES "media"("id") ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(
    `ALTER TABLE "pages_blocks_hero_images" DROP COLUMN IF EXISTS "mobile_image_id";`,
  )
  await payload.db.drizzle.execute(
    `ALTER TABLE "_pages_v_blocks_hero_images" DROP COLUMN IF EXISTS "mobile_image_id";`,
  )
}
