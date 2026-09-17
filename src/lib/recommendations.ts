import { getPayload } from 'payload'
import config from '@payload-config'
import { liftVariantGallery } from '@/lib/product-utils'

/**
 * Get products related to the current product by matching
 * fabric, weave, or collections. Deduplicated and prioritized.
 */
export async function getRelatedProducts(
  productId: string | number,
  fabricId: string | number | null,
  weaveId: string | number | null,
  collectionIds: (string | number)[],
  limit = 6,
) {
  const payload = await getPayload({ config })

  const results: any[] = []

  // Query 1: Same fabric
  if (fabricId) {
    const fabricRes = await payload.find({
      collection: 'products',
      where: {
        id: { not_equals: productId },
        fabric: { equals: fabricId },
        _status: { equals: 'published' },
        status: { equals: 'published' },
      },
      limit: 8,
      sort: '-createdAt',
      depth: 2,
    })
    results.push(...fabricRes.docs.map((d) => ({ product: d, score: 3 })))
  }

  // Query 2: Same weave (relationship ID)
  if (weaveId) {
    const weaveRes = await payload.find({
      collection: 'products',
      where: {
        id: { not_equals: productId },
        weave: { equals: weaveId },
        _status: { equals: 'published' },
        status: { equals: 'published' },
      },
      limit: 8,
      sort: '-createdAt',
      depth: 2,
    })
    results.push(...weaveRes.docs.map((d) => ({ product: d, score: 2 })))
  }

  // Query 3: Same collection
  if (collectionIds.length > 0) {
    const colRes = await payload.find({
      collection: 'products',
      where: {
        id: { not_equals: productId },
        collections: { in: collectionIds },
        _status: { equals: 'published' },
        status: { equals: 'published' },
      },
      limit: 6,
      sort: '-createdAt',
      depth: 2,
    })
    results.push(...colRes.docs.map((d) => ({ product: d, score: 1 })))
  }

  // Deduplicate and sort by score desc
  const seen = new Set<string | number>()
  const merged: any[] = []
  for (const entry of results.sort((a, b) => b.score - a.score)) {
    if (seen.has(entry.product.id)) continue
    seen.add(entry.product.id)
    merged.push(liftVariantGallery(entry.product))
    if (merged.length >= limit) break
  }

  return merged
}

/**
 * Get trending products sorted by purchaseCount.
 */
export async function getTrendingProducts(limit = 6) {
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'products',
    where: {
      _status: { equals: 'published' },
      status: { equals: 'published' },
      purchaseCount: { greater_than: 0 },
    },
    sort: '-purchaseCount',
    limit,
    depth: 2,
  })
  return res.docs.map(liftVariantGallery)
}

/**
 * Get products by ID (for recently viewed from cookie).
 */
export async function getProductsByIds(ids: (string | number)[]) {
  if (ids.length === 0) return []
  const payload = await getPayload({ config })
  const res = await payload.find({
    collection: 'products',
    where: {
      id: { in: ids },
      _status: { equals: 'published' },
      status: { equals: 'published' },
    },
    limit: ids.length,
    sort: '-createdAt',
    depth: 2,
  })
  // Preserve cookie order
  const productMap = new Map(res.docs.map((d: any) => [String(d.id), d]))
  return ids
    .map((id) => {
      const p = productMap.get(String(id))
      return p ? liftVariantGallery(p) : null
    })
    .filter(Boolean) as any[]
}
