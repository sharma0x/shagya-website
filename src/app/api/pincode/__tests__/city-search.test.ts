import { describe, it, expect, vi, beforeEach } from 'vitest'

// @vitest-environment node

const mockSearchCity = vi.fn()
const mockGetCached = vi.fn()
const mockSetCache = vi.fn()

vi.mock('@/lib/india-post', () => ({
  searchCity: (...args: unknown[]) => mockSearchCity(...args),
}))

vi.mock('@/lib/pincode-cache', () => ({
  getCached: (...args: unknown[]) => mockGetCached(...args),
  setCache: (...args: unknown[]) => mockSetCache(...args),
}))

let GET: (request: Request) => Promise<Response>

beforeEach(async () => {
  vi.clearAllMocks()
  const mod = await import('../city-search/route')
  GET = mod.GET
})

describe('GET /api/pincode/city-search', () => {
  it('returns 400 when city query param is missing', async () => {
    const response = await GET(
      new Request('http://localhost/api/pincode/city-search'),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBeDefined()
  })

  it('returns 400 when city is shorter than 2 chars', async () => {
    const response = await GET(
      new Request('http://localhost/api/pincode/city-search?city=M'),
    )

    expect(response.status).toBe(400)
  })

  it('returns 200 with results array on success', async () => {
    mockGetCached.mockReturnValueOnce(null)
    mockSearchCity.mockResolvedValueOnce([
      {
        city: 'Mumbai',
        state: 'Maharashtra',
        district: 'Mumbai',
        pincodes: ['400001'],
      },
    ])

    const response = await GET(
      new Request('http://localhost/api/pincode/city-search?city=Mumbai'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.cached).toBe(false)
    expect(body.data).toHaveLength(1)
    expect(body.data[0].state).toBe('Maharashtra')
    expect(mockSetCache).toHaveBeenCalledOnce()
  })

  it('returns 200 with cached:true on cache hit', async () => {
    const cachedResults = [
      {
        city: 'Mumbai',
        state: 'Maharashtra',
        district: 'Mumbai',
        pincodes: ['400001'],
      },
    ]
    mockGetCached.mockReturnValueOnce(cachedResults)

    const response = await GET(
      new Request('http://localhost/api/pincode/city-search?city=Mumbai'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.cached).toBe(true)
    expect(body.data).toEqual(cachedResults)
    expect(mockSearchCity).not.toHaveBeenCalled()
  })

  it('returns 404 when searchCity returns an empty array', async () => {
    mockGetCached.mockReturnValueOnce(null)
    mockSearchCity.mockResolvedValueOnce([])

    const response = await GET(
      new Request('http://localhost/api/pincode/city-search?city=Atlantis'),
    )

    expect(response.status).toBe(404)
  })

  it('returns 500 on thrown error', async () => {
    mockGetCached.mockReturnValueOnce(null)
    mockSearchCity.mockRejectedValueOnce(new Error('upstream down'))

    const response = await GET(
      new Request('http://localhost/api/pincode/city-search?city=Mumbai'),
    )

    expect(response.status).toBe(500)
  })

  it('lowercases the cache key for case-insensitive caching', async () => {
    mockGetCached.mockReturnValueOnce(null)
    mockSearchCity.mockResolvedValueOnce([
      {
        city: 'Mumbai',
        state: 'Maharashtra',
        district: 'Mumbai',
        pincodes: ['400001'],
      },
    ])

    await GET(
      new Request('http://localhost/api/pincode/city-search?city=Mumbai'),
    )

    const cacheKey = mockSetCache.mock.calls[0][0] as string
    expect(cacheKey).toBe('city:mumbai')
  })
})
