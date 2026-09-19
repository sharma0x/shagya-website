import { getPayload } from 'payload'
import config from '@payload-config'
import {
  createPhoneIdentity,
  getPhoneIdentityByUserId,
  getUserIdByPhoneNumber,
} from './phone-identity'
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
 * Retry a function with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 100,
): Promise<T> {
  let lastError: Error | undefined
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, attempt)
        console.log(
          `[Auth Sync] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
  throw lastError
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
      try {
        await retryWithBackoff(async () => {
          const existingPhoneIdentity = await getPhoneIdentityByUserId(user.id)
          if (!existingPhoneIdentity) {
            console.log('[Auth Sync] Creating new phone identity')
            await createPhoneIdentity({
              userId: user.id,
              phoneNumber: user.phoneNumber!,
              firebaseUid: user.firebaseUid!,
            })
            console.log('[Auth Sync] Phone identity created successfully')
          } else {
            console.log('[Auth Sync] Phone identity already exists')
          }
        })
      } catch (error) {
        console.error(
          `[Auth Sync] Failed to create phone identity for user ${user.id}:`,
          error,
        )
        // Continue with customer sync - phone identity can be added later
      }
    }

    // 2. Determine if email is a fallback (phone user)
    const isFallbackEmail = user.email?.includes('@phone.shayga.in')
    const email = isFallbackEmail ? '' : user.email || ''
    const phone = user.phoneNumber || ''
    const name = user.name || 'Customer'

    // 3. Use atomic upsert to prevent race conditions
    // This ensures only one customer record per betterAuthUserId
    console.log('[Auth Sync] Performing atomic upsert')
    const result = await pool.query(
      `
      INSERT INTO customers (
        better_auth_user_id,
        name,
        email,
        phone,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, NOW(), NOW())
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
      [user.id, name, email, phone],
    )

    const customer = result.rows[0]
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
