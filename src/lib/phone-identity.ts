import { getDbPool } from './db-pool'

/**
 * Phone Identity Management Service
 * Handles verified phone numbers for authentication (separate from contact info)
 */

// Use shared database pool
const pool = getDbPool()

export interface PhoneIdentity {
  id: number
  userId: string
  phoneNumber: string
  firebaseUid: string
  verifiedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface CreatePhoneIdentityInput {
  userId: string
  phoneNumber: string
  firebaseUid: string
}

export interface UpdatePhoneIdentityInput {
  phoneNumber: string
  firebaseUid: string
}

/**
 * Validates E.164 phone number format
 * E.164 format: +[country code][number] (e.g., +919876543210)
 */
export function isValidE164PhoneNumber(phone: string): boolean {
  // E.164 regex: + followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/
  return e164Regex.test(phone)
}

/**
 * Normalizes phone number to E.164 format (strips spaces, dashes, etc.)
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters except leading +
  const normalized = phone.replace(/[^\d+]/g, '')

  // Ensure it starts with +
  if (!normalized.startsWith('+')) {
    throw new Error('Phone number must start with + and country code')
  }

  return normalized
}

/**
 * Check if a phone number is already linked to an account
 */
export async function isPhoneNumberTaken(
  phoneNumber: string,
): Promise<boolean> {
  const normalized = normalizePhoneNumber(phoneNumber)

  if (!isValidE164PhoneNumber(normalized)) {
    throw new Error(
      'Invalid phone number format. Use E.164 format (e.g., +919876543210)',
    )
  }

  const result = await pool.query<{ exists: boolean }>(
    'SELECT EXISTS(SELECT 1 FROM phone_identities WHERE phone_number = $1) as exists',
    [normalized],
  )

  return result.rows[0]?.exists ?? false
}

/**
 * Maps database row (snake_case) to TypeScript interface (camelCase)
 */
function mapRowToPhoneIdentity(row: any): PhoneIdentity {
  return {
    id: row.id,
    userId: row.user_id,
    phoneNumber: row.phone_number,
    firebaseUid: row.firebase_uid,
    verifiedAt: row.verified_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Get phone identity by user ID
 */
export async function getPhoneIdentityByUserId(
  userId: string,
): Promise<PhoneIdentity | null> {
  const result = await pool.query(
    'SELECT * FROM phone_identities WHERE user_id = $1 LIMIT 1',
    [userId],
  )

  return result.rows[0] ? mapRowToPhoneIdentity(result.rows[0]) : null
}

/**
 * Get phone identity by phone number
 */
export async function getPhoneIdentityByPhoneNumber(
  phoneNumber: string,
): Promise<PhoneIdentity | null> {
  const normalized = normalizePhoneNumber(phoneNumber)

  if (!isValidE164PhoneNumber(normalized)) {
    throw new Error(
      'Invalid phone number format. Use E.164 format (e.g., +919876543210)',
    )
  }

  const result = await pool.query(
    'SELECT * FROM phone_identities WHERE phone_number = $1 LIMIT 1',
    [normalized],
  )

  return result.rows[0] ? mapRowToPhoneIdentity(result.rows[0]) : null
}

/**
 * Get phone identity by Firebase UID
 */
export async function getPhoneIdentityByFirebaseUid(
  firebaseUid: string,
): Promise<PhoneIdentity | null> {
  const result = await pool.query(
    'SELECT * FROM phone_identities WHERE firebase_uid = $1 LIMIT 1',
    [firebaseUid],
  )

  return result.rows[0] ? mapRowToPhoneIdentity(result.rows[0]) : null
}

/**
 * Create a new phone identity (verified phone for authentication)
 */
export async function createPhoneIdentity(
  input: CreatePhoneIdentityInput,
): Promise<PhoneIdentity> {
  const normalized = normalizePhoneNumber(input.phoneNumber)

  if (!isValidE164PhoneNumber(normalized)) {
    throw new Error(
      'Invalid phone number format. Use E.164 format (e.g., +919876543210)',
    )
  }

  const now = new Date()

  try {
    const result = await pool.query(
      `INSERT INTO phone_identities (user_id, phone_number, firebase_uid, verified_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [input.userId, normalized, input.firebaseUid, now, now, now],
    )

    const identity = result.rows[0]
    if (!identity) {
      throw new Error('Failed to create phone identity')
    }

    return mapRowToPhoneIdentity(identity)
  } catch (error: any) {
    // Handle unique constraint violations
    if (error.code === '23505') {
      if (error.constraint === 'phone_identities_phone_number_unique') {
        throw new Error(
          'This phone number is already linked to another account',
        )
      }
      if (error.constraint === 'phone_identities_user_id_unique') {
        throw new Error('User already has a verified phone number')
      }
      if (error.constraint === 'phone_identities_firebase_uid_unique') {
        throw new Error(
          'This Firebase UID is already linked to another account',
        )
      }
    }
    throw error
  }
}

/**
 * Update phone identity (e.g., user changes their phone number)
 * Requires re-verification with new Firebase UID
 */
export async function updatePhoneIdentity(
  userId: string,
  input: UpdatePhoneIdentityInput,
): Promise<PhoneIdentity> {
  const normalized = normalizePhoneNumber(input.phoneNumber)

  if (!isValidE164PhoneNumber(normalized)) {
    throw new Error(
      'Invalid phone number format. Use E.164 format (e.g., +919876543210)',
    )
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    // Lock the row for update and check existence
    const existingResult = await client.query(
      'SELECT * FROM phone_identities WHERE user_id = $1 FOR UPDATE',
      [userId],
    )

    if (existingResult.rows.length === 0) {
      throw new Error('No phone identity found for this user')
    }

    // Check if new phone is taken by another user
    const phoneCheckResult = await client.query(
      'SELECT user_id FROM phone_identities WHERE phone_number = $1 AND user_id != $2',
      [normalized, userId],
    )

    if (phoneCheckResult.rows.length > 0) {
      throw new Error('This phone number is already linked to another account')
    }

    // Check if Firebase UID is taken by another user
    const firebaseCheckResult = await client.query(
      'SELECT user_id FROM phone_identities WHERE firebase_uid = $1 AND user_id != $2',
      [input.firebaseUid, userId],
    )

    if (firebaseCheckResult.rows.length > 0) {
      throw new Error('This Firebase UID is already linked to another account')
    }

    // Perform update
    const now = new Date()
    const updateResult = await client.query(
      `UPDATE phone_identities
       SET phone_number = $1,
           firebase_uid = $2,
           verified_at = $3,
           updated_at = $4
       WHERE user_id = $5
       RETURNING *`,
      [normalized, input.firebaseUid, now, now, userId],
    )

    await client.query('COMMIT')

    const identity = updateResult.rows[0]
    if (!identity) {
      throw new Error('Failed to update phone identity')
    }

    return mapRowToPhoneIdentity(identity)
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

/**
 * Delete phone identity (remove phone login method)
 */
export async function deletePhoneIdentity(userId: string): Promise<void> {
  await pool.query('DELETE FROM phone_identities WHERE user_id = $1', [userId])
}

/**
 * Check if user has a verified phone identity
 */
export async function hasVerifiedPhone(userId: string): Promise<boolean> {
  const identity = await getPhoneIdentityByUserId(userId)
  return identity !== null
}

/**
 * Get user ID by phone number (for login flow)
 */
export async function getUserIdByPhoneNumber(
  phoneNumber: string,
): Promise<string | null> {
  const identity = await getPhoneIdentityByPhoneNumber(phoneNumber)
  return identity?.userId ?? null
}
