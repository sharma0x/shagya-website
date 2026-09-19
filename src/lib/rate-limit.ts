/**
 * Simple in-memory rate limiter for API endpoints
 *
 * For production with multiple servers, consider using:
 * - Redis with ioredis
 * - @upstash/ratelimit
 * - express-rate-limit with Redis store
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      const now = Date.now()
      for (const [key, entry] of this.store.entries()) {
        if (entry.resetAt < now) {
          this.store.delete(key)
        }
      }
    }, 60000)
  }

  /**
   * Check if request should be rate limited
   *
   * @param identifier - Unique identifier (e.g., IP address, user ID)
   * @param maxRequests - Maximum requests allowed in window
   * @param windowMs - Time window in milliseconds
   * @returns true if rate limit exceeded
   */
  check(
    identifier: string,
    maxRequests: number,
    windowMs: number,
  ): { limited: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const entry = this.store.get(identifier)

    if (!entry || entry.resetAt < now) {
      // New window
      this.store.set(identifier, {
        count: 1,
        resetAt: now + windowMs,
      })
      return {
        limited: false,
        remaining: maxRequests - 1,
        resetAt: now + windowMs,
      }
    }

    // Existing window
    entry.count++

    if (entry.count > maxRequests) {
      return {
        limited: true,
        remaining: 0,
        resetAt: entry.resetAt,
      }
    }

    return {
      limited: false,
      remaining: maxRequests - entry.count,
      resetAt: entry.resetAt,
    }
  }

  /**
   * Reset rate limit for an identifier (useful for testing)
   */
  reset(identifier: string): void {
    this.store.delete(identifier)
  }

  /**
   * Clear all rate limit data
   */
  clear(): void {
    this.store.clear()
  }

  /**
   * Cleanup timer on shutdown
   */
  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.clear()
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter()

/**
 * Get client identifier from request (IP address or user ID)
 */
export function getClientIdentifier(request: Request, userId?: string): string {
  if (userId) return `user:${userId}`

  // Try to get real IP from headers (considering proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return `ip:${forwarded.split(',')[0].trim()}`
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return `ip:${realIp}`
  }

  // Fallback to a generic identifier
  // In production, you should always have x-forwarded-for from your proxy
  return `ip:unknown`
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Phone identity endpoints - conservative limits
  PHONE_VERIFY: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    message: 'Too many phone verification attempts. Please try again later.',
  },

  // Firebase token verification
  FIREBASE_TOKEN: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many token verification attempts. Please try again later.',
  },

  // Customer profile API
  PROFILE_UPDATE: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many profile update attempts. Please try again later.',
  },

  // General API rate limit
  GENERAL_API: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
    message: 'Too many requests. Please slow down.',
  },
} as const
