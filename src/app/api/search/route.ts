import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import type { Payload } from 'payload'
import config from '@payload-config'

/**
 * GET /api/search
 *
 * Searches across products, pages, and posts using the Payload search plugin.
 * The search plugin maintains a `search` collection that indexes document titles
 * and description/content text for fast full-text-ish search.
 *
 * Falls back to direct collection queries if the search collection is unavailable.
 *
 * Query params:
 *   q     - search query string (required)
 *   page  - page number (default 1)
 *   limit - results per page (default 20, max 100)
 */

const CACHE_HEADER =
  'public, max-age=60, s-maxage=300, stale-while-revalidate=600'

const SEARCHABLE_COLLECTIONS = ['products', 'pages', 'posts'] as const

/**
 * Search document from the plugin's search collection.
 */
interface SearchDoc {
  id: string
  title: string
  priority?: number
  doc?: {
    relationTo: string
    value: Record<string, unknown> | string
  }
  [key: string]: unknown
}

/**
 * Queries the search collection (created by @payloadcms/plugin-search).
 * Uses a cast because the search slug is dynamically registered by the plugin
 * and may not exist in generated payload-types.ts until after db-generate-types.
 */
async function searchViaPlugin(
  payload: Payload,
  q: string,
  page: number,
  limit: number,
) {
  // Cast through unknown: the 'search' collection is dynamically registered
  // by @payloadcms/plugin-search and may not be in generated payload-types.ts.
  const find = payload.find as unknown as (
    args: Record<string, unknown>,
  ) => Promise<{
    docs: SearchDoc[]
    totalDocs: number
    page: number
    totalPages: number
    limit: number
  }>

  return find({
    collection: 'search',
    where: { title: { like: q } },
    page,
    limit,
    sort: '-priority',
    depth: 1,
  })
}

/**
 * Extracts actual documents from search plugin results.
 */
function extractDocs(searchDocs: SearchDoc[]): Record<string, unknown>[] {
  return searchDocs
    .map((sd) => {
      const docRef = sd.doc
      if (docRef && typeof docRef.value === 'object' && docRef.value !== null) {
        return docRef.value as Record<string, unknown>
      }
      return null
    })
    .filter((doc): doc is Record<string, unknown> => doc !== null)
}

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

    // Try the search plugin's search collection first
    try {
      const searchResult = await searchViaPlugin(payload, q, page, limit)

      if (searchResult.docs.length > 0) {
        const docs = extractDocs(searchResult.docs)

        return NextResponse.json(
          {
            docs,
            totalDocs: searchResult.totalDocs,
            page: searchResult.page,
            totalPages: searchResult.totalPages,
            limit: searchResult.limit,
            query: q,
          },
          {
            headers: { 'Cache-Control': CACHE_HEADER },
          },
        )
      }
    } catch {
      // Search collection not available — fall through to direct queries
      console.warn(
        '[API] GET /api/search: search collection unavailable, falling back to direct queries',
      )
    }

    // Fallback: direct collection queries (legacy behavior)
    const allDocs: Record<string, unknown>[] = []
    let totalDocs = 0

    for (const collectionSlug of SEARCHABLE_COLLECTIONS) {
      try {
        const find = payload.find as unknown as (
          args: Record<string, unknown>,
        ) => Promise<{
          docs: Record<string, unknown>[]
          totalDocs: number
        }>

        const result = await find({
          collection: collectionSlug,
          where: {
            status: { equals: 'published' },
            or: [
              { title: { like: q } },
              { name: { like: q } },
              { description: { like: q } },
              { excerpt: { like: q } },
            ],
          },
          page: 1,
          limit: 100,
          sort: '-createdAt',
        })
        allDocs.push(...result.docs)
        totalDocs += result.totalDocs
      } catch {
        // Collection might not exist or be configured yet
        continue
      }
    }

    // Paginate the combined results
    const start = (page - 1) * limit
    const paginatedDocs = allDocs.slice(start, start + limit)

    return NextResponse.json(
      {
        docs: paginatedDocs,
        totalDocs,
        page,
        totalPages: Math.ceil(totalDocs / limit),
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
