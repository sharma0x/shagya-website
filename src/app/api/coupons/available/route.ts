import { NextResponse } from 'next/server'
import { getApplicableCoupons } from '@/lib/coupons'

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId') ?? undefined

    const coupons = await getApplicableCoupons(productId, request.headers)

    return NextResponse.json({ coupons })
  } catch (error) {
    console.error('[API] GET /api/coupons/available error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
