/**
 * Variant-aware stock decrement (pure, testable).
 *
 * Stock model: when a product has color variants, `colorVariants[].stock`
 * is the single source of truth and the top-level `quantity` is derived
 * (sum of enabled variants). Products without variants keep using the
 * top-level `quantity`.
 */

import type { Payload } from 'payload'

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

// ── Server-side stock validation ──────────────────────────────────────

export interface CartStockItem {
  /** Product ID (number or string) */
  product: number | string
  /** Variant color slug (if color variant product) */
  variant?: { color?: { slug?: string } | string } | string | null
  /** Requested quantity */
  quantity: number
}

export interface StockCheckResult {
  /** Whether all items pass stock validation */
  ok: boolean
  /** Items with clamped quantities (keyed by `${productId}::${colorSlug}`) */
  clamped: Record<string, { requested: number; available: number }>
  /** Error message if not ok */
  error?: string
}

/**
 * Server-side stock check: verifies that the requested cart quantities
 * are available against the current DB stock. Returns clamped items
 * where the requested quantity exceeded available stock.
 *
 * If `allowBackorder` is true on the product, the check is skipped.
 * If `trackQuantity` is false on the product, the check is skipped.
 */
export async function validateCartStock(
  payload: Payload,
  items: CartStockItem[],
): Promise<StockCheckResult> {
  if (!items || items.length === 0) {
    return { ok: true, clamped: {} }
  }

  // Collect unique product IDs
  const productIds = [
    ...new Set(
      items.map((item) =>
        typeof item.product === 'object' && item.product !== null
          ? (item.product as any).id
          : item.product,
      ),
    ),
  ]

  // Fetch all relevant products in one query
  const products = await payload.find({
    collection: 'products',
    where: {
      id: { in: productIds },
    },
    limit: productIds.length,
    overrideAccess: true,
  })

  const productMap = new Map<string, any>()
  for (const doc of products.docs) {
    productMap.set(String((doc as any).id), doc)
  }

  const clamped: StockCheckResult['clamped'] = {}
  let allOk = true

  for (const item of items) {
    const productId =
      typeof item.product === 'object' && item.product !== null
        ? (item.product as any).id
        : item.product

    const product = productMap.get(String(productId))
    if (!product) continue

    // Skip products that don't track quantity
    if (!product.trackQuantity) continue

    // Skip products with backorder allowed
    if (product.allowBackorder) continue

    const requestedQty = item.quantity || 1

    // Determine the color slug for variant lookup
    let colorSlug: string | null = null
    if (item.variant && typeof item.variant === 'object') {
      const color = (item.variant as any).color
      if (color && typeof color === 'object' && color.slug) {
        colorSlug = String(color.slug)
      } else if (typeof color === 'string') {
        colorSlug = color
      }
    }

    let availableStock: number | null = null

    // Variant product: check per-color stock
    if (
      colorSlug &&
      Array.isArray(product.colorVariants) &&
      product.colorVariants.length > 0
    ) {
      // Find the variant by matching the color relationship's slug
      // The color field is a relationship to the Colors collection
      const variant = product.colorVariants.find((v: any) => {
        if (v.enabled === false) return false
        // color is a populated relationship object or just an ID
        const colorRel = v.color
        if (colorRel && typeof colorRel === 'object' && colorRel.slug) {
          return String(colorRel.slug) === colorSlug
        }
        return false
      })
      if (variant) {
        availableStock = Number(variant.stock) || 0
      }
    }

    // Non-variant product or variant not found: use top-level quantity
    if (availableStock === null) {
      availableStock = Number(product.quantity) || 0
    }

    // Clamp the quantity
    if (requestedQty > availableStock) {
      const key = colorSlug
        ? `${String(productId)}::${colorSlug}`
        : String(productId)
      clamped[key] = { requested: requestedQty, available: availableStock }
      allOk = false
    }
  }

  const error = !allOk
    ? `Some items exceed available stock. Quantities have been adjusted.`
    : undefined

  return { ok: allOk, clamped, error }
}

/**
 * Clamps cart item quantities to available stock in-place.
 * Returns the items with quantities adjusted to not exceed available stock.
 */
export function applyStockClamp(
  items: CartStockItem[],
  clampResult: StockCheckResult,
): CartStockItem[] {
  if (clampResult.ok) return items

  return items.map((item) => {
    const productId =
      typeof item.product === 'object' && item.product !== null
        ? (item.product as any).id
        : item.product

    let colorSlug: string | null = null
    if (item.variant && typeof item.variant === 'object') {
      const color = (item.variant as any).color
      if (color && typeof color === 'object' && color.slug) {
        colorSlug = String(color.slug)
      } else if (typeof color === 'string') {
        colorSlug = color
      }
    }

    const key = colorSlug
      ? `${String(productId)}::${colorSlug}`
      : String(productId)

    const clamp = clampResult.clamped[key]
    if (clamp) {
      return {
        ...item,
        quantity: Math.max(1, clamp.available),
      }
    }
    return item
  })
}
