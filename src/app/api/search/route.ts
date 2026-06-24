import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * GET /api/search
 *
 * Full-text-ish search across product name and description.
 * Only returns published products.
 * Supports pagination via page and limit query params.
 */

const CACHE_HEADER =
  'public, max-age=60, s-maxage=300, stale-while-revalidate=600'

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q) {
      return NextResponse.json(
        { error: 'Missing search query parameter "q"' },
        { status: 400 },
      )
    }

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get('limit') || '20', 10)),
    )

    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'products',
      where: {
        status: { equals: 'published' },
        or: [{ name: { like: q } }, { description: { like: q } }],
      },
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
        query: q,
      },
      {
        headers: {
          'Cache-Control': CACHE_HEADER,
        },
      },
    )
  } catch (error) {
    console.error('[API] GET /api/search error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}
