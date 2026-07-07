import { NextResponse } from 'next/server'
import { verifyOTPToken, OTP_COOKIE_NAME } from '@/lib/otp'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { Pool } from 'pg'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, otp, name, email } = body

    if (!phone || !otp || !name || !email) {
      return NextResponse.json(
        { error: 'Phone, OTP, name, and email are required' },
        { status: 400 },
      )
    }

    const cookie = request.headers.get('cookie') || ''
    const token = parseCookie(cookie, OTP_COOKIE_NAME)

    if (!token || !verifyOTPToken(phone, otp, token)) {
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
      if (!(existing.docs[0] as any).phone) {
        await payload.update({
          collection: 'customers',
          id: customerId,
          data: { phone, name },
        } as any)
      }
    } else {
      const created = await payload.create({
        collection: 'customers',
        data: { email, name, phone },
      } as any)
      customerId = created.id as string | number
    }

    // 2. Create Better Auth account (no auto-login — requireEmailVerification is on)
    //    Better Auth's databaseHooks.user.create.after calls syncCustomer(),
    //    which links this new BA user to the Payload Customer by phone.
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
            phoneNumber: phone,
          }),
        },
      )

      const signUpResponse = await auth.handler(signUpRequest)

      if (signUpResponse.ok) {
        const signUpData = await signUpResponse.json()
        const baUserId: string | undefined = signUpData.user?.id

        if (baUserId) {
          accountCreated = true

          // 3. Mark phone as verified in Better Auth's user table
          //    (bypasses phoneNumber plugin's input:false constraint)
          try {
            const pool = new Pool({
              connectionString: process.env.DATABASE_URL,
            })
            await pool.query(
              'UPDATE "user" SET phone_number_verified = true WHERE id = $1',
              [baUserId],
            )
            await pool.end()
          } catch (dbErr) {
            console.warn(
              '[verify-otp] Could not set phone_number_verified:',
              dbErr,
            )
          }
        }
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
      phone,
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