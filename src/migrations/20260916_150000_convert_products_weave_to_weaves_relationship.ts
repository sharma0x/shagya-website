import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

const LEGACY_WEAVE_VALUES = [
  'banarasi',
  'kanchipuram',
  'bandhani',
  'patola',
  'kalamkari',
  'ikkat',
  'paithani',
  'maheshwari',
  'chanderi',
  'tant',
  'baluchari',
]

const LEGACY_WEAVE_VALUES_SQL = LEGACY_WEAVE_VALUES.map((v) => `'${v}'`).join(
  ', ',
)

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1. Create the weaves taxonomy table (source of truth: generated schema)
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "weaves" (
     "id" serial PRIMARY KEY,
     "name" varchar NOT NULL,
     "slug" varchar,
     "description" varchar,
     "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
     "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
   );

   CREATE UNIQUE INDEX IF NOT EXISTS "weaves_slug_idx" ON "weaves" USING btree ("slug");
   CREATE INDEX IF NOT EXISTS "weaves_updated_at_idx" ON "weaves" USING btree ("updated_at");
   CREATE INDEX IF NOT EXISTS "weaves_created_at_idx" ON "weaves" USING btree ("created_at");
  `)

  // 2. Backfill weave documents from the legacy enum values still present on
  //    live products and on product version snapshots.
  await db.execute(sql`
   INSERT INTO "weaves" ("name", "slug")
   SELECT DISTINCT initcap("weave"::text), "weave"::text
   FROM "products"
   WHERE "weave" IS NOT NULL
   ON CONFLICT ("slug") DO NOTHING;

   INSERT INTO "weaves" ("name", "slug")
   SELECT DISTINCT initcap("version_weave"::text), "version_weave"::text
   FROM "_products_v"
   WHERE "version_weave" IS NOT NULL
   ON CONFLICT ("slug") DO NOTHING;
  `)

  // 3. Add relationship columns on products and product versions
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN IF NOT EXISTS "weave_id" integer;
   ALTER TABLE "_products_v" ADD COLUMN IF NOT EXISTS "version_weave_id" integer;
  `)

  // 4. Link existing products/versions to their weave documents
  await db.execute(sql`
   UPDATE "products" p
   SET "weave_id" = w."id"
   FROM "weaves" w
   WHERE w."slug" = p."weave"::text
     AND p."weave_id" IS NULL;

   UPDATE "_products_v" v
   SET "version_weave_id" = w."id"
   FROM "weaves" w
   WHERE w."slug" = v."version_weave"::text
     AND v."version_weave_id" IS NULL;
  `)

  // 5. Indexes and foreign keys for the new relationship columns
  await db.execute(sql`
   CREATE INDEX IF NOT EXISTS "products_weave_idx" ON "products" USING btree ("weave_id");
   CREATE INDEX IF NOT EXISTS "_products_v_version_version_weave_idx" ON "_products_v" USING btree ("version_weave_id");

   DO $$ BEGIN
     ALTER TABLE "products"
       ADD CONSTRAINT "products_weave_id_weaves_id_fk"
       FOREIGN KEY ("weave_id") REFERENCES "public"."weaves"("id")
       ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;

   DO $$ BEGIN
     ALTER TABLE "_products_v"
       ADD CONSTRAINT "_products_v_version_weave_id_weaves_id_fk"
       FOREIGN KEY ("version_weave_id") REFERENCES "public"."weaves"("id")
       ON DELETE set null ON UPDATE no action;
   EXCEPTION WHEN duplicate_object THEN null; END $$;
  `)

  // 6. Drop the legacy enum columns and their types
  await db.execute(sql`
   ALTER TABLE "products" DROP COLUMN IF EXISTS "weave";
   ALTER TABLE "_products_v" DROP COLUMN IF EXISTS "version_weave";
   DROP TYPE IF EXISTS "public"."enum_products_weave";
   DROP TYPE IF EXISTS "public"."enum__products_v_version_weave";
  `)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  // Restore the legacy enum columns and backfill them from weave docs where
  // the value is still a known enum member (admin-created weaves cannot be
  // represented in the old enum and are left unset).
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_weave" AS ENUM(${sql.raw(LEGACY_WEAVE_VALUES_SQL)});
   CREATE TYPE "public"."enum__products_v_version_weave" AS ENUM(${sql.raw(LEGACY_WEAVE_VALUES_SQL)});

   ALTER TABLE "products" ADD COLUMN "weave" "enum_products_weave";
   ALTER TABLE "_products_v" ADD COLUMN "version_weave" "enum__products_v_version_weave";

   UPDATE "products" p
   SET "weave" = w."slug"::"enum_products_weave"
   FROM "weaves" w
   WHERE w."id" = p."weave_id"
     AND w."slug" IN (${sql.raw(LEGACY_WEAVE_VALUES_SQL)});

   UPDATE "_products_v" v
   SET "version_weave" = w."slug"::"enum__products_v_version_weave"
   FROM "weaves" w
   WHERE w."id" = v."version_weave_id"
     AND w."slug" IN (${sql.raw(LEGACY_WEAVE_VALUES_SQL)});

   ALTER TABLE "products" DROP CONSTRAINT "products_weave_id_weaves_id_fk";
   DROP INDEX "products_weave_idx";
   ALTER TABLE "products" DROP COLUMN "weave_id";

   ALTER TABLE "_products_v" DROP CONSTRAINT "_products_v_version_weave_id_weaves_id_fk";
   DROP INDEX "_products_v_version_version_weave_idx";
   ALTER TABLE "_products_v" DROP COLUMN "version_weave_id";

   DROP TABLE "weaves";
  `)
}
