import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const body = await request.json()
    const email = body.email?.trim().toLowerCase()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const product = await payload.findByID({
      collection: 'products',
      id: slug,
    } as any)

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const existing = await payload.find({
      collection: 'back-in-stock-requests',
      where: {
        product: { equals: slug },
        email: { equals: email },
        notified: { equals: false },
      },
      limit: 1,
    } as any)

    if (existing.docs.length > 0) {
      return NextResponse.json({
        success: true,
        message: "You're already on the list — we'll email you when it's back!",
      })
    }

    await payload.create({
      collection: 'back-in-stock-requests',
      data: { product: slug, email },
    } as any)

    return NextResponse.json({
      success: true,
      message: "We'll email you when this product is back in stock!",
    })
  } catch (error) {
    console.error('[API] POST /api/products/[slug]/notify-back-in-stock error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}