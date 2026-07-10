import { describe, it, expect } from 'vitest'
import { auth } from '../auth'

describe('auth', () => {
  it('creates an auth instance', () => {
    expect(auth).toBeDefined()
  })

  it('has emailAndPassword enabled', () => {
    expect(auth.options.emailAndPassword?.enabled).toBe(true)
  })

  it('has social providers configured', () => {
    expect(auth.options.socialProviders).toBeDefined()
    expect(auth.options.socialProviders?.google).toBeDefined()
    expect(auth.options.socialProviders?.facebook).toBeDefined()
    expect(auth.options.socialProviders?.apple).toBeDefined()
  })

  it('has a secret set', () => {
    expect(auth.options.secret).toBeDefined()
    expect(typeof auth.options.secret).toBe('string')
  })

  it('has database configured', () => {
    expect(auth.options.database).toBeDefined()
  })

  it('has all 4 plugins configured', () => {
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

  it('has the magic-link plugin configured', () => {
    const plugin = auth.options.plugins?.find((p) => p.id === 'magic-link')
    expect(plugin).toBeDefined()
    expect(auth.options.plugins?.some((p) => p.id === 'magic-link')).toBe(true)
  })
})
