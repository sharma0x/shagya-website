import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import Razorpay from 'razorpay'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { shippingAddress, phone, isCod = false } = body
    const guestEmail = body.guestEmail || ''
    const guestCartItems = body.cartItems

    const isGuest = !!guestEmail

    let subtotal = 0
    let shipping = 0
    let discount = 0

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
        return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
      }

      const carts = await payload.find({
        collection: 'carts',
        where: { customer: { equals: customers.docs[0].id } },
        limit: 1,
      } as any)

      if (carts.docs.length === 0 || !(carts.docs[0] as any).items || (carts.docs[0] as any).items.length === 0) {
        return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
      }

      const cart = carts.docs[0] as any
      subtotal =
        cart.subtotal ||
        (cart.items || []).reduce(
          (acc: number, item: any) => acc + (item.unitPrice || 0) * (item.quantity || 1),
          0,
        )

      if (cart.coupon) {
        const couponId = typeof cart.coupon === 'object' ? cart.coupon.id : cart.coupon
        const coupon = await payload.findByID({
          collection: 'coupons',
          id: couponId,
        } as any) as any
        if (coupon && coupon.isActive) {
          if (coupon.type === 'percentage') {
            discount = Math.round((subtotal * (coupon.value || 0)) / 100)
            if (coupon.maxDiscount && discount > coupon.maxDiscount)
              discount = coupon.maxDiscount
          } else if (coupon.type === 'fixed_amount') {
            discount = coupon.value || 0
          }
        }
      }
    }

    shipping = subtotal >= 5000 ? 0 : 150
    const total = Math.max(0, subtotal + shipping - discount)

    // For COD, no Razorpay order needed
    if (isCod) {
      return NextResponse.json({
        razorpayOrder: { id: `cod_${Date.now()}`, isMock: true, amount: total * 100, currency: 'INR' },
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
