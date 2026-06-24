import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * GET /api/categories
 *
 * Returns the full list of categories, sorted alphabetically by name.
 */

const CACHE_HEADER =
  'public, max-age=60, s-maxage=300, stale-while-revalidate=600'

export async function GET(): Promise<NextResponse> {
  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'categories',
      sort: 'name',
      limit: 500,
    })

    return NextResponse.json(
      { docs: result.docs },
      {
        headers: {
          'Cache-Control': CACHE_HEADER,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
        },
      },
    )
  } catch (error) {
    console.error('[API] GET /api/categories error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
