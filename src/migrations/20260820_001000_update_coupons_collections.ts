import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "coupons_rels" ADD COLUMN "collections_id" integer;
   ALTER TABLE "coupons_rels" ADD CONSTRAINT "coupons_rels_collections_fk" FOREIGN KEY ("collections_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
   CREATE INDEX "coupons_rels_collections_id_idx" ON "coupons_rels" USING btree ("collections_id");

   ALTER TABLE "coupons_rels" DROP CONSTRAINT "coupons_rels_categories_fk";
   DROP INDEX "coupons_rels_categories_id_idx";
   ALTER TABLE "coupons_rels" DROP COLUMN "categories_id";
  `)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "coupons_rels" ADD COLUMN "categories_id" integer;
   ALTER TABLE "coupons_rels" ADD CONSTRAINT "coupons_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
   CREATE INDEX "coupons_rels_categories_id_idx" ON "coupons_rels" USING btree ("categories_id");

   ALTER TABLE "coupons_rels" DROP CONSTRAINT "coupons_rels_collections_fk";
   DROP INDEX "coupons_rels_collections_id_idx";
   ALTER TABLE "coupons_rels" DROP COLUMN "collections_id";
  `)
}
