import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "email_templates" (
      "id"                  serial PRIMARY KEY NOT NULL,
      "name"                varchar                                      NOT NULL,
      "slug"                varchar                                      NOT NULL,
      "is_active"           boolean              DEFAULT true            NOT NULL,
      "subject"             varchar                                      NOT NULL,
      "body"                text                                         NOT NULL,
      "available_variables" varchar,
      "updated_at"          timestamp(3) with time zone DEFAULT now()    NOT NULL,
      "created_at"          timestamp(3) with time zone DEFAULT now()    NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS "email_templates_slug_idx"
      ON "email_templates" USING btree ("slug");
    CREATE INDEX IF NOT EXISTS "email_templates_updated_at_idx"
      ON "email_templates" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "email_templates_created_at_idx"
      ON "email_templates" USING btree ("created_at");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "email_templates_created_at_idx";
    DROP INDEX IF EXISTS "email_templates_updated_at_idx";
    DROP INDEX IF EXISTS "email_templates_slug_idx";
    DROP TABLE IF EXISTS "email_templates";
  `)
}
