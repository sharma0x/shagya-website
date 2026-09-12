import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders_items" ADD COLUMN "color_id" integer;
   ALTER TABLE "orders_items" ADD COLUMN "color_name" varchar;
   ALTER TABLE "orders_items" ADD CONSTRAINT "orders_items_color_id_colors_id_fk" FOREIGN KEY ("color_id") REFERENCES "public"."colors"("id") ON DELETE set null ON UPDATE no action;
   CREATE INDEX "orders_items_color_idx" ON "orders_items" USING btree ("color_id");`)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders_items" DROP CONSTRAINT "orders_items_color_id_colors_id_fk";
  
   DROP INDEX "orders_items_color_idx";
   ALTER TABLE "orders_items" DROP COLUMN "color_id";
   ALTER TABLE "orders_items" DROP COLUMN "color_name";`)
}
