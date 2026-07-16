import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, subtotal } = await request.json()
    if (!code) {
      return NextResponse.json({ valid: false, error: 'Please enter a coupon code' }, { status: 400 })
    }

    const payload = await getPayload({ config })
    const normalizedCode = code.trim().toUpperCase()

    // Find coupon
    const coupons = await payload.find({
      collection: 'coupons',
      where: { code: { equals: normalizedCode } },
      limit: 1,
    })

    if (coupons.docs.length === 0) {
      return NextResponse.json({ valid: false, error: 'Invalid coupon code' }, { status: 200 })
    }

    const coupon = coupons.docs[0] as any

    // Check active
    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, error: 'This coupon is no longer active' }, { status: 200 })
    }

    // Check dates
    const now = new Date()
    if (coupon.startDate && new Date(coupon.startDate) > now) {
      return NextResponse.json({ valid: false, error: 'This coupon is not yet active' }, { status: 200 })
    }
    if (coupon.endDate && new Date(coupon.endDate) < now) {
      return NextResponse.json({ valid: false, error: 'This coupon has expired' }, { status: 200 })
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: 'This coupon has reached its usage limit' }, { status: 200 })
    }

    // Check minimum cart value
    if (coupon.minCartValue && subtotal < coupon.minCartValue) {
      return NextResponse.json({
        valid: false,
        error: `Minimum cart value of ₹${coupon.minCartValue} required`,
      }, { status: 200 })
    }

    // Check customer conditions
    if (coupon.customersConditions?.length > 0) {
      const customers = await payload.find({
        collection: 'customers',
        where: { betterAuthUserId: { equals: session.user.id } },
        limit: 1,
      })
      if (customers.docs.length === 0) {
        return NextResponse.json({ valid: false, error: 'Customer not found' }, { status: 200 })
      }
      const customerId = customers.docs[0].id
      const allowedIds = coupon.customersConditions.map((c: any) =>
        typeof c === 'object' ? c.id : c,
      )
      if (!allowedIds.includes(customerId)) {
        return NextResponse.json({ valid: false, error: 'This coupon is not available for your account' }, { status: 200 })
      }
    }

    // Calculate discount
    let discount = 0
    if (coupon.type === 'percentage') {
      discount = Math.round((subtotal * coupon.value) / 100)
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
    } else if (coupon.type === 'fixed_amount') {
      discount = coupon.value
    } else if (coupon.type === 'free_shipping') {
      discount = 0 // handled separately
    }

    // Return coupon data (not the full doc to avoid exposing conditions)
    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        maxDiscount: coupon.maxDiscount,
        discount,
      },
    })
  } catch (error) {
    console.error('[API] POST /api/coupons/validate error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
