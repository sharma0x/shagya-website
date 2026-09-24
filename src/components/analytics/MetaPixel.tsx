'use client'

import { Suspense, useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  initializeMetaPixel,
  isMetaPixelEnabled,
  META_EVENTS,
  trackMetaEvent,
} from '@/lib/analytics/metaPixel'
import { isAnalyticsEnabled } from '@/lib/analytics/gtag'
import { initCartAnalytics } from '@/lib/analytics/subscriptions'

export function MetaPixel() {
  return (
    <Suspense fallback={null}>
      <MetaPixelInner />
    </Suspense>
  )
}

function MetaPixelInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.toString()
  const routeKey = query ? `${pathname}?${query}` : pathname

  useEffect(() => {
    initializeMetaPixel()
  }, [])

  useEffect(() => {
    if (!isMetaPixelEnabled) return
    return initCartAnalytics()
  }, [])

  const previousRouteKey = useRef<string | null>(null)

  useEffect(() => {
    if (!isMetaPixelEnabled) return
    // Skip the initial PageView because layout.tsx base code snippet already sent it.
    if (previousRouteKey.current === null) {
      previousRouteKey.current = routeKey
      return
    }
    if (previousRouteKey.current === routeKey) return
    previousRouteKey.current = routeKey
    trackMetaEvent(META_EVENTS.PAGE_VIEW)
  }, [routeKey])

  return null
}
