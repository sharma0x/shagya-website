import { NextResponse } from 'next/server'
import { getDbPool } from '@/lib/db-pool'
import { isPhoneNumberTaken } from '@/lib/phone-identity'

/**
 * GET /api/auth/account-status?email=... or ?phone=...
 *
 * Reports whether an account already exists for the given email or phone,
 * so checkout can show a saved-address picker for existing customers and a
 * fresh address form for brand-new ones.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')?.trim()
  const phone = searchParams.get('phone')?.trim()

  try {
    if (email) {
      const pool = getDbPool()
      const result = await pool.query(
        'SELECT EXISTS(SELECT 1 FROM "user" WHERE LOWER(email) = LOWER($1)) AS exists',
        [email],
      )
      return NextResponse.json({ exists: result.rows[0]?.exists ?? false })
    }

    if (phone) {
      const exists = await isPhoneNumberTaken(phone)
      return NextResponse.json({ exists })
    }

    return NextResponse.json(
      { error: 'email or phone query param is required' },
      { status: 400 },
    )
  } catch (error: any) {
    console.error('[API] GET /api/auth/account-status error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
