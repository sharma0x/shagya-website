import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_collections_match_type" AS ENUM('all', 'any');
  CREATE TYPE "public"."enum_collections_blocks_brand_rule_operator" AS ENUM('equals', 'not_equals');
  CREATE TYPE "public"."enum_collections_blocks_fabric_rule_operator" AS ENUM('equals', 'not_equals');
  CREATE TYPE "public"."enum_collections_blocks_fabric_rule_value" AS ENUM('silk', 'cotton', 'linen', 'georgette', 'chiffon', 'crepe', 'velvet', 'net', 'blend');
  CREATE TYPE "public"."enum_collections_blocks_price_rule_operator" AS ENUM('equals', 'greater_than', 'less_than');
  CREATE TYPE "public"."enum_collections_blocks_tag_rule_operator" AS ENUM('equals', 'contains');
  CREATE TYPE "public"."enum_collections_blocks_occasion_rule_operator" AS ENUM('equals', 'not_equals');

  ALTER TABLE "collections" ADD COLUMN "is_automated" boolean DEFAULT false;
  ALTER TABLE "collections" ADD COLUMN "match_type" "enum_collections_match_type" DEFAULT 'all';

  CREATE TABLE "collections_blocks_brand_rule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"operator" "enum_collections_blocks_brand_rule_operator" DEFAULT 'equals',
  	"value_id" integer,
  	"block_name" varchar
  );

  CREATE TABLE "collections_blocks_fabric_rule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"operator" "enum_collections_blocks_fabric_rule_operator" DEFAULT 'equals',
  	"value" "enum_collections_blocks_fabric_rule_value",
  	"block_name" varchar
  );

  CREATE TABLE "collections_blocks_price_rule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"operator" "enum_collections_blocks_price_rule_operator",
  	"value" numeric,
  	"block_name" varchar
  );

  CREATE TABLE "collections_blocks_tag_rule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"operator" "enum_collections_blocks_tag_rule_operator" DEFAULT 'contains',
  	"value" varchar,
  	"block_name" varchar
  );

  CREATE TABLE "collections_blocks_occasion_rule" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"operator" "enum_collections_blocks_occasion_rule_operator" DEFAULT 'equals',
  	"value_id" integer,
  	"block_name" varchar
  );

  ALTER TABLE "collections_blocks_brand_rule" ADD CONSTRAINT "collections_blocks_brand_rule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "collections_blocks_brand_rule" ADD CONSTRAINT "collections_blocks_brand_rule_value_id_fk" FOREIGN KEY ("value_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "collections_blocks_fabric_rule" ADD CONSTRAINT "collections_blocks_fabric_rule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "collections_blocks_price_rule" ADD CONSTRAINT "collections_blocks_price_rule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "collections_blocks_tag_rule" ADD CONSTRAINT "collections_blocks_tag_rule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "collections_blocks_occasion_rule" ADD CONSTRAINT "collections_blocks_occasion_rule_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "collections_blocks_occasion_rule" ADD CONSTRAINT "collections_blocks_occasion_rule_value_id_fk" FOREIGN KEY ("value_id") REFERENCES "public"."occasions"("id") ON DELETE set null ON UPDATE no action;

  CREATE INDEX "collections_blocks_brand_rule_order_idx" ON "collections_blocks_brand_rule" USING btree ("_order");
  CREATE INDEX "collections_blocks_brand_rule_parent_id_idx" ON "collections_blocks_brand_rule" USING btree ("_parent_id");
  CREATE INDEX "collections_blocks_brand_rule_path_idx" ON "collections_blocks_brand_rule" USING btree ("_path");
  CREATE INDEX "collections_blocks_brand_rule_value_idx" ON "collections_blocks_brand_rule" USING btree ("value_id");

  CREATE INDEX "collections_blocks_fabric_rule_order_idx" ON "collections_blocks_fabric_rule" USING btree ("_order");
  CREATE INDEX "collections_blocks_fabric_rule_parent_id_idx" ON "collections_blocks_fabric_rule" USING btree ("_parent_id");
  CREATE INDEX "collections_blocks_fabric_rule_path_idx" ON "collections_blocks_fabric_rule" USING btree ("_path");

  CREATE INDEX "collections_blocks_price_rule_order_idx" ON "collections_blocks_price_rule" USING btree ("_order");
  CREATE INDEX "collections_blocks_price_rule_parent_id_idx" ON "collections_blocks_price_rule" USING btree ("_parent_id");
  CREATE INDEX "collections_blocks_price_rule_path_idx" ON "collections_blocks_price_rule" USING btree ("_path");

  CREATE INDEX "collections_blocks_tag_rule_order_idx" ON "collections_blocks_tag_rule" USING btree ("_order");
  CREATE INDEX "collections_blocks_tag_rule_parent_id_idx" ON "collections_blocks_tag_rule" USING btree ("_parent_id");
  CREATE INDEX "collections_blocks_tag_rule_path_idx" ON "collections_blocks_tag_rule" USING btree ("_path");

  CREATE INDEX "collections_blocks_occasion_rule_order_idx" ON "collections_blocks_occasion_rule" USING btree ("_order");
  CREATE INDEX "collections_blocks_occasion_rule_parent_id_idx" ON "collections_blocks_occasion_rule" USING btree ("_parent_id");
  CREATE INDEX "collections_blocks_occasion_rule_path_idx" ON "collections_blocks_occasion_rule" USING btree ("_path");
  CREATE INDEX "collections_blocks_occasion_rule_value_idx" ON "collections_blocks_occasion_rule" USING btree ("value_id");
  `)
}

export async function down({
  db,
  payload,
  req,
}: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "collections_blocks_brand_rule" CASCADE;
  DROP TABLE "collections_blocks_fabric_rule" CASCADE;
  DROP TABLE "collections_blocks_price_rule" CASCADE;
  DROP TABLE "collections_blocks_tag_rule" CASCADE;
  DROP TABLE "collections_blocks_occasion_rule" CASCADE;

  ALTER TABLE "collections" DROP COLUMN IF EXISTS "match_type";
  ALTER TABLE "collections" DROP COLUMN IF EXISTS "is_automated";

  DROP TYPE "public"."enum_collections_match_type";
  DROP TYPE "public"."enum_collections_blocks_brand_rule_operator";
  DROP TYPE "public"."enum_collections_blocks_fabric_rule_operator";
  DROP TYPE "public"."enum_collections_blocks_fabric_rule_value";
  DROP TYPE "public"."enum_collections_blocks_price_rule_operator";
  DROP TYPE "public"."enum_collections_blocks_tag_rule_operator";
  DROP TYPE "public"."enum_collections_blocks_occasion_rule_operator";
  `)
}
