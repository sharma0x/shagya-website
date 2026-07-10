import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_instagram_posts_source" AS ENUM('api', 'manual');
  CREATE TYPE "public"."enum_instagram_posts_media_type" AS ENUM('IMAGE', 'VIDEO', 'CAROUSEL_ALBUM');
  CREATE TABLE "instagram_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"source" "enum_instagram_posts_source" DEFAULT 'api',
  	"instagram_id" varchar,
  	"image_id" integer,
  	"media_url" varchar,
  	"thumbnail_url" varchar,
  	"permalink" varchar,
  	"caption" varchar,
  	"media_type" "enum_instagram_posts_media_type" DEFAULT 'IMAGE',
  	"sort_order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "instagram_posts_id" integer;
  ALTER TABLE "instagram_posts" ADD CONSTRAINT "instagram_posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE UNIQUE INDEX "instagram_posts_instagram_id_idx" ON "instagram_posts" USING btree ("instagram_id");
  CREATE INDEX "instagram_posts_image_idx" ON "instagram_posts" USING btree ("image_id");
  CREATE INDEX "instagram_posts_updated_at_idx" ON "instagram_posts" USING btree ("updated_at");
  CREATE INDEX "instagram_posts_created_at_idx" ON "instagram_posts" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_instagram_posts_fk" FOREIGN KEY ("instagram_posts_id") REFERENCES "public"."instagram_posts"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_instagram_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("instagram_posts_id");`)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "instagram_posts" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "instagram_posts" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_instagram_posts_fk";
  
  DROP INDEX "payload_locked_documents_rels_instagram_posts_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "instagram_posts_id";
  DROP TYPE "public"."enum_instagram_posts_source";
  DROP TYPE "public"."enum_instagram_posts_media_type";`)
}
