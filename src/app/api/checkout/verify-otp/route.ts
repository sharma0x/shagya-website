import { NextResponse } from 'next/server'
import { verifyOTPToken, OTP_COOKIE_NAME } from '@/lib/otp'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { Pool } from 'pg'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, otp, name } = body

    if (!email || !otp || !name) {
      return NextResponse.json(
        { error: 'Email, OTP, and name are required' },
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

    const payload = await getPayload({ config })

    // 1. Ensure a Payload Customer record exists
    const existing = await payload.find({
      collection: 'customers',
      where: { email: { equals: email } },
      limit: 1,
    } as any)

    let customerId: string | number

    if (existing.docs.length > 0) {
      customerId = existing.docs[0].id as string | number
      if (!(existing.docs[0] as any).name) {
        await payload.update({
          collection: 'customers',
          id: customerId,
          data: { name },
        } as any)
      }
    } else {
      const created = await payload.create({
        collection: 'customers',
        data: { email, name },
      } as any)
      customerId = created.id as string | number
    }

    // 2. Create Better Auth account
    const randomPassword =
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2) +
      '!A1'

    let accountCreated = false

    try {
      const signUpRequest = new Request(
        'http://localhost:3000/api/auth/sign-up/email',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password: randomPassword,
            name,
          }),
        },
      )

      const signUpResponse = await auth.handler(signUpRequest)

      if (signUpResponse.ok) {
        accountCreated = true
      }
    } catch (signUpErr) {
      console.warn(
        '[verify-otp] Better Auth sign-up failed (likely already exists):',
        signUpErr,
      )
    }

    const res = NextResponse.json({
      success: true,
      verified: true,
      accountCreated,
      customerId,
      email,
      name,
    })
    res.cookies.delete(OTP_COOKIE_NAME)
    return res
  } catch (error) {
    console.error('[API] POST /api/checkout/verify-otp error:', error)
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
