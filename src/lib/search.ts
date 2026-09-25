import type { Payload } from 'payload'
import { getProductImageUrl } from '@/lib/product-utils'
import { weaveLabel } from '@/lib/weaves'

export interface SearchProductResult {
  id: number
  type: 'product'
  name: string
  slug: string
  basePrice: number | null
  compareAtPrice: number | null
  image: string | null
  fabric: string | null
  weave: string | null
  rank: number
}

export interface SearchPostResult {
  id: number
  type: 'post'
  title: string
  slug: string
  excerpt: string | null
  rank: number
}

export type SearchResult = SearchProductResult | SearchPostResult

type SearchDocument = Record<string, any>

type SearchResponse = {
  docs: SearchResult[]
  totalDocs: number
}

function toProductResult(
  value: SearchDocument,
  rank: number,
): SearchProductResult {
  return {
    id: value.id,
    type: 'product',
    name: value.name,
    slug: value.slug,
    basePrice: value.basePrice || null,
    compareAtPrice: value.compareAtPrice || null,
    image: getProductImageUrl(value),
    fabric: weaveLabel(value.fabric) || null,
    weave: weaveLabel(value.weave) || null,
    rank,
  }
}

function toPostResult(value: SearchDocument, rank: number): SearchPostResult {
  return {
    id: value.id,
    type: 'post',
    title: value.title,
    slug: value.slug,
    excerpt: value.excerpt || null,
    rank,
  }
}

async function populateSearchDocument(
  payload: Payload,
  document: SearchDocument,
): Promise<SearchResult | null> {
  if (
    !document.doc ||
    !['products', 'posts'].includes(document.doc.relationTo)
  ) {
    return null
  }

  let value = document.doc.value
  if (typeof value !== 'object' || value === null) {
    try {
      value = await payload.findByID({
        collection: document.doc.relationTo,
        id: value,
      })
    } catch {
      return null
    }
  }

  if (!value || typeof value !== 'object') return null

  return document.doc.relationTo === 'products'
    ? toProductResult(value, document.priority || 0)
    : toPostResult(value, document.priority || 0)
}

async function searchSourceCollections(
  payload: Payload,
  query: string,
  limit: number,
): Promise<SearchResponse> {
  const [products, posts] = await Promise.all([
    payload.find({
      collection: 'products',
      where: {
        and: [
          { _status: { equals: 'published' } },
          { status: { equals: 'published' } },
          {
            or: [
              { name: { like: query } },
              { tags: { like: query } },
              { cityOfOrigin: { like: query } },
              { weavePattern: { like: query } },
              { borderType: { like: query } },
              { palluDetails: { like: query } },
              { blouseType: { like: query } },
            ],
          },
        ],
      },
      sort: '-createdAt',
      limit,
      depth: 2,
    }),
    payload.find({
      collection: 'posts',
      where: {
        and: [
          { _status: { equals: 'published' } },
          {
            or: [{ title: { like: query } }, { excerpt: { like: query } }],
          },
        ],
      },
      sort: '-publishedAt',
      limit,
      depth: 2,
    }),
  ])

  const productResults = products.docs.map((value, index) =>
    toProductResult(value, limit - index),
  )
  const postResults = posts.docs.map((value, index) =>
    toPostResult(value, limit - index),
  )
  const docs = [...productResults, ...postResults].slice(0, limit)

  return {
    docs,
    totalDocs: products.totalDocs + posts.totalDocs,
  }
}

export async function searchContent(
  payload: Payload,
  rawQuery: string,
  limit: number,
): Promise<SearchResponse> {
  const query = rawQuery.trim()
  const indexed = await payload.find({
    collection: 'search',
    where: { title: { like: query } },
    limit,
    depth: 0,
  })
  const populated = await Promise.all(
    indexed.docs.map((document) => populateSearchDocument(payload, document)),
  )
  const docs = populated
    .filter((result): result is SearchResult => result !== null)
    .sort((a, b) => b.rank - a.rank)

  if (docs.length > 0) {
    return { docs, totalDocs: indexed.totalDocs }
  }

  return searchSourceCollections(payload, query, limit)
}
