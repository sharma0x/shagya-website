import { MigrateUpArgs, MigrateDownArgs } from '@payloadcms/db-postgres'

/**
 * Migration: Fix phone_identities phone_number constraint
 *
 * ISSUE: The original constraint had an invalid regex pattern:
 *   CHECK (phone_number::text ~ '^+[1-9]d{1,14}$')
 *   - Missing backslash escapes: should be '\+' and '\d'
 *   - Wrong digit count: '\d{1,14}' allows 1-14 digits after first digit
 *     but E.164 format can have up to 15 total digits
 *
 * FIX: Use correct E.164 phone number format regex:
 *   ^\+[1-9]\d{0,14}$
 *   - Starts with '+'
 *   - First digit 1-9 (country code starts with non-zero)
 *   - Then 0-14 more digits (total up to 15 digits)
 *   - Examples:
 *     +917678228684 (India, 13 digits total) ✓
 *     +1234567890 (USA, 11 digits total) ✓
 *     +861234567890 (China, 13 digits total) ✓
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  console.log('[Migration] Fixing phone_identities constraint...')

  // Drop the broken constraint
  await db.execute(`
    ALTER TABLE phone_identities
    DROP CONSTRAINT IF EXISTS phone_identities_phone_number_check;
  `)

  console.log('[Migration] Dropped old constraint')

  // Add correct constraint with proper regex
  await db.execute(`
    ALTER TABLE phone_identities
    ADD CONSTRAINT phone_identities_phone_number_check
    CHECK (phone_number::text ~ '^\\+[1-9]\\d{0,14}$');
  `)

  console.log(
    '✅ Fixed phone_identities constraint - now accepts E.164 format phone numbers',
  )
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Restore the original (broken) constraint
  await db.execute(`
    ALTER TABLE phone_identities
    DROP CONSTRAINT IF EXISTS phone_identities_phone_number_check;
  `)

  await db.execute(`
    ALTER TABLE phone_identities
    ADD CONSTRAINT phone_identities_phone_number_check
    CHECK (phone_number::text ~ '^+[1-9]d{1,14}$');
  `)

  console.log('⚠️  Reverted to original (broken) constraint')
}
