import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Migration: Add unique constraint on betterAuthUserId and updated_at trigger
 *
 * This migration ensures:
 * 1. One customer per Better Auth user (prevents duplicates)
 * 2. Automatic updated_at timestamp updates
 * 3. Better query performance with indexes
 */
export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  // 1. Add unique constraint on betterAuthUserId (if not exists)
  // Use snake_case column name as Payload stores it
  await db.execute(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'customers_better_auth_user_id_unique'
      ) THEN
        ALTER TABLE customers
        ADD CONSTRAINT customers_better_auth_user_id_unique
        UNIQUE (better_auth_user_id);
      END IF;
    END $$;
  `)

  // 2. Create trigger function for automatic updated_at updates
  await db.execute(`
    CREATE OR REPLACE FUNCTION update_customers_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `)

  // 3. Create trigger (drop first if exists)
  await db.execute(`
    DROP TRIGGER IF EXISTS customers_updated_at ON customers;
  `)

  await db.execute(`
    CREATE TRIGGER customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW
    EXECUTE FUNCTION update_customers_updated_at();
  `)

  // 4. Add index on betterAuthUserId for faster lookups
  await db.execute(`
    CREATE INDEX IF NOT EXISTS customers_better_auth_user_id_idx
    ON customers (better_auth_user_id);
  `)

  // 5. Add index on email for faster email-based lookups
  await db.execute(`
    CREATE INDEX IF NOT EXISTS customers_email_idx
    ON customers (email)
    WHERE email IS NOT NULL AND email != '';
  `)

  console.log('✅ Added unique constraints and triggers to customers table')
}

export async function down({ db, payload }: MigrateDownArgs): Promise<void> {
  // Remove in reverse order
  await db.execute(`DROP INDEX IF EXISTS customers_email_idx;`)
  await db.execute(`DROP INDEX IF EXISTS customers_better_auth_user_id_idx;`)
  await db.execute(`DROP TRIGGER IF EXISTS customers_updated_at ON customers;`)
  await db.execute(`DROP FUNCTION IF EXISTS update_customers_updated_at();`)
  await db.execute(
    `ALTER TABLE customers DROP CONSTRAINT IF EXISTS customers_better_auth_user_id_unique;`,
  )

  console.log('✅ Removed unique constraints and triggers from customers table')
}
