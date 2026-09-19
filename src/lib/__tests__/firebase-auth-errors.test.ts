import { describe, expect, it } from 'vitest'
import { phoneAuthErrorMessage } from '../firebase-auth-errors'

describe('phoneAuthErrorMessage', () => {
  it('hides Firebase SMS configuration diagnostics from customers', () => {
    expect(
      phoneAuthErrorMessage(
        {
          code: 'auth/operation-not-allowed',
          message: 'Firebase: SMS unable to be sent until this region enabled.',
        },
        'send',
      ),
    ).toBe(
      'Phone sign-in is temporarily unavailable. Please use email or try again later.',
    )
  })

  it('uses a safe fallback for unrecognized Firebase errors', () => {
    expect(phoneAuthErrorMessage(new Error('internal details'), 'verify')).toBe(
      "We couldn't verify that code. Please try again.",
    )
  })
})
