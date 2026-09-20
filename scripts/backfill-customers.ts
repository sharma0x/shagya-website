// =============================================================================
// Shayga — Backfill missing customers for existing Better Auth users
// =============================================================================
// Usage (run on the production/staging VPS or locally against a real DB):
//   node --env-file=.env --import tsx/esm scripts/backfill-customers.ts
//
// Scans every Better Auth user and ensures a Payload Customers record exists,
// recovering the verified phone number + Firebase UID from the stored ID token
// on their firebase account row. Idempotent — safe to re-run.
// =============================================================================

import { getDbPool } from '../src/lib/db-pool'
import { syncCustomerForSession } from '../src/lib/auth-sync'

async function main(): Promise<void> {
  const pool = getDbPool()

  // Pull every Better Auth user. LEFT JOIN keeps users with no customer row
  // (the ones the sync either failed for or never ran for).
  const { rows } = await pool.query(
    `SELECT u.id, u.email, u.name, u."phoneNumber"
     FROM "user" u
     LEFT JOIN customers c ON c.better_auth_user_id = u.id
     WHERE c.id IS NULL
     ORDER BY u."createdAt" ASC`,
  )

  console.log(
    `[Backfill] Found ${rows.length} Better Auth user(s) missing a customer record`,
  )

  let synced = 0
  let failed = 0

  for (const user of rows) {
    try {
      await syncCustomerForSession(user.id)
      synced++
      console.log(
        `[Backfill] ✅ synced ${user.id} (${user.email || 'no email'})`,
      )
    } catch (error) {
      failed++
      console.error(
        `[Backfill] ❌ failed ${user.id} (${user.email || 'no email'}):`,
        error,
      )
    }
  }

  console.log(
    `[Backfill] Done. synced=${synced} failed=${failed} total=${rows.length}`,
  )

  await pool.end()
}

main()
  .then(() => {
    console.log('[Backfill] Finished successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[Backfill] Fatal error:', error)
    process.exit(1)
  })