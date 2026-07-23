import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    const payload = await getPayload({ config })

    const now = new Date().toISOString()

    const { docs: coupons } = await payload.find({
      collection: 'coupons',
      where: {
        and: [
          { isActive: { equals: true } },
          {
            or: [
              { startDate: { less_than: now } },
              { startDate: { exists: false } },
            ],
          },
          {
            or: [
              { endDate: { greater_than: now } },
              { endDate: { exists: false } },
            ],
          },
        ],
      },
      depth: 1,
      limit: 50,
      pagination: false,
    })

    let filtered = coupons

    if (productId) {
      const product = await payload.findByID({
        collection: 'products',
        id: productId,
        depth: 1,
      })

      const productCategories =
        (product as any).categories?.map(
          (c: any) => (typeof c === 'object' ? c.id : c),
        ) || []

      filtered = coupons.filter((c: any) => {
        const productConditions = c.productsConditions || []
        const categoryConditions = c.categoriesConditions || []

        if (productConditions.length === 0 && categoryConditions.length === 0) {
          return true
        }

        const productMatch = productConditions.some(
          (p: any) => String(typeof p === 'object' ? p.id : p) === String(productId),
        )

        const categoryMatch = categoryConditions.some((cat: any) =>
          productCategories.includes(
            typeof cat === 'object' ? cat.id : cat,
          ),
        )

        return productMatch || categoryMatch
      })
    }

    const result = filtered.map((c: any) => ({
      id: c.id,
      code: c.code,
      description: c.description || '',
      type: c.type,
      value: c.value,
      minCartValue: c.minCartValue || 0,
      maxDiscount: c.maxDiscount || null,
      endDate: c.endDate || null,
    }))

    return NextResponse.json({ coupons: result })
  } catch (error) {
    console.error('[API] GET /api/coupons/available error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
