import { NextResponse } from 'next/server'
import { verifyOTPToken, OTP_COOKIE_NAME } from '@/lib/otp'
import { auth } from '@/lib/auth'
import { Pool } from 'pg'

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

    const cookie = request.headers.get('cookie') || ''
    const token = parseCookie(cookie, OTP_COOKIE_NAME)

    if (!token || !verifyOTPToken(email, otp, token)) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 },
      )
    }

    // Sign in the user via Better Auth — this creates a session cookie
    const signInRequest = new Request(
      'http://localhost:3000/api/auth/sign-in/email',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, callbackURL: '/account' }),
      },
    )

    const signInResponse = await auth.handler(signInRequest)

    if (!signInResponse.ok) {
      // User might not exist yet — try sign-up first
      const randomPassword =
        Math.random().toString(36).slice(2) +
        Math.random().toString(36).slice(2) +
        '!A1'

      const signUpRequest = new Request(
        'http://localhost:3000/api/auth/sign-up/email',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password: randomPassword,
            name: email.split('@')[0],
          }),
        },
      )

      const signUpResponse = await auth.handler(signUpRequest)

      if (signUpResponse.ok) {
        // Mark email as verified so user can sign in immediately
        try {
          const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
          })
          await pool.query(
            'UPDATE "user" SET email_verified = true WHERE email = $1',
            [email.toLowerCase()],
          )
          await pool.end()
        } catch {}
      }

      // Now try sign-in again
      const secondSignIn = await auth.handler(signInRequest)
      if (!secondSignIn.ok) {
        return NextResponse.json(
          { error: 'Could not sign in. Please try again.' },
          { status: 500 },
        )
      }
    }

    const res = NextResponse.json({ success: true, email })

    // Forward the session cookie from Better Auth
    const setCookie = signInResponse.headers.getSetCookie?.() || signInResponse.headers.get('set-cookie')
    if (setCookie) {
      const cookies = Array.isArray(setCookie) ? setCookie : [setCookie]
      for (const c of cookies) {
        res.headers.append('Set-Cookie', c)
      }
    }

    res.cookies.delete(OTP_COOKIE_NAME)
    return res
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
