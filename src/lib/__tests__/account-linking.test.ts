import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockQuery, mockClientQuery } = vi.hoisted(() => ({
  mockQuery: vi.fn(),
  mockClientQuery: vi.fn(),
}))

vi.mock('../db-pool', () => ({
  getDbPool: vi.fn(() => ({
    query: mockQuery,
    connect: vi.fn(async () => ({
      query: mockClientQuery,
      release: vi.fn(),
    })),
  })),
}))

const mockSendOTPEmail = vi.fn().mockResolvedValue({ success: true })
vi.mock('@/email/send', () => ({
  sendOTPEmail: (...args: any[]) => mockSendOTPEmail(...args),
}))

vi.mock('../auth-sync', () => ({
  syncCustomerForSession: vi.fn().mockResolvedValue(undefined),
}))

import {
  signBetterAuthCookie,
  getAccountSecurityDetails,
  unlinkPhoneFromUser,
  sendEmailVerificationOtp,
  verifyAndLinkEmailForUser,
} from '../account-linking'

beforeEach(() => {
  mockQuery.mockReset()
  mockClientQuery.mockReset()
  vi.clearAllMocks()
})

describe('signBetterAuthCookie', () => {
  it('correctly creates an HMAC-SHA256 signed cookie token', async () => {
    const token = 'session-token-xyz'
    const secret = 'super-secret-key-12345'
    const signed = await signBetterAuthCookie(token, secret)

    expect(signed).toBeDefined()
    expect(decodeURIComponent(signed)).toContain(`${token}.`)
    const parts = decodeURIComponent(signed).split('.')
    expect(parts.length).toBe(2)
    expect(parts[0]).toBe(token)
    expect(parts[1].length).toBeGreaterThan(10)
  })
})

describe('getAccountSecurityDetails', () => {
  it('identifies phone shell users and masks fallback emails', async () => {
    mockQuery
      // User query
      .mockResolvedValueOnce({
        rows: [
          {
            email: 'firebase-uid-123@phone.shayga.in',
            emailVerified: false,
            phoneNumber: '+919876543210',
          },
        ],
      })
      // getPhoneIdentityByUserId
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            user_id: 'user-1',
            phone_number: '+919876543210',
            firebase_uid: 'firebase-uid-123',
            verified_at: new Date(),
          },
        ],
      })

    const details = await getAccountSecurityDetails('user-1')

    expect(details.email).toBeNull()
    expect(details.isEmailVerified).toBe(false)
    expect(details.phone).toBe('+919876543210')
    expect(details.isPhoneVerified).toBe(true)
    expect(details.canRemovePhone).toBe(false)
  })

  it('recognizes fully verified dual-method accounts', async () => {
    mockQuery
      // User query
      .mockResolvedValueOnce({
        rows: [
          {
            email: 'archana@shayga.com',
            emailVerified: true,
            phoneNumber: '+919876543210',
          },
        ],
      })
      // getPhoneIdentityByUserId
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            user_id: 'user-1',
            phone_number: '+919876543210',
            firebase_uid: 'firebase-uid-123',
            verified_at: new Date(),
          },
        ],
      })

    const details = await getAccountSecurityDetails('user-1')

    expect(details.email).toBe('archana@shayga.com')
    expect(details.isEmailVerified).toBe(true)
    expect(details.phone).toBe('+919876543210')
    expect(details.isPhoneVerified).toBe(true)
    expect(details.canRemovePhone).toBe(true)
    expect(details.canRemoveEmail).toBe(true)
  })
})

describe('unlinkPhoneFromUser', () => {
  it('prevents removing phone login if user has no verified email', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          email: 'xyz@phone.shayga.in',
          emailVerified: false,
        },
      ],
    })

    await expect(unlinkPhoneFromUser('user-1')).rejects.toThrow(
      /Cannot remove phone login without a verified email address/,
    )
  })

  it('successfully unlinks phone when user has a verified email', async () => {
    mockQuery
      // user check
      .mockResolvedValueOnce({
        rows: [
          {
            email: 'user@example.com',
            emailVerified: true,
          },
        ],
      })
      // getPhoneIdentityByUserId
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            user_id: 'user-1',
            phone_number: '+919876543210',
            firebase_uid: 'firebase-1',
          },
        ],
      })
      // getFirebaseAccountOwner
      .mockResolvedValueOnce({
        rows: [{ id: 'account-1', userId: 'user-1' }],
      })
      // DELETE account
      .mockResolvedValueOnce({ rows: [] })
      // DELETE phone_identities
      .mockResolvedValueOnce({ rows: [] })
      // UPDATE user phoneNumber to NULL
      .mockResolvedValueOnce({ rows: [] })

    const result = await unlinkPhoneFromUser('user-1')
    expect(result.success).toBe(true)
  })
})

describe('sendEmailVerificationOtp', () => {
  it('validates email format before sending', async () => {
    await expect(
      sendEmailVerificationOtp({
        currentUserId: 'user-1',
        email: 'invalid-email',
      }),
    ).rejects.toThrow(/Please enter a valid email address/)
  })

  it('stores OTP in verification table and dispatches email', async () => {
    mockQuery
      // DELETE old verification tokens
      .mockResolvedValueOnce({ rows: [] })
      // INSERT new verification token
      .mockResolvedValueOnce({ rows: [] })

    const res = await sendEmailVerificationOtp({
      currentUserId: 'user-1',
      email: 'customer@example.com',
    })

    expect(res.success).toBe(true)
    expect(mockSendOTPEmail).toHaveBeenCalledWith(
      'customer@example.com',
      expect.stringMatching(/^\d{6}$/),
    )
  })
})

describe('verifyAndLinkEmailForUser', () => {
  it('throws when OTP is invalid or expired', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] }) // no matching verification row

    await expect(
      verifyAndLinkEmailForUser({
        currentUserId: 'user-1',
        email: 'customer@example.com',
        otp: '123456',
      }),
    ).rejects.toThrow(/No verification code found/)
  })

  it('marks email verified on current user when email is unclaimed', async () => {
    mockQuery
      // SELECT verification
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'verif-1',
            value: '123456',
            expiresAt: new Date(Date.now() + 60000),
          },
        ],
      })
      // DELETE verification
      .mockResolvedValueOnce({ rows: [] })
      // SELECT user by email (check if exists) -> none
      .mockResolvedValueOnce({ rows: [] })

    mockClientQuery
      // BEGIN
      .mockResolvedValueOnce({ rows: [] })
      // UPDATE user email and emailVerified
      .mockResolvedValueOnce({ rows: [] })
      // COMMIT
      .mockResolvedValueOnce({ rows: [] })

    const result = await verifyAndLinkEmailForUser({
      currentUserId: 'user-1',
      email: 'customer@example.com',
      otp: '123456',
    })

    expect(result.success).toBe(true)
    expect(result.linked).toBe(false)
    expect(result.isEmailVerified).toBe(true)
  })

  it('merges accounts when email already belongs to an existing user', async () => {
    mockQuery
      // SELECT verification
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'verif-1',
            value: '123456',
            expiresAt: new Date(Date.now() + 60000),
          },
        ],
      })
      // DELETE verification
      .mockResolvedValueOnce({ rows: [] })
      // SELECT user by email (existing user)
      .mockResolvedValueOnce({
        rows: [
          {
            id: 'existing-user-2',
            email: 'customer@example.com',
            name: 'Existing Customer',
          },
        ],
      })

    mockClientQuery
      // BEGIN
      .mockResolvedValueOnce({ rows: [] })
      // SELECT phone_identities for current user
      .mockResolvedValueOnce({
        rows: [{ phone_number: '+919876543210', firebase_uid: 'firebase-uid' }],
      })
      // DELETE phone_identities from target
      .mockResolvedValueOnce({ rows: [] })
      // UPDATE phone_identities set user_id = target
      .mockResolvedValueOnce({ rows: [] })
      // UPDATE user set phoneNumber = target
      .mockResolvedValueOnce({ rows: [] })
      // UPDATE account set userId = target
      .mockResolvedValueOnce({ rows: [] })
      // mergeUserData: customers
      .mockResolvedValueOnce({ rows: [] })
      // mergeUserData: addresses
      .mockResolvedValueOnce({ rows: [] })
      // mergeUserData: orders
      .mockResolvedValueOnce({ rows: [] })
      // mergeUserData: delete old sessions
      .mockResolvedValueOnce({ rows: [] })
      // mergeUserData: delete old accounts
      .mockResolvedValueOnce({ rows: [] })
      // mergeUserData: delete old phone identities
      .mockResolvedValueOnce({ rows: [] })
      // mergeUserData: delete old user
      .mockResolvedValueOnce({ rows: [] })
      // INSERT new session for existing user
      .mockResolvedValueOnce({ rows: [] })
      // COMMIT
      .mockResolvedValueOnce({ rows: [] })

    const result = await verifyAndLinkEmailForUser({
      currentUserId: 'shell-user-1',
      email: 'customer@example.com',
      otp: '123456',
    })

    expect(result.success).toBe(true)
    expect(result.linked).toBe(true)
    expect(result.newSession).toBeDefined()
  })
})
