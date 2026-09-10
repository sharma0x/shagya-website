import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_products_status" ADD VALUE IF NOT EXISTS 'archived';
  ALTER TYPE "public"."enum__products_v_version_status" ADD VALUE IF NOT EXISTS 'archived';
  `)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`SELECT 1`)
}
