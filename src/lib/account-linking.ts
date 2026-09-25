import { getDbPool } from './db-pool'
import {
  getPhoneIdentityByUserId,
  getPhoneIdentityByPhoneNumber,
  getFirebaseAccountOwner,
  createPhoneIdentity,
} from './phone-identity'
import { normalizePhoneNumber, isValidE164PhoneNumber } from './phone-number'
import { sendOTPEmail } from '@/email/send'
import { syncCustomerForSession } from './auth-sync'
import { rateLimiter, RATE_LIMITS } from './rate-limit'
import { randomUUID } from 'node:crypto'

export interface PhoneIdentityData {
  phoneNumber: string
  verifiedAt: string
}

export interface SecurityStatusData {
  email: string | null
  isEmailVerified: boolean
  phone: string | null
  isPhoneVerified: boolean
  canRemovePhone: boolean
  canRemoveEmail: boolean
}

/**
 * Sign a cookie value matching Better Auth's HMAC-SHA256 signature format:
 * value = encodeURIComponent(`${value}.${base64Signature}`)
 */
export async function signBetterAuthCookie(
  value: string,
  secret: string,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(value),
  )
  const base64Sig = Buffer.from(signature).toString('base64')
  return encodeURIComponent(`${value}.${base64Sig}`)
}

/**
 * Links and verifies a phone number for the current user.
 * If this phone number was previously associated with another user (e.g., an earlier
 * phone-only login that created a fallback account), it automatically merges that
 * user's customer record, orders, and addresses into the current authenticated account.
 */
export async function linkPhoneToUser(input: {
  currentUserId: string
  phoneNumber: string
  firebaseUid: string
  idToken: string
}): Promise<{
  success: boolean
  phoneIdentity: PhoneIdentityData
}> {
  const normalizedPhoneNumber = normalizePhoneNumber(input.phoneNumber)

  if (!isValidE164PhoneNumber(normalizedPhoneNumber)) {
    throw new Error(
      'Enter a valid phone number in E.164 format (e.g. +919876543210)',
    )
  }

  const pool = getDbPool()

  // Find if phone or firebaseUid is currently registered to another account
  const existingIdentity = await getPhoneIdentityByPhoneNumber(
    normalizedPhoneNumber,
  )
  const existingAccount = await getFirebaseAccountOwner(input.firebaseUid)

  const otherUserId =
    existingIdentity && existingIdentity.userId !== input.currentUserId
      ? existingIdentity.userId
      : existingAccount && existingAccount.userId !== input.currentUserId
        ? existingAccount.userId
        : null

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (otherUserId) {
      console.log(
        `[Account Linking] Merging phone account ${otherUserId} into current user ${input.currentUserId}`,
      )

      // 1. Fetch other customer and current customer records
      const otherCustRes = await client.query(
        `SELECT id, email, phone FROM customers WHERE better_auth_user_id = $1`,
        [otherUserId],
      )
      const currentCustRes = await client.query(
        `SELECT id, email, phone FROM customers WHERE better_auth_user_id = $1`,
        [input.currentUserId],
      )

      const otherCust = otherCustRes.rows[0]
      const currentCust = currentCustRes.rows[0]

      if (otherCust) {
        if (currentCust) {
          // Re-point addresses from other customer to current customer
          await client.query(
            `UPDATE addresses SET customer_id = $1 WHERE customer_id = $2`,
            [currentCust.id, otherCust.id],
          )

          // Re-point reviews
          await client.query(
            `UPDATE reviews SET customer_id = $1 WHERE customer_id = $2`,
            [currentCust.id, otherCust.id],
          )

          // Re-point coupon assignments
          await client.query(
            `UPDATE coupons_rels SET customers_id = $1 WHERE customers_id = $2`,
            [currentCust.id, otherCust.id],
          )

          // Handle cart
          const otherCartRes = await client.query(
            `SELECT id FROM carts WHERE customer_id = $1`,
            [otherCust.id],
          )
          const currentCartRes = await client.query(
            `SELECT id FROM carts WHERE customer_id = $1`,
            [currentCust.id],
          )
          if (otherCartRes.rows.length > 0) {
            if (currentCartRes.rows.length > 0) {
              await client.query(`DELETE FROM carts WHERE id = $1`, [
                otherCartRes.rows[0].id,
              ])
            } else {
              await client.query(
                `UPDATE carts SET customer_id = $1 WHERE id = $2`,
                [currentCust.id, otherCartRes.rows[0].id],
              )
            }
          }

          // Handle wishlist
          const otherWishlistRes = await client.query(
            `SELECT id FROM wishlist WHERE customer_id = $1`,
            [otherCust.id],
          )
          const currentWishlistRes = await client.query(
            `SELECT id FROM wishlist WHERE customer_id = $1`,
            [currentCust.id],
          )
          if (otherWishlistRes.rows.length > 0) {
            if (currentWishlistRes.rows.length > 0) {
              await client.query(
                `UPDATE wishlist_items SET _parent_id = $1
                 WHERE _parent_id = $2
                   AND NOT EXISTS (
                     SELECT 1 FROM wishlist_items wi2
                     WHERE wi2._parent_id = $1 AND wi2.product_id = wishlist_items.product_id
                   )`,
                [currentWishlistRes.rows[0].id, otherWishlistRes.rows[0].id],
              )
              await client.query(`DELETE FROM wishlist WHERE id = $1`, [
                otherWishlistRes.rows[0].id,
              ])
            } else {
              await client.query(
                `UPDATE wishlist SET customer_id = $1 WHERE id = $2`,
                [currentCust.id, otherWishlistRes.rows[0].id],
              )
            }
          }

          // Re-point orders from other customer's email to current customer's email
          if (otherCust.email && currentCust.email) {
            await client.query(
              `UPDATE orders SET customer_email = $1 WHERE LOWER(customer_email) = LOWER($2)`,
              [currentCust.email, otherCust.email],
            )
          }

          // Delete the now empty other customer record
          await client.query(`DELETE FROM customers WHERE id = $1`, [
            otherCust.id,
          ])
        } else {
          // Current user had no customer row yet — re-parent other customer
          await client.query(
            `UPDATE customers SET better_auth_user_id = $1 WHERE id = $2`,
            [input.currentUserId, otherCust.id],
          )
        }
      }

      // 2. Delete sessions for otherUserId
      await client.query(`DELETE FROM "session" WHERE "userId" = $1`, [
        otherUserId,
      ])

      // 3. Delete Firebase accounts for otherUserId or with this accountId
      await client.query(
        `DELETE FROM "account" WHERE ("userId" = $1 AND "providerId" = 'firebase') OR ("providerId" = 'firebase' AND "accountId" = $2)`,
        [otherUserId, input.firebaseUid],
      )

      // 4. Delete old phone identities for otherUserId or matching phone/UID
      await client.query(
        `DELETE FROM phone_identities WHERE user_id = $1 OR phone_number = $2 OR firebase_uid = $3`,
        [otherUserId, normalizedPhoneNumber, input.firebaseUid],
      )

      // 5. Delete otherUser if it was a shell account (phone-only fallback email)
      const otherUserRes = await client.query(
        `SELECT id, email FROM "user" WHERE id = $1`,
        [otherUserId],
      )
      const otherUser = otherUserRes.rows[0]
      const isShell =
        !otherUser?.email ||
        otherUser.email.includes('@phone.shayga.in') ||
        otherUser.email.includes('@firebase.local')

      if (isShell) {
        await client.query(`DELETE FROM "user" WHERE id = $1`, [otherUserId])
      } else {
        // If otherUser had a real email, just clear its phoneNumber
        await client.query(
          `UPDATE "user" SET "phoneNumber" = NULL WHERE id = $1`,
          [otherUserId],
        )
      }
    }

    // Attach phone identity to input.currentUserId
    await client.query(
      `DELETE FROM phone_identities WHERE user_id = $1 OR phone_number = $2 OR firebase_uid = $3`,
      [input.currentUserId, normalizedPhoneNumber, input.firebaseUid],
    )

    const now = new Date()
    const insertRes = await client.query(
      `INSERT INTO phone_identities (user_id, phone_number, firebase_uid, verified_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        input.currentUserId,
        normalizedPhoneNumber,
        input.firebaseUid,
        now,
        now,
        now,
      ],
    )

    // Re-parent / link Firebase account to current user
    await client.query(
      `DELETE FROM "account" WHERE ("userId" = $1 AND "providerId" = 'firebase') OR ("providerId" = 'firebase' AND "accountId" = $2)`,
      [input.currentUserId, input.firebaseUid],
    )

    const accountId = randomUUID()
    await client.query(
      `INSERT INTO "account" ("id", "userId", "providerId", "accountId", "idToken", "createdAt", "updatedAt")
       VALUES ($1, $2, 'firebase', $3, $4, $5, $6)`,
      [
        accountId,
        input.currentUserId,
        input.firebaseUid,
        input.idToken,
        now,
        now,
      ],
    )

    // Update user.phoneNumber on user table
    await client.query(
      `UPDATE "user" SET "phoneNumber" = $1, "updatedAt" = $2 WHERE id = $3`,
      [normalizedPhoneNumber, now, input.currentUserId],
    )

    // Update phone on customers table
    await client.query(
      `UPDATE customers SET phone = $1, updated_at = $2 WHERE better_auth_user_id = $3`,
      [normalizedPhoneNumber, now, input.currentUserId],
    )

    await client.query('COMMIT')

    const identity = insertRes.rows[0]

    // Sync customer record asynchronously
    try {
      await syncCustomerForSession(input.currentUserId)
    } catch (syncErr) {
      console.warn(
        '[Account Linking] Customer sync non-fatal warning:',
        syncErr,
      )
    }

    return {
      success: true,
      phoneIdentity: {
        phoneNumber: identity.phone_number,
        verifiedAt: identity.verified_at.toISOString(),
      },
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Sends a 6-digit OTP code to an email address for verification and account linking.
 */
export async function sendEmailVerificationOtp(input: {
  currentUserId: string
  email: string
  clientIp?: string
}): Promise<{ success: boolean; message: string }> {
  const normalizedEmail = input.email.trim().toLowerCase()

  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error('Please enter a valid email address')
  }

  // Rate limiting check
  const identifier = input.clientIp || input.currentUserId
  const rateLimit = rateLimiter.check(
    `email-otp:${identifier}`,
    RATE_LIMITS.EMAIL_VERIFY.maxRequests,
    RATE_LIMITS.EMAIL_VERIFY.windowMs,
  )

  if (rateLimit.limited) {
    throw new Error(RATE_LIMITS.EMAIL_VERIFY.message)
  }

  const pool = getDbPool()
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
  const identifierKey = `email-verification:${normalizedEmail}`

  // Clean up previous verification entries for this email
  await pool.query(`DELETE FROM verification WHERE identifier = $1`, [
    identifierKey,
  ])

  // Insert OTP into verification table
  const verificationId = randomUUID()
  const now = new Date()
  await pool.query(
    `INSERT INTO verification ("id", "identifier", "value", "expiresAt", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [verificationId, identifierKey, otp, expiresAt, now, now],
  )

  // Send branded email OTP
  await sendOTPEmail(normalizedEmail, otp)

  return {
    success: true,
    message: 'Verification code sent to your email.',
  }
}

/**
 * Verifies the email OTP. If the verified email already belongs to an existing
 * account, merges the accounts (transferring phone login, addresses, and orders)
 * and returns a new session for the unified account.
 */
export async function verifyAndLinkEmailForUser(input: {
  currentUserId: string
  email: string
  otp: string
}): Promise<{
  success: boolean
  email: string
  linked: boolean
  isEmailVerified: boolean
  newSession?: {
    token: string
    expiresAt: Date
    userId: string
  }
}> {
  const normalizedEmail = input.email.trim().toLowerCase()
  const code = input.otp.trim()

  if (!normalizedEmail || !code || code.length !== 6) {
    throw new Error('Please enter a valid 6-digit verification code')
  }

  const pool = getDbPool()
  const identifierKey = `email-verification:${normalizedEmail}`

  // Check verification table
  const verRes = await pool.query(
    `SELECT id, value, "expiresAt" FROM verification WHERE identifier = $1`,
    [identifierKey],
  )

  const verificationRow = verRes.rows[0]
  if (!verificationRow) {
    throw new Error('No verification code found. Please request a new code.')
  }

  if (new Date(verificationRow.expiresAt) < new Date()) {
    await pool.query(`DELETE FROM verification WHERE id = $1`, [
      verificationRow.id,
    ])
    throw new Error('Verification code has expired. Please request a new one.')
  }

  if (verificationRow.value !== code) {
    throw new Error('Invalid verification code. Please check and try again.')
  }

  // Delete consumed OTP
  await pool.query(`DELETE FROM verification WHERE id = $1`, [
    verificationRow.id,
  ])

  // Check if an existing account already owns this email
  const existingUserRes = await pool.query(
    `SELECT id, email, name, "phoneNumber" FROM "user" WHERE LOWER(email) = LOWER($1)`,
    [normalizedEmail],
  )
  const existingUser = existingUserRes.rows[0]

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    if (existingUser && existingUser.id !== input.currentUserId) {
      console.log(
        `[Account Linking] Merging phone user ${input.currentUserId} into existing email user ${existingUser.id}`,
      )

      // Fetch phone identity of current user
      const phoneIdentRes = await client.query(
        `SELECT * FROM phone_identities WHERE user_id = $1`,
        [input.currentUserId],
      )
      const currentPhoneIdent = phoneIdentRes.rows[0]

      // 1. Move phone identity to existing user
      if (currentPhoneIdent) {
        await client.query(`DELETE FROM phone_identities WHERE user_id = $1`, [
          existingUser.id,
        ])
        await client.query(
          `UPDATE phone_identities SET user_id = $1 WHERE user_id = $2`,
          [existingUser.id, input.currentUserId],
        )
      }

      // 2. Move Firebase account to existing user
      await client.query(
        `DELETE FROM "account" WHERE "userId" = $1 AND "providerId" = 'firebase'`,
        [existingUser.id],
      )
      await client.query(
        `UPDATE "account" SET "userId" = $1 WHERE "userId" = $2 AND "providerId" = 'firebase'`,
        [existingUser.id, input.currentUserId],
      )

      // 3. Update existing user record with phone number and mark email verified
      const phoneToSet =
        currentPhoneIdent?.phone_number || existingUser.phoneNumber
      await client.query(
        `UPDATE "user" SET "phoneNumber" = COALESCE($1, "phoneNumber"), "emailVerified" = true, "updatedAt" = NOW() WHERE id = $2`,
        [phoneToSet, existingUser.id],
      )

      // 4. Merge customers
      const phoneCustRes = await client.query(
        `SELECT id, email FROM customers WHERE better_auth_user_id = $1`,
        [input.currentUserId],
      )
      const emailCustRes = await client.query(
        `SELECT id, email FROM customers WHERE better_auth_user_id = $1`,
        [existingUser.id],
      )
      const phoneCust = phoneCustRes.rows[0]
      const emailCust = emailCustRes.rows[0]

      if (phoneCust) {
        if (emailCust) {
          // Re-parent addresses
          await client.query(
            `UPDATE addresses SET customer_id = $1 WHERE customer_id = $2`,
            [emailCust.id, phoneCust.id],
          )

          // Re-point reviews
          await client.query(
            `UPDATE reviews SET customer_id = $1 WHERE customer_id = $2`,
            [emailCust.id, phoneCust.id],
          )

          // Re-point coupon assignments
          await client.query(
            `UPDATE coupons_rels SET customers_id = $1 WHERE customers_id = $2`,
            [emailCust.id, phoneCust.id],
          )

          // Handle cart
          const phoneCartRes = await client.query(
            `SELECT id FROM carts WHERE customer_id = $1`,
            [phoneCust.id],
          )
          const emailCartRes = await client.query(
            `SELECT id FROM carts WHERE customer_id = $1`,
            [emailCust.id],
          )
          if (phoneCartRes.rows.length > 0) {
            if (emailCartRes.rows.length > 0) {
              await client.query(`DELETE FROM carts WHERE id = $1`, [
                phoneCartRes.rows[0].id,
              ])
            } else {
              await client.query(
                `UPDATE carts SET customer_id = $1 WHERE id = $2`,
                [emailCust.id, phoneCartRes.rows[0].id],
              )
            }
          }

          // Handle wishlist
          const phoneWishlistRes = await client.query(
            `SELECT id FROM wishlist WHERE customer_id = $1`,
            [phoneCust.id],
          )
          const emailWishlistRes = await client.query(
            `SELECT id FROM wishlist WHERE customer_id = $1`,
            [emailCust.id],
          )
          if (phoneWishlistRes.rows.length > 0) {
            if (emailWishlistRes.rows.length > 0) {
              await client.query(
                `UPDATE wishlist_items SET _parent_id = $1
                 WHERE _parent_id = $2
                   AND NOT EXISTS (
                     SELECT 1 FROM wishlist_items wi2
                     WHERE wi2._parent_id = $1 AND wi2.product_id = wishlist_items.product_id
                   )`,
                [emailWishlistRes.rows[0].id, phoneWishlistRes.rows[0].id],
              )
              await client.query(`DELETE FROM wishlist WHERE id = $1`, [
                phoneWishlistRes.rows[0].id,
              ])
            } else {
              await client.query(
                `UPDATE wishlist SET customer_id = $1 WHERE id = $2`,
                [emailCust.id, phoneWishlistRes.rows[0].id],
              )
            }
          }

          // Re-parent orders
          if (phoneCust.email && emailCust.email) {
            await client.query(
              `UPDATE orders SET customer_email = $1 WHERE LOWER(customer_email) = LOWER($2)`,
              [emailCust.email, phoneCust.email],
            )
          }
          await client.query(`DELETE FROM customers WHERE id = $1`, [
            phoneCust.id,
          ])
        } else {
          await client.query(
            `UPDATE customers SET better_auth_user_id = $1, email = $2 WHERE id = $3`,
            [existingUser.id, normalizedEmail, phoneCust.id],
          )
        }
      }

      // 5. Delete sessions for current phone user
      await client.query(`DELETE FROM "session" WHERE "userId" = $1`, [
        input.currentUserId,
      ])

      // 6. Delete phone shell user
      await client.query(`DELETE FROM "user" WHERE id = $1`, [
        input.currentUserId,
      ])

      // 7. Create a new authenticated session for existingUser
      const sessionToken = randomUUID()
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days
      const sessionId = randomUUID()
      const now = new Date()

      await client.query(
        `INSERT INTO "session" ("id", "userId", "token", "expiresAt", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [sessionId, existingUser.id, sessionToken, expiresAt, now, now],
      )

      await client.query('COMMIT')

      try {
        await syncCustomerForSession(existingUser.id)
      } catch (err) {
        console.warn('[Account Linking] Customer sync non-fatal warning:', err)
      }

      return {
        success: true,
        email: normalizedEmail,
        linked: true,
        isEmailVerified: true,
        newSession: {
          token: sessionToken,
          expiresAt,
          userId: existingUser.id,
        },
      }
    } else {
      // Normal case: user is updating their own email or verifying unverified email
      await client.query(
        `UPDATE "user" SET email = $1, "emailVerified" = true, "updatedAt" = NOW() WHERE id = $2`,
        [normalizedEmail, input.currentUserId],
      )

      await client.query(
        `UPDATE customers SET email = $1, updated_at = NOW() WHERE better_auth_user_id = $2`,
        [normalizedEmail, input.currentUserId],
      )

      await client.query('COMMIT')

      try {
        await syncCustomerForSession(input.currentUserId)
      } catch (err) {
        console.warn('[Account Linking] Customer sync non-fatal warning:', err)
      }

      return {
        success: true,
        email: normalizedEmail,
        linked: false,
        isEmailVerified: true,
      }
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Removes phone login method from an account.
 * Requires user to have a verified email to prevent losing account access.
 */
export async function unlinkPhoneFromUser(
  currentUserId: string,
): Promise<{ success: boolean }> {
  const pool = getDbPool()

  const userRes = await pool.query(
    `SELECT email, "emailVerified" FROM "user" WHERE id = $1`,
    [currentUserId],
  )
  const user = userRes.rows[0]

  if (
    !user ||
    !user.email ||
    user.email.includes('@phone.shayga.in') ||
    user.email.includes('@firebase.local') ||
    user.emailVerified !== true
  ) {
    throw new Error(
      'Cannot remove phone login without a verified email address. Please link and verify an email first to prevent losing access to your account.',
    )
  }

  const phoneIdentity = await getPhoneIdentityByUserId(currentUserId)
  if (phoneIdentity) {
    const account = await getFirebaseAccountOwner(phoneIdentity.firebaseUid)
    if (account?.userId === currentUserId) {
      await pool.query(`DELETE FROM "account" WHERE id = $1`, [account.id])
    }
  }

  await pool.query(`DELETE FROM phone_identities WHERE user_id = $1`, [
    currentUserId,
  ])
  await pool.query(`UPDATE "user" SET "phoneNumber" = NULL WHERE id = $1`, [
    currentUserId,
  ])

  return { success: true }
}

/**
 * Fetches accurate ground-truth security and identity details for a user.
 */
export async function getAccountSecurityDetails(
  userId: string,
): Promise<SecurityStatusData> {
  const pool = getDbPool()

  const userRes = await pool.query(
    `SELECT email, "emailVerified", "phoneNumber" FROM "user" WHERE id = $1`,
    [userId],
  )
  const user = userRes.rows[0]

  const phoneIdentity = await getPhoneIdentityByUserId(userId)

  const rawEmail = user?.email || ''
  const isFallbackEmail =
    !rawEmail ||
    rawEmail.includes('@phone.shayga.in') ||
    rawEmail.includes('@firebase.local')

  const email = isFallbackEmail ? null : rawEmail
  const isEmailVerified = !isFallbackEmail && user?.emailVerified === true

  const phone = phoneIdentity?.phoneNumber || user?.phoneNumber || null
  const isPhoneVerified = phoneIdentity !== null

  return {
    email,
    isEmailVerified,
    phone,
    isPhoneVerified,
    canRemovePhone: isEmailVerified && isPhoneVerified,
    canRemoveEmail: isEmailVerified && isPhoneVerified,
  }
}
