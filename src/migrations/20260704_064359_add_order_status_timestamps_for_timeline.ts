import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" ADD COLUMN "confirmed_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "shipped_at" timestamp(3) with time zone;
  ALTER TABLE "orders" ADD COLUMN "delivered_at" timestamp(3) with time zone;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "orders" DROP COLUMN "confirmed_at";
  ALTER TABLE "orders" DROP COLUMN "shipped_at";
  ALTER TABLE "orders" DROP COLUMN "delivered_at";`)
}
