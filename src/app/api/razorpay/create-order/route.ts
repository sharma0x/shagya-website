import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import Razorpay from 'razorpay'
import { validateCartStock, type CartStockItem } from '@/lib/stock'
import { resolveCurrentPrices, applyCurrentPrice } from '@/lib/cart-prices'
import { validateCouponForCart } from '@/lib/coupons'
import { toUserFacingError } from '@/lib/api-error'
import { resolveCheckoutCart } from '@/lib/checkout-cart'

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

    let shipping = 0
    let discount = 0
    const payload = await getPayload({ config })
    const session = await auth.api.getSession({ headers: request.headers })
    let customerId: string | number | null = null

    if (session?.user) {
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

      customerId = customers.docs[0].id as string | number
    }

    const checkoutCart = await resolveCheckoutCart(
      payload,
      customerId,
      guestCartItems,
    )

    if (!checkoutCart) {
      if (!session?.user && !isGuest) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const cartItems = checkoutCart.items as any[]
    const priceMap = await resolveCurrentPrices(payload, cartItems)
    const subtotal = cartItems.reduce(
      (acc: number, item: any) =>
        acc +
        applyCurrentPrice(item, priceMap).unitPrice * (item.quantity || 1),
      0,
    )

    const stockItems: CartStockItem[] = cartItems.map((item: any) => ({
      product:
        typeof item.product === 'object' && item.product !== null
          ? item.product.id
          : item.product,
      variant: item.variant,
      quantity: item.quantity || 1,
    }))

    if (stockItems.length > 0) {
      const stockCheck = await validateCartStock(payload, stockItems)
      if (!stockCheck.ok) {
        // Find which items are out of stock for a clear error message
        const outOfStockDetails = Object.entries(stockCheck.clamped)
          .map(
            ([key, info]) =>
              `${key}: requested ${info.requested}, available ${info.available}`,
          )
          .join('; ')
        return NextResponse.json(
          {
            error:
              'Some items are no longer in stock or have insufficient quantity',
            details: outOfStockDetails,
          },
          { status: 409 },
        )
      }
    }

    const siteSettings = await payload.findGlobal({
      slug: 'site-settings',
    })
    const standardRate = (siteSettings as any).standardShippingRate ?? 150
    const expressRate = (siteSettings as any).expressShippingRate ?? 350
    const freeThreshold = (siteSettings as any).freeShippingThreshold ?? 5000
    const codFee = isCod ? Number((siteSettings as any).codFee ?? 100) : 0

    const shippingBase =
      subtotal >= freeThreshold
        ? 0
        : shippingType === 'express'
          ? expressRate
          : standardRate
    shipping = shippingBase

    // Validate coupon
    let appliedCoupon: any = null

    if (appliedCouponCode) {
      const cartProductIds = cartItems.map((item: any) =>
        String(
          typeof item.product === 'object' ? item.product.id : item.product,
        ),
      )

      const validation = await validateCouponForCart(
        payload,
        appliedCouponCode,
        subtotal,
        cartProductIds,
        session?.user,
      )

      if (!validation.valid) {
        return NextResponse.json(
          { error: validation.error || 'Invalid coupon code' },
          { status: 400 },
        )
      }

      appliedCoupon = validation.coupon
      discount = validation.coupon.discount || 0
      if (appliedCoupon.type === 'free_shipping') {
        shipping = 0
      }
    }

    const total = Math.max(0, subtotal + shipping - discount + codFee)

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
        codFee,
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
        codFee,
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
      codFee,
      discount,
      total,
    })
  } catch (error: any) {
    console.error('[Razorpay Create Order API Error]:', error)
    return NextResponse.json(
      { error: toUserFacingError(error) },
      { status: 500 },
    )
  }
}
