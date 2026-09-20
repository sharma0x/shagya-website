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
const mockFind = vi.fn()
const mockFindByID = vi.fn()

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

// We use dynamic import so the mock is set up before importing the module under test
let syncCustomer: (user: {
  id: string
  email: string
  name: string
  phoneNumber?: string
  firebaseUid?: string
}) => Promise<void>

let syncCustomerForSession: (userId: string) => Promise<void>

let findOrRepairCustomer: (
  userId: string,
) => Promise<Record<string, unknown> | null>

beforeAll(async () => {
  const mod = await import('../auth-sync')
  syncCustomer = mod.syncCustomer
  syncCustomerForSession = mod.syncCustomerForSession
  findOrRepairCustomer = mod.findOrRepairCustomer
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

  it('stores the fallback email for phone users (unique per Firebase UID)', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 4,
          name: 'Phone User',
          email: 'firebase-uid-123@phone.shayga.in',
          phone: '+919876543210',
        },
      ],
    })

    mockFindByID.mockResolvedValueOnce({ id: 4 })

    await syncCustomer({
      id: 'ba-user-789',
      email: 'firebase-uid-123@phone.shayga.in', // Fallback email
      name: 'Phone User',
      phoneNumber: '+919876543210',
    })

    // Fallback email is stored (it's unique per Firebase UID), not blanked
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO customers'),
      [
        'ba-user-789',
        'Phone User',
        'firebase-uid-123@phone.shayga.in',
        '+919876543210',
      ],
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

describe('syncCustomerForSession', () => {
  it('recovers the phone number from the stored Firebase ID token and syncs', async () => {
    const payload = btoa(
      JSON.stringify({ phone_number: '+917678228684', sub: 'fb-uid-1' }),
    )
    const idToken = `header.${payload}.signature`

    // 1. Load user row
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'session-user-1',
          email: 'rtp1haspgkdtdtlngcsfw5fyfse2@phone.shayga.in',
          name: '',
          phoneNumber: '',
        },
      ],
    })
    // 2. Load firebase account row with stored ID token
    mockQuery.mockResolvedValueOnce({ rows: [{ idToken }] })
    // 3. Update user phoneNumber
    mockQuery.mockResolvedValueOnce({ rows: [] })
    // 4. Customer upsert
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 9,
          name: 'Customer',
          email: 'rtp1haspgkdtdtlngcsfw5fyfse2@phone.shayga.in',
          phone: '+917678228684',
        },
      ],
    })
    mockFindByID.mockResolvedValueOnce({ id: 9 })

    await syncCustomerForSession('session-user-1')

    // User phone number update ran with the recovered value + friendly name
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE "user" SET "phoneNumber"'),
      ['+917678228684', 'User 8684', 'session-user-1'],
    )
    // Customer upsert got the recovered phone
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO customers'),
      expect.arrayContaining(['+917678228684']),
    )
  })

  it('creates a phone identity when phone + firebase UID are known', async () => {
    const payload = btoa(
      JSON.stringify({ phone_number: '+917678228684', sub: 'fb-uid-2' }),
    )
    const idToken = `header.${payload}.signature`

    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'session-user-2',
          email: 'x@phone.shayga.in',
          name: '',
          phoneNumber: '',
        },
      ],
    })
    mockQuery.mockResolvedValueOnce({ rows: [{ idToken }] })
    mockQuery.mockResolvedValueOnce({ rows: [] }) // update phoneNumber
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 10, name: 'Customer', email: 'x@phone.shayga.in', phone: '' },
      ],
    })
    mockFindByID.mockResolvedValueOnce({ id: 10 })

    const { createPhoneIdentity } = await import('../phone-identity')

    await syncCustomerForSession('session-user-2')

    expect(createPhoneIdentity).toHaveBeenCalledWith({
      userId: 'session-user-2',
      phoneNumber: '+917678228684',
      firebaseUid: 'fb-uid-2',
    })
  })

  it('is a no-op when the user does not exist', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })

    await expect(syncCustomerForSession('ghost-user')).resolves.toBeUndefined()
    expect(mockQuery).toHaveBeenCalledTimes(1)
  })
})

describe('findOrRepairCustomer', () => {
  it('returns the customer when it already exists', async () => {
    mockFind.mockResolvedValueOnce({
      docs: [{ id: 11, name: 'Existing', email: 'a@b.com' }],
    })

    const customer = await findOrRepairCustomer('session-user-3')

    expect(customer?.id).toBe(11)
    // No repair attempted
    expect(mockFind).toHaveBeenCalledTimes(1)
  })

  it('repairs a missing customer and returns it', async () => {
    // 1st find: no customer
    mockFind.mockResolvedValueOnce({ docs: [] })
    // Repair: load user row
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'session-user-4',
          email: 'y@phone.shayga.in',
          name: '',
          phoneNumber: '',
        },
      ],
    })
    // no firebase account
    mockQuery.mockResolvedValueOnce({ rows: [] })
    // customer upsert
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 12, name: 'Customer', email: 'y@phone.shayga.in', phone: '' },
      ],
    })
    mockFindByID.mockResolvedValueOnce({ id: 12 })
    // 2nd find: customer now exists
    mockFind.mockResolvedValueOnce({
      docs: [{ id: 12, name: 'Customer', email: 'y@phone.shayga.in' }],
    })

    const customer = await findOrRepairCustomer('session-user-4')

    expect(customer?.id).toBe(12)
    expect(mockFind).toHaveBeenCalledTimes(2)
  })

  it('heals an existing customer row with an empty email (broken window)', async () => {
    // 1st find: customer exists but with empty email (stale broken-window row)
    mockFind.mockResolvedValueOnce({
      docs: [{ id: 13, name: 'Customer', email: '' }],
    })
    // Repair: load user row
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'session-user-5',
          email: 'z@phone.shayga.in',
          name: '',
          phoneNumber: '',
        },
      ],
    })
    // no firebase account
    mockQuery.mockResolvedValueOnce({ rows: [] })
    // customer upsert
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 13, name: 'Customer', email: 'z@phone.shayga.in', phone: '' },
      ],
    })
    mockFindByID.mockResolvedValueOnce({ id: 13 })
    // 2nd find: customer now healed with real fallback email
    mockFind.mockResolvedValueOnce({
      docs: [{ id: 13, name: 'Customer', email: 'z@phone.shayga.in' }],
    })

    const customer = await findOrRepairCustomer('session-user-5')

    expect(customer?.id).toBe(13)
    expect(customer?.email).toBe('z@phone.shayga.in')
    expect(mockFind).toHaveBeenCalledTimes(2)
  })
})
