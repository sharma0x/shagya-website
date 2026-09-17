import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { resolveWeaveIds, resolveFabricIds } from '@/lib/weaves'

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
  cities: FacetCount[]
}

const PATTERN_LABELS: Record<string, string> = {
  solid: 'Solid',
  printed: 'Printed',
  embroidered: 'Embroidered',
  embellished: 'Embellished',
  painted: 'Painted',
}

function getCommaParam(searchParams: URLSearchParams, key: string): string[] {
  const val = searchParams.get(key)
  if (!val) return []
  return val.split(',').filter(Boolean)
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)

    // Build base where matching the current product filters
    const baseWhere: Record<string, any> = {
      _status: { equals: 'published' },
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
    if (city === '__unknown__') {
      baseWhere.or = [
        { cityOfOrigin: { exists: false } },
        { cityOfOrigin: { equals: '' } },
      ]
    } else if (city) {
      baseWhere.cityOfOrigin = { equals: city }
    }

    const payload = await getPayload({ config })

    // Resolve filter slugs to relationship IDs
    if (fabricFilter.length > 0) {
      const fabricIds = await resolveFabricIds(payload, fabricFilter)
      if (fabricIds.length > 0) baseWhere.fabric = { in: fabricIds }
    }
    if (weaveFilter.length > 0) {
      const weaveIds = await resolveWeaveIds(payload, weaveFilter)
      if (weaveIds.length > 0) baseWhere.weave = { in: weaveIds }
    }

    // Fetch all matching products (need their IDs for variant lookup)
    const productsRes = await payload.find({
      collection: 'products',
      where: baseWhere,
      depth: 0,
      limit: 0,
      pagination: false,
    })

    const productIds = productsRes.docs.map((p: any) => p.id)

    // Count fabric, weave, pattern from the same result
    const fabricCounts: Record<string, number> = {}
    const weaveCounts: Record<string, number> = {}
    const patternCounts: Record<string, number> = {}

    for (const key of Object.keys(PATTERN_LABELS)) patternCounts[key] = 0

    // Helper: clone baseWhere, remove specified keys for self-filter-free counting
    function excludeKeys(
      where: Record<string, any>,
      ...keys: string[]
    ): Record<string, any> {
      const clone = { ...where }
      for (const k of keys) delete clone[k]
      return clone
    }

    // Query each facet type without its own filter in parallel
    const fabricWhere = excludeKeys(baseWhere, 'fabric')
    const weaveWhere = excludeKeys(baseWhere, 'weave')
    const patternWhere = excludeKeys(baseWhere, 'pattern')
    const cityBaseWhere = excludeKeys(baseWhere, 'cityOfOrigin', 'or')

    const [fabricProducts, weaveProducts, patternProducts, cityProducts] =
      await Promise.all([
        payload.find({
          collection: 'products',
          where: fabricWhere,
          depth: 0,
          limit: 500,
          pagination: false,
        }),
        payload.find({
          collection: 'products',
          where: weaveWhere,
          depth: 0,
          limit: 500,
          pagination: false,
        }),
        payload.find({
          collection: 'products',
          where: patternWhere,
          depth: 0,
          limit: 500,
          pagination: false,
        }),
        payload.find({
          collection: 'products',
          where: cityBaseWhere,
          depth: 0,
          limit: 500,
          pagination: false,
        }),
      ])

    for (const p of fabricProducts.docs as any[]) {
      if (p.fabric != null) {
        const key = String(
          typeof p.fabric === 'object' ? p.fabric.id : p.fabric,
        )
        fabricCounts[key] = (fabricCounts[key] || 0) + 1
      }
    }
    for (const p of weaveProducts.docs as any[]) {
      if (p.weave != null) {
        const key = String(typeof p.weave === 'object' ? p.weave.id : p.weave)
        weaveCounts[key] = (weaveCounts[key] || 0) + 1
      }
    }
    for (const p of patternProducts.docs as any[]) {
      if (p.pattern && patternCounts[p.pattern] !== undefined)
        patternCounts[p.pattern]++
    }

    const cityCounts: Record<string, number> = {}
    let unknownCount = 0
    for (const p of cityProducts.docs as any[]) {
      if (p.cityOfOrigin && p.cityOfOrigin.trim() !== '') {
        const val = p.cityOfOrigin.trim()
        cityCounts[val] = (cityCounts[val] || 0) + 1
      } else {
        unknownCount++
      }
    }

    const cityFacets: FacetCount[] = Object.entries(cityCounts)
      .filter(([, count]) => count > 0)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, count]) => ({ value, label: value, count }))

    if (unknownCount > 0) {
      cityFacets.push({
        value: '__unknown__',
        label: 'Unknown',
        count: unknownCount,
      })
    }

    // Count distinct colors from variants of matching products
    const colorCounts: Record<string, number> = {}
    if (productIds.length > 0) {
      // We need to query variants in batches since product IDs could be many
      const variantsRes = await payload.find({
        collection: 'variants',
        where: { product: { in: productIds.slice(0, 500) } },
        depth: 0,
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
        .filter(([key]) => (counts[key] || 0) > 0)
        .map(([key, label]) => ({
          value: key,
          label,
          count: counts[key] || 0,
        }))

    // Fabric facets are dynamic from fabric-types collection
    const fabricsRes = await payload.find({
      collection: 'fabric-types',
      limit: 500,
      pagination: false,
      depth: 0,
    })
    const fabricFacets: FacetCount[] = (fabricsRes.docs as any[])
      .map((f) => ({
        value: f.slug,
        label: f.name,
        count: fabricCounts[String(f.id)] || 0,
      }))
      .filter((f) => f.count > 0 || fabricFilter.includes(f.value))

    // Weave facets are dynamic — value is the weave slug (used in URL
    // filter params) and label is the admin-managed weave name.
    const weavesRes = await payload.find({
      collection: 'weaves',
      limit: 500,
      pagination: false,
      depth: 0,
    })
    const weaveFacets: FacetCount[] = (weavesRes.docs as any[])
      .map((w) => ({
        value: w.slug,
        label: w.name,
        count: weaveCounts[String(w.id)] || 0,
      }))
      .filter((f) => f.count > 0 || weaveFilter.includes(f.value))

    const colorFacets: FacetCount[] = Object.entries(colorCounts)
      .filter(([, count]) => count > 0)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 30)
      .map(([value, count]) => ({ value, label: value, count }))

    return NextResponse.json(
      {
        fabric: fabricFacets,
        weave: weaveFacets,
        pattern: buildFacets(PATTERN_LABELS, patternCounts, patternFilter),
        colors: colorFacets,
        cities: cityFacets,
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
