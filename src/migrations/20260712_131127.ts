import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_orders_shipping_type" AS ENUM('standard', 'express');
  ALTER TABLE "orders" ADD COLUMN "shipping_type" "enum_orders_shipping_type" DEFAULT 'standard' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" DROP COLUMN "shipping_type";
  DROP TYPE "public"."enum_orders_shipping_type";`)
}
