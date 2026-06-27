import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * GET /api/search
 *
 * Search across products and posts using the Payload search collection.
 *
 * Query params:
 *   q     - search query string (required)
 *   limit - results per page (default 20, max 100)
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

    const limit = Math.max(
      1,
      Math.min(100, parseInt(searchParams.get('limit') || '20', 10)),
    )

    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'search',
      where: {
        title: {
          like: q,
        },
      },
      limit,
      depth: 1, // Populate the actual doc
    })

    const docs = result.docs
      .filter(
        (d: any) =>
          d.doc &&
          typeof d.doc.value === 'object' &&
          ['products', 'posts'].includes(d.doc.relationTo),
      )
      .map((d: any, index: number) => {
        const type = d.doc.relationTo === 'products' ? 'product' : 'post'
        const docValue = d.doc.value

        if (type === 'product') {
          return {
            id: docValue.id,
            type: 'product',
            name: docValue.name,
            slug: docValue.slug,
            basePrice: docValue.basePrice || null,
            compareAtPrice: docValue.compareAtPrice || null,
            fabric:
              typeof docValue.fabric === 'object'
                ? docValue.fabric?.title
                : docValue.fabric,
            weave: docValue.weave,
            rank: d.priority || limit - index,
          }
        }

        return {
          id: docValue.id,
          type: 'post',
          title: docValue.title,
          slug: docValue.slug,
          excerpt: docValue.excerpt,
          rank: d.priority || limit - index,
        }
      })
      .sort((a, b) => b.rank - a.rank)

    return NextResponse.json(
      {
        docs,
        totalDocs: result.totalDocs,
        limit,
        query: q,
      },
      {
        headers: { 'Cache-Control': CACHE_HEADER },
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
