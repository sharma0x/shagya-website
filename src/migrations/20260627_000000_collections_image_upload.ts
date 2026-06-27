import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "collections" DROP COLUMN IF EXISTS "image";
    ALTER TABLE "collections" ADD COLUMN "image_id" integer;
    ALTER TABLE "collections" ADD CONSTRAINT "collections_image_id_media_id_fk"
      FOREIGN KEY ("image_id") REFERENCES "public"."media"("id")
      ON DELETE SET NULL ON UPDATE no action;
    CREATE INDEX "collections_image_idx" ON "collections" USING btree ("image_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "collections_image_idx";
    ALTER TABLE "collections" DROP CONSTRAINT IF EXISTS "collections_image_id_media_id_fk";
    ALTER TABLE "collections" DROP COLUMN IF EXISTS "image_id";
    ALTER TABLE "collections" ADD COLUMN "image" varchar;
  `)
}
