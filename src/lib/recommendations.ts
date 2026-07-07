import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Get products related to the current product by matching
 * fabric, weave, or collections. Deduplicated and prioritized.
 */
export async function getRelatedProducts(
  productId: string | number,
  fabric: string,
  weave: string,
  collectionIds: (string | number)[],
  limit = 6,
) {
  const payload = await getPayload({ config })

  const results: any[] = []

  // Query 1: Same fabric
  if (fabric) {
    const fabricRes = await payload.find({
      collection: 'products',
      where: {
        id: { not_equals: productId },
        fabric: { equals: fabric },
        status: { equals: 'published' },
      },
      limit: 8,
      sort: '-createdAt',
    })
    results.push(
      ...fabricRes.docs.map((d) => ({ product: d, score: 3 })),
    )
  }

  // Query 2: Same weave
  if (weave) {
    const weaveRes = await payload.find({
      collection: 'products',
      where: {
        id: { not_equals: productId },
        weave: { equals: weave },
        status: { equals: 'published' },
      },
      limit: 8,
      sort: '-createdAt',
    })
    results.push(
      ...weaveRes.docs.map((d) => ({ product: d, score: 2 })),
    )
  }

  // Query 3: Same collection
  if (collectionIds.length > 0) {
    const colRes = await payload.find({
      collection: 'products',
      where: {
        id: { not_equals: productId },
        collections: { in: collectionIds },
        status: { equals: 'published' },
      },
      limit: 6,
      sort: '-createdAt',
    })
    results.push(
      ...colRes.docs.map((d) => ({ product: d, score: 1 })),
    )
  }

  // Deduplicate and sort by score desc
  const seen = new Set<string | number>()
  const merged: any[] = []
  for (const entry of results.sort((a, b) => b.score - a.score)) {
    if (seen.has(entry.product.id)) continue
    seen.add(entry.product.id)
    merged.push(entry.product)
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
      status: { equals: 'published' },
      purchaseCount: { greater_than: 0 },
    },
    sort: '-purchaseCount',
    limit,
  })
  return res.docs
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
      status: { equals: 'published' },
    },
    limit: ids.length,
    sort: '-createdAt',
  })
  // Preserve cookie order
  const productMap = new Map(res.docs.map((d: any) => [String(d.id), d]))
  return ids
    .map((id) => productMap.get(String(id)))
    .filter(Boolean) as any[]
}
