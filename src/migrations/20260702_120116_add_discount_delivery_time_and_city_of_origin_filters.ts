import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_delivery_time" AS ENUM('by-tomorrow', 'within-2-days', 'within-5-days', 'within-7-days', '7-plus-days');
  CREATE TYPE "public"."enum__products_v_version_delivery_time" AS ENUM('by-tomorrow', 'within-2-days', 'within-5-days', 'within-7-days', '7-plus-days');
  ALTER TABLE "products" ADD COLUMN "city_of_origin" varchar;
  ALTER TABLE "products" ADD COLUMN "discount_percentage" numeric;
  ALTER TABLE "products" ADD COLUMN "delivery_time" "enum_products_delivery_time";
  ALTER TABLE "_products_v" ADD COLUMN "version_city_of_origin" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_discount_percentage" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_delivery_time" "enum__products_v_version_delivery_time";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN "city_of_origin";
  ALTER TABLE "products" DROP COLUMN "discount_percentage";
  ALTER TABLE "products" DROP COLUMN "delivery_time";
  ALTER TABLE "_products_v" DROP COLUMN "version_city_of_origin";
  ALTER TABLE "_products_v" DROP COLUMN "version_discount_percentage";
  ALTER TABLE "_products_v" DROP COLUMN "version_delivery_time";
  DROP TYPE "public"."enum_products_delivery_time";
  DROP TYPE "public"."enum__products_v_version_delivery_time";`)
}
