import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_stock_movements_type" AS ENUM('committed', 'restored', 'reserved', 'released', 'manual');
    CREATE TABLE "stock_movements" (
      "id" serial PRIMARY KEY NOT NULL,
      "product_id" integer NOT NULL,
      "variant_id" integer,
      "order_id" integer,
      "type" "enum_stock_movements_type" NOT NULL,
      "delta" numeric NOT NULL,
      "quantity_after" numeric,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "stock_deducted" boolean DEFAULT false;
    ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "stock_restored" boolean DEFAULT false;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "stock_movements_id" integer;

    ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk"
      FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_variant_id_colors_id_fk"
      FOREIGN KEY ("variant_id") REFERENCES "public"."colors"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_order_id_orders_id_fk"
      FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_stock_movements_fk"
      FOREIGN KEY ("stock_movements_id") REFERENCES "public"."stock_movements"("id") ON DELETE cascade ON UPDATE no action;

    CREATE INDEX "stock_movements_product_idx" ON "stock_movements" USING btree ("product_id");
    CREATE INDEX "stock_movements_variant_idx" ON "stock_movements" USING btree ("variant_id");
    CREATE INDEX "stock_movements_order_idx" ON "stock_movements" USING btree ("order_id");
    CREATE INDEX "stock_movements_updated_at_idx" ON "stock_movements" USING btree ("updated_at");
    CREATE INDEX "stock_movements_created_at_idx" ON "stock_movements" USING btree ("created_at");
    CREATE INDEX "payload_locked_documents_rels_stock_movements_id_idx"
      ON "payload_locked_documents_rels" USING btree ("stock_movements_id");
  `)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "stock_movements" DISABLE ROW LEVEL SECURITY;
    DROP TABLE "stock_movements" CASCADE;
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_stock_movements_fk";

    DROP INDEX "payload_locked_documents_rels_stock_movements_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "stock_movements_id";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "stock_deducted";
    ALTER TABLE "orders" DROP COLUMN IF EXISTS "stock_restored";
    DROP TYPE "public"."enum_stock_movements_type";
  `)
}
