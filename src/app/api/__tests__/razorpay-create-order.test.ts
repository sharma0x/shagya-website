import { beforeEach, describe, expect, it, vi } from 'vitest'
import { COD_LIMIT_ERROR } from '@/lib/cod-eligibility'

const mockFind = vi.fn()
const mockFindGlobal = vi.fn()
const mockGetSession = vi.fn()
let currentBasePrice = 2500
let serverBasePrice = 2500

vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('payload', () => ({
  getPayload: vi.fn(async () => ({
    find: mockFind,
    findGlobal: mockFindGlobal,
  })),
}))
vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: mockGetSession } },
}))
vi.mock('razorpay', () => ({ default: vi.fn() }))
vi.mock('@/lib/cart-prices', () => ({
  resolveCurrentPrices: vi.fn(
    async (_payload: unknown, items: any[]) =>
      new Map(
        items.map((item) => [
          String(item.product),
          {
            basePrice:
              String(item.product) === '101'
                ? serverBasePrice
                : currentBasePrice,
            productCode: `SKU-${item.product}`,
          },
        ]),
      ),
  ),
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

function createRequest(isGuest = false) {
  return new Request('http://localhost/api/razorpay/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shippingAddress: { fullName: 'Test Customer' },
      isCod: true,
      ...(isGuest
        ? {
            guestEmail: 'test@example.com',
            cartItems: [
              { product: 202, variant: null, quantity: 1, unitPrice: 9999 },
            ],
          }
        : {}),
    }),
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  currentBasePrice = 2500
  serverBasePrice = 2500
  mockGetSession.mockResolvedValue({ user: { id: 'user-1' } })
  mockFind.mockImplementation(
    async ({ collection }: { collection: string }) => {
      if (collection === 'customers') {
        return { docs: [{ id: 7 }] }
      }
      if (collection === 'carts') {
        return {
          docs: [
            {
              id: 42,
              items: [
                { product: 101, variant: null, quantity: 1, unitPrice: 2500 },
              ],
            },
          ],
        }
      }
      return { docs: [] }
    },
  )
  mockFindGlobal.mockResolvedValue({})
})

describe('POST /api/razorpay/create-order COD limit', () => {
  it('uses the current guest cart instead of a stale server cart', async () => {
    serverBasePrice = 3750.01
    const { POST } = await import('../razorpay/create-order/route')

    const response = await POST(createRequest(true))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.total).toBe(2750)
  })

  it('allows a final total of exactly 4000', async () => {
    currentBasePrice = 3750
    const { POST } = await import('../razorpay/create-order/route')

    const response = await POST(createRequest(true))
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.total).toBe(4000)
  })

  it('rejects a final total above 4000', async () => {
    currentBasePrice = 3750.01
    const { POST } = await import('../razorpay/create-order/route')

    const response = await POST(createRequest(true))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe(COD_LIMIT_ERROR)
  })
})
