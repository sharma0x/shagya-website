import { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    -- Create phone_identities table for verified phone authentication
    CREATE TABLE IF NOT EXISTS "phone_identities" (
      "id" SERIAL PRIMARY KEY,
      "user_id" VARCHAR NOT NULL,
      "phone_number" VARCHAR NOT NULL,
      "firebase_uid" VARCHAR NOT NULL,
      "verified_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),

      -- Constraints
      CONSTRAINT "phone_identities_phone_number_unique" UNIQUE ("phone_number"),
      CONSTRAINT "phone_identities_firebase_uid_unique" UNIQUE ("firebase_uid"),
      CONSTRAINT "phone_identities_user_id_unique" UNIQUE ("user_id"),
      CONSTRAINT "phone_identities_user_id_fkey" FOREIGN KEY ("user_id")
        REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );

    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS "phone_identities_user_id_idx" ON "phone_identities" ("user_id");
    CREATE INDEX IF NOT EXISTS "phone_identities_phone_number_idx" ON "phone_identities" ("phone_number");
    CREATE INDEX IF NOT EXISTS "phone_identities_firebase_uid_idx" ON "phone_identities" ("firebase_uid");
  `)
}

export async function down({ payload }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(`
    -- Drop indexes
    DROP INDEX IF EXISTS "phone_identities_firebase_uid_idx";
    DROP INDEX IF EXISTS "phone_identities_phone_number_idx";
    DROP INDEX IF EXISTS "phone_identities_user_id_idx";

    -- Drop table
    DROP TABLE IF EXISTS "phone_identities";
  `)
}
