import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import crypto from 'crypto'
import { isSameAddress } from '@/lib/address-utils'
import { validateCartStock, type CartStockItem } from '@/lib/stock'
import { resolveCurrentPrices, applyCurrentPrice } from '@/lib/cart-prices'
import { validateCouponForCart } from '@/lib/coupons'

/**
 * Resolves the color identity from a cart item's variant JSON
 * (`{ color: { id?, slug, name, hex } }`) into the Colors doc ID + a name
 * snapshot for the order record. Falls back to a slug lookup when the
 * variant JSON lacks the color ID (older carts).
 */
function makeColorResolver(payload: any) {
  const cache = new Map<string, { id: number; name: string }>()

  return async function resolveOrderItemColor(
    variant: unknown,
  ): Promise<{ colorId: number | null; colorName: string | null }> {
    const color =
      variant && typeof variant === 'object' ? (variant as any).color : null
    if (!color || typeof color !== 'object') {
      return { colorId: null, colorName: null }
    }

    const name = typeof color.name === 'string' ? color.name : null

    if (color.id != null && color.id !== '') {
      const parsed = Number(color.id)
      if (Number.isFinite(parsed)) {
        return { colorId: parsed, colorName: name }
      }
    }

    const slug = typeof color.slug === 'string' ? color.slug : ''
    if (slug) {
      const cached = cache.get(slug)
      if (cached) return { colorId: cached.id, colorName: name ?? cached.name }
      try {
        const res = await payload.find({
          collection: 'colors',
          where: { slug: { equals: slug } },
          limit: 1,
          overrideAccess: true,
        })
        const found = res.docs[0]
        if (found) {
          cache.set(slug, { id: found.id as number, name: found.name })
          return { colorId: found.id as number, colorName: name ?? found.name }
        }
      } catch {
        // lookup failure — record name only
      }
    }

    return { colorId: null, colorName: name }
  }
}

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
      shippingType = 'standard',
      cartItems: guestCartItems,
      appliedCouponCode,
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
        : {
            betterAuthUserId: {
              equals:
                (await auth.api.getSession({ headers: request.headers }))?.user
                  ?.id || '',
            },
          },
      limit: 1,
    } as any)

    if (isGuest && customers.docs.length === 0) {
      // Guest customer might have been created by verify-otp, but if not, create now
      const created = await payload.create({
        collection: 'customers',
        data: { email: customerEmail },
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
    let cart: any = null
    const resolveOrderItemColor = makeColorResolver(payload)

    if (isGuest && guestCartItems && guestCartItems.length > 0) {
      // Guest — use cart items from request body but price them from the
      // CURRENT product documents (never trust the stale client snapshot)
      const priceMap = await resolveCurrentPrices(payload, guestCartItems)
      orderItems = await Promise.all(
        guestCartItems.map(async (item: any) => {
          const { unitPrice } = applyCurrentPrice(item, priceMap)
          const { colorId, colorName } = await resolveOrderItemColor(
            item.variant,
          )
          return {
            product: Number(item.product),
            color: colorId,
            colorName,
            quantity: item.quantity || 1,
            unitPrice,
            totalPrice: unitPrice * (item.quantity || 1),
          }
        }),
      )
      subtotal = orderItems.reduce((a: number, i: any) => a + i.totalPrice, 0)
    } else {
      // Logged in — get cart from DB
      const carts = await payload.find({
        collection: 'carts',
        where: { customer: { equals: customerId } },
        limit: 1,
      } as any)

      cart = carts.docs[0] as any

      if (
        carts.docs.length === 0 ||
        !(cart as any).items ||
        (cart as any).items.length === 0
      ) {
        return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
      }

      cartId = cart.id as string | number
      const cartItems = (cart.items || []) as any[]
      // Price the order from CURRENT product documents, not the stored
      // add-time unitPrice snapshot
      const priceMap = await resolveCurrentPrices(payload, cartItems)
      orderItems = await Promise.all(
        cartItems.map(async (item: any) => {
          const productId =
            typeof item.product === 'object' && item.product !== null
              ? item.product.id
              : item.product
          const { unitPrice } = applyCurrentPrice(item, priceMap)
          const { colorId, colorName } = await resolveOrderItemColor(
            item.variant,
          )
          return {
            product: productId,
            color: colorId,
            colorName,
            quantity: item.quantity,
            unitPrice,
            totalPrice: unitPrice * item.quantity,
          }
        }),
      )
      subtotal = orderItems.reduce((a: number, i: any) => a + i.totalPrice, 0)
    }

    // ── Server-side stock validation before order creation ──
    const stockItems: CartStockItem[] = orderItems.map((item: any) => ({
      product: item.product,
      variant: null, // order items use color ID, we need to check via product ID + quantity
      quantity: item.quantity || 1,
    }))

    // For variant products, we need to check per-color stock.
    // Build stock items from the original cart/guest items with variant info.
    const rawStockItems: CartStockItem[] = isGuest
      ? (guestCartItems || []).map((item: any) => ({
          product: item.product,
          variant: item.variant,
          quantity: item.quantity || 1,
        }))
      : (cart?.items || []).map((item: any) => ({
          product:
            typeof item.product === 'object' && item.product !== null
              ? item.product.id
              : item.product,
          variant: item.variant,
          quantity: item.quantity || 1,
        }))

    if (rawStockItems.length > 0) {
      const stockCheck = await validateCartStock(payload, rawStockItems)
      if (!stockCheck.ok) {
        return NextResponse.json(
          {
            error:
              'Some items are no longer in stock or have insufficient quantity. Please refresh your cart.',
            details: Object.entries(stockCheck.clamped)
              .map(
                ([key, info]) =>
                  `${key}: requested ${info.requested}, available ${info.available}`,
              )
              .join('; '),
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

    const shippingBase =
      subtotal >= freeThreshold
        ? 0
        : shippingType === 'express'
          ? expressRate
          : standardRate
    let shipping = shippingBase

    let discount = 0
    let usedCouponId: string | number | null = null

    // Validate coupon
    if (appliedCouponCode) {
      const cartProductIds = orderItems.map((item: any) => String(item.product))
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

      const appliedCoupon = validation.coupon
      usedCouponId = appliedCoupon.id
      discount = appliedCoupon.discount || 0
      if (appliedCoupon.type === 'free_shipping') {
        shipping = 0 // Actually zero out the shipping cost
      }

      // Increment usedCount
      try {
        await payload.update({
          collection: 'coupons',
          id: usedCouponId as string,
          data: { usedCount: (appliedCoupon.usedCount || 0) + 1 },
        } as any)
      } catch {
        // Non-critical — don't block order
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
        shippingType,
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
        coupon: usedCouponId,
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

    // Save shipping address to customer's saved addresses if not already saved
    if (customerId && shippingAddress) {
      try {
        const existingAddresses = await payload.find({
          collection: 'addresses',
          where: {
            customer: { equals: customerId },
          },
          limit: 100,
        })

        const alreadyExists = existingAddresses.docs.some((addr: any) =>
          isSameAddress(addr, shippingAddress),
        )

        if (!alreadyExists) {
          await payload.create({
            collection: 'addresses',
            data: {
              customer: customerId as number,
              fullName: shippingAddress.fullName || '',
              phone: shippingAddress.phone || '',
              line1: shippingAddress.line1 || '',
              line2: shippingAddress.line2 || '',
              city: shippingAddress.city || '',
              state: shippingAddress.state || '',
              pincode: shippingAddress.pincode || '',
              country: shippingAddress.country || 'India',
              isDefault: false,
            },
          })
        }
      } catch {
        // Non-critical — don't fail the order if address save fails
      }
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
