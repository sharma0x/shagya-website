import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePhoneAuth } from '../use-phone-auth'
import { usePhoneVerify } from '../use-phone-verify'

const mocks = vi.hoisted(() => {
  const auth = { name: 'test-auth' }

  return {
    auth,
    getFirebaseAuth: vi.fn(() => auth),
    signInWithPhoneNumber: vi.fn(),
  }
})

vi.mock('firebase/auth', () => ({
  signInWithPhoneNumber: mocks.signInWithPhoneNumber,
}))

vi.mock('@/lib/firebase-client', () => ({
  getFirebaseAuth: mocks.getFirebaseAuth,
}))

vi.mock('@/lib/auth-client', () => ({
  signInWithPhone: vi.fn(),
}))

beforeEach(() => {
  vi.clearAllMocks()
  mocks.signInWithPhoneNumber.mockResolvedValue({
    confirm: vi.fn(),
  })
})

describe('phone authentication reCAPTCHA', () => {
  it('uses Firebase-managed Enterprise reCAPTCHA for sign-in', async () => {
    const { result } = renderHook(() => usePhoneAuth())

    await act(async () => {
      await result.current.sendOTP('+917678228684')
    })

    expect(mocks.signInWithPhoneNumber).toHaveBeenCalledWith(
      mocks.auth,
      '+917678228684',
    )
    expect(mocks.signInWithPhoneNumber.mock.calls[0]).toHaveLength(2)
  })

  it('uses Firebase-managed Enterprise reCAPTCHA for phone verification', async () => {
    const { result } = renderHook(() => usePhoneVerify())

    await act(async () => {
      await result.current.sendOTP('+917678228684')
    })

    expect(mocks.signInWithPhoneNumber).toHaveBeenCalledWith(
      mocks.auth,
      '+917678228684',
    )
    expect(mocks.signInWithPhoneNumber.mock.calls[0]).toHaveLength(2)
  })
})
