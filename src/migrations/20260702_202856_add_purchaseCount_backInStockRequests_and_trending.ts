import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_email_templates_slug" ADD VALUE 'back-in-stock';
  CREATE TABLE "back_in_stock_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"email" varchar NOT NULL,
  	"notified" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "products" ADD COLUMN "purchase_count" numeric DEFAULT 0;
  ALTER TABLE "_products_v" ADD COLUMN "version_purchase_count" numeric DEFAULT 0;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "back_in_stock_requests_id" integer;
  ALTER TABLE "back_in_stock_requests" ADD CONSTRAINT "back_in_stock_requests_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "back_in_stock_requests_product_idx" ON "back_in_stock_requests" USING btree ("product_id");
  CREATE INDEX "back_in_stock_requests_updated_at_idx" ON "back_in_stock_requests" USING btree ("updated_at");
  CREATE INDEX "back_in_stock_requests_created_at_idx" ON "back_in_stock_requests" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_back_in_stock_requests_fk" FOREIGN KEY ("back_in_stock_requests_id") REFERENCES "public"."back_in_stock_requests"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_back_in_stock_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("back_in_stock_requests_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "back_in_stock_requests" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "back_in_stock_requests" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_back_in_stock_requests_fk";
  
  ALTER TABLE "email_templates" ALTER COLUMN "slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_email_templates_slug";
  CREATE TYPE "public"."enum_email_templates_slug" AS ENUM('order-placed-customer', 'admin-new-order', 'order-confirmed-customer', 'order-processing-customer', 'order-shipped-customer', 'order-delivered-customer', 'order-cancelled-customer', 'admin-order-cancelled', 'order-refunded-customer', 'admin-order-refunded', 'welcome-customer', 'verify-email', 'magic-link');
  ALTER TABLE "email_templates" ALTER COLUMN "slug" SET DATA TYPE "public"."enum_email_templates_slug" USING "slug"::"public"."enum_email_templates_slug";
  DROP INDEX "payload_locked_documents_rels_back_in_stock_requests_id_idx";
  ALTER TABLE "products" DROP COLUMN "purchase_count";
  ALTER TABLE "_products_v" DROP COLUMN "version_purchase_count";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "back_in_stock_requests_id";`)
}
