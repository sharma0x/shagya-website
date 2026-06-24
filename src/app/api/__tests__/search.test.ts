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

let GET_search: (request: Request) => Promise<Response>

beforeEach(async () => {
  vi.clearAllMocks()
  const mod = await import('../search/route')
  GET_search = mod.GET
})

describe('GET /api/search', () => {
  it('returns matching published products', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [
        { id: 1, name: 'Banarasi Silk Saree', status: 'published' },
        { id: 2, name: 'Silk Cotton Blend', status: 'published' },
      ],
      totalDocs: 2,
      page: 1,
      totalPages: 1,
      limit: 20,
    })

    const response = await GET_search(
      new Request('http://localhost/api/search?q=silk'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.docs).toHaveLength(2)
    expect(body.totalDocs).toBe(2)
  })

  it('searches by name using contains operator', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 1,
      totalPages: 0,
      limit: 20,
    })

    await GET_search(new Request('http://localhost/api/search?q=banarasi'))

    const callArgs = mockFind.mock.calls[0][0]
    expect(callArgs.where).toBeDefined()
    expect(callArgs.where.status).toEqual({ equals: 'published' })
    // The search should match name containing the query
    expect(callArgs.where.or).toBeDefined()
  })

  it('searches both name and description', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 1,
      totalPages: 0,
      limit: 20,
    })

    await GET_search(new Request('http://localhost/api/search?q=handwoven'))

    const callArgs = mockFind.mock.calls[0][0]
    const orClause = callArgs.where.or as Array<Record<string, unknown>>
    expect(orClause).toHaveLength(2)
    expect(orClause[0]).toHaveProperty('name')
    expect(orClause[1]).toHaveProperty('description')
  })

  it('returns empty array when no match found', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 1,
      totalPages: 0,
      limit: 20,
    })

    const response = await GET_search(
      new Request('http://localhost/api/search?q=xyznonexistent'),
    )
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.docs).toHaveLength(0)
    expect(body.totalDocs).toBe(0)
  })

  it('uses default pagination values', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 1,
      totalPages: 0,
      limit: 20,
    })

    await GET_search(new Request('http://localhost/api/search?q=test'))

    const callArgs = mockFind.mock.calls[0][0]
    expect(callArgs.page).toBe(1)
    expect(callArgs.limit).toBe(20)
  })

  it('respects page and limit query params', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 3,
      totalPages: 0,
      limit: 5,
    })

    await GET_search(
      new Request('http://localhost/api/search?q=test&page=3&limit=5'),
    )

    const callArgs = mockFind.mock.calls[0][0]
    expect(callArgs.page).toBe(3)
    expect(callArgs.limit).toBe(5)
  })

  it('sets Cache-Control headers', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [],
      totalDocs: 0,
      page: 1,
      totalPages: 0,
      limit: 20,
    })

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

  it('returns 500 on payload error', async () => {
    mockFind.mockRejectedValueOnce(new Error('Database error'))

    const response = await GET_search(
      new Request('http://localhost/api/search?q=test'),
    )
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toBe('Internal Server Error')
  })
})
