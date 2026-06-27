import { describe, it, expect, vi, afterEach } from 'vitest'
import { sendEmail } from '../email'

describe('sendEmail', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  it('is a function', () => {
    expect(sendEmail).toBeDefined()
    expect(typeof sendEmail).toBe('function')
  })

  it('returns success in dev mode when RESEND_API_KEY is not set', async () => {
    delete (process.env as Record<string, string | undefined>).RESEND_API_KEY
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Subject',
      html: '<p>Hello</p>',
    })

    expect(result).toEqual({ success: true, messageId: 'dev-mode' })
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Email] Would send to test@example.com: Test Subject',
    )
  })

  it('returns success in dev mode when RESEND_API_KEY is the dummy value', async () => {
    process.env.RESEND_API_KEY = 're_test_dummy'
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const result = await sendEmail({
      to: 'user@shayga.com',
      subject: 'Welcome',
      html: '<p>Welcome to Shayga</p>',
    })

    expect(result).toEqual({ success: true, messageId: 'dev-mode' })
    expect(consoleSpy).toHaveBeenCalledWith(
      '[Email] Would send to user@shayga.com: Welcome',
    )
  })

  it('logs the correct subject when in dev mode', async () => {
    process.env.RESEND_API_KEY = 're_test_dummy'
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await sendEmail({
      to: 'hello@example.com',
      subject: 'Sign in to Shayga',
      html: '<p>Magic link</p>',
    })

    expect(consoleSpy).toHaveBeenCalledWith(
      '[Email] Would send to hello@example.com: Sign in to Shayga',
    )
  })

  it('accepts HTML content as the body parameter', async () => {
    delete (process.env as Record<string, string | undefined>).RESEND_API_KEY
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'HTML Test',
      html: '<div><h1>Heading</h1><p>Paragraph</p></div>',
    })

    expect(result).toEqual({ success: true, messageId: 'dev-mode' })
    expect(consoleSpy).toHaveBeenCalledTimes(1)
  })

  it('handles calls with different recipients in dev mode', async () => {
    delete (process.env as Record<string, string | undefined>).RESEND_API_KEY
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    // First call
    await sendEmail({
      to: 'first@example.com',
      subject: 'First',
      html: '<p>First email</p>',
    })

    // Second call
    await sendEmail({
      to: 'second@example.com',
      subject: 'Second',
      html: '<p>Second email</p>',
    })

    expect(consoleSpy).toHaveBeenCalledTimes(2)
    expect(consoleSpy).toHaveBeenNthCalledWith(
      1,
      '[Email] Would send to first@example.com: First',
    )
    expect(consoleSpy).toHaveBeenNthCalledWith(
      2,
      '[Email] Would send to second@example.com: Second',
    )
  })
})
