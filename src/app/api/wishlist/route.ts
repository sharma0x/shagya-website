import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'

/**
 * GET /api/wishlist
 * Returns the authenticated customer's wishlist items.
 */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // Find the customer
    const customers = await payload.find({
      collection: 'customers',
      where: {
        betterAuthUserId: { equals: session.user.id },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (customers.docs.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customer = customers.docs[0]

    // Fetch the customer's wishlist with populated product relationships
    const wishlists = await payload.find({
      collection: 'wishlist',
      where: {
        customer: { equals: customer.id },
      },
      limit: 1,
      depth: 2,
      overrideAccess: true,
    })

    if (wishlists.docs.length === 0) {
      return NextResponse.json({ items: [], message: 'Wishlist is empty' })
    }

    return NextResponse.json({
      ...wishlists.docs[0],
      items: wishlists.docs[0].items || [],
      message: 'Wishlist retrieved successfully',
    })
  } catch (error: any) {
    console.error('[API] GET /api/wishlist error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

function cleanWishlistItems(items: any[]) {
  return items.map((item: any) => {
    const pId =
      typeof item.product === 'object' && item.product !== null
        ? item.product.id
        : item.product
    const vId =
      item.variant && typeof item.variant === 'object'
        ? item.variant.id
        : item.variant
    const cleanedItem: { product: number; variant?: number } = {
      product: Number(pId),
    }
    if (vId !== undefined && vId !== null) {
      cleanedItem.variant = Number(vId)
    }
    return cleanedItem
  })
}

/**
 * POST /api/wishlist
 * Toggles a product in the customer's wishlist (adds if absent, removes if present).
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, variantId } = await request.json()
    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Find customer
    const customers = await payload.find({
      collection: 'customers',
      where: {
        betterAuthUserId: { equals: session.user.id },
      },
      limit: 1,
    })

    if (customers.docs.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customer = customers.docs[0]

    const wishlists = await payload.find({
      collection: 'wishlist',
      where: {
        customer: { equals: customer.id },
      },
      limit: 1,
      overrideAccess: true,
    })

    let wishlistDoc = wishlists.docs[0]
    let items = wishlistDoc?.items || []

    const itemIndex = items.findIndex((item: any) => {
      const matchProduct =
        typeof item.product === 'object'
          ? String(item.product.id) === String(productId)
          : String(item.product) === String(productId)
      const matchVariant =
        !variantId ||
        (typeof item.variant === 'object'
          ? String(item.variant?.id) === String(variantId)
          : String(item.variant) === String(variantId))
      return matchProduct && matchVariant
    })

    let message = ''

    if (itemIndex > -1) {
      // Remove item
      items.splice(itemIndex, 1)
      message = 'Product removed from wishlist'
    } else {
      // Add item
      const newItem: { product: number; variant?: number } = {
        product: Number(productId),
      }
      if (variantId) newItem.variant = Number(variantId)
      items.push(newItem)
      message = 'Product added to wishlist'
    }

    const cleanedItems = cleanWishlistItems(items)

    if (wishlistDoc) {
      wishlistDoc = await payload.update({
        collection: 'wishlist',
        id: wishlistDoc.id,
        data: {
          items: cleanedItems,
        },
        overrideAccess: true,
      })
    } else {
      wishlistDoc = await payload.create({
        collection: 'wishlist',
        data: {
          customer: customer.id,
          items: cleanedItems,
        },
        overrideAccess: true,
      })
    }

    return NextResponse.json({
      success: true,
      productId,
      message,
      wishlist: wishlistDoc,
    })
  } catch (error: any) {
    console.error('[API] POST /api/wishlist error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/wishlist
 * Explicitly removes a product from the customer's wishlist.
 */
export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { productId, variantId } = await request.json()
    if (!productId) {
      return NextResponse.json(
        { error: 'productId is required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Find customer
    const customers = await payload.find({
      collection: 'customers',
      where: {
        betterAuthUserId: { equals: session.user.id },
      },
      limit: 1,
      overrideAccess: true,
    })

    if (customers.docs.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customer = customers.docs[0]

    // Find customer's wishlist
    const wishlists = await payload.find({
      collection: 'wishlist',
      where: {
        customer: { equals: customer.id },
      },
      limit: 1,
      overrideAccess: true,
    })

    let wishlistDoc = wishlists.docs[0]
    if (!wishlistDoc) {
      return NextResponse.json({
        success: true,
        productId,
        message: 'Wishlist is already empty',
      })
    }

    let items = wishlistDoc.items || []
    const originalLength = items.length

    items = items.filter((item: any) => {
      const matchProduct =
        typeof item.product === 'object'
          ? String(item.product.id) === String(productId)
          : String(item.product) === String(productId)
      const matchVariant =
        !variantId ||
        (typeof item.variant === 'object'
          ? String(item.variant?.id) === String(variantId)
          : String(item.variant) === String(variantId))
      return !(matchProduct && matchVariant)
    })

    if (items.length !== originalLength) {
      const cleanedItems = cleanWishlistItems(items)
      wishlistDoc = await payload.update({
        collection: 'wishlist',
        id: wishlistDoc.id,
        data: {
          items: cleanedItems,
        },
        overrideAccess: true,
      })
    }

    return NextResponse.json({
      success: true,
      productId,
      message: 'Product removed from wishlist',
      wishlist: wishlistDoc,
    })
  } catch (error: any) {
    console.error('[API] DELETE /api/wishlist error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 },
    )
  }
}
