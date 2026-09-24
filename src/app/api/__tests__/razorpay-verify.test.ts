import { beforeEach, describe, expect, it, vi } from 'vitest'
import crypto from 'crypto'

const mockFind = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockBeginTransaction = vi.fn()
const mockCommitTransaction = vi.fn()
const mockRollbackTransaction = vi.fn()
const mockGetSession = vi.fn()
const mockFindOrRepairCustomer = vi.fn()
const mockOrdersFetch = vi.fn()
const mockPaymentsFetch = vi.fn()
const mockPaymentsCapture = vi.fn()
let currentBasePrice = 2500
let serverBasePrice = 2500

vi.mock('razorpay', () => {
  return {
    default: class MockRazorpay {
      orders = { fetch: mockOrdersFetch }
      payments = { fetch: mockPaymentsFetch, capture: mockPaymentsCapture }
    },
  }
})

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
  findOrRepairCustomer: mockFindOrRepairCustomer,
}))

vi.mock('@/lib/cart-prices', () => ({
  resolveCurrentPrices: vi.fn(async (_payload: unknown, items: any[]) => {
    return new Map(
      items.map((item) => [
        String(item.product),
        {
          basePrice:
            String(item.product) === '101' ? serverBasePrice : currentBasePrice,
          productCode: `SKU-${item.product}`,
        },
      ]),
    )
  }),
  applyCurrentPrice: vi.fn((item: any, priceMap: Map<string, any>) => ({
    ...item,
    unitPrice: priceMap.get(String(item.product))?.basePrice ?? item.unitPrice,
  })),
  requireCurrentPrice: vi.fn(
    (item: any, priceMap: Map<string, any>) =>
      priceMap.get(String(item.product))?.basePrice ?? item.unitPrice,
  ),
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

function createRequest(isGuest = true): Request {
  return new Request('http://localhost/api/razorpay/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      isCod: true,
      shippingAddress,
      ...(isGuest
        ? {
            guestEmail: 'test@example.com',
            guestPhone: '9999999999',
            cartItems: [
              {
                product: '202',
                variant: null,
                quantity: 1,
                unitPrice: 9999,
              },
            ],
          }
        : {}),
    }),
  })
}

beforeEach(async () => {
  vi.clearAllMocks()
  currentBasePrice = 2500
  serverBasePrice = 2500
  mockGetSession.mockResolvedValue({
    user: { id: 'user-1', email: 'test@example.com' },
  })
  mockFindOrRepairCustomer.mockResolvedValue({
    id: 7,
    name: 'Prince Sharma',
    email: 'prince@example.com',
    phone: '+919999999999',
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
  it('uses the current guest cart after OTP instead of a stale server cart', async () => {
    serverBasePrice = 3750.01

    const response = await POST(createRequest())
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        data: expect.objectContaining({
          items: [expect.objectContaining({ product: 202 })],
          total: 2750,
          paymentId: 'COD',
        }),
      }),
    )
    expect(mockUpdate).not.toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'carts' }),
    )
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

  it('uses the saved customer email for authenticated orders', async () => {
    mockGetSession.mockResolvedValue({
      user: {
        id: 'phone-user-1',
        email: 'rtp1haspgkdtdtlngcsfw5fyfse2@phone.shayga.in',
        phoneNumber: '+919999999999',
      },
    })
    mockFindOrRepairCustomer.mockResolvedValue({
      id: 7,
      name: 'Prince Sharma',
      email: 'prince@example.com',
      phone: '+919999999999',
    })

    const response = await POST(createRequest(false))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        data: expect.objectContaining({
          customerEmail: 'prince@example.com',
        }),
      }),
    )
  })

  it('rolls back the order when consuming the cart fails', async () => {
    mockUpdate.mockRejectedValueOnce(
      new Error('Cart changed while the order was being placed'),
    )

    const response = await POST(createRequest(false))
    const body = await response.json()

    expect(response.status).toBe(409)
    expect(body.error).toBe(
      'Your cart changed while the order was being placed. Please refresh and try again.',
    )
    expect(mockRollbackTransaction).toHaveBeenCalledWith('transaction-1')
  })

  it('verifies a valid online Razorpay payment with captured status', async () => {
    const keySecret = 'test_secret'
    process.env.RAZORPAY_KEY_ID = 'rzp_live_test'
    process.env.RAZORPAY_KEY_SECRET = keySecret

    const orderId = 'order_test_123'
    const paymentId = 'pay_test_456'
    const signature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    // Cart: 1 item at 2500 + standard shipping 150 = total 2650 -> 265000 paise
    mockOrdersFetch.mockResolvedValueOnce({
      id: orderId,
      amount: 265000,
      currency: 'INR',
    })
    mockPaymentsFetch.mockResolvedValueOnce({
      id: paymentId,
      order_id: orderId,
      amount: 265000,
      currency: 'INR',
      status: 'captured',
    })
    mockCreate.mockResolvedValueOnce({ id: 101, orderNumber: 'SH-101' })

    const req = new Request('http://localhost/api/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isCod: false,
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        shippingAddress,
        guestEmail: 'online@example.com',
        cartItems: [{ product: '202', quantity: 1, unitPrice: 2500 }],
      }),
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.orderNumber).toBe('SH-101')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'orders',
        data: expect.objectContaining({
          status: 'confirmed',
          paymentId,
          paymentReference: orderId,
        }),
      }),
    )
  })

  it('captures authorized payments and creates order', async () => {
    const keySecret = 'test_secret'
    process.env.RAZORPAY_KEY_ID = 'rzp_live_test'
    process.env.RAZORPAY_KEY_SECRET = keySecret

    const orderId = 'order_auth_123'
    const paymentId = 'pay_auth_456'
    const signature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    mockOrdersFetch.mockResolvedValueOnce({
      id: orderId,
      amount: 265000,
      currency: 'INR',
    })
    mockPaymentsFetch.mockResolvedValueOnce({
      id: paymentId,
      order_id: orderId,
      amount: 265000,
      currency: 'INR',
      status: 'authorized',
    })
    mockPaymentsCapture.mockResolvedValueOnce({
      id: paymentId,
      status: 'captured',
    })
    mockCreate.mockResolvedValueOnce({ id: 102, orderNumber: 'SH-102' })

    const req = new Request('http://localhost/api/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isCod: false,
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        shippingAddress,
        guestEmail: 'online@example.com',
        cartItems: [{ product: '202', quantity: 1, unitPrice: 2500 }],
      }),
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(mockPaymentsCapture).toHaveBeenCalledWith(paymentId, 265000, 'INR')
  })

  it('rejects an invalid Razorpay payment signature', async () => {
    process.env.RAZORPAY_KEY_ID = 'rzp_live_test'
    process.env.RAZORPAY_KEY_SECRET = 'test_secret'

    const req = new Request('http://localhost/api/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isCod: false,
        razorpay_order_id: 'order_123',
        razorpay_payment_id: 'pay_123',
        razorpay_signature: 'invalid_signature',
        shippingAddress,
        guestEmail: 'online@example.com',
        cartItems: [{ product: '202', quantity: 1, unitPrice: 2500 }],
      }),
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Invalid payment signature')
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns existing order without duplicate placement when paymentReference matches (idempotency)', async () => {
    mockFind.mockImplementation(
      async ({ collection, where }: { collection: string; where?: any }) => {
        if (collection === 'orders' && where?.paymentReference) {
          return {
            docs: [{ id: 99, orderNumber: 'SH-EXISTING-99' }],
          }
        }
        return { docs: [] }
      },
    )

    const req = new Request('http://localhost/api/razorpay/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        isCod: false,
        razorpay_order_id: 'order_duplicate_test',
        razorpay_payment_id: 'pay_duplicate_test',
        shippingAddress,
        guestEmail: 'online@example.com',
        cartItems: [{ product: '202', quantity: 1, unitPrice: 2500 }],
      }),
    })

    const response = await POST(req)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.orderNumber).toBe('SH-EXISTING-99')
    expect(body.orderId).toBe(99)
    // Order creation must be bypassed completely
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
