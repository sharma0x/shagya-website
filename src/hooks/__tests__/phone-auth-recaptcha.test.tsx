import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePhoneAuth } from '../use-phone-auth'
import { usePhoneVerify } from '../use-phone-verify'

const mocks = vi.hoisted(() => {
  const auth = { name: 'test-auth' }

  return {
    auth,
    getFirebaseAuth: vi.fn(() => auth),
    RecaptchaVerifier: vi.fn(function RecaptchaVerifier() {}),
    signInWithPhoneNumber: vi.fn(),
  }
})

vi.mock('firebase/auth', () => ({
  RecaptchaVerifier: mocks.RecaptchaVerifier,
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
  it('uses an explicit reCAPTCHA verifier for sign-in', async () => {
    const { result } = renderHook(() => usePhoneAuth())

    await act(async () => {
      await result.current.sendOTP('+917678228684')
    })

    expect(mocks.signInWithPhoneNumber).toHaveBeenCalledWith(
      mocks.auth,
      '+917678228684',
      expect.anything(),
    )
    expect(mocks.signInWithPhoneNumber.mock.calls[0]).toHaveLength(3)
  })

  it('uses an explicit reCAPTCHA verifier for phone verification', async () => {
    const { result } = renderHook(() => usePhoneVerify())

    await act(async () => {
      await result.current.sendOTP('+917678228684')
    })

    expect(mocks.signInWithPhoneNumber).toHaveBeenCalledWith(
      mocks.auth,
      '+917678228684',
      expect.anything(),
    )
    expect(mocks.signInWithPhoneNumber.mock.calls[0]).toHaveLength(3)
  })
})
