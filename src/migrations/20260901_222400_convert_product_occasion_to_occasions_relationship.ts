import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_rels" ADD COLUMN "occasions_id" integer;
   ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_occasions_fk" FOREIGN KEY ("occasions_id") REFERENCES "public"."occasions"("id") ON DELETE cascade ON UPDATE no action;
   CREATE INDEX "products_rels_occasions_id_idx" ON "products_rels" USING btree ("occasions_id");

   ALTER TABLE "_products_v_rels" ADD COLUMN "occasions_id" integer;
   ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_occasions_fk" FOREIGN KEY ("occasions_id") REFERENCES "public"."occasions"("id") ON DELETE cascade ON UPDATE no action;
   CREATE INDEX "_products_v_rels_occasions_id_idx" ON "_products_v_rels" USING btree ("occasions_id");

   ALTER TABLE "products" DROP COLUMN "occasion";
   ALTER TABLE "_products_v" DROP COLUMN "version_occasion";
  `)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_rels" DROP CONSTRAINT "products_rels_occasions_fk";
   DROP INDEX "products_rels_occasions_id_idx";
   ALTER TABLE "products_rels" DROP COLUMN "occasions_id";

   ALTER TABLE "_products_v_rels" DROP CONSTRAINT "_products_v_rels_occasions_fk";
   DROP INDEX "_products_v_rels_occasions_id_idx";
   ALTER TABLE "_products_v_rels" DROP COLUMN "occasions_id";

   ALTER TABLE "products" ADD COLUMN "occasion" varchar;
   ALTER TABLE "_products_v" ADD COLUMN "version_occasion" varchar;
  `)
}
