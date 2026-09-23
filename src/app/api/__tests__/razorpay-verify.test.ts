import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockFind = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockBeginTransaction = vi.fn()
const mockCommitTransaction = vi.fn()
const mockRollbackTransaction = vi.fn()
const mockGetSession = vi.fn()
let currentBasePrice = 2500

vi.mock('@payload-config', () => ({ default: {} }))

vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    find: mockFind,
    findGlobal: vi.fn(async () => ({})),
    create: mockCreate,
    update: mockUpdate,
    db: {
      beginTransaction: mockBeginTransaction,
      commitTransaction: mockCommitTransaction,
      rollbackTransaction: mockRollbackTransaction,
    },
  })),
}))

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: mockGetSession } },
}))

vi.mock('@/lib/auth-sync', () => ({
  findOrRepairCustomer: vi.fn(async () => ({ id: 7 })),
}))

vi.mock('@/lib/cart-prices', () => ({
  resolveCurrentPrices: vi.fn(async (_payload: unknown, items: any[]) => {
    return new Map(
      items.map((item) => [
        String(item.product),
        { basePrice: currentBasePrice, productCode: `SKU-${item.product}` },
      ]),
    )
  }),
  applyCurrentPrice: vi.fn((item: any, priceMap: Map<string, any>) => ({
    ...item,
    unitPrice: priceMap.get(String(item.product))?.basePrice ?? item.unitPrice,
  })),
}))

vi.mock('@/lib/stock', () => ({
  validateCartStock: vi.fn(async () => ({ ok: true, clamped: {} })),
}))

vi.mock('@/lib/coupons', () => ({
  validateCouponForCart: vi.fn(),
}))

vi.mock('@/lib/address-utils', () => ({
  isSameAddress: vi.fn(() => true),
}))

vi.mock('@/lib/api-error', () => ({
  toUserFacingError: vi.fn((error: Error) => error.message),
}))

let POST: (request: Request) => Promise<Response>

const shippingAddress = {
  fullName: 'Test Customer',
  phone: '9999999999',
  line1: 'Test Street',
  line2: '',
  city: 'Bengaluru',
  state: 'Karnataka',
  pincode: '560001',
  country: 'India',
}

function createRequest(): Request {
  return new Request('http://localhost/api/razorpay/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      isCod: true,
      shippingAddress,
      guestEmail: 'test@example.com',
      guestPhone: '9999999999',
      cartItems: [
        {
          product: 202,
          variant: null,
          quantity: 1,
          unitPrice: 9999,
        },
      ],
    }),
  })
}

beforeEach(async () => {
  vi.clearAllMocks()
  currentBasePrice = 2500
  mockGetSession.mockResolvedValue({
    user: { id: 'user-1', email: 'test@example.com' },
  })
  mockFind.mockImplementation(
    async ({ collection }: { collection: string }) => {
      if (collection === 'carts') {
        return {
          docs: [
            {
              id: 42,
              customer: 7,
              items: [
                {
                  product: 101,
                  variant: null,
                  quantity: 1,
                  unitPrice: 2500,
                },
              ],
              updatedAt: '2026-09-23T00:00:00.000Z',
            },
          ],
        }
      }
      if (collection === 'addresses') {
        return { docs: [] }
      }
      return { docs: [] }
    },
  )
  mockCreate.mockImplementation(
    async ({ collection }: { collection: string }) => {
      if (collection === 'orders') {
        return { id: 'order-1', orderNumber: 'ORD-00001' }
      }
      return { id: `${collection}-1` }
    },
  )
  mockUpdate.mockResolvedValue({
    docs: [{ id: 42, items: [], subtotal: 0, coupon: null }],
  })
  mockBeginTransaction.mockResolvedValue('transaction-1')
  mockCommitTransaction.mockResolvedValue(undefined)
  mockRollbackTransaction.mockResolvedValue(undefined)

  const route = await import('../razorpay/verify/route')
  POST = route.POST
})

describe('POST /api/razorpay/verify', () => {
  it('uses and atomically consumes the server cart after guest OTP authentication', async () => {
    const response = await POST(createRequest())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        data: expect.objectContaining({
          items: [expect.objectContaining({ product: 101 })],
        }),
      }),
    )
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'carts',
        where: {
          and: [
            { id: { equals: 42 } },
            {
              updatedAt: {
                equals: '2026-09-23T00:00:00.000Z',
              },
            },
          ],
        },
        data: { items: [], subtotal: 0, coupon: null },
        req: { transactionID: 'transaction-1' },
      }),
    )
    expect(mockCommitTransaction).toHaveBeenCalledWith('transaction-1')
  })

  it('allows COD when the final order total is exactly 4000', async () => {
    currentBasePrice = 3750

    const response = await POST(createRequest())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        data: expect.objectContaining({ total: 4000, paymentId: 'COD' }),
      }),
    )
  })

  it('rejects COD when the final order total exceeds 4000', async () => {
    currentBasePrice = 3750.01

    const response = await POST(createRequest())
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe(
      'Cash on Delivery is available only for orders up to ₹4,000.',
    )
    expect(mockCreate).not.toHaveBeenCalled()
    expect(mockUpdate).not.toHaveBeenCalled()
    expect(mockBeginTransaction).not.toHaveBeenCalled()
  })

  it('rolls back the order when consuming the cart fails', async () => {
    mockUpdate.mockRejectedValueOnce(new Error('Cart changed'))

    const response = await POST(createRequest())
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Cart changed')
    expect(mockRollbackTransaction).toHaveBeenCalledWith('transaction-1')
  })
})
