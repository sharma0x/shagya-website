import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1', 10)
  const limit = parseInt(searchParams.get('limit') || '8', 10)

  if (page < 1 || limit < 1 || limit > 50) {
    return NextResponse.json(
      { error: 'Invalid page or limit' },
      { status: 400 },
    )
  }

  try {
    const payload = await getPayload({ config })

    const result = await payload.find({
      collection: 'products',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { status: { equals: 'published' } },
        ],
      },
      page,
      limit,
      sort: '-createdAt',
      depth: 2,
    })

    const { docs, totalPages, hasNextPage } = result

    return NextResponse.json({
      products: docs,
      hasMore: hasNextPage,
      totalDocs: result.totalDocs,
      page,
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 },
    )
  }
}
