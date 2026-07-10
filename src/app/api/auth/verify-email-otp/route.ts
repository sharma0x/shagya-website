import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyOTPToken, OTP_COOKIE_NAME } from '@/lib/otp'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Pool } from 'pg'
import crypto from 'crypto'

const SESSION_COOKIE = 'better-auth.session_token'
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000

function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

function generateId(): string {
  return crypto.randomUUID()
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, otp, name } = body

    if (!email || !otp) {
      return NextResponse.json(
        { error: 'Email and OTP are required' },
        { status: 400 },
      )
    }

    const cookieHeader = request.headers.get('cookie') || ''
    const token = parseCookie(cookieHeader, OTP_COOKIE_NAME)

    if (!token || !verifyOTPToken(email, otp, token)) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 },
      )
    }

    const pool = new Pool({ connectionString: process.env.DATABASE_URL })
    const payload = await getPayload({ config })

    const normalizedEmail = email.toLowerCase()
    const displayName = name || normalizedEmail.split('@')[0]

    // ── 1. Find or create Better Auth user ──
    let userResult = await pool.query(
      'SELECT id FROM "user" WHERE LOWER(email) = $1',
      [normalizedEmail],
    )

    let userId: string
    const nowISO = new Date().toISOString()

    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id
    } else {
      userId = generateId()

      await pool.query(
        `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, true, $4, $4)`,
        [userId, displayName, normalizedEmail, nowISO],
      )

      // Create empty account row so Better Auth treats this as a valid user
      await pool.query(
        `INSERT INTO account (id, "accountId", "providerId", "userId", "createdAt", "updatedAt")
         VALUES ($1, $2, 'email', $3, $4, $4)`,
        [generateId(), normalizedEmail, userId, nowISO],
      )
    }

    // ── 2. Find or create Payload Customer ──
    let customerId: string | number | null = null

    const existingCustomers = await payload.find({
      collection: 'customers',
      where: { email: { equals: normalizedEmail } },
      limit: 1,
    })

    if (existingCustomers.docs.length > 0) {
      const cust = existingCustomers.docs[0]
      customerId = cust.id as string | number
      // Link to Better Auth user if not already
      if (!(cust as any).betterAuthUserId) {
        await payload.update({
          collection: 'customers',
          id: customerId,
          data: { betterAuthUserId: userId },
        })
      }
    } else {
      const created = await payload.create({
        collection: 'customers',
        data: {
          email: normalizedEmail,
          name: displayName,
          betterAuthUserId: userId,
        },
      })
      customerId = created.id as string | number
    }

    // ── 3. Create session ──
    const rawToken = generateToken()
    const sessionToken = hashToken(rawToken)
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY)

    await pool.query(
      `INSERT INTO "session" (id, "userId", token, "expiresAt", "ipAddress", "userAgent", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
      [
        generateId(), userId, sessionToken, expiresAt,
        request.headers.get('x-forwarded-for') || '',
        request.headers.get('user-agent') || '',
        nowISO,
      ],
    )

    await pool.end()

    // ── 4. Set session cookie, clear OTP cookie ──
    const cookieStore = await cookies()

    cookieStore.set(SESSION_COOKIE, rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_EXPIRY / 1000,
    })

    cookieStore.delete(OTP_COOKIE_NAME)

    return NextResponse.json({
      success: true,
      email: normalizedEmail,
      name: displayName,
      customerId,
    })
  } catch (error) {
    console.error('[API] POST /api/auth/verify-email-otp error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

function parseCookie(cookieHeader: string, name: string): string | null {
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : null
}
