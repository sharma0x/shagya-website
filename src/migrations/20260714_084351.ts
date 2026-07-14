import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_delivery_time" AS ENUM('by-tomorrow', 'within-2-days', 'within-5-days', 'within-7-days', '7-plus-days');
  CREATE TYPE "public"."enum__products_v_version_delivery_time" AS ENUM('by-tomorrow', 'within-2-days', 'within-5-days', 'within-7-days', '7-plus-days');
  CREATE TYPE "public"."enum_orders_shipping_type" AS ENUM('standard', 'express');
  ALTER TYPE "public"."enum_email_templates_slug" ADD VALUE 'back-in-stock';
  ALTER TYPE "public"."enum_email_templates_slug" ADD VALUE 'password-reset';
  CREATE TABLE "products_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar
  );
  
  CREATE TABLE "_products_v_version_features" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "back_in_stock_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"product_id" integer NOT NULL,
  	"email" varchar NOT NULL,
  	"notified" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "products" ADD COLUMN "city_of_origin" varchar;
  ALTER TABLE "products" ADD COLUMN "tags" varchar;
  ALTER TABLE "products" ADD COLUMN "discount_percentage" numeric;
  ALTER TABLE "products" ADD COLUMN "delivery_time" "enum_products_delivery_time";
  ALTER TABLE "products" ADD COLUMN "purchase_count" numeric DEFAULT 0;
  ALTER TABLE "products" ADD COLUMN "brand_id" integer;
  ALTER TABLE "_products_v" ADD COLUMN "version_city_of_origin" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_tags" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_discount_percentage" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_delivery_time" "enum__products_v_version_delivery_time";
  ALTER TABLE "_products_v" ADD COLUMN "version_purchase_count" numeric DEFAULT 0;
  ALTER TABLE "_products_v" ADD COLUMN "version_brand_id" integer;
  ALTER TABLE "orders" ADD COLUMN "notes" varchar;
  ALTER TABLE "orders" ADD COLUMN "confirmed_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "shipped_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "delivered_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "tracking_id" varchar;
  ALTER TABLE "orders" ADD COLUMN "tracking_url" varchar;
  ALTER TABLE "orders" ADD COLUMN "shipping_type" "enum_orders_shipping_type" DEFAULT 'standard' NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "back_in_stock_requests_id" integer;
  ALTER TABLE "products_features" ADD CONSTRAINT "products_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_features" ADD CONSTRAINT "_products_v_version_features_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "back_in_stock_requests" ADD CONSTRAINT "back_in_stock_requests_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_features_order_idx" ON "products_features" USING btree ("_order");
  CREATE INDEX "products_features_parent_id_idx" ON "products_features" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_features_order_idx" ON "_products_v_version_features" USING btree ("_order");
  CREATE INDEX "_products_v_version_features_parent_id_idx" ON "_products_v_version_features" USING btree ("_parent_id");
  CREATE INDEX "back_in_stock_requests_product_idx" ON "back_in_stock_requests" USING btree ("product_id");
  CREATE INDEX "back_in_stock_requests_updated_at_idx" ON "back_in_stock_requests" USING btree ("updated_at");
  CREATE INDEX "back_in_stock_requests_created_at_idx" ON "back_in_stock_requests" USING btree ("created_at");
  ALTER TABLE "products" ADD CONSTRAINT "products_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_brand_id_brands_id_fk" FOREIGN KEY ("version_brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_back_in_stock_requests_fk" FOREIGN KEY ("back_in_stock_requests_id") REFERENCES "public"."back_in_stock_requests"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_brand_idx" ON "products" USING btree ("brand_id");
  CREATE INDEX "_products_v_version_version_brand_idx" ON "_products_v" USING btree ("version_brand_id");
  CREATE INDEX "payload_locked_documents_rels_back_in_stock_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("back_in_stock_requests_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_features" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "back_in_stock_requests" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_features" CASCADE;
  DROP TABLE "_products_v_version_features" CASCADE;
  DROP TABLE "back_in_stock_requests" CASCADE;
  ALTER TABLE "products" DROP CONSTRAINT "products_brand_id_brands_id_fk";
  
  ALTER TABLE "_products_v" DROP CONSTRAINT "_products_v_version_brand_id_brands_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_back_in_stock_requests_fk";
  
  ALTER TABLE "email_templates" ALTER COLUMN "slug" SET DATA TYPE text;
  DROP TYPE "public"."enum_email_templates_slug";
  CREATE TYPE "public"."enum_email_templates_slug" AS ENUM('order-placed-customer', 'admin-new-order', 'order-confirmed-customer', 'order-processing-customer', 'order-shipped-customer', 'order-delivered-customer', 'order-cancelled-customer', 'admin-order-cancelled', 'order-refunded-customer', 'admin-order-refunded', 'welcome-customer', 'verify-email', 'magic-link');
  ALTER TABLE "email_templates" ALTER COLUMN "slug" SET DATA TYPE "public"."enum_email_templates_slug" USING "slug"::"public"."enum_email_templates_slug";
  DROP INDEX "products_brand_idx";
  DROP INDEX "_products_v_version_version_brand_idx";
  DROP INDEX "payload_locked_documents_rels_back_in_stock_requests_id_idx";
  ALTER TABLE "products" DROP COLUMN "city_of_origin";
  ALTER TABLE "products" DROP COLUMN "tags";
  ALTER TABLE "products" DROP COLUMN "discount_percentage";
  ALTER TABLE "products" DROP COLUMN "delivery_time";
  ALTER TABLE "products" DROP COLUMN "purchase_count";
  ALTER TABLE "products" DROP COLUMN "brand_id";
  ALTER TABLE "_products_v" DROP COLUMN "version_city_of_origin";
  ALTER TABLE "_products_v" DROP COLUMN "version_tags";
  ALTER TABLE "_products_v" DROP COLUMN "version_discount_percentage";
  ALTER TABLE "_products_v" DROP COLUMN "version_delivery_time";
  ALTER TABLE "_products_v" DROP COLUMN "version_purchase_count";
  ALTER TABLE "_products_v" DROP COLUMN "version_brand_id";
  ALTER TABLE "orders" DROP COLUMN "notes";
  ALTER TABLE "orders" DROP COLUMN "confirmed_at";
  ALTER TABLE "orders" DROP COLUMN "shipped_at";
  ALTER TABLE "orders" DROP COLUMN "delivered_at";
  ALTER TABLE "orders" DROP COLUMN "tracking_id";
  ALTER TABLE "orders" DROP COLUMN "tracking_url";
  ALTER TABLE "orders" DROP COLUMN "shipping_type";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "back_in_stock_requests_id";
  DROP TYPE "public"."enum_products_delivery_time";
  DROP TYPE "public"."enum__products_v_version_delivery_time";
  DROP TYPE "public"."enum_orders_shipping_type";`)
}
