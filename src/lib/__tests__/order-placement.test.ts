import { describe, expect, it, vi } from 'vitest'
import { placeOrderAndConsumeCart } from '../order-placement'

describe('placeOrderAndConsumeCart', () => {
  it('places order, consumes cart and commits transaction', async () => {
    const mockTxId = 'tx-123'
    const mockDb = {
      beginTransaction: vi.fn().mockResolvedValue(mockTxId),
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      rollbackTransaction: vi.fn().mockResolvedValue(undefined),
    }
    const mockCreate = vi
      .fn()
      .mockResolvedValue({ id: 10, orderNumber: 'ORD-10' })
    const mockUpdate = vi.fn().mockResolvedValue({ docs: [{ id: 5 }] })
    const mockCount = vi.fn().mockResolvedValue({ totalDocs: 0 })

    const payload: any = {
      db: mockDb,
      create: mockCreate,
      update: mockUpdate,
      count: mockCount,
    }

    const orderData = { customerEmail: 'test@example.com', total: 1500 }
    const cart = { cartId: 5, updatedAt: '2026-09-24T12:00:00Z' }

    const result = await placeOrderAndConsumeCart(payload, {
      orderData,
      cart,
      couponUsage: null,
    })

    expect(result).toEqual({ id: 10, orderNumber: 'ORD-10' })
    expect(mockDb.beginTransaction).toHaveBeenCalled()
    expect(mockCreate).toHaveBeenCalledWith({
      collection: 'orders',
      data: orderData,
      overrideAccess: true,
      req: { transactionID: mockTxId },
    })
    expect(mockUpdate).toHaveBeenCalledWith({
      collection: 'carts',
      where: {
        and: [
          { id: { equals: 5 } },
          { updatedAt: { equals: '2026-09-24T12:00:00Z' } },
        ],
      },
      data: { items: [], subtotal: 0, coupon: null },
      overrideAccess: true,
      req: { transactionID: mockTxId },
    })
    expect(mockDb.commitTransaction).toHaveBeenCalledWith(mockTxId)
  })

  it('increments coupon usage without locking to exact usedCount equality', async () => {
    const mockTxId = 'tx-123'
    const mockDb = {
      beginTransaction: vi.fn().mockResolvedValue(mockTxId),
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      rollbackTransaction: vi.fn().mockResolvedValue(undefined),
    }
    const mockFind = vi
      .fn()
      .mockResolvedValue({ docs: [{ id: 1, usedCount: 5 }] })
    const mockUpdate = vi
      .fn()
      .mockResolvedValue({ docs: [{ id: 1, usedCount: 6 }] })
    const mockCreate = vi
      .fn()
      .mockResolvedValue({ id: 10, orderNumber: 'ORD-10' })

    const payload: any = {
      db: mockDb,
      create: mockCreate,
      update: mockUpdate,
      find: mockFind,
    }

    await placeOrderAndConsumeCart(payload, {
      orderData: { customerEmail: 'test@example.com', total: 1500 },
      cart: null,
      couponUsage: {
        id: 1,
        usedCount: 2, // older client snapshot
        usageLimit: null,
        perUserUsageLimit: null,
        customerEmail: 'test@example.com',
      },
    })

    // The update should increment based on current db count (5 -> 6), without an equality lock on 2
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'coupons',
        where: { and: [{ id: { equals: 1 } }] },
        data: { usedCount: 6 },
      }),
    )
  })

  it('rolls back and throws when perUserUsageLimit is reached', async () => {
    const mockTxId = 'tx-123'
    const mockDb = {
      beginTransaction: vi.fn().mockResolvedValue(mockTxId),
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      rollbackTransaction: vi.fn().mockResolvedValue(undefined),
    }
    const mockCount = vi.fn().mockResolvedValue({ totalDocs: 1 })

    const payload: any = {
      db: mockDb,
      count: mockCount,
      create: vi.fn(),
      update: vi.fn(),
    }

    await expect(
      placeOrderAndConsumeCart(payload, {
        orderData: { customerEmail: 'test@example.com', total: 1500 },
        cart: null,
        couponUsage: {
          id: 1,
          usedCount: 1,
          usageLimit: 100,
          perUserUsageLimit: 1,
          customerEmail: 'test@example.com',
        },
      }),
    ).rejects.toThrow('Coupon per-user usage limit reached')

    expect(mockDb.rollbackTransaction).toHaveBeenCalledWith(mockTxId)
  })
})
