import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// @vitest-environment node

const mockGetPayload = vi.fn()
const mockProcess = vi.fn()

vi.mock('payload', () => ({
  getPayload: (...args: unknown[]) => mockGetPayload(...args),
}))

vi.mock('@payload-config', () => ({ default: {} }))

vi.mock('@/lib/delhivery/webhook-processor', () => ({
  processDelhiveryWebhook: (...args: unknown[]) => mockProcess(...args),
}))

const ORIGINAL_ENV = process.env

let POST: (request: Request) => Promise<Response>

beforeEach(async () => {
  vi.clearAllMocks()
  process.env = {
    ...ORIGINAL_ENV,
    DELHIVERY_WEBHOOK_SECRET: 'webhook-secret',
  }
  mockGetPayload.mockResolvedValue({})
  mockProcess.mockResolvedValue({ action: 'none', message: 'ok' })
  const mod = await import('../route')
  POST = mod.POST
})

afterEach(() => {
  process.env = ORIGINAL_ENV
})

function signedRequest(body: unknown, signature: string): Request {
  return new Request('http://localhost/api/webhooks/delhivery', {
    method: 'POST',
    headers: { 'x-delhivery-signature': signature },
    body: JSON.stringify(body),
  })
}

describe('POST /api/webhooks/delhivery', () => {
  it('rejects requests with a missing signature', async () => {
    const response = await POST(
      new Request('http://localhost/api/webhooks/delhivery', {
        method: 'POST',
        body: JSON.stringify({ status_type: 'UD' }),
      }),
    )
    expect(response.status).toBe(401)
    expect(mockProcess).not.toHaveBeenCalled()
  })

  it('accepts the documented Delhivery payload with the configured header', async () => {
    const response = await POST(
      signedRequest(
        {
          Shipment: {
            Status: { StatusType: 'UD', Status: 'In Transit' },
            AWB: 'AWB-1',
          },
        },
        'webhook-secret',
      ),
    )
    expect(response.status).toBe(200)
    expect(mockProcess).toHaveBeenCalledTimes(1)
  })

  it('rejects requests with an invalid signature', async () => {
    const response = await POST(
      signedRequest({ status_type: 'UD' }, 'wrong-signature'),
    )
    expect(response.status).toBe(401)
    expect(mockProcess).not.toHaveBeenCalled()
  })

  it('returns 500 when the webhook secret is not configured', async () => {
    delete process.env.DELHIVERY_WEBHOOK_SECRET
    const response = await POST(
      signedRequest({ status_type: 'UD' }, 'webhook-secret'),
    )
    expect(response.status).toBe(500)
  })

  it('processes a validly signed payload', async () => {
    const response = await POST(
      signedRequest(
        { status_type: 'UD', status: 'In Transit' },
        'webhook-secret',
      ),
    )
    expect(response.status).toBe(200)
    expect(mockProcess).toHaveBeenCalledTimes(1)
    const body = await response.json()
    expect(body.ok).toBe(true)
  })

  it('returns 400 for malformed JSON', async () => {
    const request = new Request('http://localhost/api/webhooks/delhivery', {
      method: 'POST',
      headers: { 'x-delhivery-signature': 'webhook-secret' },
      body: '{',
    })
    const response = await POST(request)
    expect(response.status).toBe(400)
    expect(mockProcess).not.toHaveBeenCalled()
  })

  it.each([null, []])('returns 400 for a non-object payload', async (body) => {
    const response = await POST(signedRequest(body, 'webhook-secret'))
    expect(response.status).toBe(400)
    expect(mockProcess).not.toHaveBeenCalled()
  })

  it('returns 500 when the processor throws', async () => {
    mockProcess.mockRejectedValueOnce(new Error('boom'))
    const response = await POST(
      signedRequest({ status_type: 'UD' }, 'webhook-secret'),
    )
    expect(response.status).toBe(500)
  })
})
