import { NextResponse } from 'next/server'
import { verifyOTPToken, OTP_COOKIE_NAME } from '@/lib/otp'
import { getPayload } from 'payload'
import config from '@payload-config'

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

    // Read the OTP token from the cookie
    const cookie = request.headers.get('cookie') || ''
    const token = parseCookie(cookie, OTP_COOKIE_NAME)

    if (!token || !verifyOTPToken(phone, otp, token)) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Ensure a Customer record exists for this guest
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

    const res = NextResponse.json({
      success: true,
      verified: true,
      customerId,
      email,
      name,
      phone,
    })
    // Clear the OTP cookie
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
