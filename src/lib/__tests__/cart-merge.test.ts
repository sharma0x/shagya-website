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

  it('keeps same product with different colors as separate lines', () => {
    const rose = { color: { slug: 'rose', name: 'Rose', hex: '#e11d48' } }
    const gold = { color: { slug: 'gold', name: 'Gold', hex: '#fbbf24' } }

    const existing = [existingItem(21, rose)]
    const incoming = [existingItem(21, gold)]

    const merged = mergeCartItems(existing, incoming)

    expect(merged).toHaveLength(2)
  })

  it('merges same product with same color into one line', () => {
    const rose = { color: { slug: 'rose', name: 'Rose', hex: '#e11d48' } }

    const existing = [existingItem(21, rose, 1)]
    const incoming = [existingItem(21, rose, 2)]

    const merged = mergeCartItems(existing, incoming)

    expect(merged).toHaveLength(1)
    expect(merged[0].quantity).toBe(2)
  })

  it('keeps product with color separate from product without color', () => {
    const rose = { color: { slug: 'rose', name: 'Rose', hex: '#e11d48' } }

    const existing = [existingItem(21, null)]
    const incoming = [existingItem(21, rose)]

    const merged = mergeCartItems(existing, incoming)

    expect(merged).toHaveLength(2)
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

  it('caps summed quantity at 10', () => {
    const items = [existingItem(21, null, 6), existingItem(21, null, 6)]

    const merged = dedupeCartItems(items)

    expect(merged[0].quantity).toBe(10)
  })

  it('keeps same product with different colors as separate lines', () => {
    const rose = { color: { slug: 'rose', name: 'Rose', hex: '#e11d48' } }
    const gold = { color: { slug: 'gold', name: 'Gold', hex: '#fbbf24' } }

    const items = [existingItem(21, rose, 1), existingItem(21, gold, 2)]

    const merged = dedupeCartItems(items)

    expect(merged).toHaveLength(2)
    expect(merged[0].quantity).toBe(1)
    expect(merged[1].quantity).toBe(2)
  })

  it('merges same product with same color', () => {
    const rose = { color: { slug: 'rose', name: 'Rose', hex: '#e11d48' } }

    const items = [existingItem(21, rose, 1), existingItem(21, rose, 2)]

    const merged = dedupeCartItems(items)

    expect(merged).toHaveLength(1)
    expect(merged[0].quantity).toBe(3)
  })
})
