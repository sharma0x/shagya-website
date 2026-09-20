import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { getPhoneIdentityByUserId } from '@/lib/phone-identity'
import { getDbPool } from '@/lib/db-pool'
import { rateLimiter, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit'
import { findOrRepairCustomer } from '@/lib/auth-sync'

/**
 * Determines how the user originally signed in.
 *
 * Priority:
 *  1. Has a row in `phone_identities` → 'phone'
 *  2. Has a Better Auth `account` row with provider = 'google' → 'google'
 *  3. Otherwise → 'email'
 */
async function detectLoginMethod(
  userId: string,
): Promise<'phone' | 'google' | 'email'> {
  // 1. Check phone_identities
  try {
    const phoneIdentity = await getPhoneIdentityByUserId(userId)
    if (phoneIdentity) return 'phone'
  } catch {
    // ignore — table might not exist yet
  }

  // 2. Check Better Auth `account` table for social providers
  try {
    const pool = getDbPool()
    const result = await pool.query(
      `SELECT "providerId" FROM "account" WHERE "userId" = $1 LIMIT 10`,
      [userId],
    )
    for (const row of result.rows) {
      if (row.providerId === 'google') return 'google'
    }
  } catch {
    // ignore — table structure may vary
  }

  return 'email'
}

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // Find the customer, creating it first if it is missing. This heals
    // sessions that predate a successful customer sync.
    const customer = await findOrRepairCustomer(session.user.id)

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    console.log('[customers/me] Customer data:', {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      betterAuthUserId: customer.betterAuthUserId,
    })

    // Detect login method
    const loginMethod = await detectLoginMethod(session.user.id)
    console.log('[customers/me] Detected login method:', loginMethod)

    // Check for verified phone number from phone_identities (login method)
    // Falls back to customer.phone (editable contact info)
    let phone = (customer.phone as string) || ''
    let hasVerifiedPhone = false
    try {
      const phoneIdentity = await getPhoneIdentityByUserId(session.user.id)
      console.log('[customers/me] Phone identity:', phoneIdentity)
      if (phoneIdentity?.phoneNumber) {
        phone = phoneIdentity.phoneNumber
        hasVerifiedPhone = true
      }
    } catch (err) {
      console.error('[customers/me] Failed to get phone identity:', err)
      // Continue with customer.phone fallback
    }
    console.log('[customers/me] Final phone:', { phone, hasVerifiedPhone })

    // Determine email — filter out fallback phone-user emails
    const rawEmail = (customer.email as string) || session.user.email || ''
    const isFallbackEmail = rawEmail.includes('@phone.shayga.in')
    const email = isFallbackEmail ? '' : rawEmail
    // An email is only "verified" when Better Auth actually verified it
    // (email-OTP sign-in sets emailVerified=true). A phone user who saves a
    // contact email via the profile is NOT email-verified.
    const hasVerifiedEmail =
      (session.user as { emailVerified?: boolean }).emailVerified === true
        ? !isFallbackEmail && !!rawEmail
        : false

    // Fallback to session data if customer fields are empty
    const name =
      customer.name && customer.name !== 'Customer'
        ? (customer.name as string)
        : session.user.name || ''

    // If phone is still empty, try to get it from session user
    if (!phone && (session.user as any)?.phoneNumber) {
      phone = (session.user as any).phoneNumber
      console.log('[customers/me] Using phone from session:', phone)
    }

    console.log('[customers/me] Final response:', {
      name,
      email,
      phone,
      loginMethod,
      hasVerifiedPhone,
      hasVerifiedEmail,
    })

    return NextResponse.json({
      name,
      email,
      phone,
      loginMethod,
      hasVerifiedPhone,
      hasVerifiedEmail,
    })
  } catch (err) {
    console.error('[customers/me] GET error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting for profile updates
    const identifier = getClientIdentifier(request, session.user.id)
    const rateLimit = rateLimiter.check(
      `profile-update:${identifier}`,
      RATE_LIMITS.PROFILE_UPDATE.maxRequests,
      RATE_LIMITS.PROFILE_UPDATE.windowMs,
    )

    if (rateLimit.limited) {
      return NextResponse.json(
        {
          error: RATE_LIMITS.PROFILE_UPDATE.message,
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        { status: 429 },
      )
    }

    const body = await request.json()
    const { name, phone, email } = body

    const payload = await getPayload({ config })

    const customer = await findOrRepairCustomer(session.user.id)

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone

    // Allow setting email only when the customer currently has no real email
    // (phone-login users who have a @phone.shayga.in fallback or empty email)
    if (email !== undefined) {
      const currentEmail = customer.email as string
      const isFallback =
        !currentEmail || currentEmail.includes('@phone.shayga.in')
      if (isFallback) {
        updateData.email = email
      }
      // If user already has a real email, silently ignore the email update
      // (they'd need to use the security flow to change their verified email)
    }

    await payload.update({
      collection: 'customers',
      id: customer.id as number,
      data: updateData,
      overrideAccess: true,
    } as any)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[customers/me] PATCH error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
