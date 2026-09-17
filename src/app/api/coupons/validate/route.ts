import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { validateCouponForCart } from '@/lib/coupons'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    const { code, subtotal, productIds } = await request.json()
    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Please enter a coupon code' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    const validation = await validateCouponForCart(
      payload,
      code,
      subtotal,
      productIds,
      session?.user,
    )

    if (!validation.valid) {
      return NextResponse.json(
        { valid: false, error: validation.error },
        { status: 200 },
      )
    }

    return NextResponse.json({
      valid: true,
      coupon: validation.coupon,
    })
  } catch (error) {
    console.error('[API] POST /api/coupons/validate error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
