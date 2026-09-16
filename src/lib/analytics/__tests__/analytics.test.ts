import { describe, expect, it } from 'vitest'
import { mapProductToGA4Item, round } from '../mappers'
import { sanitizePagePath } from '../events'
import { cartItemToGA4Item, computeCartLineDiff } from '../subscriptions'
import type { CartItem } from '@/lib/store/cart'

const line = (overrides: Partial<CartItem> = {}): CartItem => ({
  product: {
    id: 1,
    name: 'Banarasi Silk Saree',
    slug: 'banarasi-silk-saree',
    basePrice: 12000,
    fabric: 'silk',
    weave: 'banarasi',
  },
  variant: {
    color: { id: 10, slug: 'maroon', name: 'Maroon', hex: '#7b1e3b' },
  },
  quantity: 1,
  unitPrice: 12000,
  ...overrides,
})

describe('mapProductToGA4Item', () => {
  it('maps a Payload product with the full taxonomy slot order', () => {
    const item = mapProductToGA4Item({
      id: 42,
      name: 'Kanchipuram Classic',
      basePrice: 45000,
      weave: 'kanchipuram',
      fabric: 'silk',
      pattern: 'embroidered',
      cityOfOrigin: 'Kanchipuram',
      occasions: [{ name: 'Bridal' }, { name: 'Festive' }],
      brand: { name: 'House of Shayga' },
      color: { slug: 'ivory', name: 'Ivory', hex: '#fff' },
    })

    expect(item.item_id).toBe('42')
    expect(item.item_name).toBe('Kanchipuram Classic')
    expect(item.item_category).toBe('kanchipuram')
    expect(item.item_category2).toBe('silk')
    expect(item.item_category3).toBe('embroidered')
    expect(item.item_category4).toBe('Kanchipuram')
    expect(item.item_category5).toBe('Bridal, Festive')
    expect(item.item_brand).toBe('House of Shayga')
    expect(item.item_variant).toBe('Ivory')
    expect(item.price).toBe(45000)
    expect(item.currency).toBe('INR')
    expect(item.affiliation).toBe('Shayga')
  })

  it('maps a cart line via overrides (price from unitPrice, variant color)', () => {
    const item = mapProductToGA4Item(line().product, {
      price: line().unitPrice,
      quantity: 2,
      item_variant: line().variant?.color?.name,
    })

    expect(item.item_id).toBe('1')
    expect(item.item_name).toBe('Banarasi Silk Saree')
    expect(item.price).toBe(12000)
    expect(item.quantity).toBe(2)
    expect(item.item_variant).toBe('Maroon')
  })

  it('reads variant.color when the product has no top-level color', () => {
    const item = mapProductToGA4Item({
      id: 7,
      name: 'Chanderi Cotton',
      variant: { color: { name: 'Mint' } },
    })
    expect(item.item_variant).toBe('Mint')
  })

  it('tolerates null/empty products', () => {
    const item = mapProductToGA4Item(null)
    expect(item.item_id).toBe('')
    expect(item.item_name).toBe('')
  })
})

describe('cartItemToGA4Item', () => {
  it('produces item_id, item_name, price, quantity and variant from a cart line', () => {
    const item = cartItemToGA4Item(line({ quantity: 3 }))
    expect(item.item_id).toBe('1')
    expect(item.item_name).toBe('Banarasi Silk Saree')
    expect(item.price).toBe(12000)
    expect(item.quantity).toBe(3)
    expect(item.item_variant).toBe('Maroon')
    expect(item.item_category).toBe('banarasi')
    expect(item.item_category2).toBe('silk')
  })
})

describe('computeCartLineDiff', () => {
  it('detects adds, removes and quantity changes keyed by product+color', () => {
    const maroon = line({ quantity: 1 })
    const mint = line({
      quantity: 2,
      product: { ...line().product, id: 2, name: 'Mint Saree' },
      variant: {
        color: { id: 11, slug: 'mint', name: 'Mint', hex: '#cfeee6' },
      },
    })

    const diff = computeCartLineDiff(
      [maroon, mint],
      [
        { ...maroon, quantity: 3 },
        mint,
        line({
          product: { ...line().product, id: 3, name: 'New Saree' },
          variant: null,
        }),
      ],
    )

    expect(diff.removed).toHaveLength(0)
    expect(diff.added).toHaveLength(1)
    expect(diff.added[0].product.id).toBe(3)
    expect(diff.quantityIncreased).toHaveLength(1)
    expect(diff.quantityIncreased[0].item.product.id).toBe(1)
    expect(diff.quantityIncreased[0].delta).toBe(2)
    expect(diff.quantityDecreased).toHaveLength(0)
  })

  it('detects removals and quantity decreases', () => {
    const a = line({ quantity: 4 })
    const b = line({
      quantity: 2,
      product: { ...line().product, id: 2, name: 'Other' },
      variant: null,
    })

    const diff = computeCartLineDiff([a, b], [{ ...b, quantity: 1 }])

    expect(diff.removed).toHaveLength(1)
    expect(diff.removed[0].product.id).toBe(1)
    expect(diff.quantityDecreased).toHaveLength(1)
    expect(diff.quantityDecreased[0].item.product.id).toBe(2)
    expect(diff.quantityDecreased[0].delta).toBe(1)
    expect(diff.added).toHaveLength(0)
  })

  it('treats identical snapshots as no diff', () => {
    const diff = computeCartLineDiff([line()], [line()])
    expect(diff.added).toHaveLength(0)
    expect(diff.removed).toHaveLength(0)
    expect(diff.quantityIncreased).toHaveLength(0)
    expect(diff.quantityDecreased).toHaveLength(0)
  })

  it('handles multi-line removals from a single user action', () => {
    const a = line({ product: { ...line().product, id: 1 } })
    const b = line({
      product: { ...line().product, id: 1 },
      variant: {
        color: { id: 12, slug: 'navy', name: 'Navy', hex: '#1d2a4d' },
      },
    })
    const diff = computeCartLineDiff([a, b], [])
    expect(diff.removed).toHaveLength(2)
  })
})

describe('sanitizePagePath', () => {
  it('strips sensitive query keys but keeps benign ones', () => {
    const cleaned = sanitizePagePath(
      '/checkout/success?orderNumber=ORD-123&email=leak@me.com&utm_source=x',
    )
    expect(cleaned).toBe('/checkout/success?orderNumber=ORD-123&utm_source=x')
  })

  it('is case-insensitive and returns the base path when only sensitive keys exist', () => {
    expect(sanitizePagePath('/checkout/success?Email=a@b.com&OTP=123456')).toBe(
      '/checkout/success',
    )
  })

  it('passes through paths without a query string', () => {
    expect(sanitizePagePath('/products/banarasi-silk-saree/1')).toBe(
      '/products/banarasi-silk-saree/1',
    )
  })

  it('returns the original string when nothing is removed', () => {
    const path = '/search?q=silk&sort=price-asc'
    expect(sanitizePagePath(path)).toBe(path)
  })
})

describe('round', () => {
  it('rounds currency values to 2dp', () => {
    expect(round(99.999)).toBe(100)
    expect(round(123.456)).toBe(123.46)
  })
})
