/**
 * Minimal, SSR-safe wrapper around `window.gtag` (GA4).
 *
 * No external dependency — we inject the official GA4 bootstrap script in
 * `GoogleAnalytics` (client component). Every call here is guarded so it is
 * safe to invoke from any module scope, during SSR, before hydration, or when
 * analytics is not configured (no measurement ID) — events simply no-op.
 *
 * Performance notes:
 *  - The `window.dataLayer` queue + `window.gtag` shim are created at module
 *    scope (a couple of byte-sized assignments, no DOM access) so events
 *    fired before `gtag.js` loads are buffered natively and flushed by the
 *    script once it arrives — zero blocking work on the critical path.
 *  - `gtag.js` itself is loaded async on browser idle (see GoogleAnalytics).
 */

import type { GA4EventName, GA4EventParams } from './types'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[][]
  }
}

/**
 * Create the queue/shim as early as possible (module scope). GA4's own
 * bootstrap uses exactly this pattern: anything pushed before the script
 * loads is replayed by gtag.js in order.
 */
if (typeof window !== 'undefined') {
  window.dataLayer = window.dataLayer || []
  if (!window.gtag) {
    window.gtag = function queueGtag(...args: unknown[]): void {
      window.dataLayer!.push(args)
    }
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? ''

/** Analytics is enabled when a measurement ID is configured at build time. */
export const isAnalyticsEnabled = GA_MEASUREMENT_ID.length > 0

/**
 * Debug logging: always on in development, opt-in via
 * NEXT_PUBLIC_GA_DEBUG=true elsewhere — but NEVER in production builds,
 * where `debug_mode` would silently reroute events to DebugView and void all
 * standard reports.
 */
export const isAnalyticsDebug =
  process.env.NODE_ENV !== 'production' &&
  (process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_GA_DEBUG === 'true')

export function getGtag(): Window['gtag'] {
  if (typeof window === 'undefined') return undefined
  return window.gtag
}

/**
 * Push a raw call onto gtag. No-op when the script has not loaded or is
 * disabled; logs a structured debug line in development.
 */
export function gtag(command: string, ...args: unknown[]): void {
  const fn = getGtag()
  if (!fn) return
  fn(command, ...args)
}

/**
 * Send a GA4 event. In debug mode we:
 *  1. print a colour-coded console line (works without a real GA account),
 *  2. attach `debug_mode` so the event surfaces in GA4 DebugView.
 *
 * When no measurement ID is configured the event is never sent to Google —
 * dev-mode console logging still works, which is the primary local
 * verification path.
 */
export function trackEvent(
  eventName: GA4EventName,
  params: GA4EventParams = {},
): void {
  if (typeof window === 'undefined') return

  const payload = { ...params }
  if (isAnalyticsDebug) {
    payload.debug_mode = true
    console.info(
      `%c[ga4] %c${eventName}`,
      'color:#8b5cf6;font-weight:bold',
      'color:#4b5563',
      params,
    )
  }

  if (!isAnalyticsEnabled) return
  gtag('event', eventName, payload)
}

/**
 * Set a Google user id / property for the current session. Call this after
 * auth state changes (login/logout) so GA4 can stitch cross-device journeys.
 */
export function setAnalyticsUserId(userId: string | null): void {
  const config: Record<string, unknown> = {}
  if (userId) config.user_id = userId
  gtag('config', GA_MEASUREMENT_ID, config)
}
