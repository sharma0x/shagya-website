import { NextResponse } from 'next/server'
import { verifyOTP } from '@/lib/otp'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(request: Request) {
  try {
    const { phone, otp, name } = await request.json()

    if (!phone || !otp || !name) {
      return NextResponse.json(
        { error: 'Phone, OTP, and name are required' },
        { status: 400 },
      )
    }

    const result = verifyOTP(phone, otp)
    if (!result.valid || !result.email) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Ensure a Customer record exists for this guest
    const existing = await payload.find({
      collection: 'customers',
      where: { email: { equals: result.email } },
      limit: 1,
    } as any)

    let customerId: string | number

    if (existing.docs.length > 0) {
      customerId = existing.docs[0].id as string | number
      // Update phone if not set
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
        data: { email: result.email, name, phone },
      } as any)
      customerId = created.id as string | number
    }

    return NextResponse.json({
      success: true,
      verified: true,
      customerId,
      email: result.email,
      name,
      phone,
    })
  } catch (error) {
    console.error('[API] POST /api/checkout/verify-otp error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
