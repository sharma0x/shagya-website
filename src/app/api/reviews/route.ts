import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'

const URL_PATTERN = /https?:\/\/\S+/i

function containsLinks(text: string): boolean {
  return URL_PATTERN.test(text)
}

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, rating, title, body: reviewBody } = body

    if (!productId || !rating || !title || !reviewBody) {
      return NextResponse.json(
        { error: 'Rating, title, and review body are required' },
        { status: 400 },
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 },
      )
    }

    // Content filter — block links
    if (containsLinks(title) || containsLinks(reviewBody)) {
      return NextResponse.json(
        { error: 'Links are not allowed in reviews' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config })

    // Find customer by Better Auth user ID
    const customers = await payload.find({
      collection: 'customers',
      where: { betterAuthUserId: { equals: session.user.id } },
      limit: 1,
    })

    if (customers.docs.length === 0) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
    }

    const customer = customers.docs[0]

    // ── Verified purchase check ──
    const orders = await payload.find({
      collection: 'orders',
      where: {
        and: [
          { customerEmail: { equals: customer.email } },
          { status: { in: ['confirmed', 'processing', 'shipped', 'delivered'] } },
        ],
      },
      limit: 50,
      depth: 1,
    })

    const hasPurchasedProduct = orders.docs.some((order: any) => {
      const items = order.items || []
      return items.some((item: any) => {
        const pid = typeof item.product === 'object' ? item.product?.id : item.product
        return String(pid) === String(productId)
      })
    })

    // ── Duplicate check ──
    const existingReviews = await payload.find({
      collection: 'reviews',
      where: {
        and: [
          { customer: { equals: customer.id } },
          { product: { equals: Number(productId) } },
        ],
      },
      limit: 1,
    })

    const alreadyReviewed = existingReviews.docs.length > 0

    const review = await payload.create({
      collection: 'reviews',
      data: {
        customer: customer.id as number,
        product: Number(productId),
        rating,
        title: title.trim(),
        body: reviewBody.trim(),
        verifiedPurchase: hasPurchasedProduct,
        status: 'approved',
      },
    })

    return NextResponse.json({
      success: true,
      reviewId: review.id,
      verifiedPurchase: hasPurchasedProduct,
      alreadyReviewed: false,
    })
  } catch (error) {
    console.error('[API] POST /api/reviews error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
