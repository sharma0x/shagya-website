import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockQuery } = vi.hoisted(() => ({ mockQuery: vi.fn() }))

vi.mock('../db-pool', () => ({
  getDbPool: vi.fn(() => ({ query: mockQuery })),
}))

import { isValidE164PhoneNumber, normalizePhoneNumber } from '../phone-number'
import {
  getFirebaseAccountOwner,
  linkFirebaseAccountToUser,
} from '../phone-identity'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('phone number utilities', () => {
  it('normalizes formatted phone numbers before verification', () => {
    expect(normalizePhoneNumber('+91 98765 43210')).toBe('+919876543210')
    expect(isValidE164PhoneNumber('+919876543210')).toBe(true)
  })
})

describe('Firebase account linking', () => {
  it('re-parents a Firebase account when identity previously belonged to another shell user', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'account-1', userId: 'user-b' }],
    })
    mockQuery.mockResolvedValueOnce({ rows: [] }) // for UPDATE query
    const linker = { linkAccount: vi.fn() }

    const result = await linkFirebaseAccountToUser(linker, {
      userId: 'user-a',
      firebaseUid: 'firebase-uid',
      idToken: 'new-token',
    })

    expect(result).toEqual({ id: 'account-1', userId: 'user-a' })
    expect(linker.linkAccount).not.toHaveBeenCalled()
    expect(mockQuery).toHaveBeenCalledTimes(2)
  })

  it('creates the Better Auth Firebase link when the identity is unclaimed', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })
    const linker = {
      linkAccount: vi.fn(async () => ({ id: 'account-2' })),
    }

    await expect(
      linkFirebaseAccountToUser(linker, {
        userId: 'user-a',
        firebaseUid: 'firebase-uid',
        idToken: 'token',
      }),
    ).resolves.toEqual({ id: 'account-2', userId: 'user-a' })
    expect(linker.linkAccount).toHaveBeenCalledWith({
      providerId: 'firebase',
      accountId: 'firebase-uid',
      userId: 'user-a',
      idToken: 'token',
      accessTokenExpiresAt: undefined,
    })
  })

  it('detects duplicate Firebase account rows', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'account-1', userId: 'user-a' },
        { id: 'account-2', userId: 'user-b' },
      ],
    })

    await expect(getFirebaseAccountOwner('firebase-uid')).rejects.toThrow(
      'Multiple Firebase accounts are linked to this identity',
    )
  })
})
