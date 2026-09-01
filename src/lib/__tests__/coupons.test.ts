import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  mockFind: vi.fn(),
  mockFindByID: vi.fn(),
  mockGetSession: vi.fn(),
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

vi.mock('payload', async (importOriginal) => {
  const actual: Record<string, unknown> =
    await importOriginal<typeof import('payload')>()
  return {
    ...actual,
    getPayload: vi.fn(() =>
      Promise.resolve({
        find: mocks.mockFind,
        findByID: mocks.mockFindByID,
      }),
    ),
  }
})

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: mocks.mockGetSession,
    },
  },
}))

import { getApplicableCoupons } from '@/lib/coupons'

function mockCoupon(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    code: 'SAVE10',
    description: 'Save 10%',
    type: 'percentage',
    value: 10,
    minCartValue: 999,
    maxDiscount: 500,
    endDate: null,
    productsConditions: [],
    collectionsConditions: [],
    customersConditions: [],
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getApplicableCoupons', () => {
  it('maps active coupons to the API response shape', async () => {
    mocks.mockFind.mockResolvedValueOnce({ docs: [mockCoupon()] })

    const result = await getApplicableCoupons()

    expect(mocks.mockFind).toHaveBeenCalledTimes(1)
    expect(result).toEqual([
      {
        id: 1,
        code: 'SAVE10',
        description: 'Save 10%',
        type: 'percentage',
        value: 10,
        minCartValue: 999,
        maxDiscount: 500,
        endDate: null,
      },
    ])
  })

  it('keeps coupons that match the product conditions', async () => {
    mocks.mockFind.mockResolvedValueOnce({
      docs: [mockCoupon({ productsConditions: [21] })],
    })
    mocks.mockFindByID.mockResolvedValueOnce({ id: 21, categories: [] })

    const result = await getApplicableCoupons('21')

    expect(result).toHaveLength(1)
    expect(mocks.mockFindByID).toHaveBeenCalledWith({
      collection: 'products',
      id: '21',
      depth: 1,
    })
  })

  it('drops coupons that do not match the product conditions', async () => {
    mocks.mockFind.mockResolvedValueOnce({
      docs: [mockCoupon({ productsConditions: [99] })],
    })
    mocks.mockFindByID.mockResolvedValueOnce({ id: 21, categories: [] })

    const result = await getApplicableCoupons('21')

    expect(result).toEqual([])
  })

  it('drops coupons that do not match the customer conditions', async () => {
    mocks.mockFind.mockResolvedValueOnce({
      docs: [mockCoupon({ customersConditions: [7] })],
    })
    mocks.mockGetSession.mockResolvedValueOnce({ user: { id: 'user-1' } })
    mocks.mockFind.mockResolvedValueOnce({ docs: [{ id: 99 }] })

    const headers = new Headers()
    const result = await getApplicableCoupons(undefined, headers)

    expect(result).toEqual([])
    expect(mocks.mockGetSession).toHaveBeenCalledWith({ headers })
  })

  it('returns an empty array when no coupons exist', async () => {
    mocks.mockFind.mockResolvedValueOnce({ docs: [] })

    const result = await getApplicableCoupons()

    expect(result).toEqual([])
  })
})
