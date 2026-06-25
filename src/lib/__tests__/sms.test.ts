import { describe, it, expect, vi, afterEach } from 'vitest'
import { validateIndianPhone, sendSMS } from '../sms'

describe('validateIndianPhone', () => {
  it('returns true for a valid 10-digit number starting with 9', () => {
    expect(validateIndianPhone('9876543210')).toBe(true)
  })

  it('returns true for a valid 10-digit number starting with 8', () => {
    expect(validateIndianPhone('8123456789')).toBe(true)
  })

  it('returns true for a valid 10-digit number starting with 7', () => {
    expect(validateIndianPhone('7998877665')).toBe(true)
  })

  it('returns true for a valid 10-digit number starting with 6', () => {
    expect(validateIndianPhone('6987654321')).toBe(true)
  })

  it('returns false for a number starting with 0', () => {
    expect(validateIndianPhone('0123456789')).toBe(false)
  })

  it('returns false for a number starting with 5', () => {
    expect(validateIndianPhone('5123456789')).toBe(false)
  })

  it('returns false for a number with fewer than 10 digits', () => {
    expect(validateIndianPhone('987654321')).toBe(false)
  })

  it('returns false for a number with more than 10 digits', () => {
    expect(validateIndianPhone('98765432101')).toBe(false)
  })

  it('returns false for a string containing letters', () => {
    expect(validateIndianPhone('98a6543210')).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(validateIndianPhone('')).toBe(false)
  })

  it('returns false for non-numeric characters only', () => {
    expect(validateIndianPhone('abcdefghij')).toBe(false)
  })

  it('returns true for a number with spaces (still 10 digits)', () => {
    // validateIndianPhone strips whitespace
    expect(validateIndianPhone('98765 43210')).toBe(true)
  })

  it('returns true for a number with +91 prefix and 10 digits', () => {
    expect(validateIndianPhone('+919876543210')).toBe(true)
  })

  it('returns true for a number with 91 prefix (no plus) and 10 digits', () => {
    expect(validateIndianPhone('919876543210')).toBe(true)
  })

  it('returns false for a number with +91 prefix but wrong first digit', () => {
    expect(validateIndianPhone('+910123456789')).toBe(false)
  })
})

describe('sendSMS', () => {
  const originalEnv = process.env

  afterEach(() => {
    process.env = { ...originalEnv }
    vi.restoreAllMocks()
  })

  it('is a function', () => {
    expect(sendSMS).toBeDefined()
    expect(typeof sendSMS).toBe('function')
  })

  it('returns success in dev mode when Twilio keys are not set', async () => {
    delete (process.env as Record<string, string | undefined>)
      .TWILIO_ACCOUNT_SID
    delete (process.env as Record<string, string | undefined>).TWILIO_AUTH_TOKEN
    delete (process.env as Record<string, string | undefined>)
      .TWILIO_PHONE_NUMBER

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const result = await sendSMS('9876543210', 'Test OTP: 123456')

    expect(result).toEqual({ success: true, sid: 'dev-mode' })
    expect(consoleSpy).toHaveBeenCalledWith(
      '[SMS Dev] To 9876543210: Test OTP: 123456',
    )
  })

  it('returns success in dev mode when TWILIO_PHONE_NUMBER is missing', async () => {
    process.env.TWILIO_ACCOUNT_SID = 'AC_test'
    process.env.TWILIO_AUTH_TOKEN = 'test_token'
    delete (process.env as Record<string, string | undefined>)
      .TWILIO_PHONE_NUMBER

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    const result = await sendSMS('9876543210', 'Your code: 654321')

    expect(result).toEqual({ success: true, sid: 'dev-mode' })
    expect(consoleSpy).toHaveBeenCalledWith(
      '[SMS Dev] To 9876543210: Your code: 654321',
    )
  })

  it('logs correct recipient and message in dev mode', async () => {
    delete (process.env as Record<string, string | undefined>)
      .TWILIO_ACCOUNT_SID
    delete (process.env as Record<string, string | undefined>).TWILIO_AUTH_TOKEN
    delete (process.env as Record<string, string | undefined>)
      .TWILIO_PHONE_NUMBER

    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await sendSMS('9123456780', 'Shagya OTP: 111222')

    expect(consoleSpy).toHaveBeenCalledWith(
      '[SMS Dev] To 9123456780: Shagya OTP: 111222',
    )
  })

  it('handles multiple dev-mode calls without error', async () => {
    delete (process.env as Record<string, string | undefined>)
      .TWILIO_ACCOUNT_SID
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await sendSMS('9876500001', 'First OTP')
    await sendSMS('9876500002', 'Second OTP')
    await sendSMS('9876500003', 'Third OTP')

    expect(consoleSpy).toHaveBeenCalledTimes(3)
    expect(consoleSpy).toHaveBeenNthCalledWith(
      1,
      '[SMS Dev] To 9876500001: First OTP',
    )
    expect(consoleSpy).toHaveBeenNthCalledWith(
      2,
      '[SMS Dev] To 9876500002: Second OTP',
    )
    expect(consoleSpy).toHaveBeenNthCalledWith(
      3,
      '[SMS Dev] To 9876500003: Third OTP',
    )
  })
})
