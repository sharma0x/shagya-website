import { describe, it, expect } from 'vitest'
import {
  mergeCartItems,
  dedupeCartItems,
  normalizeVariant,
} from '../cart-merge'

const existingItem = (product: any, variant: any, quantity = 1) => ({
  product,
  variant,
  quantity,
  unitPrice: 100,
})

describe('mergeCartItems', () => {
  it('merges the same product+variant instead of duplicating when existing items have populated product objects', () => {
    // Existing items come back from payload.find with relationships populated
    // (default depth >= 1), so `product` is an object, while incoming items
    // carry the normalized numeric id.
    const existing = [existingItem({ id: 21, title: 'Saree' }, null)]
    const incoming = [existingItem(21, null, 2)]

    const merged = mergeCartItems(existing, incoming)

    expect(merged).toHaveLength(1)
    expect(merged[0].product).toBe(21)
    expect(merged[0].quantity).toBe(2)
  })

  it('merges incoming objects into an existing numeric id', () => {
    const existing = [existingItem(21, null)]
    const incoming = [existingItem({ id: 21, title: 'Saree' }, null, 3)]

    const merged = mergeCartItems(existing, incoming)

    expect(merged).toHaveLength(1)
    expect(merged[0].product).toBe(21)
    expect(merged[0].quantity).toBe(3)
  })

  it('treats an empty object variant and null variant as the same no-variant selection', () => {
    const existing = [existingItem(21, {})]
    const incoming = [existingItem(21, null, 4)]

    const merged = mergeCartItems(existing, incoming)

    expect(merged).toHaveLength(1)
    expect(merged[0].quantity).toBe(4)
  })

  it('merges the same product even with different variants into one line', () => {
    const existing = [existingItem(21, { size: 'M' })]
    const incoming = [existingItem(21, { size: 'L' })]

    const merged = mergeCartItems(existing, incoming)

    expect(merged).toHaveLength(1)
  })

  it('merges homepage (no variant) with PDP (color variant) adds of the same product', () => {
    const existing = [existingItem(21, null, 1)]
    const incoming = [existingItem(21, { color: 'rose' }, 1)]

    const merged = mergeCartItems(existing, incoming)

    expect(merged).toHaveLength(1)
    expect(merged[0].variant).toEqual({ color: 'rose' })
    expect(merged[0].quantity).toBe(1)
  })

  it('keeps distinct products as separate line items', () => {
    const existing = [existingItem(21, null)]
    const incoming = [existingItem(22, null)]

    const merged = mergeCartItems(existing, incoming)

    expect(merged).toHaveLength(2)
  })

  it('takes the max quantity when merging the same line twice', () => {
    const existing = [existingItem(21, null, 2)]
    const incoming = [existingItem(21, null, 1)]

    const merged = mergeCartItems(existing, incoming)

    expect(merged).toHaveLength(1)
    expect(merged[0].quantity).toBe(2)
  })

  it('returns empty array when both inputs are empty', () => {
    expect(mergeCartItems([], [])).toEqual([])
  })

  it('overwrites unitPrice with the incoming value on merge', () => {
    const existing = [existingItem(21, null, 1)]
    const incoming = [{ ...existingItem(21, null, 1), unitPrice: 250 }]

    const merged = mergeCartItems(existing, incoming)

    expect(merged).toHaveLength(1)
    expect(merged[0].unitPrice).toBe(250)
  })
})

describe('normalizeVariant', () => {
  it('normalizes empty object, null, and undefined to null', () => {
    expect(normalizeVariant({})).toBeNull()
    expect(normalizeVariant(null)).toBeNull()
    expect(normalizeVariant(undefined)).toBeNull()
  })

  it('normalizes objects with only empty values to null (e.g. { color: "" })', () => {
    expect(normalizeVariant({ color: '' })).toBeNull()
    expect(normalizeVariant({ color: '', size: undefined })).toBeNull()
  })

  it('keeps non-empty variants as-is', () => {
    const v = { size: 'M' }
    expect(normalizeVariant(v)).toEqual(v)
  })
})

describe('dedupeCartItems', () => {
  it('sums duplicate lines with mixed populated-object and id products', () => {
    const items = [
      existingItem({ id: 21, title: 'Saree' }, null, 1),
      existingItem(21, null, 2),
    ]

    const merged = dedupeCartItems(items)

    expect(merged).toHaveLength(1)
    expect(merged[0].quantity).toBe(3)
  })

  it('keeps the full product object when deduping', () => {
    const items = [
      existingItem({ id: 21, name: 'Saree' }, null, 1),
      existingItem(21, null, 1),
    ]

    const merged = dedupeCartItems(items)

    expect(merged[0].product).toEqual({ id: 21, name: 'Saree' })
  })

  it('merges empty-object variant with null variant', () => {
    const items = [existingItem(21, {}, 1), existingItem(21, null, 2)]

    const merged = dedupeCartItems(items)

    expect(merged).toHaveLength(1)
    expect(merged[0].variant).toBeNull()
    expect(merged[0].quantity).toBe(3)
  })

  it('merges same product added with different colors into one line', () => {
    const items = [
      existingItem(21, { color: 'rose' }, 1),
      existingItem(21, { color: 'gold' }, 1),
    ]

    const merged = dedupeCartItems(items)

    expect(merged).toHaveLength(1)
    expect(merged[0].quantity).toBe(2)
  })

  it('caps summed quantity at 10', () => {
    const items = [existingItem(21, null, 6), existingItem(21, null, 6)]

    const merged = dedupeCartItems(items)

    expect(merged[0].quantity).toBe(10)
  })
})
