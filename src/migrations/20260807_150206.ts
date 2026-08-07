import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "colors" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar,
  	"hex" varchar NOT NULL,
  	"order" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "colors_id" integer;
  CREATE UNIQUE INDEX "colors_slug_idx" ON "colors" USING btree ("slug");
  CREATE INDEX "colors_updated_at_idx" ON "colors" USING btree ("updated_at");
  CREATE INDEX "colors_created_at_idx" ON "colors" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_colors_fk" FOREIGN KEY ("colors_id") REFERENCES "public"."colors"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_colors_id_idx" ON "payload_locked_documents_rels" USING btree ("colors_id");`)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "colors" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "colors" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_colors_fk";
  
  DROP INDEX "payload_locked_documents_rels_colors_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "colors_id";`)
}
