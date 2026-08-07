import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import Razorpay from 'razorpay'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      shippingAddress,
      phone,
      isCod = false,
      shippingType = 'standard',
      appliedCouponCode,
    } = body
    const guestEmail = body.guestEmail || ''
    const guestCartItems = body.cartItems

    const isGuest = !!guestEmail

    let subtotal = 0
    let shipping = 0
    let discount = 0
    let cartId: string | null = null

    const payload = await getPayload({ config })

    if (isGuest && guestCartItems && guestCartItems.length > 0) {
      // Guest — calculate from cart items in request
      subtotal = guestCartItems.reduce(
        (acc: number, item: any) =>
          acc + (item.unitPrice || 0) * (item.quantity || 1),
        0,
      )
    } else {
      // Logged in — get cart from DB
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const customers = await payload.find({
        collection: 'customers',
        where: { betterAuthUserId: { equals: session.user.id } },
        limit: 1,
      } as any)

      if (customers.docs.length === 0) {
        return NextResponse.json(
          { error: 'Customer not found' },
          { status: 404 },
        )
      }

      const carts = await payload.find({
        collection: 'carts',
        where: { customer: { equals: customers.docs[0].id } },
        limit: 1,
      } as any)

      if (
        carts.docs.length === 0 ||
        !(carts.docs[0] as any).items ||
        (carts.docs[0] as any).items.length === 0
      ) {
        return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
      }

      const cart = carts.docs[0] as any
      cartId = cart.id
      subtotal =
        cart.subtotal ||
        (cart.items || []).reduce(
          (acc: number, item: any) =>
            acc + (item.unitPrice || 0) * (item.quantity || 1),
          0,
        )
    }

    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
    })
    const standardRate = (siteSettings as any).standardShippingRate ?? 150
    const expressRate = (siteSettings as any).expressShippingRate ?? 350
    const freeThreshold = (siteSettings as any).freeShippingThreshold ?? 5000

    const shippingBase =
      subtotal >= freeThreshold
        ? 0
        : shippingType === 'express'
          ? expressRate
          : standardRate
    shipping = shippingBase

    // Find coupon document either from logged-in cart OR from appliedCouponCode
    let couponDoc: any = null

    if (!isGuest && cartId) {
      const carts = await payload.find({
        collection: 'carts',
        where: { id: { equals: cartId } },
        limit: 1,
      })
      const cart = carts.docs[0] as any
      if (cart?.coupon) {
        const couponId =
          typeof cart.coupon === 'object' ? cart.coupon.id : cart.coupon
        couponDoc = await payload.findByID({
          collection: 'coupons',
          id: couponId,
        } as any)
      }
    } else if (appliedCouponCode) {
      const coupons = await payload.find({
        collection: 'coupons',
        where: { code: { equals: appliedCouponCode.trim().toUpperCase() } },
        limit: 1,
      })
      if (coupons.docs.length > 0) {
        couponDoc = coupons.docs[0]
      }
    }

    if (couponDoc && couponDoc.isActive) {
      if (couponDoc.type === 'percentage') {
        discount = Math.round((subtotal * (couponDoc.value || 0)) / 100)
        if (couponDoc.maxDiscount && discount > couponDoc.maxDiscount)
          discount = couponDoc.maxDiscount
      } else if (couponDoc.type === 'fixed_amount') {
        discount = couponDoc.value || 0
      } else if (couponDoc.type === 'free_shipping') {
        shipping = 0
      }
    }

    const total = Math.max(0, subtotal + shipping - discount)

    // For COD, no Razorpay order needed
    if (isCod) {
      return NextResponse.json({
        razorpayOrder: {
          id: `cod_${Date.now()}`,
          isMock: true,
          amount: total * 100,
          currency: 'INR',
        },
        subtotal,
        shipping,
        discount,
        total,
      })
    }

    // Initialize Razorpay
    const keyId = process.env.RAZORPAY_KEY_ID || ''
    const keySecret = process.env.RAZORPAY_KEY_SECRET || ''

    const isDummyKey =
      !keyId || keyId.startsWith('rzp_test_xxxx') || keySecret === 'change-me'

    if (isDummyKey) {
      const mockOrder = {
        id: `order_mock_${Math.random().toString(36).substring(2, 11)}`,
        entity: 'order',
        amount: total * 100,
        amount_paid: 0,
        amount_due: total * 100,
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        status: 'created',
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000),
        isMock: true,
      }

      return NextResponse.json({
        razorpayOrder: mockOrder,
        subtotal,
        shipping,
        discount,
        total,
      })
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const order = await razorpay.orders.create({
      amount: total * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
    })

    return NextResponse.json({
      razorpayOrder: order,
      subtotal,
      shipping,
      discount,
      total,
    })
  } catch (error: any) {
    console.error('[Razorpay Create Order API Error]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}
