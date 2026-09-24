import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockQuery } = vi.hoisted(() => ({ mockQuery: vi.fn() }))

vi.mock('../db-pool', () => ({
  getDbPool: vi.fn(() => ({ query: mockQuery })),
}))

import { isValidE164PhoneNumber, normalizePhoneNumber } from '../phone-number'
import {
  getFirebaseAccountOwner,
  linkFirebaseAccountToUser,
  PHONE_LINKED_TO_ANOTHER_ACCOUNT,
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
  it('rejects a number whose verified identity belongs to another account', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 'account-1', userId: 'user-b' }],
    })
    const linker = { linkAccount: vi.fn() }

    await expect(
      linkFirebaseAccountToUser(linker, {
        userId: 'user-a',
        firebaseUid: 'firebase-uid',
      }),
    ).rejects.toThrow(PHONE_LINKED_TO_ANOTHER_ACCOUNT)
    expect(linker.linkAccount).not.toHaveBeenCalled()
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
