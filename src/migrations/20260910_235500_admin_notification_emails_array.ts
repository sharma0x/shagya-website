import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  // 1. Create site_settings_admin_notification_emails (array table)
  await payload.db.drizzle.execute(`
    CREATE TABLE IF NOT EXISTS "site_settings_admin_notification_emails" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY,
      "email" varchar
    );
  `)

  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "site_settings_admin_notification_emails_order_idx"
      ON "site_settings_admin_notification_emails" ("_order");
  `)

  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "site_settings_admin_notification_emails_parent_id_idx"
      ON "site_settings_admin_notification_emails" ("_parent_id");
  `)

  await payload.db.drizzle.execute(`
    DO $$ BEGIN
      ALTER TABLE "site_settings_admin_notification_emails"
        ADD CONSTRAINT "site_settings_admin_notification_emails_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "site_settings"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)

  // 2. Migrate existing single email into array table if column exists
  await payload.db.drizzle.execute(`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='site_settings' AND column_name='admin_notification_email'
      ) THEN
        INSERT INTO "site_settings_admin_notification_emails" ("_order", "_parent_id", "id", "email")
        SELECT 0, id, 'admin_email_initial', "admin_notification_email"
        FROM "site_settings"
        WHERE "admin_notification_email" IS NOT NULL AND "admin_notification_email" != ''
        ON CONFLICT ("id") DO NOTHING;

        ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "admin_notification_email";
      END IF;
    END $$;
  `)

  // 3. Create versioned array table
  await payload.db.drizzle.execute(`
    CREATE TABLE IF NOT EXISTS "_site_settings_v_version_admin_notification_emails" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY,
      "email" varchar,
      "_uuid" varchar
    );
  `)

  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "_site_settings_v_version_admin_notification_emails_order_idx"
      ON "_site_settings_v_version_admin_notification_emails" ("_order");
  `)

  await payload.db.drizzle.execute(`
    CREATE INDEX IF NOT EXISTS "_site_settings_v_version_admin_notification_emails_parent_id_idx"
      ON "_site_settings_v_version_admin_notification_emails" ("_parent_id");
  `)

  await payload.db.drizzle.execute(`
    DO $$ BEGIN
      ALTER TABLE "_site_settings_v_version_admin_notification_emails"
        ADD CONSTRAINT "_site_settings_v_version_admin_notification_emails_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "_site_settings_v"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)

  // 4. Drop old column from versioned table
  await payload.db.drizzle.execute(`
    DO $$ BEGIN
      IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='_site_settings_v' AND column_name='version_admin_notification_email'
      ) THEN
        ALTER TABLE "_site_settings_v" DROP COLUMN IF EXISTS "version_admin_notification_email";
      END IF;
    END $$;
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    DROP TABLE IF EXISTS "site_settings_admin_notification_emails" CASCADE;
    DROP TABLE IF EXISTS "_site_settings_v_version_admin_notification_emails" CASCADE;
  `)
}
