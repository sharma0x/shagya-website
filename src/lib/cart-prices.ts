import type { Payload } from 'payload'

export interface PriceResolvableItem {
  product: number | string | { id?: number | string } | null | undefined
  quantity?: number | null
}

export interface ResolvedProductInfo {
  price: number
  productCode: string | null
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
 * Resolves the CURRENT selling price (basePrice) and productCode for each
 * product in a set of cart items, so carts, checkout summaries and orders
 * never use a stale add-time price snapshot.
 *
 * Returns a Map keyed by String(productId) -> { price, productCode }. Products
 * that no longer exist or have no valid price are omitted.
 */
export async function resolveCurrentPrices(
  payload: Payload,
  items: PriceResolvableItem[],
): Promise<Map<string, ResolvedProductInfo>> {
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

  const priceMap = new Map<string, ResolvedProductInfo>()
  for (const doc of products.docs) {
    const price = Number((doc as any).basePrice)
    if (Number.isFinite(price) && price > 0) {
      priceMap.set(String((doc as any).id), {
        price,
        productCode: (doc as any).productCode ?? null,
      })
    }
  }
  return priceMap
}

/** Overrides an item's unitPrice when a current price is known. */
export function applyCurrentPrice(
  item: PriceResolvableItem & { unitPrice?: number },
  priceMap: Map<string, ResolvedProductInfo>,
): { unitPrice: number; productId: string | null } {
  const pid = itemProductId(item)
  const info = pid != null ? priceMap.get(String(pid)) : undefined
  return {
    productId: pid != null ? String(pid) : null,
    unitPrice: info?.price ?? item.unitPrice ?? 0,
  }
}
