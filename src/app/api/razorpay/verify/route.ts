import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import crypto from 'crypto'
import { isSameAddress } from '@/lib/address-utils'
import { validateCartStock, type CartStockItem } from '@/lib/stock'
import { resolveCurrentPrices, applyCurrentPrice } from '@/lib/cart-prices'
import { validateCouponForCart } from '@/lib/coupons'
import { findOrRepairCustomer } from '@/lib/auth-sync'
import { toUserFacingError } from '@/lib/api-error'
import { resolveCheckoutCart } from '@/lib/checkout-cart'
import { COD_LIMIT_ERROR, isCodEligible } from '@/lib/cod-eligibility'
import { placeOrderAndConsumeCart } from '@/lib/order-placement'

function normalizeProductId(value: unknown): number | null {
  const rawId =
    value && typeof value === 'object' && 'id' in value
      ? (value as { id: unknown }).id
      : value
  const parsedId = typeof rawId === 'number' ? rawId : Number(rawId)

  return Number.isInteger(parsedId) && parsedId > 0 ? parsedId : null
}

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
      checkoutMode = 'account',
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

    const isGuest = checkoutMode === 'guest' || !!guestEmail
    let customerEmail = ''
    let customerPhone = phone || ''
    let customerId: string | number | null = null

    const payload = await getPayload({ config })

    if (isGuest) {
      customerEmail = guestEmail
      customerPhone = guestPhone || phone || ''
    }

    // Every current checkout path verifies identity first (email/phone OTP),
    // so a session almost always exists here. Prefer the atomic find-or-repair
    // path (keyed on the Better Auth user): it creates the customer once with
    // a real name/email and heals stale rows, instead of the old bare
    // `{ email }` insert that violated the NOT NULL `name` column. The bare
    // insert remains only as a legacy fallback for unverified guests.
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user && !isGuest) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let customer: any = null

    if (session?.user) {
      customer = await findOrRepairCustomer(session.user.id)
      const savedCustomerEmail =
        typeof customer?.email === 'string' ? customer.email.trim() : ''
      customerEmail =
        customerEmail || savedCustomerEmail || session.user.email || ''
      customerPhone = customerPhone || (session.user as any).phoneNumber || ''
    }

    if (!customer && isGuest) {
      const found = await payload.find({
        collection: 'customers',
        where: { email: { equals: customerEmail } },
        limit: 1,
      } as any)
      customer = found.docs[0] ?? null

      if (!customer) {
        try {
          const created = await payload.create({
            collection: 'customers',
            overrideAccess: true,
            data: {
              email: customerEmail,
              name: shippingAddress?.fullName || '',
              phone: customerPhone || '',
            },
          } as any)
          customer = created
        } catch {
          // A concurrent creation can race the unique email index — re-find
          // instead of surfacing the DB error to the client.
          const refound = await payload.find({
            collection: 'customers',
            where: { email: { equals: customerEmail } },
            limit: 1,
          } as any)
          customer = refound.docs[0] ?? null
        }
      }
    }

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    customerId = customer.id as string | number

    let orderItems: any[]
    let subtotal = 0
    const resolveOrderItemColor = makeColorResolver(payload)
    const checkoutCart = await resolveCheckoutCart(
      payload,
      session?.user && !isGuest ? customerId : null,
      guestCartItems,
    )

    if (!checkoutCart) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
    }

    const sourceItems = checkoutCart.items as any[]
    const priceMap = await resolveCurrentPrices(payload, sourceItems)
    orderItems = await Promise.all(
      sourceItems.map(async (item: any) => {
        const productId = normalizeProductId(item.product)
        if (!productId) throw new Error('Cart contains an invalid product')
        const { unitPrice } = applyCurrentPrice(item, priceMap)
        const { colorId, colorName } = await resolveOrderItemColor(item.variant)
        const productCode = priceMap.get(String(productId))?.productCode ?? null
        const quantity = item.quantity || 1
        return {
          product: productId,
          productCode,
          color: colorId,
          colorName,
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
        }
      }),
    )
    subtotal = orderItems.reduce((a: number, i: any) => a + i.totalPrice, 0)

    // ── Server-side stock validation before order creation ──
    const rawStockItems: CartStockItem[] = sourceItems.map((item: any) => ({
      product: normalizeProductId(item.product) ?? item.product,
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
    const codFee = isCod ? Number((siteSettings as any).codFee ?? 100) : 0

    const shippingBase =
      subtotal >= freeThreshold
        ? 0
        : shippingType === 'express'
          ? expressRate
          : standardRate
    let shipping = shippingBase

    let discount = 0
    let usedCouponId: string | number | null = null
    let usedCoupon: any = null

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
      usedCoupon = appliedCoupon
      usedCouponId = appliedCoupon.id
      discount = appliedCoupon.discount || 0
      if (appliedCoupon.type === 'free_shipping') {
        shipping = 0 // Actually zero out the shipping cost
      }
    }

    const total = Math.max(0, subtotal + shipping - discount + codFee)

    if (isCod && !isCodEligible(total)) {
      return NextResponse.json({ error: COD_LIMIT_ERROR }, { status: 400 })
    }

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

    const order: any = await placeOrderAndConsumeCart(payload, {
      orderData: {
        customerEmail,
        phone: customerPhone,
        status: orderStatus,
        subtotal,
        shipping,
        codFee,
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
      cart: checkoutCart
        ? {
            cartId: checkoutCart.cartId,
            updatedAt: checkoutCart.updatedAt,
          }
        : null,
    })

    if (usedCouponId && usedCoupon) {
      try {
        await payload.update({
          collection: 'coupons',
          id: usedCouponId as string,
          data: { usedCount: (usedCoupon.usedCount || 0) + 1 },
        } as any)
      } catch {
        // Non-critical — don't block order
      }
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
    const cartConflict =
      error?.message === 'Cart changed while the order was being placed'
    return NextResponse.json(
      {
        error: cartConflict
          ? 'Your cart changed while the order was being placed. Please refresh and try again.'
          : toUserFacingError(error),
      },
      { status: cartConflict ? 409 : 500 },
    )
  }
}
