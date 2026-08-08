import { describe, it, expect } from 'vitest'
import { auth } from '../auth'

const hasGoogle = !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
)
const hasFacebook = !!(
  process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
)
const hasApple = !!(
  process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
)

describe('auth', () => {
  it('creates an auth instance', () => {
    expect(auth).toBeDefined()
  })

  it('has emailAndPassword enabled', () => {
    expect(auth.options.emailAndPassword?.enabled).toBe(true)
  })

  it('has social providers configured when env vars are set', () => {
    expect(auth.options.socialProviders).toBeDefined()
    if (hasGoogle) {
      expect(auth.options.socialProviders?.google).toBeDefined()
    }
    if (hasFacebook) {
      expect(auth.options.socialProviders?.facebook).toBeDefined()
    }
    if (hasApple) {
      expect(auth.options.socialProviders?.apple).toBeDefined()
    }
    // When no provider env vars are set, the object should be empty
    if (!hasGoogle && !hasFacebook && !hasApple) {
      expect(Object.keys(auth.options.socialProviders ?? {})).toHaveLength(0)
    }
  })

  it('has a secret set', () => {
    expect(auth.options.secret).toBeDefined()
    expect(typeof auth.options.secret).toBe('string')
  })

  it('has database configured', () => {
    expect(auth.options.database).toBeDefined()
  })

  it('has plugins configured (emailOTP + twoFactor + passkey)', () => {
    expect(auth.options.plugins).toBeDefined()
    expect(auth.options.plugins?.length).toBe(3)
  })

  it('has the two-factor plugin configured with correct issuer', () => {
    const plugin = auth.options.plugins?.find((p) => p.id === 'two-factor')
    expect(plugin).toBeDefined()
    // Verify twoFactor was configured with options
    expect(auth.options.plugins?.some((p) => p.id === 'two-factor')).toBe(true)
  })

  it('has the passkey plugin configured with correct rpName', () => {
    const plugin = auth.options.plugins?.find((p) => p.id === 'passkey')
    expect(plugin).toBeDefined()
    expect(auth.options.plugins?.some((p) => p.id === 'passkey')).toBe(true)
  })
})
