import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

const FABRICS = [
  'silk',
  'cotton',
  'linen',
  'georgette',
  'chiffon',
  'crepe',
  'velvet',
  'net',
  'blend',
]

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  const db = payload.db.drizzle

  // 1. Ensure all hardcoded fabrics exist in fabric_types table
  const fabricMap: Record<string, number> = {}

  for (const fSlug of FABRICS) {
    const fName = fSlug.charAt(0).toUpperCase() + fSlug.slice(1)

    const existing = await db.execute(
      sql`SELECT id FROM fabric_types WHERE slug = ${fSlug} LIMIT 1`,
    )

    if (existing.rows.length > 0) {
      fabricMap[fSlug] = existing.rows[0].id as number
    } else {
      const now = new Date().toISOString()
      const inserted = await db.execute(
        sql`INSERT INTO fabric_types (name, slug, updated_at, created_at) VALUES (${fName}, ${fSlug}, ${now}, ${now}) RETURNING id`,
      )
      fabricMap[fSlug] = inserted.rows[0].id as number
    }
  }

  // 2. Add the new integer foreign key columns
  await db.execute(sql`ALTER TABLE "products" ADD COLUMN "fabric_id" integer;`)
  await db.execute(
    sql`ALTER TABLE "_products_v" ADD COLUMN "version_fabric_id" integer;`,
  )
  await db.execute(
    sql`ALTER TABLE "collections_blocks_fabric_rule" ADD COLUMN "value_id" integer;`,
  )

  // 3. Migrate data from old enum columns to new FK columns
  for (const [slug, id] of Object.entries(fabricMap)) {
    await db.execute(
      sql`UPDATE "products" SET "fabric_id" = ${id} WHERE "fabric"::text = ${slug};`,
    )
    await db.execute(
      sql`UPDATE "_products_v" SET "version_fabric_id" = ${id} WHERE "version_fabric"::text = ${slug};`,
    )
    await db.execute(
      sql`UPDATE "collections_blocks_fabric_rule" SET "value_id" = ${id} WHERE "value"::text = ${slug};`,
    )
  }

  // 4. Drop old enum columns
  await db.execute(sql`ALTER TABLE "products" DROP COLUMN "fabric";`)
  await db.execute(sql`ALTER TABLE "_products_v" DROP COLUMN "version_fabric";`)
  await db.execute(
    sql`ALTER TABLE "collections_blocks_fabric_rule" DROP COLUMN "value";`,
  )

  // 5. Add foreign key constraints
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "products" ADD CONSTRAINT "products_fabric_id_fabric_types_id_fk" FOREIGN KEY ("fabric_id") REFERENCES "public"."fabric_types"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_fabric_id_fabric_types_id_fk" FOREIGN KEY ("version_fabric_id") REFERENCES "public"."fabric_types"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)
  await db.execute(sql`
    DO $$ BEGIN
      ALTER TABLE "collections_blocks_fabric_rule" ADD CONSTRAINT "collections_blocks_fabric_rule_value_id_fabric_types_id_fk" FOREIGN KEY ("value_id") REFERENCES "public"."fabric_types"("id") ON DELETE set null ON UPDATE no action;
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `)

  // 6. Create Indexes
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "products_fabric_idx" ON "products" USING btree ("fabric_id");`,
  )
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "_products_v_version_version_fabric_idx" ON "_products_v" USING btree ("version_fabric_id");`,
  )
  await db.execute(
    sql`CREATE INDEX IF NOT EXISTS "collections_blocks_fabric_rule_value_idx" ON "collections_blocks_fabric_rule" USING btree ("value_id");`,
  )

  // 7. Drop enums
  await db.execute(sql`DROP TYPE "public"."enum_products_fabric";`)
  await db.execute(sql`DROP TYPE "public"."enum__products_v_version_fabric";`)
  await db.execute(
    sql`DROP TYPE "public"."enum_collections_blocks_fabric_rule_value";`,
  )
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  const db = payload.db.drizzle

  await db.execute(
    sql`CREATE TYPE "public"."enum_products_fabric" AS ENUM('silk', 'cotton', 'linen', 'georgette', 'chiffon', 'crepe', 'velvet', 'net', 'blend');`,
  )
  await db.execute(
    sql`CREATE TYPE "public"."enum__products_v_version_fabric" AS ENUM('silk', 'cotton', 'linen', 'georgette', 'chiffon', 'crepe', 'velvet', 'net', 'blend');`,
  )
  await db.execute(
    sql`CREATE TYPE "public"."enum_collections_blocks_fabric_rule_value" AS ENUM('silk', 'cotton', 'linen', 'georgette', 'chiffon', 'crepe', 'velvet', 'net', 'blend');`,
  )

  await db.execute(
    sql`ALTER TABLE "products" ADD COLUMN "fabric" "public"."enum_products_fabric";`,
  )
  await db.execute(
    sql`ALTER TABLE "_products_v" ADD COLUMN "version_fabric" "public"."enum__products_v_version_fabric";`,
  )
  await db.execute(
    sql`ALTER TABLE "collections_blocks_fabric_rule" ADD COLUMN "value" "public"."enum_collections_blocks_fabric_rule_value";`,
  )

  await db.execute(
    sql`ALTER TABLE "products" DROP CONSTRAINT IF EXISTS "products_fabric_id_fabric_types_id_fk";`,
  )
  await db.execute(
    sql`ALTER TABLE "_products_v" DROP CONSTRAINT IF EXISTS "_products_v_version_fabric_id_fabric_types_id_fk";`,
  )
  await db.execute(
    sql`ALTER TABLE "collections_blocks_fabric_rule" DROP CONSTRAINT IF EXISTS "collections_blocks_fabric_rule_value_id_fabric_types_id_fk";`,
  )

  await db.execute(sql`DROP INDEX IF EXISTS "products_fabric_idx";`)
  await db.execute(
    sql`DROP INDEX IF EXISTS "_products_v_version_version_fabric_idx";`,
  )
  await db.execute(
    sql`DROP INDEX IF EXISTS "collections_blocks_fabric_rule_value_idx";`,
  )

  await db.execute(sql`ALTER TABLE "products" DROP COLUMN "fabric_id";`)
  await db.execute(
    sql`ALTER TABLE "_products_v" DROP COLUMN "version_fabric_id";`,
  )
  await db.execute(
    sql`ALTER TABLE "collections_blocks_fabric_rule" DROP COLUMN "value_id";`,
  )
}
