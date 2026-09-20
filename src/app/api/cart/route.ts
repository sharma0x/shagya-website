import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'
import { mergeCartItems, normalizeVariant } from '@/lib/cart-merge'
import {
  validateCartStock,
  applyStockClamp,
  type CartStockItem,
} from '@/lib/stock'
import {
  resolveCurrentPrices,
  itemProductId,
  applyCurrentPrice,
} from '@/lib/cart-prices'
import { findOrRepairCustomer } from '@/lib/auth-sync'

/**
 * GET /api/cart
 * Returns the authenticated user's cart.
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // Find the customer linked to this Better Auth user (repairing first)
    const customer = await findOrRepairCustomer(session.user.id)

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customerId = customer.id as number

    // Find the cart for this customer
    const carts = await payload.find({
      collection: 'carts',
      where: {
        customer: { equals: customerId },
      },
      limit: 1,
      overrideAccess: true,
      depth: 2,
    })

    if (carts.docs.length === 0) {
      return NextResponse.json({ items: [], subtotal: 0 })
    }

    // Recompute unit prices and subtotal from the CURRENT product prices so
    // a price change made in the admin is reflected immediately.
    const cart = carts.docs[0] as any
    const storedItems = Array.isArray(cart?.items) ? cart.items : []
    const priceMap = await resolveCurrentPrices(payload, storedItems)
    const items = storedItems.map((item: any) => {
      const { unitPrice } = applyCurrentPrice(item, priceMap)
      return { ...item, unitPrice }
    })
    const subtotal = items.reduce(
      (acc: number, item: any) =>
        acc + (item.unitPrice || 0) * (item.quantity || 1),
      0,
    )

    return NextResponse.json({ ...cart, items, subtotal })
  } catch (error) {
    console.error('[API] GET /api/cart error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/cart
 * Updates or merges the authenticated user's cart.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { items, couponId, action } = await request.json()
    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items must be an array' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // ── Server-side stock validation ──
    const stockItems: CartStockItem[] = items.map((item: any) => ({
      product: item.product,
      variant: item.variant,
      quantity: item.quantity || 1,
    }))

    const stockCheck = await validateCartStock(payload, stockItems)

    if (!stockCheck.ok) {
      // Clamp quantities to available stock instead of rejecting entirely
      const clampedItems = applyStockClamp(items, stockCheck)
      // Replace items array with clamped version for downstream processing
      items.length = 0
      items.push(...clampedItems)
    }

    // Find the customer linked to this Better Auth user (repairing first)
    const customer = await findOrRepairCustomer(session.user.id)

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customerId = customer.id as number

    // Calculate subtotal from CURRENT product prices (never trust the
    // add-time unitPrice snapshot in the client payload)
    const priceMap = await resolveCurrentPrices(payload, items)
    const pricedItems = items.map((item: any) => {
      const { unitPrice } = applyCurrentPrice(item, priceMap)
      return { ...item, unitPrice }
    })
    const subtotal = pricedItems.reduce(
      (acc, item) => acc + (item.unitPrice || 0) * (item.quantity || 1),
      0,
    )

    // Find existing cart
    const carts = await payload.find({
      collection: 'carts',
      where: {
        customer: { equals: customerId },
      },
      limit: 1,
      overrideAccess: true,
      depth: 2,
    })

    let cart
    const data: any = {
      customer: customerId,
      items: pricedItems.map((item) => ({
        product:
          typeof item.product === 'object' && item.product !== null
            ? item.product.id
            : item.product,
        variant: normalizeVariant(item.variant),
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      subtotal,
      lastActivity: new Date().toISOString(),
    }

    if (couponId) {
      data.coupon = couponId
    }

    if (carts.docs.length > 0) {
      if (action === 'merge') {
        // Merge incoming items with existing cart items. Existing items come
        // back from payload.find with relationships populated (default depth
        // >= 1), so keys must normalize populated product objects + variants.
        const existingItems = (carts.docs[0] as any).items || []

        data.items = mergeCartItems(existingItems, data.items)
        data.subtotal = data.items.reduce(
          (acc: number, item: any) =>
            acc + (item.unitPrice || 0) * (item.quantity || 1),
          0,
        )
      }

      cart = await payload.update({
        collection: 'carts',
        id: carts.docs[0].id,
        data,
        overrideAccess: true,
        depth: 2,
      })
    } else {
      // Create new cart
      cart = await payload.create({
        collection: 'carts',
        data,
        overrideAccess: true,
        depth: 2,
      })
    }

    return NextResponse.json(cart)
  } catch (error) {
    console.error('[API] POST /api/cart error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
