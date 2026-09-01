import { describe, it, expect } from 'vitest'
import { applyStockDecrement } from '../stock'

const variantProduct = (overrides: any = {}) => ({
  id: 1,
  trackQuantity: true,
  quantity: 10,
  purchaseCount: 0,
  colorVariants: [
    { color: 101, stock: 5, enabled: true },
    { color: 102, stock: 3, enabled: true },
    { color: 103, stock: 2, enabled: false },
  ],
  ...overrides,
})

describe('applyStockDecrement — variant products', () => {
  it('decrements only the matched variant and recomputes quantity as sum of enabled variants', () => {
    const update = applyStockDecrement(variantProduct(), [
      { color: 101, quantity: 2 },
    ])

    expect(update).not.toBeNull()
    expect(update!.colorVariants!.find((v) => v.color === 101)!.stock).toBe(3)
    expect(update!.colorVariants!.find((v) => v.color === 102)!.stock).toBe(3)
    // quantity = 3 + 3 (enabled variants only; disabled variant excluded)
    expect(update!.quantity).toBe(6)
    expect(update!.purchaseCount).toBe(2)
  })

  it('handles multiple colors of the same product in one order', () => {
    const update = applyStockDecrement(variantProduct(), [
      { color: 101, quantity: 1 },
      { color: 102, quantity: 2 },
    ])

    expect(update!.colorVariants!.find((v) => v.color === 101)!.stock).toBe(4)
    expect(update!.colorVariants!.find((v) => v.color === 102)!.stock).toBe(1)
    expect(update!.quantity).toBe(5)
    expect(update!.purchaseCount).toBe(3)
  })

  it('clamps variant stock at zero instead of going negative', () => {
    const update = applyStockDecrement(variantProduct(), [
      { color: 102, quantity: 10 },
    ])

    expect(update!.colorVariants!.find((v) => v.color === 102)!.stock).toBe(0)
    expect(update!.quantity).toBe(5)
  })

  it('matches a populated color doc reference as well as a bare ID', () => {
    const update = applyStockDecrement(variantProduct(), [
      { color: { id: 101 }, quantity: 1 },
    ])

    expect(update!.colorVariants!.find((v) => v.color === 101)!.stock).toBe(4)
  })

  it('matches a numeric-string color reference', () => {
    const update = applyStockDecrement(variantProduct(), [
      { color: '101', quantity: 1 },
    ])

    expect(update!.colorVariants!.find((v) => v.color === 101)!.stock).toBe(4)
  })

  it('skips variant decrement for items without color info but still counts purchases', () => {
    const product = variantProduct()
    const update = applyStockDecrement(product, [{ quantity: 2 }])

    // No variant change — only purchaseCount
    expect(update).toEqual({ purchaseCount: 2 })
  })

  it('skips decrement when the color no longer exists on the product', () => {
    const update = applyStockDecrement(variantProduct(), [
      { color: 999, quantity: 1 },
    ])

    expect(update).toEqual({ purchaseCount: 1 })
  })

  it('always increments purchaseCount with the full ordered quantity', () => {
    const update = applyStockDecrement(
      { ...variantProduct(), purchaseCount: 7 },
      [
        { color: 101, quantity: 1 },
        { color: 102, quantity: 2 },
        { color: 999, quantity: 3 },
      ],
    )

    expect(update!.purchaseCount).toBe(13)
  })
})

describe('applyStockDecrement — variant-less products (legacy)', () => {
  const legacyProduct = (overrides: any = {}) => ({
    id: 2,
    trackQuantity: true,
    quantity: 10,
    purchaseCount: 0,
    colorVariants: [],
    ...overrides,
  })

  it('decrements top-level quantity when tracking is on', () => {
    const update = applyStockDecrement(legacyProduct(), [{ quantity: 3 }])

    expect(update).toEqual({ purchaseCount: 3, quantity: 7 })
  })

  it('clamps at zero', () => {
    const update = applyStockDecrement(legacyProduct(), [{ quantity: 99 }])

    expect(update).toEqual({ purchaseCount: 99, quantity: 0 })
  })

  it('only counts purchases when tracking is off', () => {
    const update = applyStockDecrement(
      { ...legacyProduct(), trackQuantity: false },
      [{ quantity: 3 }],
    )

    expect(update).toEqual({ purchaseCount: 3 })
  })
})

describe('applyStockDecrement — edge cases', () => {
  it('returns null for empty items', () => {
    expect(applyStockDecrement(variantProduct(), [])).toBeNull()
  })

  it('returns null when all quantities are zero', () => {
    expect(
      applyStockDecrement(variantProduct(), [{ color: 101, quantity: 0 }]),
    ).toBeNull()
  })
})
