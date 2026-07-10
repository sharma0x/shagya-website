import { NextResponse } from 'next/server'
import { generateOTP, storeOTP, hasPendingOTP } from '@/lib/otp'
import { sendOTP } from '@/lib/sms'
import { validateIndianPhone } from '@/lib/sms'

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

    if (hasPendingOTP(phone)) {
      return NextResponse.json(
        { error: 'An OTP was already sent. Please wait before requesting a new one.' },
        { status: 429 },
      )
    }

    const otp = generateOTP()
    storeOTP(phone, email, otp)
    await sendOTP(phone, otp)

    return NextResponse.json({ success: true, message: 'OTP sent' })
  } catch (error) {
    console.error('[API] POST /api/checkout/send-otp error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
