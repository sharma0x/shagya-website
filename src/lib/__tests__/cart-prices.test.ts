import { describe, it, expect, vi } from 'vitest'
import {
  itemProductId,
  resolveCurrentPrices,
  applyCurrentPrice,
} from '../cart-prices'

describe('cart-prices', () => {
  describe('itemProductId', () => {
    it('returns the raw id for primitive references', () => {
      expect(itemProductId({ product: 42, quantity: 1 })).toBe(42)
      expect(itemProductId({ product: 'abc', quantity: 1 })).toBe('abc')
    })

    it('extracts the id from a populated product object', () => {
      expect(itemProductId({ product: { id: 7 }, quantity: 1 })).toBe(7)
      expect(itemProductId({ product: null, quantity: 1 })).toBeNull()
    })
  })

  describe('resolveCurrentPrices', () => {
    it('fetches products and maps id -> { price, productCode }', async () => {
      const payload = {
        find: vi.fn().mockResolvedValue({
          docs: [
            { id: 1, basePrice: 1299, productCode: 'SHG-00001' },
            { id: 2, basePrice: 2499, productCode: null },
          ],
        }),
      } as any

      const priceInfoMap = await resolveCurrentPrices(payload, [
        { product: 1, quantity: 2 },
        { product: 2, quantity: 1 },
      ])

      expect(priceInfoMap.get('1')).toEqual({
        price: 1299,
        productCode: 'SHG-00001',
      })
      expect(priceInfoMap.get('2')).toEqual({ price: 2499, productCode: null })
      expect(payload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'products',
          where: { id: { in: [1, 2] } },
          overrideAccess: true,
        }),
      )
    })

    it('ignores products without a valid price', async () => {
      const payload = {
        find: vi.fn().mockResolvedValue({
          docs: [{ id: 1, basePrice: null, productCode: 'SHG-00001' }],
        }),
      } as any

      const priceInfoMap = await resolveCurrentPrices(payload, [{ product: 1 }])
      expect(priceInfoMap.has('1')).toBe(false)
    })

    it('returns an empty map when there are no items', async () => {
      const payload = { find: vi.fn() } as any
      const priceInfoMap = await resolveCurrentPrices(payload, [])
      expect(priceInfoMap.size).toBe(0)
      expect(payload.find).not.toHaveBeenCalled()
    })
  })

  describe('applyCurrentPrice', () => {
    it('overrides the unitPrice with the current price when known', () => {
      const priceInfoMap = new Map([
        ['1', { price: 1599, productCode: 'SHG-00001' }],
      ])
      const { unitPrice } = applyCurrentPrice(
        { product: 1, unitPrice: 999 },
        priceInfoMap,
      )
      expect(unitPrice).toBe(1599)
    })

    it('keeps the stored unitPrice when the product price is unknown', () => {
      const priceInfoMap = new Map()
      const { unitPrice } = applyCurrentPrice(
        { product: 1, unitPrice: 999 },
        priceInfoMap,
      )
      expect(unitPrice).toBe(999)
    })
  })
})
