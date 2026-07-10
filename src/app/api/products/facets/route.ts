import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

interface FacetCount {
  value: string
  label: string
  count: number
}

interface FacetsResponse {
  fabric: FacetCount[]
  weave: FacetCount[]
  pattern: FacetCount[]
  colors: FacetCount[]
}

const FABRIC_LABELS: Record<string, string> = {
  silk: 'Silk',
  cotton: 'Cotton',
  linen: 'Linen',
  georgette: 'Georgette',
  chiffon: 'Chiffon',
  crepe: 'Crepe',
  velvet: 'Velvet',
  net: 'Net',
  blend: 'Blend',
}

const WEAVE_LABELS: Record<string, string> = {
  banarasi: 'Banarasi',
  kanchipuram: 'Kanchipuram',
  bandhani: 'Bandhani',
  patola: 'Patola',
  kalamkari: 'Kalamkari',
  ikkat: 'Ikat',
  paithani: 'Paithani',
  maheshwari: 'Maheshwari',
  chanderi: 'Chanderi',
  tant: 'Tant',
  baluchari: 'Baluchari',
}

const PATTERN_LABELS: Record<string, string> = {
  solid: 'Solid',
  printed: 'Printed',
  embroidered: 'Embroidered',
  embellished: 'Embellished',
  painted: 'Painted',
}

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

    // Build base where matching the current product filters
    const baseWhere: Record<string, any> = {
      status: { equals: 'published' },
    }

    const fabricFilter = getCommaParam(searchParams, 'fabric')
    const weaveFilter = getCommaParam(searchParams, 'weave')
    const patternFilter = getCommaParam(searchParams, 'pattern')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const onSale = searchParams.get('onSale')
    const minDiscount = searchParams.get('minDiscount')
    const deliveryTime = searchParams.get('deliveryTime')
    const city = searchParams.get('city')

    if (fabricFilter.length > 0) baseWhere.fabric = { in: fabricFilter }
    if (weaveFilter.length > 0) baseWhere.weave = { in: weaveFilter }
    if (patternFilter.length > 0) baseWhere.pattern = { in: patternFilter }
    if (minPrice || maxPrice) {
      const basePrice: Record<string, number> = {}
      if (minPrice) basePrice.greater_than_equal = parseInt(minPrice, 10)
      if (maxPrice) basePrice.less_than_equal = parseInt(maxPrice, 10)
      baseWhere.basePrice = basePrice
    }
    if (onSale === 'true') baseWhere.compareAtPrice = { greater_than: 0 }
    if (minDiscount) {
      baseWhere.discountPercentage = {
        greater_than_equal: parseInt(minDiscount, 10),
      }
    }
    if (deliveryTime) baseWhere.deliveryTime = { equals: deliveryTime }
    if (city) baseWhere.cityOfOrigin = { contains: city }

    const payload = await getPayload({ config })

    // Fetch all matching products (need their IDs for variant lookup)
    const productsRes = await payload.find({
      collection: 'products',
      where: baseWhere,
      limit: 0, // just need IDs for variant lookup
      pagination: false,
    })

    const productIds = productsRes.docs.map((p: any) => p.id)

    // Count fabric, weave, pattern from the same result
    const fabricCounts: Record<string, number> = {}
    const weaveCounts: Record<string, number> = {}
    const patternCounts: Record<string, number> = {}

    for (const key of Object.keys(FABRIC_LABELS)) fabricCounts[key] = 0
    for (const key of Object.keys(WEAVE_LABELS)) weaveCounts[key] = 0
    for (const key of Object.keys(PATTERN_LABELS)) patternCounts[key] = 0

    // Fetch all matching products with their field data
    const allProducts = await payload.find({
      collection: 'products',
      where: baseWhere,
      limit: 500,
      pagination: false,
    })

    for (const p of allProducts.docs as any[]) {
      if (p.fabric && fabricCounts[p.fabric] !== undefined) {
        fabricCounts[p.fabric]++
      }
      if (p.weave && weaveCounts[p.weave] !== undefined) {
        weaveCounts[p.weave]++
      }
      if (p.pattern && patternCounts[p.pattern] !== undefined) {
        patternCounts[p.pattern]++
      }
    }

    // Count distinct colors from variants of matching products
    const colorCounts: Record<string, number> = {}
    if (productIds.length > 0) {
      // We need to query variants in batches since product IDs could be many
      const variantsRes = await payload.find({
        collection: 'variants',
        where: { product: { in: productIds.slice(0, 500) } },
        limit: 1000,
        pagination: false,
      })

      for (const v of variantsRes.docs as any[]) {
        if (v.color) {
          const c = v.color.trim()
          colorCounts[c] = (colorCounts[c] || 0) + 1
        }
      }
    }

    const buildFacets = (
      labels: Record<string, string>,
      counts: Record<string, number>,
      excludeKeys?: string[],
    ): FacetCount[] =>
      Object.entries(labels)
        .filter(([key]) => !excludeKeys || !excludeKeys.includes(key))
        .map(([key, label]) => ({
          value: key,
          label,
          count: counts[key] || 0,
        }))

    const colorFacets: FacetCount[] = Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 30)
      .map(([value, count]) => ({ value, label: value, count }))

    return NextResponse.json(
      {
        fabric: buildFacets(FABRIC_LABELS, fabricCounts, fabricFilter),
        weave: buildFacets(WEAVE_LABELS, weaveCounts, weaveFilter),
        pattern: buildFacets(PATTERN_LABELS, patternCounts, patternFilter),
        colors: colorFacets,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=30, s-maxage=60',
        },
      },
    )
  } catch (error) {
    console.error('[API] GET /api/products/facets error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
