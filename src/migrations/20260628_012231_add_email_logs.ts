import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_email_logs_status" AS ENUM('sent', 'failed');
  ALTER TYPE "public"."enum_email_templates_slug" ADD VALUE 'verify-email';
  ALTER TYPE "public"."enum_email_templates_slug" ADD VALUE 'magic-link';
  CREATE TABLE "pages_blocks_categories_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_product_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"cta_text" varchar,
  	"cta_link" varchar,
  	"limit" numeric DEFAULT 4,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_post_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"cta_text" varchar,
  	"cta_link" varchar,
  	"limit" numeric DEFAULT 2,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_categories_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"subheading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_product_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"cta_text" varchar,
  	"cta_link" varchar,
  	"limit" numeric DEFAULT 4,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_post_grid" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"cta_text" varchar,
  	"cta_link" varchar,
  	"limit" numeric DEFAULT 2,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "email_logs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"to" varchar NOT NULL,
  	"subject" varchar NOT NULL,
  	"status" "enum_email_logs_status" NOT NULL,
  	"label" varchar,
  	"error" varchar,
  	"html" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "totp_secret" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "email_logs_id" integer;
  ALTER TABLE "pages_blocks_categories_grid" ADD CONSTRAINT "pages_blocks_categories_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_grid" ADD CONSTRAINT "pages_blocks_product_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_post_grid" ADD CONSTRAINT "pages_blocks_post_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_categories_grid" ADD CONSTRAINT "_pages_v_blocks_categories_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_grid" ADD CONSTRAINT "_pages_v_blocks_product_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_post_grid" ADD CONSTRAINT "_pages_v_blocks_post_grid_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_categories_grid_order_idx" ON "pages_blocks_categories_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_categories_grid_parent_id_idx" ON "pages_blocks_categories_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_categories_grid_path_idx" ON "pages_blocks_categories_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_product_grid_order_idx" ON "pages_blocks_product_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_product_grid_parent_id_idx" ON "pages_blocks_product_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_product_grid_path_idx" ON "pages_blocks_product_grid" USING btree ("_path");
  CREATE INDEX "pages_blocks_post_grid_order_idx" ON "pages_blocks_post_grid" USING btree ("_order");
  CREATE INDEX "pages_blocks_post_grid_parent_id_idx" ON "pages_blocks_post_grid" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_post_grid_path_idx" ON "pages_blocks_post_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_categories_grid_order_idx" ON "_pages_v_blocks_categories_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_categories_grid_parent_id_idx" ON "_pages_v_blocks_categories_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_categories_grid_path_idx" ON "_pages_v_blocks_categories_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_product_grid_order_idx" ON "_pages_v_blocks_product_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_product_grid_parent_id_idx" ON "_pages_v_blocks_product_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_product_grid_path_idx" ON "_pages_v_blocks_product_grid" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_post_grid_order_idx" ON "_pages_v_blocks_post_grid" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_post_grid_parent_id_idx" ON "_pages_v_blocks_post_grid" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_post_grid_path_idx" ON "_pages_v_blocks_post_grid" USING btree ("_path");
  CREATE INDEX "email_logs_updated_at_idx" ON "email_logs" USING btree ("updated_at");
  CREATE INDEX "email_logs_created_at_idx" ON "email_logs" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_email_logs_fk" FOREIGN KEY ("email_logs_id") REFERENCES "public"."email_logs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_email_logs_id_idx" ON "payload_locked_documents_rels" USING btree ("email_logs_id");
  ALTER TABLE "email_templates" DROP COLUMN "available_variables";`)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_categories_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_product_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_post_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_categories_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_product_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_post_grid" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "email_logs" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_categories_grid" CASCADE;
  DROP TABLE "pages_blocks_product_grid" CASCADE;
  DROP TABLE "pages_blocks_post_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_categories_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_product_grid" CASCADE;
  DROP TABLE "_pages_v_blocks_post_grid" CASCADE;
  DROP TABLE "email_logs" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_email_logs_fk";
  
  ALTER TABLE "email_templates" ALTER COLUMN "slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_email_templates_slug";
  CREATE TYPE "public"."enum_email_templates_slug" AS ENUM('order-placed-customer', 'admin-new-order', 'order-confirmed-customer', 'order-processing-customer', 'order-shipped-customer', 'order-delivered-customer', 'order-cancelled-customer', 'admin-order-cancelled', 'order-refunded-customer', 'admin-order-refunded', 'welcome-customer');
  ALTER TABLE "email_templates" ALTER COLUMN "slug" SET DATA TYPE "public"."enum_email_templates_slug" USING "slug"::"public"."enum_email_templates_slug";
  DROP INDEX "payload_locked_documents_rels_email_logs_id_idx";
  ALTER TABLE "email_templates" ADD COLUMN "available_variables" varchar;
  ALTER TABLE "users" DROP COLUMN "totp_secret";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "email_logs_id";
  DROP TYPE "public"."enum_email_logs_status";`)
}
