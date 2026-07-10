import { NextResponse } from 'next/server'
import { generateOTP, createOTPToken, OTP_COOKIE_NAME, OTP_TTL_MS } from '@/lib/otp'
import { sendOTP, validateIndianPhone } from '@/lib/sms'

export async function POST(request: Request) {
  try {
    const { phone, email } = await request.json()

    if (!phone || !email) {
      return NextResponse.json(
        { error: 'Phone and email are required' },
        { status: 400 },
      )
    }

    if (!validateIndianPhone(phone)) {
      return NextResponse.json(
        { error: 'Please enter a valid 10-digit Indian mobile number' },
        { status: 400 },
      )
    }

    const otp = generateOTP()
    const token = createOTPToken(phone, otp)

    // In dev mode (no Twilio), log the OTP so you can see it
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log(`[OTP] Dev mode — OTP for ${phone}: ${otp}`)
    }
    await sendOTP(phone, otp)

    const res = NextResponse.json({ success: true, message: 'OTP sent' })
    res.cookies.set(OTP_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: OTP_TTL_MS / 1000,
    })
    return res
  } catch (error) {
    console.error('[API] POST /api/checkout/send-otp error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
