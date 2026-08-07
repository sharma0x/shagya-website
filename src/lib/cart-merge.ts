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

// Cart line identity is the PRODUCT ONLY — the same saree added from the
// homepage (no variant) and from the PDP (with a color) must land on the
// same line, and a product can never hold more than one color in the cart.
export function cartMergeKey(item: MergeableItem): string {
  return productId(item.product)
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

  return [...merged.values()]
}

export function dedupeCartItems<T extends MergeableItem>(items: T[]): T[] {
  const merged = new Map<string, any>()

  for (const item of items) {
    const key = cartMergeKey(item)
    const current = merged.get(key)
    if (current) {
      current.quantity = Math.min(
        10,
        (current.quantity || 0) + (item.quantity || 1),
      )
      const v = normalizeVariant(item.variant)
      if (v !== null) current.variant = v
    } else {
      merged.set(key, { ...item, variant: normalizeVariant(item.variant) })
    }
  }

  return [...merged.values()]
}
