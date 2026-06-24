import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Payload module — only mock `getPayload`, keep everything else
const mockFind = vi.fn()
const mockCreate = vi.fn()

vi.mock('payload', async (importOriginal) => {
  const actual: Record<string, unknown> =
    await importOriginal<typeof import('payload')>()
  return {
    ...actual,
    getPayload: vi.fn(() =>
      Promise.resolve({
        find: mockFind,
        create: mockCreate,
      }),
    ),
  }
})

// We use dynamic import so the mock is set up before importing the module under test
let syncCustomer: (user: {
  id: string
  email: string
  name: string
  phoneNumber?: string
}) => Promise<void>

beforeEach(async () => {
  vi.clearAllMocks()
  const mod = await import('../auth-sync')
  syncCustomer = mod.syncCustomer
})

describe('syncCustomer', () => {
  const testUser = {
    id: 'ba-user-123',
    email: 'john@example.com',
    name: 'John Doe',
    phoneNumber: '+919876543210',
  }

  it('creates a new customer when none exists', async () => {
    mockFind.mockResolvedValueOnce({ docs: [] })
    mockCreate.mockResolvedValueOnce({ id: 'cust-1' })

    await syncCustomer(testUser)

    expect(mockFind).toHaveBeenCalledWith({
      collection: 'customers',
      where: { betterAuthUserId: { equals: 'ba-user-123' } },
      limit: 1,
    })

    expect(mockCreate).toHaveBeenCalledWith({
      collection: 'customers',
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+919876543210',
        betterAuthUserId: 'ba-user-123',
      },
      overrideAccess: true,
    })
  })

  it('skips creation when customer already exists', async () => {
    mockFind.mockResolvedValueOnce({ docs: [{ id: 'cust-1' }] })

    await syncCustomer(testUser)

    expect(mockFind).toHaveBeenCalled()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('uses empty string for phone when phoneNumber is undefined', async () => {
    mockFind.mockResolvedValueOnce({ docs: [] })
    mockCreate.mockResolvedValueOnce({ id: 'cust-2' })

    await syncCustomer({
      id: 'ba-user-456',
      email: 'jane@example.com',
      name: 'Jane Doe',
    })

    expect(mockCreate).toHaveBeenCalledWith({
      collection: 'customers',
      data: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '',
        betterAuthUserId: 'ba-user-456',
      },
      overrideAccess: true,
    })
  })

  it('does not throw when Payload fails', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    mockFind.mockRejectedValueOnce(new Error('DB connection failed'))

    // Should not throw
    await expect(syncCustomer(testUser)).resolves.toBeUndefined()

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Auth Sync] Failed to sync customer'),
      expect.any(Error),
    )

    consoleErrorSpy.mockRestore()
  })

  it('does not throw when Payload create fails', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    mockFind.mockResolvedValueOnce({ docs: [] })
    mockCreate.mockRejectedValueOnce(new Error('Validation error'))

    // Should not throw
    await expect(syncCustomer(testUser)).resolves.toBeUndefined()

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Auth Sync] Failed to sync customer'),
      expect.any(Error),
    )

    consoleErrorSpy.mockRestore()
  })
})
