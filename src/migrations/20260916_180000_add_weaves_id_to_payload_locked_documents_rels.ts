import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Fix for the weaves collection conversion (20260916_150000): Payload's
 * locked-documents system table keeps one id column per collection, and the
 * new `weaves` collection requires a `weaves_id` column on it. Without this,
 * the admin panel fails SSR with
 * "column payload_locked_documents__rels.weaves_id does not exist".
 */
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "weaves_id" integer;

   DO $$ BEGIN
     ALTER TABLE "payload_locked_documents_rels"
       ADD CONSTRAINT "payload_locked_documents_rels_weaves_fk"
       FOREIGN KEY ("weaves_id") REFERENCES "public"."weaves"("id")
       ON DELETE cascade ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_weaves_id_idx"
     ON "payload_locked_documents_rels" USING btree ("weaves_id");
  `)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_weaves_fk";
   DROP INDEX IF EXISTS "payload_locked_documents_rels_weaves_id_idx";
   ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "weaves_id";
  `)
}
