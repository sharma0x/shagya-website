import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { getPhoneIdentityByUserId } from '@/lib/phone-identity'
import { getDbPool } from '@/lib/db-pool'

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

    const customers = await payload.find({
      collection: 'customers',
      where: { betterAuthUserId: { equals: session.user.id } },
      limit: 1,
    })

    if (customers.docs.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customer = customers.docs[0] as unknown as Record<string, unknown>

    // Detect login method
    const loginMethod = await detectLoginMethod(session.user.id)

    // Check for verified phone number from phone_identities (login method)
    // Falls back to customer.phone (editable contact info)
    let phone = (customer.phone as string) || ''
    let hasVerifiedPhone = false
    try {
      const phoneIdentity = await getPhoneIdentityByUserId(session.user.id)
      if (phoneIdentity?.phoneNumber) {
        phone = phoneIdentity.phoneNumber
        hasVerifiedPhone = true
      }
    } catch (err) {
      console.error('[customers/me] Failed to get phone identity:', err)
      // Continue with customer.phone fallback
    }

    // Determine email — filter out fallback phone-user emails
    const rawEmail = (customer.email as string) || session.user.email || ''
    const isFallbackEmail = rawEmail.includes('@phone.shayga.in')
    const email = isFallbackEmail ? '' : rawEmail
    const hasVerifiedEmail = !isFallbackEmail && !!rawEmail

    return NextResponse.json({
      name: customer.name || '',
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

    const body = await request.json()
    const { name, phone, email } = body

    const payload = await getPayload({ config })

    const customers = await payload.find({
      collection: 'customers',
      where: { betterAuthUserId: { equals: session.user.id } },
      limit: 1,
    })

    if (customers.docs.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const updateData: Record<string, unknown> = {}
    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone

    // Allow setting email only when the customer currently has no real email
    // (phone-login users who have a @phone.shayga.in fallback or empty email)
    if (email !== undefined) {
      const currentEmail = (
        customers.docs[0] as unknown as Record<string, unknown>
      ).email as string
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
      id: customers.docs[0].id,
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
