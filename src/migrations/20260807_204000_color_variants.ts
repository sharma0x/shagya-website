import { MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "products_gallery" CASCADE;
    DROP TABLE IF EXISTS "_products_v_version_gallery" CASCADE;
    ALTER TABLE "products" DROP COLUMN IF EXISTS "color";
    DROP TYPE IF EXISTS "public"."enum_products_color";
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_color_variants" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY,
      "color_id" integer REFERENCES "colors"("id") ON DELETE SET NULL,
      "price_override" numeric,
      "stock" numeric DEFAULT 0,
      "sku" varchar,
      "enabled" boolean DEFAULT true
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "products_color_variants_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" varchar NOT NULL,
      "id" varchar PRIMARY KEY,
      "image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "alt" varchar
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_products_v_version_color_variants" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY,
      "color_id" integer REFERENCES "colors"("id") ON DELETE SET NULL,
      "price_override" numeric,
      "stock" numeric DEFAULT 0,
      "sku" varchar,
      "enabled" boolean DEFAULT true,
      "_uuid" varchar
    );
  `)

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "_products_v_version_color_variants_gallery" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" serial PRIMARY KEY,
      "image_id" integer REFERENCES "media"("id") ON DELETE SET NULL,
      "alt" varchar,
      "_uuid" varchar
    );
  `)

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS "products_color_variants_order_idx" ON "products_color_variants" ("_order");
    CREATE INDEX IF NOT EXISTS "products_color_variants_parent_id_idx" ON "products_color_variants" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "products_color_variants_color_idx" ON "products_color_variants" ("color_id");

    CREATE INDEX IF NOT EXISTS "products_color_variants_gallery_order_idx" ON "products_color_variants_gallery" ("_order");
    CREATE INDEX IF NOT EXISTS "products_color_variants_gallery_parent_id_idx" ON "products_color_variants_gallery" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "products_color_variants_gallery_image_idx" ON "products_color_variants_gallery" ("image_id");

    CREATE INDEX IF NOT EXISTS "_products_v_version_color_variants_order_idx" ON "_products_v_version_color_variants" ("_order");
    CREATE INDEX IF NOT EXISTS "_products_v_version_color_variants_parent_id_idx" ON "_products_v_version_color_variants" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_products_v_version_color_variants_color_idx" ON "_products_v_version_color_variants" ("color_id");

    CREATE INDEX IF NOT EXISTS "_products_v_version_color_variants_gallery_order_idx" ON "_products_v_version_color_variants_gallery" ("_order");
    CREATE INDEX IF NOT EXISTS "_products_v_version_color_variants_gallery_parent_id_idx" ON "_products_v_version_color_variants_gallery" ("_parent_id");
    CREATE INDEX IF NOT EXISTS "_products_v_version_color_variants_gallery_image_idx" ON "_products_v_version_color_variants_gallery" ("image_id");
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "products_color_variants"
        ADD CONSTRAINT "products_color_variants_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "products"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "products_color_variants_gallery"
        ADD CONSTRAINT "products_color_variants_gallery_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "products_color_variants"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "_products_v_version_color_variants"
        ADD CONSTRAINT "_products_v_version_color_variants_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "_products_v"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)

  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "_products_v_version_color_variants_gallery"
        ADD CONSTRAINT "_products_v_version_color_variants_gallery_parent_id_fk"
        FOREIGN KEY ("_parent_id") REFERENCES "_products_v_version_color_variants"("id") ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN null;
    END $$;
  `)
}
