/**
 * Store-level event subscription for cart mutations.
 *
 * Cart mutations flow through the Zustand cart store, so instead of
 * sprinkling `add_to_cart` calls across every button, we subscribe to the
 * store here and diff consecutive snapshots. This guarantees:
 *  - one consistent implementation for every add/remove surface,
 *  - no duplicate events from optimistic updates + API syncs,
 *  - zero coupling between UI components and analytics.
 *
 * Programmatic transitions (hydration merges, server loads, bulk clears)
 * are wrapped in `suppressCartAnalytics()` inside the store itself — the
 * diff therefore only ever sees real user actions. (See src/lib/store/cart.ts)
 *
 * Wishlist events deliberately do NOT use diffing: the wishlist store
 * applies optimistic updates with rollback, which a pure diff cannot
 * distinguish from a real toggle. Instead the store emits events after the
 * server confirms each toggle (see src/lib/store/wishlist.ts).
 */

import { useCart, type CartItem } from '@/lib/store/cart'
import { trackAddToCart, trackRemoveFromCart } from './events'
import { mapProductToGA4Item } from './mappers'
import { isCartAnalyticsSuppressed } from './flags'

export { suppressCartAnalytics, resumeCartAnalytics } from './flags'

const cartLineKey = (item: CartItem): string =>
  `${String(item.product.id)}:${item.variant?.color?.slug ?? ''}`

export function cartItemToGA4Item(item: CartItem) {
  return mapProductToGA4Item(item.product, {
    price: item.unitPrice,
    quantity: item.quantity,
    item_variant: item.variant?.color?.name,
  })
}

export interface CartLineDiff {
  added: CartItem[]
  removed: CartItem[]
  quantityIncreased: Array<{ item: CartItem; delta: number }>
  quantityDecreased: Array<{ item: CartItem; delta: number }>
}

type CartLineMap = Map<string, CartItem>

function toLineMap(items: CartItem[]): CartLineMap {
  return new Map(items.map((i) => [cartLineKey(i), i]))
}

/**
 * Pure diff between two cart snapshots, keyed by product + color line.
 * Extracted for unit testing — this is where add/remove events come from.
 */
export function computeCartLineDiff(
  prevItems: CartItem[],
  nextItems: CartItem[],
): CartLineDiff {
  const prev = toLineMap(prevItems)
  const next = toLineMap(nextItems)

  const diff: CartLineDiff = {
    added: [],
    removed: [],
    quantityIncreased: [],
    quantityDecreased: [],
  }

  for (const [key, item] of next) {
    const prevItem = prev.get(key)
    if (!prevItem) {
      diff.added.push(item)
    } else if (item.quantity > prevItem.quantity) {
      diff.quantityIncreased.push({
        item,
        delta: item.quantity - prevItem.quantity,
      })
    } else if (item.quantity < prevItem.quantity) {
      diff.quantityDecreased.push({
        item,
        delta: prevItem.quantity - item.quantity,
      })
    }
  }

  for (const [key, item] of prev) {
    if (!next.has(key)) diff.removed.push(item)
  }

  return diff
}

export function initCartAnalytics(): () => void {
  return useCart.subscribe((state, prevState) => {
    if (isCartAnalyticsSuppressed()) return

    const diff = computeCartLineDiff(prevState.items, state.items)

    for (const item of diff.added) {
      trackAddToCart({
        item: cartItemToGA4Item(item),
        quantity: item.quantity,
      })
    }

    for (const item of diff.removed) {
      trackRemoveFromCart({
        item: cartItemToGA4Item(item),
        quantity: item.quantity,
      })
    }

    for (const { item, delta } of diff.quantityIncreased) {
      trackAddToCart({
        item: cartItemToGA4Item(item),
        quantity: delta,
      })
    }

    for (const { item, delta } of diff.quantityDecreased) {
      trackRemoveFromCart({
        item: cartItemToGA4Item(item),
        quantity: delta,
      })
    }
  })
}
