import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * GET /api/products
 *
 * Returns a paginated list of published products.
 * Supports filtering by fabric, weave, pattern, minPrice, maxPrice.
 * Supports pagination via page and limit query params.
 */

const CACHE_HEADER =
  'public, max-age=60, s-maxage=300, stale-while-revalidate=600'

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)

    // Parse pagination
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get('limit') || '20', 10)),
    )

    // Build where clause dynamically
    const where: Record<string, any> = {
      status: { equals: 'published' },
    }

    // Optional filters
    const fabric = searchParams.get('fabric')
    if (fabric) {
      where.fabric = { equals: fabric }
    }

    const weave = searchParams.get('weave')
    if (weave) {
      where.weave = { equals: weave }
    }

    const pattern = searchParams.get('pattern')
    if (pattern) {
      where.pattern = { equals: pattern }
    }

    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice || maxPrice) {
      const basePrice: Record<string, number> = {}
      if (minPrice) {
        basePrice.greater_than_equal = parseInt(minPrice, 10)
      }
      if (maxPrice) {
        basePrice.less_than_equal = parseInt(maxPrice, 10)
      }
      where.basePrice = basePrice
    }

    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'products',
      where,
      page,
      limit,
      sort: '-createdAt',
    })

    return NextResponse.json(
      {
        docs: result.docs,
        totalDocs: result.totalDocs,
        page: result.page,
        totalPages: result.totalPages,
        limit: result.limit,
      },
      {
        headers: {
          'Cache-Control': CACHE_HEADER,
        },
      },
    )
  } catch (error) {
    console.error('[API] GET /api/products error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
