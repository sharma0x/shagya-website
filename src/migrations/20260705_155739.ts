import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_color" AS ENUM('red', 'burgundy', 'gold', 'green', 'blue', 'ivory', 'pink', 'purple', 'orange', 'black', 'white', 'multicolor');
  CREATE TYPE "public"."enum__products_v_version_color" AS ENUM('red', 'burgundy', 'gold', 'green', 'blue', 'ivory', 'pink', 'purple', 'orange', 'black', 'white', 'multicolor');
  ALTER TABLE "products" ADD COLUMN "color" "enum_products_color";
  ALTER TABLE "_products_v" ADD COLUMN "version_color" "enum__products_v_version_color";`)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN "color";
  ALTER TABLE "_products_v" DROP COLUMN "version_color";
  DROP TYPE "public"."enum_products_color";
  DROP TYPE "public"."enum__products_v_version_color";`)
}
