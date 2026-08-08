import { describe, it, expect } from 'vitest'
import { getProductUrl } from '@/lib/product-url'

describe('getProductUrl', () => {
  it('builds the canonical product URL', () => {
    expect(getProductUrl('banarasi-silk', 42)).toBe(
      '/products/banarasi-silk/42',
    )
  })

  it('falls back to "product" when slug is missing', () => {
    expect(getProductUrl(null, 7)).toBe('/products/product/7')
    expect(getProductUrl(undefined, 7)).toBe('/products/product/7')
  })

  it('appends the color query param when a color slug is given', () => {
    expect(getProductUrl('banarasi-silk', 42, 'blue')).toBe(
      '/products/banarasi-silk/42?color=blue',
    )
  })

  it('omits the color param for null/empty color slugs', () => {
    expect(getProductUrl('s', 1, null)).toBe('/products/s/1')
    expect(getProductUrl('s', 1, '')).toBe('/products/s/1')
  })

  it('encodes special characters in the color slug', () => {
    expect(getProductUrl('s', 1, 'deep blue & gold')).toBe(
      '/products/s/1?color=deep%20blue%20%26%20gold',
    )
  })
})
