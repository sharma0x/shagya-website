import { unstable_cache } from 'next/cache'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Cached `products` collection query shared by ISR pages (PDP, category,
 * collections). Tagged with `products` so that a stock change — which calls
 * `revalidateTag('products')` — purges every cached page that rendered these
 * docs, instead of serving stale stock for up to `revalidate` seconds.
 *
 * `revalidate: 300` is kept as a safety net in case a revalidation tag is
 * missed; the tag is the primary freshness mechanism.
 */
export interface CachedProductQuery {
  where: Record<string, any>
  sort?: string
  limit?: number
  page?: number
  depth?: number
  pagination?: boolean
}

export interface CachedFindResult {
  docs: any[]
  totalDocs: number
  totalPages: number
  page: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export const cachedFindProducts: (
  opts: CachedProductQuery,
) => Promise<CachedFindResult> = unstable_cache(
  async (opts: CachedProductQuery): Promise<CachedFindResult> => {
    const payload = await getPayload({ config })
    const res = await payload.find({
      collection: 'products',
      where: opts.where,
      sort: opts.sort,
      limit: opts.limit,
      page: opts.page,
      depth: opts.depth,
      pagination: opts.pagination,
    })
    return {
      docs: res.docs as any[],
      totalDocs: res.totalDocs ?? 0,
      totalPages: res.totalPages ?? 1,
      page: res.page ?? 1,
      hasNextPage: res.hasNextPage ?? false,
      hasPrevPage: res.hasPrevPage ?? false,
    }
  },
  ['product-queries'],
  { revalidate: 300, tags: ['products'] },
)
