import type { Payload } from 'payload'

export interface PriceResolvableItem {
  product: number | string | { id?: number | string } | null | undefined
  quantity?: number | null
}

/** Extracts the product reference from a cart item. */
export function itemProductId(
  item: PriceResolvableItem,
): number | string | null {
  if (typeof item.product === 'object' && item.product !== null) {
    return item.product.id ?? null
  }
  return item.product ?? null
}

/**
 * Resolves the CURRENT selling price (basePrice) for each product in a set
 * of cart items, so carts, checkout summaries and orders never use a stale
 * add-time price snapshot.
 *
 * Returns a Map keyed by String(productId) -> current basePrice. Products
 * that no longer exist or have no valid price are omitted.
 */
export async function resolveCurrentPrices(
  payload: Payload,
  items: PriceResolvableItem[],
): Promise<Map<string, number>> {
  const ids = [
    ...new Set(
      items
        .map((item) => itemProductId(item))
        .filter((id): id is number | string => id != null),
    ),
  ]
  if (ids.length === 0) return new Map()

  const products = await payload.find({
    collection: 'products',
    where: { id: { in: ids } },
    limit: ids.length,
    overrideAccess: true,
    depth: 0,
  })

  const priceMap = new Map<string, number>()
  for (const doc of products.docs) {
    const price = Number((doc as any).basePrice)
    if (Number.isFinite(price) && price > 0) {
      priceMap.set(String((doc as any).id), price)
    }
  }
  return priceMap
}

/** Overrides an item's unitPrice when a current price is known. */
export function applyCurrentPrice(
  item: PriceResolvableItem & { unitPrice?: number },
  priceMap: Map<string, number>,
): { unitPrice: number; productId: string | null } {
  const pid = itemProductId(item)
  const current = pid != null ? priceMap.get(String(pid)) : undefined
  return {
    productId: pid != null ? String(pid) : null,
    unitPrice: current ?? item.unitPrice ?? 0,
  }
}
