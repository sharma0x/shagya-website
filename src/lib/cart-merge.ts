export type MergeableItem = {
  product: unknown
  variant?: unknown
  quantity?: number
  unitPrice?: number
}

export function normalizeVariant(variant: unknown): unknown {
  if (variant === null || variant === undefined) return null
  if (
    typeof variant === 'object' &&
    Object.keys(variant as object).length === 0
  ) {
    return null
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

function variantKey(variant: unknown): string {
  const v = normalizeVariant(variant)
  if (v === null) return 'none'
  return JSON.stringify(v)
}

export function cartMergeKey(item: MergeableItem): string {
  return `${productId(item.product)}-${variantKey(item.variant)}`
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
    })
  }

  for (const item of incoming) {
    const key = cartMergeKey(item)
    const current = merged.get(key)
    if (current) {
      current.quantity = Math.max(current.quantity || 1, item.quantity || 1)
      if (item.unitPrice) current.unitPrice = item.unitPrice
    } else {
      merged.set(key, { ...item, product: normalizeProduct(item.product) })
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
    } else {
      merged.set(key, { ...item, variant: normalizeVariant(item.variant) })
    }
  }

  return [...merged.values()]
}
