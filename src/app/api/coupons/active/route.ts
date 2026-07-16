import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const settings = await payload.findGlobal({
      slug: 'site-settings',
    }) as any

    const activeCoupons = settings.activeCoupons || []
    if (!activeCoupons.length) {
      return NextResponse.json({ coupons: [] })
    }

    // Fetch full coupon data for the selected IDs
    const couponIds = activeCoupons.map((c: any) =>
      typeof c === 'object' ? c.id : c,
    )

    const coupons = await payload.find({
      collection: 'coupons',
      where: { id: { in: couponIds } },
      limit: 10,
    })

    const result = coupons.docs
      .filter((c: any) => c.isActive)
      .map((c: any) => ({
        id: c.id,
        code: c.code,
        description: c.description || '',
        type: c.type,
        value: c.value,
      }))

    return NextResponse.json({ coupons: result })
  } catch (error) {
    console.error('[API] GET /api/coupons/active error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
