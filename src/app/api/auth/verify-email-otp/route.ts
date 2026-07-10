import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyOTPToken, OTP_COOKIE_NAME } from '@/lib/otp'
import { Pool } from 'pg'
import crypto from 'crypto'

const SESSION_COOKIE = 'better-auth.session_token'
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000 // 7 days

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
    const { email, otp } = body

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

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    })

    const normalizedEmail = email.toLowerCase()

    // ── 1. Find or create the user ──
    let userResult = await pool.query(
      'SELECT id, email FROM "user" WHERE LOWER(email) = $1',
      [normalizedEmail],
    )

    let userId: string
    let userEmail: string

    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id
      userEmail = userResult.rows[0].email
    } else {
      const newUserId = generateId()
      const now = new Date().toISOString()

      // Create user row
      await pool.query(
        `INSERT INTO "user" (id, name, email, "emailVerified", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, true, $4, $4)`,
        [newUserId, normalizedEmail.split('@')[0], normalizedEmail, now],
      )

      // Create account row (credentials for email/password, even though password is random)
      const randomPassword = crypto.randomBytes(16).toString('base64') + 'Aa1!'
      await pool.query(
        `INSERT INTO account (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
         VALUES ($1, $2, 'email', $3, $4, $5, $5)`,
        [generateId(), normalizedEmail, newUserId, randomPassword, now],
      )

      userId = newUserId
      userEmail = normalizedEmail
    }

    // ── 2. Create a session ──
    const rawToken = generateToken()
    const sessionToken = hashToken(rawToken)
    const now = new Date()
    const expiresAt = new Date(now.getTime() + SESSION_EXPIRY)
    const nowISO = now.toISOString()

    await pool.query(
      `INSERT INTO "session" (id, "userId", token, "expiresAt", "ipAddress", "userAgent", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7)`,
      [
        generateId(),
        userId,
        sessionToken,
        expiresAt,
        request.headers.get('x-forwarded-for') || '',
        request.headers.get('user-agent') || '',
        nowISO,
      ],
    )

    await pool.end()

    // ── 3. Set session cookie with RAW token, clear OTP cookie ──
    const cookieStore = await cookies()

    cookieStore.set(SESSION_COOKIE, rawToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_EXPIRY / 1000,
    })

    cookieStore.delete(OTP_COOKIE_NAME)

    return NextResponse.json({ success: true, email: userEmail })
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
