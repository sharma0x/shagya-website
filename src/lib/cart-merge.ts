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
