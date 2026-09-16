'use client'

import { useEffect, useRef } from 'react'
import { trackViewItem } from '@/lib/analytics/events'
import type { AnalyticsProduct } from '@/lib/analytics/mappers'

interface TrackViewItemProps {
  product: AnalyticsProduct
  listName?: string
}

/**
 * Fires GA4 `view_item` once per product page view. Renders nothing —
 * designed to sit inside server components that already have the product.
 */
export function TrackViewItem({ product, listName }: TrackViewItemProps) {
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    trackViewItem({ product, listName })
  }, [product, listName])

  return null
}
