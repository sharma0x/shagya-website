import { MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs) {
  // Create pages_blocks_hero_images (array field for hero block)
  // _parentID is varchar because pages_blocks_hero.id is varchar
  await payload.db.drizzle.execute(`
    CREATE TABLE IF NOT EXISTS "pages_blocks_hero_images" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY,
      "image_id" integer REFERENCES "media"("id") ON DELETE SET NULL
    );
  `)

  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "pages_blocks_hero_images_order_idx" ON "pages_blocks_hero_images" ("_order");
  `)
  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "pages_blocks_hero_images_parent_id_idx" ON "pages_blocks_hero_images" ("_parent_id");
  `)
  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "pages_blocks_hero_images_image_idx" ON "pages_blocks_hero_images" ("image_id");
  `)
  await payload.db.drizzle.execute(`
    DO $$ BEGIN
      ALTER TABLE "pages_blocks_hero_images" ADD CONSTRAINT "pages_blocks_hero_images_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_hero"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)

  // Create _pages_v_blocks_hero_images (versions array field)
  // _parentID is integer because _pages_v_blocks_hero.id is serial
  await payload.db.drizzle.execute(`
    CREATE TABLE IF NOT EXISTS "_pages_v_blocks_hero_images" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY,
      "image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "_uuid" varchar
    );
  `)

  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_hero_images_order_idx" ON "_pages_v_blocks_hero_images" ("_order");
  `)
  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_hero_images_parent_id_idx" ON "_pages_v_blocks_hero_images" ("_parent_id");
  `)
  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "_pages_v_blocks_hero_images_image_idx" ON "_pages_v_blocks_hero_images" ("image_id");
  `)
  await payload.db.drizzle.execute(`
    DO $$ BEGIN
      ALTER TABLE "_pages_v_blocks_hero_images" ADD CONSTRAINT "_pages_v_blocks_hero_images_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "_pages_v_blocks_hero"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
}
