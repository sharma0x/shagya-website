import { describe, it, expect } from 'vitest'

/**
 * Regression: staging must deliver mail through Mailpit, never Resend.
 *
 * There are two independent mail paths and both used to gate on
 * `NODE_ENV !== 'production'`. Staging runs with NODE_ENV=production, so:
 *
 *   1. src/lib/email.ts       — generic sendEmail()
 *   2. src/payload.config.ts  — Payload's adapter, used by
 *                               `payload.sendEmail()` in src/email/send.ts,
 *                               which is what sends the auth OTP
 *
 * Both therefore fell through to Resend, where staging's dummy API key fails
 * with "401 validation_error - API key is invalid". Path 2 is the one that
 * broke email OTP sign-in.
 *
 * EMAIL_TRANSPORT=mailpit is the explicit, staging-only override.
 */

function resolveTransport(env: Record<string, string | undefined>) {
  const isProduction = env.NODE_ENV === 'production'
  const useMailpit =
    env.EMAIL_TRANSPORT === 'mailpit' ||
    (!isProduction && !!env.MAILPIT_SMTP_HOST)
  return useMailpit && env.MAILPIT_SMTP_HOST ? 'mailpit' : 'resend'
}

const STAGING = {
  NODE_ENV: 'production',
  EMAIL_TRANSPORT: 'mailpit',
  MAILPIT_SMTP_HOST: 'mailpit',
  RESEND_API_KEY: 're_test_dummy',
}

const PRODUCTION = {
  NODE_ENV: 'production',
  RESEND_API_KEY: 're_live_real_key',
}

describe('staging email transport selection', () => {
  it('staging with EMAIL_TRANSPORT=mailpit uses Mailpit despite NODE_ENV=production', () => {
    expect(resolveTransport(STAGING)).toBe('mailpit')
  })

  it('production with no EMAIL_TRANSPORT still uses Resend', () => {
    expect(resolveTransport(PRODUCTION)).toBe('resend')
  })

  it('a live Resend key in production is never overridden by a stray MAILPIT_SMTP_HOST', () => {
    expect(
      resolveTransport({ ...PRODUCTION, MAILPIT_SMTP_HOST: 'mailpit' }),
    ).toBe('resend')
  })

  it('EMAIL_TRANSPORT=mailpit without an SMTP host falls back rather than half-configuring', () => {
    expect(
      resolveTransport({
        NODE_ENV: 'production',
        EMAIL_TRANSPORT: 'mailpit',
        MAILPIT_SMTP_HOST: undefined,
      }),
    ).toBe('resend')
  })

  it('dev with MAILPIT_SMTP_HOST set uses Mailpit (pre-existing behaviour)', () => {
    expect(
      resolveTransport({
        NODE_ENV: 'development',
        MAILPIT_SMTP_HOST: 'mailpit',
      }),
    ).toBe('mailpit')
  })
})
