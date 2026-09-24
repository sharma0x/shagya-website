import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { validateCouponForCart } from '@/lib/coupons'
import {
  CheckoutCartValidationError,
  resolveCheckoutCart,
} from '@/lib/checkout-cart'
import { findOrRepairCustomer } from '@/lib/auth-sync'
import { requireCurrentPrice, resolveCurrentPrices } from '@/lib/cart-prices'

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })

    const {
      code,
      items,
      productIds,
      checkoutMode = 'account',
      guestEmail = '',
    } = await request.json()
    if (!code) {
      return NextResponse.json(
        { valid: false, error: 'Please enter a coupon code' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })
    const useServerCart = checkoutMode !== 'guest' && !guestEmail
    const customer =
      session?.user && useServerCart
        ? await findOrRepairCustomer(session.user.id)
        : null
    const requestItems = Array.isArray(items)
      ? items
      : Array.isArray(productIds)
        ? productIds.map((item) =>
            typeof item === 'object' && item !== null && 'product' in item
              ? item
              : { product: item, quantity: 1 },
          )
        : []
    const checkoutCart = await resolveCheckoutCart(
      payload,
      customer?.id as string | number | null,
      requestItems,
    )
    const cartItems = checkoutCart?.items || []

    if (cartItems.length === 0) {
      return NextResponse.json(
        { valid: false, error: 'Your cart is empty' },
        { status: 400 },
      )
    }

    const priceMap = await resolveCurrentPrices(payload, cartItems)
    const pricedItems = cartItems.map((item: any) => ({
      ...item,
      unitPrice: requireCurrentPrice(item, priceMap),
    }))
    const subtotal = pricedItems.reduce(
      (total: number, item: any) =>
        total + (item.unitPrice || 0) * (item.quantity || 1),
      0,
    )

    const validation = await validateCouponForCart(
      payload,
      code,
      subtotal,
      pricedItems,
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
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      {
        status: error instanceof CheckoutCartValidationError ? 400 : 500,
      },
    )
  }
}
