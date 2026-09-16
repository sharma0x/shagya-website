/**
 * Product-data registry for wishlist analytics.
 *
 * The wishlist store only tracks product IDs, but GA4 wishlist events need
 * rich item payloads (name, price, categories). Components that render full
 * product data (ProductCard, PDP actions, wishlist page) register the
 * product here; the store looks it up when a toggle is confirmed by the
 * server. IDs-only fallback: the event still fires with `item_id` alone.
 */

import type { AnalyticsProduct } from './mappers'

const CACHE_LIMIT = 200
const cache = new Map<string, AnalyticsProduct>()

export function registerWishlistProduct(product: AnalyticsProduct): void {
  if (!product.id) return
  if (cache.size >= CACHE_LIMIT) {
    const oldestKey = cache.keys().next().value
    if (oldestKey !== undefined) cache.delete(oldestKey)
  }
  cache.set(String(product.id), product)
}

export function getWishlistProduct(
  id: string | number,
): AnalyticsProduct | undefined {
  return cache.get(String(id))
}
