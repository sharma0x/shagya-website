import { describe, it, expect, vi, beforeEach } from 'vitest'

// @vitest-environment node

const mockLookupPincode = vi.fn()
const mockGetCached = vi.fn()
const mockSetCache = vi.fn()

vi.mock('@/lib/india-post', () => ({
  lookupPincode: (...args: unknown[]) => mockLookupPincode(...args),
}))

vi.mock('@/lib/pincode-cache', () => ({
  getCached: (...args: unknown[]) => mockGetCached(...args),
  setCache: (...args: unknown[]) => mockSetCache(...args),
}))

let POST: (request: Request) => Promise<Response>

beforeEach(async () => {
  vi.clearAllMocks()
  const mod = await import('../verify/route')
  POST = mod.POST
})

describe('POST /api/pincode/verify', () => {
  it('returns 400 when pincode is missing', async () => {
    const response = await POST(
      new Request('http://localhost/api/pincode/verify', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toMatch(/required/i)
  })

  it('returns 400 on non-numeric pincode', async () => {
    const response = await POST(
      new Request('http://localhost/api/pincode/verify', {
        method: 'POST',
        body: JSON.stringify({ pincode: 'abc' }),
      }),
    )

    expect(response.status).toBe(400)
  })

  it('returns 400 on pincode shorter than 6 digits', async () => {
    const response = await POST(
      new Request('http://localhost/api/pincode/verify', {
        method: 'POST',
        body: JSON.stringify({ pincode: '12345' }),
      }),
    )

    expect(response.status).toBe(400)
  })

  it('returns 400 on pincode starting with 0', async () => {
    const response = await POST(
      new Request('http://localhost/api/pincode/verify', {
        method: 'POST',
        body: JSON.stringify({ pincode: '012345' }),
      }),
    )

    expect(response.status).toBe(400)
  })

  it('returns 200 with cached:false on first hit', async () => {
    mockGetCached.mockReturnValueOnce(null)
    mockLookupPincode.mockResolvedValueOnce({
      pincode: '110001',
      city: 'New Delhi',
      district: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      postOffices: [],
    })

    const response = await POST(
      new Request('http://localhost/api/pincode/verify', {
        method: 'POST',
        body: JSON.stringify({ pincode: '110001' }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.cached).toBe(false)
    expect(body.data.pincode).toBe('110001')
    expect(mockSetCache).toHaveBeenCalledOnce()
  })

  it('returns 200 with cached:true on second hit', async () => {
    const cachedResult = {
      pincode: '110001',
      city: 'New Delhi',
      district: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      postOffices: [],
    }
    mockGetCached.mockReturnValueOnce(cachedResult)

    const response = await POST(
      new Request('http://localhost/api/pincode/verify', {
        method: 'POST',
        body: JSON.stringify({ pincode: '110001' }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.cached).toBe(true)
    expect(body.data).toEqual(cachedResult)
    expect(mockLookupPincode).not.toHaveBeenCalled()
  })

  it('returns 404 when lookupPincode returns null', async () => {
    mockGetCached.mockReturnValueOnce(null)
    mockLookupPincode.mockResolvedValueOnce(null)

    const response = await POST(
      new Request('http://localhost/api/pincode/verify', {
        method: 'POST',
        body: JSON.stringify({ pincode: '999999' }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBeDefined()
  })

  it('returns 500 on thrown error', async () => {
    mockGetCached.mockReturnValueOnce(null)
    mockLookupPincode.mockRejectedValueOnce(new Error('upstream down'))

    const response = await POST(
      new Request('http://localhost/api/pincode/verify', {
        method: 'POST',
        body: JSON.stringify({ pincode: '110001' }),
      }),
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBeDefined()
  })

  it('trims whitespace from pincode input', async () => {
    mockGetCached.mockReturnValueOnce(null)
    mockLookupPincode.mockResolvedValueOnce({
      pincode: '110001',
      city: 'New Delhi',
      district: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      postOffices: [],
    })

    const response = await POST(
      new Request('http://localhost/api/pincode/verify', {
        method: 'POST',
        body: JSON.stringify({ pincode: ' 110001 ' }),
      }),
    )

    expect(response.status).toBe(200)
    expect(mockLookupPincode).toHaveBeenCalledWith('110001')
  })
})
