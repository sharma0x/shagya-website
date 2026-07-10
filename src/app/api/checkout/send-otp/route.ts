import { NextResponse } from 'next/server'
import { generateOTP, createOTPToken, OTP_COOKIE_NAME, OTP_TTL_MS } from '@/lib/otp'
import { sendOTPEmail } from '@/email/send'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'A valid email is required' },
        { status: 400 },
      )
    }

    const otp = generateOTP()
    const token = createOTPToken(email, otp)

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_xxxx') {
      console.log(`[OTP] Dev mode — OTP for ${email}: ${otp}`)
    }

    await sendOTPEmail(email, otp)

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
