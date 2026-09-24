import { describe, expect, it, vi } from 'vitest'
import { resolveCheckoutCart } from '../checkout-cart'

describe('resolveCheckoutCart', () => {
  it('rejects fractional quantities from guest requests', async () => {
    const payload = { find: vi.fn() }

    await expect(
      resolveCheckoutCart(payload as any, null, [
        { product: 1, quantity: 1.5, unitPrice: 1000 },
      ]),
    ).rejects.toThrow('Cart quantities must be whole numbers between 1 and 10')
  })

  it('rejects quantities outside the cart limit', async () => {
    const payload = { find: vi.fn() }

    await expect(
      resolveCheckoutCart(payload as any, null, [
        { product: 1, quantity: 11, unitPrice: 1000 },
      ]),
    ).rejects.toThrow('Cart quantities must be whole numbers between 1 and 10')
  })

  it('accepts valid guest quantities', async () => {
    const payload = { find: vi.fn() }
    const result = await resolveCheckoutCart(payload as any, null, [
      { product: 1, quantity: 2, unitPrice: 1000 },
    ])

    expect(result?.items[0].quantity).toBe(2)
  })
})
