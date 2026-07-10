/**
 * OTP utility — in-memory storage for phone verification.
 * Suitable for dev/single-instance. Migrate to Redis for production.
 */

interface OTPEntry {
  otp: string
  email: string
  expiresAt: number
}

const store = new Map<string, OTPEntry>()

const TTL_MS = 5 * 60 * 1000 // 5 minutes

function cleanExpired() {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.expiresAt < now) store.delete(key)
  }
}

export function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function storeOTP(phone: string, email: string, otp: string): void {
  cleanExpired()
  store.set(phone, { otp, email, expiresAt: Date.now() + TTL_MS })
}

export function verifyOTP(
  phone: string,
  otp: string,
): { valid: boolean; email?: string } {
  cleanExpired()
  const entry = store.get(phone)
  if (!entry || entry.expiresAt < Date.now()) {
    store.delete(phone)
    return { valid: false }
  }
  if (entry.otp !== otp) return { valid: false }
  store.delete(phone) // one-time use
  return { valid: true, email: entry.email }
}

export function hasPendingOTP(phone: string): boolean {
  cleanExpired()
  const entry = store.get(phone)
  return !!entry && entry.expiresAt > Date.now()
}
