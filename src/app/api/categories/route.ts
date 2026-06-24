import { NextResponse } from 'next/server'

/**
 * GET /api/categories
 *
 * Returns the category tree for product navigation.
 * Currently a stub — returns empty array. Full implementation comes with CLO-12.
 */

const CACHE_HEADER =
  'public, max-age=60, s-maxage=300, stale-while-revalidate=600'

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      categories: [],
      message:
        'Categories endpoint stub — full implementation coming in CLO-12.',
    },
    {
      headers: {
        'Cache-Control': CACHE_HEADER,
      },
    },
  )
}
