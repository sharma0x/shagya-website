import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * GET /api/products
 *
 * Returns a paginated list of published products.
 * Supports filtering by fabric, weave, pattern, minPrice, maxPrice,
 * onSale, minDiscount, deliveryTime, city, color, size.
 * Multi-select values are comma-separated.
 * Supports pagination via page and limit query params.
 */

const CACHE_HEADER =
  'public, max-age=60, s-maxage=300, stale-while-revalidate=600'

function getCommaParam(
  searchParams: URLSearchParams,
  key: string,
): string[] {
  const val = searchParams.get(key)
  if (!val) return []
  return val.split(',').filter(Boolean)
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get('limit') || '20', 10)),
    )

    const where: Record<string, any> = {
      status: { equals: 'published' },
    }

    // Multi-select filters (comma-separated)
    const fabricFilter = getCommaParam(searchParams, 'fabric')
    if (fabricFilter.length > 0) {
      where.fabric = { in: fabricFilter }
    }

    const weaveFilter = getCommaParam(searchParams, 'weave')
    if (weaveFilter.length > 0) {
      where.weave = { in: weaveFilter }
    }

    const patternFilter = getCommaParam(searchParams, 'pattern')
    if (patternFilter.length > 0) {
      where.pattern = { in: patternFilter }
    }

    // Price range
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    if (minPrice || maxPrice) {
      const basePrice: Record<string, number> = {}
      if (minPrice) basePrice.greater_than_equal = parseInt(minPrice, 10)
      if (maxPrice) basePrice.less_than_equal = parseInt(maxPrice, 10)
      where.basePrice = basePrice
    }

    const onSale = searchParams.get('onSale')
    if (onSale === 'true') {
      where.compareAtPrice = { greater_than: 0 }
    }

    const minDiscount = searchParams.get('minDiscount')
    if (minDiscount) {
      where.discountPercentage = {
        greater_than_equal: parseInt(minDiscount, 10),
      }
    }

    const deliveryTime = searchParams.get('deliveryTime')
    if (deliveryTime) {
      where.deliveryTime = { equals: deliveryTime }
    }

    const city = searchParams.get('city')
    if (city) {
      where.cityOfOrigin = { contains: city }
    }

    const color = getCommaParam(searchParams, 'color')
    const size = searchParams.get('size')

    const payload = await getPayload({ config })

    // Color/Size filters require variant sub-query
    if (color.length > 0 || size) {
      const variantWhere: Record<string, any> = {}
      if (color.length > 0) variantWhere.color = { in: color }
      if (size) variantWhere.size = { equals: size }

      const variants = await payload.find({
        collection: 'variants',
        where: variantWhere,
        limit: 500,
        pagination: false,
      })

      const productIds = [
        ...new Set(variants.docs.map((v: any) => v.product)),
      ]
      if (productIds.length > 0) {
        where.id = { in: productIds }
      } else {
        // No matching variants — return empty
        return NextResponse.json(
          {
            docs: [],
            totalDocs: 0,
            page: 1,
            totalPages: 0,
            limit,
          },
          { headers: { 'Cache-Control': CACHE_HEADER } },
        )
      }
    }

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
      { headers: { 'Cache-Control': CACHE_HEADER } },
    )
  } catch (error) {
    console.error('[API] GET /api/products error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
