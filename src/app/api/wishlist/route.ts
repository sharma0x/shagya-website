import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

/**
 * GET /api/wishlist
 *
 * Returns the authenticated user's wishlist items.
 * Currently a stub — returns empty array. Full implementation comes with CLO-19.
 */

export async function GET(request: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({
    items: [],
    message: 'Wishlist endpoint stub — full implementation coming in CLO-19.',
  })
}

/**
 * POST /api/wishlist
 *
 * Adds a product to the authenticated user's wishlist.
 * Currently a stub. Full implementation comes with CLO-19.
 */

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { productId?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.productId) {
    return NextResponse.json(
      { error: 'Missing productId in request body' },
      { status: 400 },
    )
  }

  return NextResponse.json({
    productId: body.productId,
    message: 'Wishlist endpoint stub — full implementation coming in CLO-19.',
  })
}

/**
 * DELETE /api/wishlist
 *
 * Removes a product from the authenticated user's wishlist.
 * Currently a stub. Full implementation comes with CLO-19.
 */

export async function DELETE(request: Request): Promise<NextResponse> {
  const session = await auth.api.getSession({ headers: request.headers })

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { productId?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.productId) {
    return NextResponse.json(
      { error: 'Missing productId in request body' },
      { status: 400 },
    )
  }

  return NextResponse.json({
    productId: body.productId,
    message: 'Wishlist endpoint stub — full implementation coming in CLO-19.',
  })
}
