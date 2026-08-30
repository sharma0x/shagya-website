/**
 * Variant-aware stock decrement (pure, testable).
 *
 * Stock model: when a product has color variants, `colorVariants[].stock`
 * is the single source of truth and the top-level `quantity` is derived
 * (sum of enabled variants). Products without variants keep using the
 * top-level `quantity`.
 */

export interface StockOrderItem {
  /** Colors collection doc ID (order items' `color` relationship value) */
  color?: number | string | { id?: number | string } | null
  quantity?: number | null
}

export interface StockUpdate {
  colorVariants?: Array<Record<string, unknown>>
  quantity?: number
  purchaseCount: number
}

/** Normalize a color reference (ID, numeric string, or populated doc) to a comparable value. */
function colorRef(color: unknown): number | string | null {
  if (color === null || color === undefined) return null
  if (typeof color === 'number') return color
  if (typeof color === 'string') {
    const trimmed = color.trim()
    if (trimmed === '') return null
    const n = Number(trimmed)
    return Number.isFinite(n) ? n : trimmed
  }
  if (typeof color === 'object' && color !== null && 'id' in (color as any)) {
    return colorRef((color as any).id)
  }
  return null
}

function variantsMatchColor(
  variant: Record<string, any>,
  itemColor: unknown,
): boolean {
  const itemRef = colorRef(itemColor)
  if (itemRef === null) return false
  return colorRef(variant?.color) === itemRef
}

/**
 * Computes the product fields to write after an order is confirmed.
 * Returns `null` when there is nothing to change (no items / no product).
 *
 * Behavior:
 * - Products WITHOUT colorVariants: decrements top-level `quantity`
 *   (clamped at 0) when `trackQuantity` is on — preserves legacy behavior.
 * - Products WITH colorVariants: decrements each matched variant's `stock`
 *   (clamped at 0) and recomputes `quantity` as the sum of enabled
 *   variants. Items whose color cannot be matched (legacy orders without
 *   color info) are skipped rather than decrementing the wrong variant.
 * - `purchaseCount` always accumulates the full ordered quantity.
 */
export function applyStockDecrement(
  product: any,
  items: StockOrderItem[],
): StockUpdate | null {
  const relevant = (items || []).filter(
    (i) => i && i.quantity && i.quantity > 0,
  )
  if (relevant.length === 0) return null

  const totalQty = relevant.reduce((sum, i) => sum + (i.quantity || 0), 0)
  const purchaseCount = (Number(product?.purchaseCount) || 0) + totalQty

  const variants = Array.isArray(product?.colorVariants)
    ? product.colorVariants
    : null

  // ── Legacy / variant-less products: top-level quantity ──
  if (!variants || variants.length === 0) {
    if (product?.trackQuantity !== true) return { purchaseCount }
    return {
      purchaseCount,
      quantity: Math.max(0, (Number(product?.quantity) || 0) - totalQty),
    }
  }

  // ── Variant products: per-color decrement ──
  const newVariants: Array<Record<string, any>> = variants.map((v: any) => ({
    ...v,
  }))
  let matched = false

  for (const item of relevant) {
    const variant = newVariants.find((v: Record<string, any>) =>
      variantsMatchColor(v, item.color),
    )
    if (!variant) continue
    variant.stock = Math.max(
      0,
      (Number(variant.stock) || 0) - (item.quantity || 0),
    )
    matched = true
  }

  if (!matched) return { purchaseCount }

  const quantity = newVariants
    .filter((v: Record<string, any>) => v.enabled !== false)
    .reduce(
      (sum: number, v: Record<string, any>) => sum + (Number(v.stock) || 0),
      0,
    )

  return { colorVariants: newVariants, quantity, purchaseCount }
}

/**
 * Live purchasable stock for a cart/order line against a product doc.
 * Returns `null` when the product doesn't track quantity (no cap).
 * Semantics for variant products: a line whose color can't be matched
 * (removed variant, disabled variant, or missing color) is NOT
 * purchasable → 0.
 */
export function purchasableStock(
  product: any,
  colorSlug?: string | null,
): number | null {
  if (product?.trackQuantity !== true) return null
  const variants = Array.isArray(product?.colorVariants)
    ? product.colorVariants
    : []
  if (variants.length === 0) return Math.max(0, Number(product?.quantity) || 0)
  if (!colorSlug) return 0
  const variant = variants.find(
    (v: any) =>
      v?.enabled !== false && v?.color && v.color.slug === colorSlug,
  )
  return variant ? Math.max(0, Number(variant.stock) || 0) : 0
}

/**
 * Effective stock for a cart line item, preferring the validated snapshot
 * on the variant (`variant.color.stock`, refreshed by `validateStock`)
 * and falling back to the product doc's live variant stock (populated
 * carts from the DB). `null` = untracked, never OOS.
 */
export function lineStockFor(item: {
  product?: unknown
  variant?: {
    color?: { stock?: number | null; slug?: string | null } | null
    stock?: number | null
  } | null
}): number | null {
  const snapshot = item.variant?.color?.stock ?? item.variant?.stock ?? null
  if (typeof snapshot === 'number') return snapshot
  const slug =
    (item.variant?.color && (item.variant.color as any).slug) || null
  return purchasableStock(item.product, slug)
}
