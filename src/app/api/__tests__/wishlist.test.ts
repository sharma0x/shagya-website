import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mock auth from @/lib/auth
// ---------------------------------------------------------------------------
const mockGetSession = vi.fn()

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
})
