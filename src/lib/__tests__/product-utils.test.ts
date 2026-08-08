import { describe, it, expect } from 'vitest'
import { liftVariantGallery, resolveVariantIndex } from '@/lib/product-utils'

const variants = [
  { color: { slug: 'red', name: 'Red', hex: '#f00' } },
  { color: { slug: 'blue', name: 'Blue', hex: '#00f' } },
  { color: { slug: 'green', name: 'Green', hex: '#0f0' } },
]

describe('resolveVariantIndex', () => {
  it('returns the index of the variant matching the color slug', () => {
    expect(resolveVariantIndex(variants, 'blue')).toBe(1)
    expect(resolveVariantIndex(variants, 'red')).toBe(0)
  })

  it('falls back to 0 when the slug is missing', () => {
    expect(resolveVariantIndex(variants, undefined)).toBe(0)
    expect(resolveVariantIndex(variants, null)).toBe(0)
    expect(resolveVariantIndex(variants, '')).toBe(0)
  })

  it('falls back to 0 when the slug matches no variant', () => {
    expect(resolveVariantIndex(variants, 'purple')).toBe(0)
  })

  it('falls back to 0 for an empty variant list', () => {
    expect(resolveVariantIndex([], 'blue')).toBe(0)
  })
})

describe('liftVariantGallery', () => {
  it('lifts the first enabled variant gallery, color, and price override', () => {
    const product = {
      id: 1,
      name: 'Saree',
      basePrice: 5000,
      colorVariants: [
        {
          enabled: false,
          color: { slug: 'red', name: 'Red', hex: '#f00' },
          gallery: [{ image: { url: '/red.jpg' } }],
        },
        {
          enabled: true,
          color: { slug: 'blue', name: 'Blue', hex: '#00f' },
          gallery: [{ image: { url: '/blue.jpg' } }],
          priceOverride: 4500,
        },
      ],
    }
    const lifted = liftVariantGallery(product)
    expect(lifted.gallery).toEqual([{ image: { url: '/blue.jpg' } }])
    expect(lifted.color).toEqual({ slug: 'blue', name: 'Blue', hex: '#00f' })
    expect(lifted.basePrice).toBe(4500)
  })

  it('returns null color and empty gallery when no variant is enabled', () => {
    const lifted = liftVariantGallery({
      id: 1,
      basePrice: 100,
      colorVariants: [],
    })
    expect(lifted.color).toBeNull()
    expect(lifted.gallery).toEqual([])
    expect(lifted.basePrice).toBe(100)
  })
})
