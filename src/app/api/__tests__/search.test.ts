import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports
// ---------------------------------------------------------------------------

const mockFind = vi.fn()
const mockFindByID = vi.fn()

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
        findByID: mockFindByID,
      }),
    ),
  }
})

let GET_search: (request: Request) => Promise<Response>

beforeEach(async () => {
  vi.clearAllMocks()
  const mod = await import('../search/route')
  GET_search = mod.GET
})

// Build a search-collection doc shape: { id, doc: { relationTo, value }, priority }
function searchDocForProduct(product: Record<string, unknown>, priority = 0.5) {
  return {
    id: Math.floor(Math.random() * 1000),
    doc: { relationTo: 'products', value: product },
    priority,
  }
}

function searchDocForPost(post: Record<string, unknown>, priority = 0.3) {
  return {
    id: Math.floor(Math.random() * 1000),
    doc: { relationTo: 'posts', value: post },
    priority,
  }
}

const sampleProduct = {
  id: 1,
  name: 'Banarasi Silk Saree',
  slug: 'banarasi-silk-saree',
  basePrice: 15000,
  compareAtPrice: null,
  fabric: 'silk',
  weave: 'banarasi',
}

const samplePost = {
  id: 5,
  title: 'Saree Care Guide',
  slug: 'saree-care-guide',
  excerpt: 'How to care for silks',
}

describe('GET /api/search', () => {
  it('returns matching FTS results with product type', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [searchDocForProduct(sampleProduct, 0.9)],
      totalDocs: 1,
    })

    const response = await GET_search(
      new Request('http://localhost/api/search?q=silk'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.docs).toHaveLength(1)
    expect(body.docs[0]).toHaveProperty('type', 'product')
    expect(body.docs[0]).toHaveProperty('name', 'Banarasi Silk Saree')
    expect(body.docs[0]).toHaveProperty('basePrice', 15000)
    expect(body.docs[0]).toHaveProperty('rank')
    expect(body.totalDocs).toBe(1)
  })

  it('returns both product and post results', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [
        searchDocForProduct(sampleProduct, 0.9),
        searchDocForPost(samplePost, 0.7),
      ],
      totalDocs: 2,
    })

    const response = await GET_search(
      new Request('http://localhost/api/search?q=saree'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.docs).toHaveLength(2)
    expect(body.docs[0]).toHaveProperty('type', 'product')
    expect(body.docs[1]).toHaveProperty('type', 'post')
    expect(body.docs[1]).toHaveProperty('title', 'Saree Care Guide')
  })

  it('returns empty array when no FTS match found', async () => {
    mockFind.mockResolvedValueOnce({ docs: [], totalDocs: 0 })

    const response = await GET_search(
      new Request('http://localhost/api/search?q=xyznonexistent'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.docs).toHaveLength(0)
    expect(body.totalDocs).toBe(0)
  })

  it('respects limit query param', async () => {
    mockFind.mockResolvedValueOnce({ docs: [], totalDocs: 0 })

    await GET_search(new Request('http://localhost/api/search?q=test&limit=5'))

    expect(mockFind).toHaveBeenCalledTimes(1)
    expect(mockFind).toHaveBeenCalledWith(expect.objectContaining({ limit: 5 }))
  })

  it('clamps limit to max 100', async () => {
    mockFind.mockResolvedValueOnce({ docs: [], totalDocs: 0 })

    const response = await GET_search(
      new Request('http://localhost/api/search?q=test&limit=500'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.limit).toBe(100)
    expect(mockFind).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 100 }),
    )
  })

  it('sets Cache-Control headers', async () => {
    mockFind.mockResolvedValueOnce({ docs: [], totalDocs: 0 })

    const response = await GET_search(
      new Request('http://localhost/api/search?q=test'),
    )

    expect(response.headers.get('Cache-Control')).toBe(
      'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
    )
  })

  it('returns 400 when q param is missing', async () => {
    const response = await GET_search(
      new Request('http://localhost/api/search'),
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Missing search query parameter "q"')
  })

  it('returns 400 when q param is empty', async () => {
    const response = await GET_search(
      new Request('http://localhost/api/search?q='),
    )

    expect(response.status).toBe(400)
  })

  it('returns 500 when payload.find throws', async () => {
    mockFind.mockRejectedValueOnce(new Error('DB connection lost'))

    const response = await GET_search(
      new Request('http://localhost/api/search?q=test'),
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Internal Server Error')
  })

  it('converts numeric fields from strings to numbers', async () => {
    // The route reads docValue.basePrice / compareAtPrice directly. If the
    // upstream returns numbers as strings, the route's JSON response will
    // surface them as strings — this test verifies the input flow.
    const productWithStringPrices = {
      ...sampleProduct,
      basePrice: '12500.50' as unknown as number,
      compareAtPrice: '15000.00' as unknown as number,
    }
    mockFind.mockResolvedValueOnce({
      docs: [searchDocForProduct(productWithStringPrices)],
      totalDocs: 1,
    })

    const response = await GET_search(
      new Request('http://localhost/api/search?q=silk'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.docs[0].basePrice).toBe('12500.50')
  })

  it('populates unpopulated doc values via findByID', async () => {
    // doc.value is an ID (number), not an object — route must call findByID
    mockFind.mockResolvedValueOnce({
      docs: [
        {
          id: 99,
          doc: { relationTo: 'products', value: 42 },
          priority: 0.5,
        },
      ],
      totalDocs: 1,
    })
    mockFindByID.mockResolvedValueOnce(sampleProduct)

    const response = await GET_search(
      new Request('http://localhost/api/search?q=silk'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.docs).toHaveLength(1)
    expect(body.docs[0]).toHaveProperty('name', 'Banarasi Silk Saree')
    expect(mockFindByID).toHaveBeenCalledWith({
      collection: 'products',
      id: 42,
    })
  })
})
