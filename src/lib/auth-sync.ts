import { getPayload } from 'payload'
import config from '@payload-config'
import { createPhoneIdentity, getPhoneIdentityByUserId } from './phone-identity'
import { getDbPool } from './db-pool'

interface BetterAuthUser {
  id: string
  email: string
  name: string
  phoneNumber?: string
  // Firebase UID is passed when user signs up with phone
  firebaseUid?: string
}

/**
 * Decode a stored Firebase ID token's claims.
 *
 * The better-auth-firebase-auth plugin stores the raw ID token on the account
 * row when a phone sign-in links the Firebase identity. The token has long
 * expired, but its (unencrypted) JWT payload still carries the verified
 * `phone_number` and `sub` (Firebase UID) claims, which are exactly what we
 * need to backfill a phone number on an existing Better Auth user.
 */
export function decodeStoredIdToken(idToken: string): {
  phone_number?: string
  sub?: string
} {
  try {
    const payload = idToken.split('.')[1]
    const claims = payload
      ? JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
      : undefined
    return claims !== null && typeof claims === 'object' ? claims : {}
  } catch {
    return {}
  }
}

/**
 * Load the Better Auth user row for a session.
 */
async function loadUserById(userId: string): Promise<{
  id: string
  email: string
  name: string
  phoneNumber: string
} | null> {
  const pool = getDbPool()
  const result = await pool.query(
    `SELECT id, email, name, "phoneNumber" FROM "user" WHERE id = $1 LIMIT 1`,
    [userId],
  )
  const row = result.rows[0]
  if (!row) return null
  return {
    id: row.id,
    email: row.email || '',
    name: row.name || '',
    phoneNumber: row.phoneNumber || '',
  }
}

/**
 * Look up the Firebase account row(s) for a user and return the verified
 * phone number + Firebase UID recovered from the stored ID token.
 */
async function getFirebasePhoneClaims(
  userId: string,
): Promise<{ phoneNumber: string; firebaseUid: string }> {
  const pool = getDbPool()
  const result = await pool.query(
    `SELECT "idToken" FROM "account" WHERE "userId" = $1 AND "providerId" = 'firebase' AND "idToken" IS NOT NULL LIMIT 1`,
    [userId],
  )
  const idToken = result.rows[0]?.idToken
  if (!idToken) return { phoneNumber: '', firebaseUid: '' }
  const claims = decodeStoredIdToken(idToken)
  return {
    phoneNumber: claims.phone_number || '',
    firebaseUid: claims.sub || '',
  }
}

/**
 * Persist a verified phone number onto the Better Auth user row, along with a
 * friendly display name when the user has none yet.
 */
async function setUserPhoneNumber(
  userId: string,
  phoneNumber: string,
  friendlyName: string,
): Promise<void> {
  const pool = getDbPool()
  await pool.query(
    `UPDATE "user" SET "phoneNumber" = $1, "name" = COALESCE(NULLIF("name", ''), $2) WHERE id = $3`,
    [phoneNumber, friendlyName, userId],
  )
}

/**
 * Create a phone identity for a user if they have a verified phone number.
 * Never throws — a failure here must not block customer sync.
 */
async function ensurePhoneIdentity(
  userId: string,
  phoneNumber: string,
  firebaseUid: string,
): Promise<void> {
  if (!phoneNumber || !firebaseUid) return
  try {
    const existing = await getPhoneIdentityByUserId(userId)
    if (existing) {
      console.log('[Auth Sync] Phone identity already exists for user', userId)
      return
    }
    await createPhoneIdentity({
      userId,
      phoneNumber,
      firebaseUid,
    })
    console.log('[Auth Sync] Phone identity created for user', userId)
  } catch (error) {
    console.error(
      `[Auth Sync] Failed to create phone identity for user ${userId}:`,
      error,
    )
  }
}

/**
 * Sync a Better Auth user to the Payload Customers collection.
 *
 * IMPROVED FLOW:
 * 1. Create phone identity if user signed up with phone (with retry)
 * 2. Use database-level upsert to prevent race conditions
 * 3. Atomic customer creation/update via raw SQL
 * 4. Sync back to Payload CMS for consistency
 *
 * This approach prevents duplicate customers and ensures data consistency
 * even under high concurrency.
 */
export async function syncCustomer(user: BetterAuthUser): Promise<void> {
  const startTime = Date.now()
  try {
    console.log('[Auth Sync] Starting customer sync for user:', {
      id: user.id,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      firebaseUid: user.firebaseUid,
    })

    const payload = await getPayload({ config })
    const pool = getDbPool()

    // 1. Create phone identity if user signed up with phone (with retry)
    if (user.phoneNumber && user.firebaseUid) {
      console.log('[Auth Sync] Processing phone identity')
      await ensurePhoneIdentity(user.id, user.phoneNumber, user.firebaseUid)
    }

    // 2. Determine email. For phone users the fallback email
    //    (`${firebaseUid}@phone.shayga.in`) is unique per user, satisfies the
    //    required+unique email field, and the API/UI already filters it out.
    const email = user.email || ''

    // 3. Use atomic upsert to prevent race conditions
    // This ensures only one customer record per betterAuthUserId
    console.log('[Auth Sync] Performing atomic upsert')
    const result = await pool.query(
      `
      WITH claimed_legacy_customer AS (
        UPDATE customers
        SET
          better_auth_user_id = $1,
          name = CASE
            WHEN name = '' OR name IS NULL OR name = 'Customer' THEN $2
            ELSE name
          END,
          phone = CASE
            WHEN phone = '' OR phone IS NULL THEN $4
            ELSE phone
          END,
          updated_at = NOW()
        WHERE LOWER(email) = LOWER($3)
          AND better_auth_user_id IS NULL
        RETURNING id
      ), insertable_customer AS (
        SELECT $1 AS better_auth_user_id,
               $2 AS name,
               $3 AS email,
               $4 AS phone
        WHERE NOT EXISTS (SELECT 1 FROM claimed_legacy_customer)
      )
      INSERT INTO customers (
        better_auth_user_id,
        name,
        email,
        phone,
        created_at,
        updated_at
      )
      SELECT better_auth_user_id, name, email, phone, NOW(), NOW()
      FROM insertable_customer
      ON CONFLICT (better_auth_user_id)
      DO UPDATE SET
        name = CASE
          WHEN customers.name = '' OR customers.name IS NULL OR customers.name = 'Customer'
          THEN EXCLUDED.name
          ELSE customers.name
        END,
        email = CASE
          WHEN customers.email = '' OR customers.email IS NULL
          THEN EXCLUDED.email
          ELSE customers.email
        END,
        phone = CASE
          WHEN customers.phone = '' OR customers.phone IS NULL
          THEN EXCLUDED.phone
          ELSE customers.phone
        END,
        updated_at = NOW()
      RETURNING id, name, email, phone
      `,
      [user.id, user.name || 'Customer', email, user.phoneNumber || ''],
    )

    const customer =
      result.rows[0] ||
      (
        await pool.query(
          `SELECT id, name, email, phone
           FROM customers
           WHERE better_auth_user_id = $1
           LIMIT 1`,
          [user.id],
        )
      ).rows[0]
    console.log('[Auth Sync] Customer upserted successfully:', {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      duration: `${Date.now() - startTime}ms`,
    })

    // 4. Verify Payload CMS can read the customer
    // This ensures Payload's internal cache is updated
    try {
      await payload.findByID({
        collection: 'customers',
        id: customer.id,
        overrideAccess: true,
      })
    } catch (error) {
      console.warn(
        '[Auth Sync] Customer exists in DB but not accessible via Payload:',
        error,
      )
    }
  } catch (error) {
    console.error(
      `[Auth Sync] Failed to sync customer for user ${user.id}:`,
      error,
    )
    throw error // Re-throw to ensure Better Auth knows the hook failed
  }
}

/**
 * Re-sync the customer for an existing session user.
 *
 * This is the safety net for users whose customer record was never created
 * (e.g. created during the broken window where phone users synced with an
 * empty email). It runs on every session creation (login) and on-demand from
 * the customer API routes.
 */
export async function syncCustomerForSession(userId: string): Promise<void> {
  try {
    const user = await loadUserById(userId)
    if (!user) {
      console.warn('[Auth Sync] Session user not found in DB:', userId)
      return
    }

    const { phoneNumber: tokenPhone, firebaseUid } =
      await getFirebasePhoneClaims(userId)

    // Recover the verified phone number from the stored Firebase ID token
    // if it was never written onto the Better Auth user row.
    const phoneNumber = user.phoneNumber || tokenPhone
    const friendlyName = phoneNumber
      ? `User ${phoneNumber.slice(-4)}`
      : user.name || 'Customer'

    if (phoneNumber && !user.phoneNumber) {
      try {
        await setUserPhoneNumber(userId, phoneNumber, friendlyName)
      } catch (error) {
        console.error(
          `[Auth Sync] Failed to persist phone number for user ${userId}:`,
          error,
        )
      }
    }

    await ensurePhoneIdentity(userId, phoneNumber, firebaseUid)

    await syncCustomer({
      id: userId,
      email: user.email,
      name: user.name || friendlyName,
      phoneNumber,
      firebaseUid,
    })
  } catch (error) {
    console.error(
      `[Auth Sync] Failed to sync customer for session user ${userId}:`,
      error,
    )
    throw error
  }
}

/**
 * Fire-and-forget wrapper for the Better Auth session hook. Never throws,
 * so a sync failure can never break a login.
 */
export async function runSessionSyncSafely(userId: string): Promise<void> {
  try {
    await syncCustomerForSession(userId)
  } catch (error) {
    console.error('[Auth Sync] Session sync failed (non-fatal):', error)
  }
}

/**
 * Find a customer for a session user, repairing (creating or healing) the
 * record if it is missing or was created during the broken window with an
 * empty email. Returns the Payload customer doc, or null if it still cannot be
 * found after a repair attempt.
 */
export async function findOrRepairCustomer(
  userId: string,
): Promise<Record<string, unknown> | null> {
  const payload = await getPayload({ config })

  const findCustomer = () =>
    payload.find({
      collection: 'customers',
      where: { betterAuthUserId: { equals: userId } },
      limit: 1,
    })

  let customers = await findCustomer()
  const existing = customers.docs[0] as unknown as
    | Record<string, unknown>
    | undefined
  const needsHealing =
    !existing ||
    existing.email === '' ||
    existing.email === null ||
    existing.email === undefined

  if (needsHealing) {
    console.log(
      '[Auth Sync] Customer missing or stale — attempting repair for user',
      userId,
    )
    try {
      await syncCustomerForSession(userId)
      customers = await findCustomer()
    } catch (error) {
      console.error('[Auth Sync] Customer repair failed:', error)
    }
  }

  return customers.docs[0]
    ? (customers.docs[0] as unknown as Record<string, unknown>)
    : null
}
