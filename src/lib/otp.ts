/**
 * OTP utility — cookie-based storage for phone verification.
 * Uses httpOnly cookies with HMAC hashing — works across serverless instances.
 */

import crypto from 'crypto'

const COOKIE_NAME = 'shayga_otp'
const TTL_MS = 5 * 60 * 1000 // 5 minutes

function getSecret(): string {
  return process.env.BETTER_AUTH_SECRET || process.env.PAYLOAD_SECRET || 'fallback-dev-secret'
}

function hashOTP(phone: string, otp: string, expiresAt: number): string {
  const data = `${phone}:${otp}:${expiresAt}`
  const hmac = crypto.createHmac('sha256', getSecret()).update(data).digest('hex')
  return `${expiresAt}:${hmac}`
}

function verifyHash(phone: string, otp: string, token: string): boolean {
  const parts = token.split(':')
  if (parts.length !== 2) return false
  const expiresAt = parseInt(parts[0], 10)
  if (Date.now() > expiresAt) return false
  const expected = hashOTP(phone, otp, expiresAt)
  return expected === token
}

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

/**
 * Creates the OTP cookie value to set on the response.
 */
export function createOTPToken(phone: string, otp: string): string {
  const expiresAt = Date.now() + TTL_MS
  return hashOTP(phone, otp, expiresAt)
}

/**
 * Verifies the OTP against the token from the cookie.
 */
export function verifyOTPToken(phone: string, otp: string, token: string): boolean {
  try {
    return verifyHash(phone, otp, token)
  } catch {
    return false
  }
}

export const OTP_COOKIE_NAME = COOKIE_NAME
export const OTP_TTL_MS = TTL_MS
