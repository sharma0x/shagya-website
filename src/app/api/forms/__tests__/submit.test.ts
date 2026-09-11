import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../submit/route'

const mockGetPayload = vi.hoisted(() => vi.fn())

vi.mock('payload', () => ({
  getPayload: mockGetPayload,
}))

vi.mock('@payload-config', () => ({
  default: {},
}))

function mockPayload(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    find: vi.fn().mockResolvedValue({ docs: [] }),
    findByID: vi.fn().mockRejectedValue(new Error('Not Found')),
    create: vi.fn().mockResolvedValue({ id: 'sub-1' }),
    ...overrides,
  }
}

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/forms/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/forms/submit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetPayload.mockResolvedValue(mockPayload())
  })

  it('rejects submissions without the not-a-robot check', async () => {
    const res = await POST(
      makeRequest({ formId: 'form-1', data: { name: 'Bot' }, notRobot: false }),
    )
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.error).toContain('not a robot')
  })

  it('quietly filters honeypot spam without storing', async () => {
    const payload = mockPayload()
    mockGetPayload.mockResolvedValue(payload)
    const res = await POST(
      makeRequest({
        formId: 'form-1',
        data: { name: 'Bot' },
        honeypot: 'filled',
        notRobot: true,
      }),
    )
    expect(res.status).toBe(200)
    expect(payload.create).not.toHaveBeenCalled()
  })

  it('creates a Contact form when the given id does not exist', async () => {
    const payload = mockPayload({
      find: vi.fn().mockResolvedValue({ docs: [] }),
      create: vi
        .fn()
        .mockResolvedValueOnce({ id: 'contact-1' })
        .mockResolvedValueOnce({ id: 'sub-1' }),
    })
    mockGetPayload.mockResolvedValue(payload)

    const res = await POST(
      makeRequest({
        formId: 'default-contact',
        data: { name: 'John' },
        notRobot: true,
      }),
    )
    expect(res.status).toBe(200)
    expect(payload.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        collection: 'forms',
        data: expect.objectContaining({ slug: 'contact' }),
      }),
    )
    expect(payload.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        collection: 'form-submissions',
        data: expect.objectContaining({ form: 'contact-1' }),
      }),
    )
  })

  it('stores a submission for a known form', async () => {
    const payload = mockPayload({
      findByID: vi.fn().mockResolvedValue({ id: 5, title: 'Contact' }),
      create: vi.fn().mockResolvedValue({ id: 'sub-1' }),
    })
    mockGetPayload.mockResolvedValue(payload)

    const res = await POST(
      makeRequest({
        formId: 5,
        data: { name: 'John', message: 'Hello' },
        notRobot: true,
      }),
    )
    expect(res.status).toBe(200)
    expect(payload.create).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'form-submissions',
        data: expect.objectContaining({
          form: 5,
          data: { name: 'John', message: 'Hello' },
        }),
      }),
    )
  })
})
