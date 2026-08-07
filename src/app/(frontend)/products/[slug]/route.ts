import { NextResponse, type NextRequest } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

type RouteContext = {
  params: Promise<{ slug: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { slug } = await context.params
  const { searchParams } = request.nextUrl

  // Legacy preview URLs: /products/{slug}?preview=true&id={productId}
  if (searchParams.get('preview') === 'true' && searchParams.get('id')) {
    const id = searchParams.get('id')!
    const previewUrl = `/products/${slug}/${id}?preview=true`
    return NextResponse.redirect(new URL(previewUrl, request.url), 301)
  }

  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
  })
  const product = docs[0]

  if (!product) {
    return new NextResponse(null, { status: 404 })
  }

  const canonical = `/products/${product.slug || slug}/${product.id}`
  return NextResponse.redirect(new URL(canonical, request.url), 301)
}
