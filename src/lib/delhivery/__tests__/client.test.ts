import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// @vitest-environment node

import { delhiveryFetch, DelhiveryError } from '../client'

const ORIGINAL_ENV = process.env

function setEnv(values: Record<string, string | undefined>) {
  process.env = { ...ORIGINAL_ENV, ...values }
}

describe('delhiveryFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    setEnv({
      DELHIVERY_API_TOKEN: 'test-token-123',
      DELHIVERY_MODE: 'test',
    })
  })

  afterEach(() => {
    process.env = ORIGINAL_ENV
  })

  it('sends Token auth header and hits staging base URL in test mode', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), { status: 200 }),
      )
    vi.stubGlobal('fetch', fetchMock)

    await delhiveryFetch('/api/cmu/create.json', { method: 'POST' })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toBe(
      'https://staging-express.delhivery.com/api/cmu/create.json',
    )
    const headers = new Headers(init.headers)
    expect(headers.get('Authorization')).toBe('Token test-token-123')
  })

  it('uses track.delhivery.com in prod mode', async () => {
    setEnv({ DELHIVERY_API_TOKEN: 'prod-token', DELHIVERY_MODE: 'prod' })
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await delhiveryFetch('/c/api/pin-codes/json/')

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toMatch(/^https:\/\/track\.delhivery\.com\//)
  })

  it('serialises query params', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    await delhiveryFetch('/c/api/pin-codes/json/', {
      query: { filter_codes: '400068,400001', small: true },
    })

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('filter_codes=400068%2C400001')
    expect(url).toContain('small=true')
  })

  it('throws DelhiveryError with status and body on non-2xx', async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(
          new Response('Login or API Key Required', { status: 401 }),
        ),
      )
    vi.stubGlobal('fetch', fetchMock)

    await expect(delhiveryFetch('/c/api/pin-codes/json/')).rejects.toThrow(
      DelhiveryError,
    )

    try {
      await delhiveryFetch('/c/api/pin-codes/json/')
      expect.unreachable()
    } catch (error) {
      const err = error as DelhiveryError
      expect(err.status).toBe(401)
      expect(err.body).toBe('Login or API Key Required')
    }
  })

  it('throws when token is not configured', async () => {
    setEnv({ DELHIVERY_API_TOKEN: '', DELHIVERY_MODE: 'test' })
    await expect(delhiveryFetch('/c/api/pin-codes/json/')).rejects.toThrow(
      'DELHIVERY_API_TOKEN is not configured',
    )
  })

  it('returns undefined for empty body', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response('', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await delhiveryFetch('/empty')
    expect(result).toBeUndefined()
  })
})
