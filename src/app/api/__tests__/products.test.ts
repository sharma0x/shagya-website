import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports
// ---------------------------------------------------------------------------
const mockFind = vi.fn()

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
      }),
    ),
  }
})

// Dynamic imports so mocks are applied first
let GET_products: (request: Request, ctx?: any) => Promise<Response>
let GET_productBySlug: (
  request: Request,
  ctx: { params: Promise<{ slug: string }> },
) => Promise<Response>

beforeEach(async () => {
  vi.clearAllMocks()
})

describe('GET /api/products', () => {
  beforeEach(async () => {
    const mod = await import('../products/route')
    GET_products = mod.GET
  })

  it('returns published products with pagination metadata', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [
        { id: 1, name: 'Silk Saree', status: 'published' },
        { id: 2, name: 'Cotton Saree', status: 'published' },
      ],
      totalDocs: 2,
      page: 1,
      totalPages: 1,
      limit: 20,
    })

    const response = await GET_products(
      new Request('http://localhost/api/products'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.docs).toHaveLength(2)
    expect(body.totalDocs).toBe(2)
    expect(body.page).toBe(1)
    expect(body.totalPages).toBe(1)
    expect(body.limit).toBe(20)
  })

  it('always includes status=published in the where clause', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 1,
      totalPages: 0,
      limit: 20,
    })

    await GET_products(new Request('http://localhost/api/products'))

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { equals: 'published' },
        }),
      }),
    )
  })

  it('filters by fabric query param', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 1,
      totalPages: 0,
      limit: 20,
    })

    await GET_products(new Request('http://localhost/api/products?fabric=silk'))

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { equals: 'published' },
          fabric: { equals: 'silk' },
        }),
      }),
    )
  })

  it('filters by weave query param', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 1,
      totalPages: 0,
      limit: 20,
    })

    await GET_products(
      new Request('http://localhost/api/products?weave=banarasi'),
    )

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { equals: 'published' },
          weave: { equals: 'banarasi' },
        }),
      }),
    )
  })

  it('filters by pattern query param', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 1,
      totalPages: 0,
      limit: 20,
    })

    await GET_products(
      new Request('http://localhost/api/products?pattern=embroidered'),
    )

    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { equals: 'published' },
          pattern: { equals: 'embroidered' },
        }),
      }),
    )
  })

  it('filters by minPrice query param', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 1,
      totalPages: 0,
      limit: 20,
    })

    await GET_products(
      new Request('http://localhost/api/products?minPrice=500'),
    )

    const callArgs = mockFind.mock.calls[0][0]
    expect(callArgs.where.basePrice).toBeDefined()
    expect(callArgs.where.basePrice.greater_than_equal).toBe(500)
  })

  it('filters by maxPrice query param', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 1,
      totalPages: 0,
      limit: 20,
    })

    await GET_products(
      new Request('http://localhost/api/products?maxPrice=10000'),
    )

    const callArgs = mockFind.mock.calls[0][0]
    expect(callArgs.where.basePrice).toBeDefined()
    expect(callArgs.where.basePrice.less_than_equal).toBe(10000)
  })

  it('filters by both minPrice and maxPrice together', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 1,
      totalPages: 0,
      limit: 20,
    })

    await GET_products(
      new Request('http://localhost/api/products?minPrice=500&maxPrice=10000'),
    )

    const callArgs = mockFind.mock.calls[0][0]
    expect(callArgs.where.basePrice.greater_than_equal).toBe(500)
    expect(callArgs.where.basePrice.less_than_equal).toBe(10000)
  })

  it('uses default page=1 and limit=20', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 1,
      totalPages: 0,
      limit: 20,
    })

    await GET_products(new Request('http://localhost/api/products'))

    const callArgs = mockFind.mock.calls[0][0]
    expect(callArgs.page).toBe(1)
    expect(callArgs.limit).toBe(20)
  })

  it('respects page and limit query params', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 2,
      totalPages: 0,
      limit: 10,
    })

    await GET_products(
      new Request('http://localhost/api/products?page=2&limit=10'),
    )

    const callArgs = mockFind.mock.calls[0][0]
    expect(callArgs.page).toBe(2)
    expect(callArgs.limit).toBe(10)
  })

  it('sets Cache-Control headers', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 1,
      totalPages: 0,
      limit: 20,
    })

    const response = await GET_products(
      new Request('http://localhost/api/products'),
    )

    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    )
  })

  it('returns 500 on payload error', async () => {
    mockFind.mockRejectedValueOnce(new Error('Database connection failed'))

    const response = await GET_products(
      new Request('http://localhost/api/products'),
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Internal Server Error')
  })
})

describe('GET /api/products/[slug]', () => {
  beforeEach(async () => {
    const mod = await import('../products/[slug]/route')
    GET_productBySlug = mod.GET
    // Mock findByID as we use it (Payload doesn't have native findBySlug in local API;
    // we use find with where slug equals)
  })

  it('returns a single product by slug', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [
        {
          id: 1,
          name: 'Banarasi Silk Saree',
          slug: 'banarasi-silk-saree',
          status: 'published',
        },
      ],
      totalDocs: 1,
    })

    const request = new Request(
      'http://localhost/api/products/banarasi-silk-saree',
    )
    const response = await GET_productBySlug(request, {
      params: Promise.resolve({ slug: 'banarasi-silk-saree' }),
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.slug).toBe('banarasi-silk-saree')
    expect(body.name).toBe('Banarasi Silk Saree')
  })

  it('queries with depth: 2 to populate relationships', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [{ id: 1, slug: 'test-saree', status: 'published' }],
      totalDocs: 1,
    })

    const request = new Request('http://localhost/api/products/test-saree')
    await GET_productBySlug(request, {
      params: Promise.resolve({ slug: 'test-saree' }),
    })

    const callArgs = mockFind.mock.calls[0][0]
    expect(callArgs.depth).toBe(2)
  })

  it('returns 404 when product not found', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
    })

    const request = new Request('http://localhost/api/products/non-existent')
    const response = await GET_productBySlug(request, {
      params: Promise.resolve({ slug: 'non-existent' }),
    })
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe('Not Found')
  })

  it('sets Cache-Control headers', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [{ id: 1, slug: 'test-saree', status: 'published' }],
      totalDocs: 1,
    })

    const request = new Request('http://localhost/api/products/test-saree')
    const response = await GET_productBySlug(request, {
      params: Promise.resolve({ slug: 'test-saree' }),
    })

    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    )
  })

  it('returns 500 on payload error', async () => {
    mockFind.mockRejectedValueOnce(new Error('Database error'))

    const request = new Request('http://localhost/api/products/test-saree')
    const response = await GET_productBySlug(request, {
      params: Promise.resolve({ slug: 'test-saree' }),
    })
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Internal Server Error')
  })
})
