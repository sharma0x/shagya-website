import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'

// Mock database pool
const mockQuery = vi.fn()
vi.mock('../db-pool', () => ({
  getDbPool: vi.fn(() => ({
    query: mockQuery,
  })),
}))

// Mock phone identity functions
vi.mock('../phone-identity', () => ({
  getPhoneIdentityByUserId: vi.fn(() => Promise.resolve(null)),
  createPhoneIdentity: vi.fn(() => Promise.resolve({ id: 1 })),
}))

// Mock the Payload module
const mockFindByID = vi.fn()

vi.mock('payload', async (importOriginal) => {
  const actual: Record<string, unknown> =
    await importOriginal<typeof import('payload')>()
  return {
    ...actual,
    getPayload: vi.fn(() =>
      Promise.resolve({
        findByID: mockFindByID,
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
  firebaseUid?: string
}) => Promise<void>

beforeAll(async () => {
  const mod = await import('../auth-sync')
  syncCustomer = mod.syncCustomer
}, 30000)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('syncCustomer', () => {
  const testUser = {
    id: 'ba-user-123',
    email: 'john@example.com',
    name: 'John Doe',
    phoneNumber: '+919876543210',
    firebaseUid: 'firebase-uid-123',
  }

  it('creates a new customer when none exists (upsert with INSERT)', async () => {
    // Mock successful upsert (returns inserted row)
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+919876543210',
        },
      ],
    })

    // Mock Payload findByID for verification
    mockFindByID.mockResolvedValueOnce({ id: 1 })

    await syncCustomer(testUser)

    // Check that upsert query was called with correct params
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO customers'),
      ['ba-user-123', 'John Doe', 'john@example.com', '+919876543210'],
    )

    // Verify Payload findByID was called to verify customer exists
    expect(mockFindByID).toHaveBeenCalledWith({
      collection: 'customers',
      id: 1,
      overrideAccess: true,
    })
  })

  it('updates existing customer (upsert with UPDATE)', async () => {
    // Mock successful upsert (returns updated row)
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 2,
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+919876543210',
        },
      ],
    })

    mockFindByID.mockResolvedValueOnce({ id: 2 })

    await syncCustomer(testUser)

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('ON CONFLICT (better_auth_user_id)'),
      ['ba-user-123', 'John Doe', 'john@example.com', '+919876543210'],
    )
  })

  it('uses empty string for phone when phoneNumber is undefined', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 3, name: 'Jane Doe', email: 'jane@example.com', phone: '' }],
    })

    mockFindByID.mockResolvedValueOnce({ id: 3 })

    await syncCustomer({
      id: 'ba-user-456',
      email: 'jane@example.com',
      name: 'Jane Doe',
    })

    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO customers'),
      ['ba-user-456', 'Jane Doe', 'jane@example.com', ''],
    )
  })

  it('filters out fallback email for phone users', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 4, name: 'Phone User', email: '', phone: '+919876543210' }],
    })

    mockFindByID.mockResolvedValueOnce({ id: 4 })

    await syncCustomer({
      id: 'ba-user-789',
      email: 'firebase-uid-123@phone.shayga.in', // Fallback email
      name: 'Phone User',
      phoneNumber: '+919876543210',
    })

    // Should use empty string for email (fallback filtered out)
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO customers'),
      ['ba-user-789', 'Phone User', '', '+919876543210'],
    )
  })

  it('throws error when database query fails', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})

    mockQuery.mockRejectedValueOnce(new Error('DB connection lost'))

    // Should throw (not swallow error)
    await expect(syncCustomer(testUser)).rejects.toThrow('DB connection lost')

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[Auth Sync] Failed to sync customer'),
      expect.any(Error),
    )

    consoleErrorSpy.mockRestore()
  })
})
