import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_site_settings_trust_signals_icon" AS ENUM('shield', 'truck', 'refresh', 'badge', 'package', 'sparkles');
  CREATE TYPE "public"."enum__site_settings_v_version_trust_signals_icon" AS ENUM('shield', 'truck', 'refresh', 'badge', 'package', 'sparkles');
  CREATE TABLE "site_settings_trust_signals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_site_settings_trust_signals_icon" DEFAULT 'shield',
  	"title" varchar,
  	"detail" varchar
  );
  
  CREATE TABLE "_site_settings_v_version_trust_signals" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__site_settings_v_version_trust_signals_icon" DEFAULT 'shield',
  	"title" varchar,
  	"detail" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "site_settings_trust_signals" ADD CONSTRAINT "site_settings_trust_signals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_trust_signals" ADD CONSTRAINT "_site_settings_v_version_trust_signals_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "site_settings_trust_signals_order_idx" ON "site_settings_trust_signals" USING btree ("_order");
  CREATE INDEX "site_settings_trust_signals_parent_id_idx" ON "site_settings_trust_signals" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_version_trust_signals_order_idx" ON "_site_settings_v_version_trust_signals" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_trust_signals_parent_id_idx" ON "_site_settings_v_version_trust_signals" USING btree ("_parent_id");`)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "site_settings_trust_signals" CASCADE;
  DROP TABLE "_site_settings_v_version_trust_signals" CASCADE;
  DROP TYPE "public"."enum_site_settings_trust_signals_icon";
  DROP TYPE "public"."enum__site_settings_v_version_trust_signals_icon";`)
}
