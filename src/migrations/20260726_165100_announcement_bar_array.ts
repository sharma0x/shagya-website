import { MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs) {
  // Create site_settings_announcement_bar_announcements (array field)
  await payload.db.drizzle.execute(`
    CREATE TABLE IF NOT EXISTS "site_settings_announcement_bar_announcements" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY,
      "text" varchar,
      "link" varchar
    );
  `)

  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "site_settings_announcement_bar_announcements_order_idx"
      ON "site_settings_announcement_bar_announcements" ("_order");
  `)
  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "site_settings_announcement_bar_announcements_parent_id_idx"
      ON "site_settings_announcement_bar_announcements" ("_parent_id");
  `)
  await payload.db.drizzle.execute(`
    DO $$ BEGIN
      ALTER TABLE "site_settings_announcement_bar_announcements"
        ADD CONSTRAINT "site_settings_announcement_bar_announcements_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "site_settings"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)

  // Migrate existing text into the new array table
  await payload.db.drizzle.execute(`
    INSERT INTO "site_settings_announcement_bar_announcements" ("_order", "_parent_id", "id", "text")
    SELECT 0, id, 'ann_default_1', "announcement_bar_text"
    FROM "site_settings"
    WHERE "announcement_bar_text" IS NOT NULL AND "announcement_bar_text" != '';
  `)

  // Drop old text column from site_settings
  await payload.db.drizzle.execute(`
    ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "announcement_bar_text";
  `)

  // Create versioned array table
  await payload.db.drizzle.execute(`
    CREATE TABLE IF NOT EXISTS "_site_settings_v_version_announcement_bar_announcements" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY,
      "text" varchar,
      "link" varchar,
      "_uuid" varchar
    );
  `)

  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "_site_settings_v_version_announcement_bar_announcements_order_idx"
      ON "_site_settings_v_version_announcement_bar_announcements" ("_order");
  `)
  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "_site_settings_v_version_announcement_bar_announcements_parent_id_idx"
      ON "_site_settings_v_version_announcement_bar_announcements" ("_parent_id");
  `)
  await payload.db.drizzle.execute(`
    DO $$ BEGIN
      ALTER TABLE "_site_settings_v_version_announcement_bar_announcements"
        ADD CONSTRAINT "_site_settings_v_version_announcement_bar_announcements_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "_site_settings_v"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)

  // Drop old text column from versioned table
  await payload.db.drizzle.execute(`
    ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_announcement_bar_text";
  `)
}
