import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'

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

    const review = await payload.create({
      collection: 'reviews',
      data: {
        customer: customer.id as number,
        product: Number(productId),
        rating,
        title: title.trim(),
        body: reviewBody.trim(),
        status: 'pending', // admin must approve
      },
    })

    return NextResponse.json({ success: true, reviewId: review.id })
  } catch (error) {
    console.error('[API] POST /api/reviews error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
