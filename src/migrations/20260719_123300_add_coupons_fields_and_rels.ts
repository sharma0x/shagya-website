import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "description" varchar;
  ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "influencer_code" varchar;
  CREATE TABLE IF NOT EXISTS "site_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"coupons_id" integer
  );
  CREATE INDEX IF NOT EXISTS "site_settings_rels_order_idx" ON "site_settings_rels" ("order");
  CREATE INDEX IF NOT EXISTS "site_settings_rels_parent_idx" ON "site_settings_rels" ("parent_id");
  CREATE INDEX IF NOT EXISTS "site_settings_rels_coupons_idx" ON "site_settings_rels" ("coupons_id");
  DO $$ BEGIN
   ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "site_settings"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
   ALTER TABLE "site_settings_rels" ADD CONSTRAINT "site_settings_rels_coupons_fk" FOREIGN KEY ("coupons_id") REFERENCES "coupons"("id") ON DELETE set null;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  CREATE TABLE IF NOT EXISTS "_site_settings_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"coupons_id" integer
  );
  CREATE INDEX IF NOT EXISTS "_site_settings_v_rels_order_idx" ON "_site_settings_v_rels" ("order");
  CREATE INDEX IF NOT EXISTS "_site_settings_v_rels_parent_idx" ON "_site_settings_v_rels" ("parent_id");
  CREATE INDEX IF NOT EXISTS "_site_settings_v_rels_coupons_idx" ON "_site_settings_v_rels" ("coupons_id");
  DO $$ BEGIN
   ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "_site_settings_v"("id") ON DELETE cascade;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;
  DO $$ BEGIN
   ALTER TABLE "_site_settings_v_rels" ADD CONSTRAINT "_site_settings_v_rels_coupons_fk" FOREIGN KEY ("coupons_id") REFERENCES "coupons"("id") ON DELETE set null;
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "coupons" DROP COLUMN IF EXISTS "description";
  ALTER TABLE "coupons" DROP COLUMN IF EXISTS "influencer_code";
  DROP TABLE IF EXISTS "site_settings_rels" CASCADE;
  DROP TABLE IF EXISTS "_site_settings_v_rels" CASCADE;`)
}
