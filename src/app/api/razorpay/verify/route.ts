import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      shippingAddress,
      billingAddress,
      phone,
      isCod = false,
      isMock = false,
      notes = '',
      guestEmail = '',
      guestPhone = '',
      cartItems: guestCartItems,
    } = body

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 },
      )
    }

    const isGuest = !!guestEmail
    let customerEmail = ''
    let customerPhone = phone || ''
    let customerId: string | number | null = null

    if (isGuest) {
      customerEmail = guestEmail
      customerPhone = guestPhone || phone || ''
    } else {
      const session = await auth.api.getSession({ headers: request.headers })
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      customerEmail = session.user.email
    }

    const payload = await getPayload({ config })

    // Find or create customer
    const customers = await payload.find({
      collection: 'customers',
      where: isGuest
        ? { email: { equals: customerEmail } }
        : { betterAuthUserId: { equals: (await auth.api.getSession({ headers: request.headers }))?.user?.id || '' } },
      limit: 1,
    } as any)

    if (isGuest && customers.docs.length === 0) {
      // Guest customer might have been created by verify-otp, but if not, create now
      const created = await payload.create({
        collection: 'customers',
        data: { email: customerEmail, phone: customerPhone },
      } as any)
      customerId = created.id as string | number
    } else if (customers.docs.length > 0) {
      customerId = customers.docs[0].id as string | number
    } else {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    let orderItems: any[]
    let subtotal = 0
    let cartId: string | number | null = null

    if (isGuest && guestCartItems && guestCartItems.length > 0) {
      // Guest — use cart items from request body
      orderItems = guestCartItems.map((item: any) => ({
        product: Number(item.product),
        variant: item.variant ? Number(item.variant) : null,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        totalPrice: (item.unitPrice || 0) * (item.quantity || 1),
      }))
      subtotal = orderItems.reduce((a: number, i: any) => a + i.totalPrice, 0)
    } else {
      // Logged in — get cart from DB
      const carts = await payload.find({
        collection: 'carts',
        where: { customer: { equals: customerId } },
        limit: 1,
      } as any)

      const cart = carts.docs[0] as any

      if (
        carts.docs.length === 0 ||
        !(cart as any).items ||
        (cart as any).items.length === 0
      ) {
        return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
      }

      cartId = cart.id as string | number
      subtotal =
        (cart as any).subtotal ||
        ((cart as any).items || []).reduce(
          (acc: number, item: any) =>
            acc + (item.unitPrice || 0) * (item.quantity || 1),
          0,
        )

      orderItems = (cart.items || []).map((item: any) => {
        const productId =
          typeof item.product === 'object' && item.product !== null
            ? item.product.id
            : item.product
        let variantId = null
        if (item.variant) {
          variantId =
            typeof item.variant === 'object'
              ? item.variant.id || null
              : item.variant
        }
        return {
          product: productId,
          variant: variantId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
        }
      })
    }

    const shipping = subtotal >= 5000 ? 0 : 150

    let discount = 0
    // For logged-in users with coupon
    if (!isGuest && cartId) {
      const cart = await payload.findByID({
        collection: 'carts',
        id: cartId,
        } as any) as any
        if ((cart as any)?.coupon) {
          const couponId =
            typeof (cart as any).coupon === 'object' ? (cart as any).coupon.id : (cart as any).coupon
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

    const total = Math.max(0, subtotal + shipping - discount)

    // Payment verification
    let finalPaymentId = ''
    let orderStatus: 'confirmed' | 'pending' = 'pending'

    if (isCod) {
      finalPaymentId = 'COD'
      orderStatus = 'pending'
    } else {
      orderStatus = 'confirmed'
      finalPaymentId = razorpay_payment_id || 'MOCK_PAYMENT'

      if (!isMock) {
        const keySecret = process.env.RAZORPAY_KEY_SECRET || ''
        const expected = crypto
          .createHmac('sha256', keySecret)
          .update(`${razorpay_order_id}|${razorpay_payment_id}`)
          .digest('hex')

        if (expected !== razorpay_signature) {
          return NextResponse.json(
            { error: 'Invalid payment signature' },
            { status: 400 },
          )
        }
      }
    }

    const order: any = await payload.create({
      collection: 'orders',
      data: {
        customerEmail,
        phone: customerPhone,
        status: orderStatus,
        subtotal,
        shipping,
        discount,
        total,
        paymentId: finalPaymentId,
        notes: notes || '',
        shippingAddress: {
          fullName: shippingAddress.fullName,
          phone: shippingAddress.phone,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2 || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          country: shippingAddress.country || 'India',
        },
        billingAddress: {
          fullName: billingAddress?.fullName || shippingAddress.fullName,
          phone: billingAddress?.phone || shippingAddress.phone,
          line1: billingAddress?.line1 || shippingAddress.line1,
          line2: billingAddress?.line2 || shippingAddress.line2 || '',
          city: billingAddress?.city || shippingAddress.city,
          state: billingAddress?.state || shippingAddress.state,
          pincode: billingAddress?.pincode || shippingAddress.pincode,
          country:
            billingAddress?.country || shippingAddress.country || 'India',
        },
        items: orderItems,
      },
    } as any)

    // Clear cart for logged-in users
    if (cartId) {
      await payload.update({
        collection: 'carts',
        id: cartId,
        data: { items: [], subtotal: 0, coupon: null },
      } as any)
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
    })
  } catch (error: any) {
    console.error('[Razorpay Verify API Error]:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}
