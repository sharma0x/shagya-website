import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports
// ---------------------------------------------------------------------------
const mockFind = vi.fn()
const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockGetSession = vi.fn()

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
        find: mockFind,
        create: mockCreate,
        update: mockUpdate,
      }),
    ),
  }
})

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}))

let GET_wishlist: (request: Request) => Promise<Response>
let POST_wishlist: (request: Request) => Promise<Response>
let DELETE_wishlist: (request: Request) => Promise<Response>

beforeEach(async () => {
  vi.clearAllMocks()
  const mod = await import('../wishlist/route')
  GET_wishlist = mod.GET
  POST_wishlist = mod.POST
  DELETE_wishlist = mod.DELETE
})

describe('GET /api/wishlist', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null)

    const response = await GET_wishlist(
      new Request('http://localhost/api/wishlist'),
    )
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns empty wishlist when authenticated (stub)', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    })

    // Mock Payload calls
    mockFind.mockResolvedValueOnce({
      docs: [{ id: 'customer-1', email: 'test@example.com' }],
    }) // customer
    mockFind.mockResolvedValueOnce({ docs: [] }) // empty wishlist

    const response = await GET_wishlist(
      new Request('http://localhost/api/wishlist'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.items).toEqual([])
    expect(body.message).toBeDefined()
  })
})

describe('POST /api/wishlist', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null)

    const request = new Request('http://localhost/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 1 }),
    })

    const response = await POST_wishlist(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('accepts productId and returns stub response when authenticated', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    })

    // Mock Payload calls
    mockFind.mockResolvedValueOnce({
      docs: [{ id: 'customer-1', email: 'test@example.com' }],
    }) // customer
    mockFind.mockResolvedValueOnce({
      docs: [{ id: 'wishlist-1', customer: 'customer-1', items: [] }],
    }) // wishlist
    mockUpdate.mockResolvedValueOnce({
      id: 'wishlist-1',
      customer: 'customer-1',
      items: [{ product: 42 }],
    }) // update call

    const request = new Request('http://localhost/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 42 }),
    })

    const response = await POST_wishlist(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.productId).toBe(42)
    expect(body.message).toBeDefined()
  })
})

describe('DELETE /api/wishlist', () => {
  it('returns 401 when not authenticated', async () => {
    mockGetSession.mockResolvedValueOnce(null)

    const request = new Request('http://localhost/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 1 }),
    })

    const response = await DELETE_wishlist(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('accepts productId and returns stub response when authenticated', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    })

    // Mock Payload calls
    mockFind.mockResolvedValueOnce({
      docs: [{ id: 'customer-1', email: 'test@example.com' }],
    }) // customer
    mockFind.mockResolvedValueOnce({
      docs: [
        { id: 'wishlist-1', customer: 'customer-1', items: [{ product: 42 }] },
      ],
    }) // wishlist
    mockUpdate.mockResolvedValueOnce({
      id: 'wishlist-1',
      customer: 'customer-1',
      items: [],
    }) // update call (remove product)

    const request = new Request('http://localhost/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 42 }),
    })

    const response = await DELETE_wishlist(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.productId).toBe(42)
    expect(body.message).toBeDefined()
  })

  it('correctly cleans populated product objects when removing an item', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'user-1', email: 'test@example.com' },
      session: { id: 'session-1' },
    })

    mockFind.mockResolvedValueOnce({
      docs: [{ id: 'customer-1', email: 'test@example.com' }],
    })
    mockFind.mockResolvedValueOnce({
      docs: [
        {
          id: 'wishlist-1',
          customer: 'customer-1',
          items: [
            { id: 'item-1', product: { id: 42, name: 'Saree' } },
            { id: 'item-2', product: { id: 99, name: 'Dupatta' } },
          ],
        },
      ],
    })
    mockUpdate.mockResolvedValueOnce({
      id: 'wishlist-1',
      customer: 'customer-1',
      items: [{ product: 99 }],
    })

    const request = new Request('http://localhost/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: '42' }),
    })

    const response = await DELETE_wishlist(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'wishlist',
        id: 'wishlist-1',
        data: {
          items: [{ product: 99 }],
        },
      }),
    )
    expect(body.message).toBe('Product removed from wishlist')
  })
})
