import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_testimonials_items" ADD COLUMN "rating" numeric DEFAULT 5;
  ALTER TABLE "_pages_v_blocks_testimonials_items" ADD COLUMN "rating" numeric DEFAULT 5;`)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_testimonials_items" DROP COLUMN "rating";
  ALTER TABLE "_pages_v_blocks_testimonials_items" DROP COLUMN "rating";`)
}
