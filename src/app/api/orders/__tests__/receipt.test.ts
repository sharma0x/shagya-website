import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks — must be declared before any imports
// ---------------------------------------------------------------------------
const mockFind = vi.fn()
const mockGetSession = vi.fn()
const mockGeneratePdf = vi.fn()

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

vi.mock('@/lib/auth', () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}))

vi.mock('@/lib/receipt', () => ({
  generateOrderReceiptPdf: mockGeneratePdf,
}))

let GET_receipt: (request: Request) => Promise<Response>

const PDF_BYTES = Buffer.from('%PDF-1.4 mock receipt')

function requestWith(params: Record<string, string>): Request {
  const url = new URL('http://localhost/api/orders/receipt')
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return new Request(url.toString())
}

beforeEach(async () => {
  vi.clearAllMocks()
  mockGeneratePdf.mockResolvedValue(PDF_BYTES)
  const mod = await import('../receipt/route')
  GET_receipt = mod.GET
})

describe('GET /api/orders/receipt', () => {
  it('returns 400 when orderNumber is missing', async () => {
    const response = await GET_receipt(requestWith({}))
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('orderNumber is required')
  })

  it('returns 403 when there is no session and no email', async () => {
    mockGetSession.mockResolvedValueOnce(null)

    const response = await GET_receipt(
      requestWith({ orderNumber: 'ORD-00042' }),
    )
    const body = await response.json()

    expect(response.status).toBe(403)
  })

  it('returns 404 when the order does not exist', async () => {
    mockGetSession.mockResolvedValueOnce(null)
    mockFind.mockResolvedValueOnce({ docs: [] })

    const response = await GET_receipt(
      requestWith({ orderNumber: 'ORD-00042', email: 'test@example.com' }),
    )
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe('Order not found')
  })

  it('returns 403 when the guest email does not match the order', async () => {
    mockGetSession.mockResolvedValueOnce(null)
    mockFind.mockResolvedValueOnce({
      docs: [
        {
          orderNumber: 'ORD-00042',
          customerEmail: 'owner@example.com',
        },
      ],
    })

    const response = await GET_receipt(
      requestWith({ orderNumber: 'ORD-00042', email: 'intruder@example.com' }),
    )
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(mockGeneratePdf).not.toHaveBeenCalled()
  })

  it('returns the PDF for a guest with a matching email (case-insensitive)', async () => {
    mockGetSession.mockResolvedValueOnce(null)
    mockFind.mockResolvedValueOnce({
      docs: [
        {
          orderNumber: 'ORD-00042',
          customerEmail: 'Owner@Example.com',
        },
      ],
    })

    const response = await GET_receipt(
      requestWith({ orderNumber: 'ORD-00042', email: 'owner@example.com' }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/pdf')
    expect(response.headers.get('Content-Disposition')).toContain(
      'Shayga-ORD-00042-receipt.pdf',
    )
    expect(mockGeneratePdf).toHaveBeenCalledTimes(1)
  })

  it('returns 403 when the logged-in customer does not own the order', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'user-1', email: 'someone@example.com' },
      session: { id: 'session-1' },
    })
    mockFind.mockResolvedValueOnce({
      docs: [{ id: 'customer-1', email: 'someone@example.com' }],
    })
    mockFind.mockResolvedValueOnce({
      docs: [
        {
          orderNumber: 'ORD-00042',
          customerEmail: 'owner@example.com',
        },
      ],
    })

    const response = await GET_receipt(
      requestWith({ orderNumber: 'ORD-00042' }),
    )
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(mockGeneratePdf).not.toHaveBeenCalled()
  })

  it('returns the PDF for the owner when logged in', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'user-1', email: 'owner@example.com' },
      session: { id: 'session-1' },
    })
    mockFind.mockResolvedValueOnce({
      docs: [{ id: 'customer-1', email: 'owner@example.com' }],
    })
    mockFind.mockResolvedValueOnce({
      docs: [
        {
          orderNumber: 'ORD-00042',
          customerEmail: 'owner@example.com',
          items: [],
        },
      ],
    })

    const response = await GET_receipt(
      requestWith({ orderNumber: 'ORD-00042' }),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/pdf')
  })

  it('returns 403 when a session exists but no customer record matches', async () => {
    mockGetSession.mockResolvedValueOnce({
      user: { id: 'user-1', email: 'owner@example.com' },
      session: { id: 'session-1' },
    })
    mockFind.mockResolvedValueOnce({ docs: [] })

    const response = await GET_receipt(
      requestWith({ orderNumber: 'ORD-00042' }),
    )

    expect(response.status).toBe(403)
  })
})
