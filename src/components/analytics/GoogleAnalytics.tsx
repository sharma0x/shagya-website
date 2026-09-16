'use client'

import { Suspense, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import {
  GA_MEASUREMENT_ID,
  gtag,
  isAnalyticsEnabled,
  isAnalyticsDebug,
  setAnalyticsUserId,
} from '@/lib/analytics/gtag'
import { trackPageView } from '@/lib/analytics/events'
import { initCartAnalytics } from '@/lib/analytics/subscriptions'

const GA4_SCRIPT_ID = 'ga4-gtag-script'
let scriptInjected = false

/**
 * Downloads `gtag.js` asynchronously on browser idle — it never blocks
 * hydration, first paint, or LCP. Any events fired before the script arrives
 * are buffered in `window.dataLayer` (created at module scope in gtag.ts) and
 * replayed by gtag.js in order, so no early events are lost.
 *
 * The guard lives INSIDE `inject` because both the idle callback and its
 * timeout fallback can fire on a busy main thread — without the re-check the
 * script would be injected twice and every queued event replayed twice.
 */
function loadGtagScript(): void {
  if (scriptInjected || !isAnalyticsEnabled) return
  scriptInjected = true

  const inject = () => {
    if (document.getElementById(GA4_SCRIPT_ID)) return
    const script = document.createElement('script')
    script.id = GA4_SCRIPT_ID
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`
    document.head.appendChild(script)
  }

  if ('requestIdleCallback' in window) {
    // Fallback in case the browser never reaches idle.
    const timeout = window.setTimeout(inject, 2500)
    window.requestIdleCallback(
      () => {
        window.clearTimeout(timeout)
        inject()
      },
      { timeout: 2500 },
    )
  } else {
    inject()
  }
}

function bootstrapGtag(): void {
  if (!isAnalyticsEnabled) return

  // Consent mode v2 defaults. Analytics storage is granted out of the box —
  // swap these to 'denied' + wire a consent banner before relying on them.
  // Queued before the script loads so gtag.js replays them in order.
  gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })

  gtag('js', new Date())

  // Manual page_view (SPA): the loader below fires it on every route change.
  gtag('config', GA_MEASUREMENT_ID, {
    send_page_view: false,
    ...(isAnalyticsDebug ? { debug_mode: true } : {}),
    currency: 'INR',
  })

  loadGtagScript()
}

/**
 * Bootstraps GA4, tracks page views on route changes, keeps the Google user
 * id in sync, and initializes store-level event subscriptions. Renders
 * nothing. Safe to mount in the root layout for every visitor.
 *
 * `useSearchParams` needs a Suspense boundary so statically prerendered
 * routes (e.g. /account/addresses) don't bail out of static generation —
 * hence the split: the outer shell carries no search-params dependency, the
 * inner tracker is lazily resolved.
 */
export function GoogleAnalytics() {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner />
    </Suspense>
  )
}

function GoogleAnalyticsInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: sessionData } = useSession()

  useEffect(() => {
    bootstrapGtag()
  }, [])

  // Cart store subscription (add/remove/quantity diffs) — once per app mount.
  useEffect(() => {
    if (!isAnalyticsEnabled) return
    return initCartAnalytics()
  }, [])

  // SPA page views.
  useEffect(() => {
    if (!isAnalyticsEnabled) return
    const query = searchParams.toString()
    trackPageView({
      pagePath: query ? `${pathname}?${query}` : pathname,
      pageTitle: typeof document !== 'undefined' ? document.title : undefined,
      pageReferrer:
        typeof document !== 'undefined'
          ? document.referrer || undefined
          : undefined,
    })
  }, [pathname, searchParams])

  // Google user id for cross-device stitching.
  const userId = sessionData?.user?.id
  const prevUserId = useRef<string | null | undefined>(undefined)
  useEffect(() => {
    if (!isAnalyticsEnabled || prevUserId.current === userId) return
    prevUserId.current = userId
    setAnalyticsUserId(userId ?? null)
  }, [userId])

  return null
}
