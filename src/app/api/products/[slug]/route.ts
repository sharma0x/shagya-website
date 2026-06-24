import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * GET /api/products/[slug]
 *
 * Returns a single product by its slug with populated relationships (depth: 2).
 * Returns 404 if no matching product is found.
 */

const CACHE_HEADER =
  'public, max-age=60, s-maxage=300, stale-while-revalidate=600'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
): Promise<NextResponse> {
  try {
    const { slug } = await params

    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'products',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    })

    if (!result.docs.length) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }

    return NextResponse.json(result.docs[0], {
      headers: {
        'Cache-Control': CACHE_HEADER,
      },
    })
  } catch (error) {
    console.error(`[API] GET /api/products/[slug] error:`, error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
