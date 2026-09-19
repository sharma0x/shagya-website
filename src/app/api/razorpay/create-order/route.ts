import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import Razorpay from 'razorpay'
import { validateCartStock, type CartStockItem } from '@/lib/stock'
import { resolveCurrentPrices, applyCurrentPrice } from '@/lib/cart-prices'
import { validateCouponForCart } from '@/lib/coupons'

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
    let cartItems: any[] = []

    const payload = await getPayload({ config })

    if (isGuest && guestCartItems && guestCartItems.length > 0) {
      // Guest — resolve CURRENT prices so a price change in the admin is
      // reflected at checkout instead of trusting the stale client snapshot
      const priceMap = await resolveCurrentPrices(payload, guestCartItems)
      subtotal = guestCartItems.reduce(
        (acc: number, item: any) =>
          acc +
          applyCurrentPrice(item, priceMap).unitPrice * (item.quantity || 1),
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
      cartItems = (cart.items || []) as any[]
      // Resolve CURRENT prices from the DB (the stored unitPrice may be a

      // stale add-time snapshot)
      const priceMap = await resolveCurrentPrices(payload, cartItems)
      subtotal = cartItems.reduce(
        (acc: number, item: any) =>
          acc +
          applyCurrentPrice(item, priceMap).unitPrice * (item.quantity || 1),
        0,
      )
    }

    // ── Server-side stock validation ──
    const stockItems: CartStockItem[] = isGuest
      ? (guestCartItems || []).map((item: any) => ({
          product: item.product,
          variant: item.variant,
          quantity: item.quantity || 1,
        }))
      : [] // logged-in user: validate from DB cart below

    if (!isGuest && cartId) {
      // Fetch cart items from DB to validate against current stock
      const cartDoc = await payload.findByID({
        collection: 'carts',
        id: cartId,
      } as any)
      const cartItems = (cartDoc as any)?.items || []
      for (const item of cartItems) {
        const productId =
          typeof item.product === 'object' && item.product !== null
            ? item.product.id
            : item.product
        stockItems.push({
          product: productId,
          variant: item.variant,
          quantity: item.quantity || 1,
        })
      }
    }

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
      const cartProductIds = isGuest
        ? (guestCartItems || []).map((item: any) =>
            String(
              typeof item.product === 'object' ? item.product.id : item.product,
            ),
          )
        : (cartItems || []).map((item: any) =>
            String(
              typeof item.product === 'object' ? item.product.id : item.product,
            ),
          )

      const session = await auth.api.getSession({ headers: request.headers })

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
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}
