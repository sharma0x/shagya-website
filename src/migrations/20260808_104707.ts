import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reviews" ADD COLUMN "helpful_count" numeric DEFAULT 0;
  ALTER TABLE "reviews" ADD COLUMN "helpful_user_emails" jsonb;`)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "reviews" DROP COLUMN "helpful_count";
  ALTER TABLE "reviews" DROP COLUMN "helpful_user_emails";`)
}
