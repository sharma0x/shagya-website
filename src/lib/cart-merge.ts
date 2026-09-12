export type MergeableItem = {
  product: unknown
  variant?: unknown
  quantity?: number
  unitPrice?: number
}

export function normalizeVariant(variant: unknown): unknown {
  if (variant === null || variant === undefined) return null
  if (typeof variant === 'object') {
    const entries = Object.entries(variant as object)
    // An empty object or an object whose values are all empty ("no
    // selection", e.g. { color: '' } from the PDP when no color is chosen)
    // means "no variant".
    if (entries.length === 0) return null
    if (
      entries.every(
        ([, value]) => value === '' || value === null || value === undefined,
      )
    ) {
      return null
    }
  }
  return variant
}

function normalizeProduct(product: unknown) {
  if (product && typeof product === 'object' && 'id' in product) {
    return (product as { id: number | string }).id
  }
  return product
}

function productId(product: unknown): string {
  return String(normalizeProduct(product) ?? '')
}

function colorSlug(variant: unknown): string {
  if (variant && typeof variant === 'object' && 'color' in variant) {
    const color = (variant as any).color
    if (color && typeof color === 'object' && 'slug' in color) {
      return String(color.slug)
    }
  }
  return ''
}

export function cartMergeKey(item: MergeableItem): string {
  const pid = productId(item.product)
  const cid = colorSlug(item.variant)
  return cid ? `${pid}::${cid}` : pid
}

export const CART_MAX_QTY = 10

/**
 * Maximum quantity a cart line item may reach. Caps by the color variant's
 * stock when the product tracks quantity; otherwise the general 10-item cap.
 * `stock` is a snapshot from add-time (no reservation), so races can still
 * oversell — the decrement on order confirmation clamps at zero.
 */
/**
 * Maximum quantity a cart line item may reach. The color variant's
 * add-time stock snapshot takes priority (it lives on the variant's color
 * object, survives merging where the product is normalized to a bare ID,
 * and matches the PDP's per-variant OOS semantics). Falls back to the
 * tracked product-level quantity, then the general 10-item cap.
 * `stock` is a snapshot from add-time (no reservation), so races can still
 * oversell — the decrement on order confirmation clamps at zero.
 */
export function cartQtyCap(
  item: MergeableItem & {
    product?: {
      trackQuantity?: boolean | null
      quantity?: number | null
      [key: string]: any
    }
    variant?: {
      stock?: number | null
      color?: { stock?: number | null; [key: string]: any } | null
      [key: string]: any
    } | null
  },
): number {
  const variantStock = item.variant?.color?.stock ?? item.variant?.stock ?? null
  if (typeof variantStock === 'number' && variantStock >= 0) {
    return Math.min(CART_MAX_QTY, variantStock)
  }
  if (item.product?.trackQuantity === true) {
    const productQty = item.product?.quantity
    if (typeof productQty === 'number' && productQty >= 0) {
      return Math.min(CART_MAX_QTY, productQty)
    }
  }
  return CART_MAX_QTY
}

export function mergeCartItems(
  existing: MergeableItem[],
  incoming: MergeableItem[],
): any[] {
  const merged = new Map<string, any>()

  for (const item of existing) {
    merged.set(cartMergeKey(item), {
      ...item,
      product: normalizeProduct(item.product),
      variant: normalizeVariant(item.variant),
    })
  }

  for (const item of incoming) {
    const key = cartMergeKey(item)
    const current = merged.get(key)
    if (current) {
      current.quantity = Math.max(current.quantity || 1, item.quantity || 1)
      if (item.unitPrice) current.unitPrice = item.unitPrice
      const v = normalizeVariant(item.variant)
      if (v !== null) current.variant = v
    } else {
      merged.set(key, {
        ...item,
        product: normalizeProduct(item.product),
        variant: normalizeVariant(item.variant),
      })
    }
  }

  for (const item of merged.values()) {
    item.quantity = Math.min(item.quantity || 1, cartQtyCap(item))
  }

  return [...merged.values()]
}

export function dedupeCartItems<T extends MergeableItem>(items: T[]): T[] {
  const merged = new Map<string, any>()

  for (const item of items) {
    const key = cartMergeKey(item)
    const current = merged.get(key)
    if (current) {
      current.quantity = Math.min(
        CART_MAX_QTY,
        (current.quantity || 0) + (item.quantity || 1),
      )
      const v = normalizeVariant(item.variant)
      if (v !== null) current.variant = v
    } else {
      merged.set(key, { ...item, variant: normalizeVariant(item.variant) })
    }
  }

  for (const item of merged.values()) {
    item.quantity = Math.min(item.quantity || 1, cartQtyCap(item))
  }

  return [...merged.values()]
}
