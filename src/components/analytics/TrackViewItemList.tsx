'use client'

import { useEffect, useRef } from 'react'
import { trackViewItemList } from '@/lib/analytics/events'
import type { AnalyticsProduct } from '@/lib/analytics/mappers'

interface TrackViewItemListProps {
  products: AnalyticsProduct[]
  listId: string
  listName: string
}

/**
 * Fires GA4 `view_item_list` when a product listing renders. The `listId`
 * should be stable per surface (e.g. `category/silk`) so GA4 can join the
 * impression with later `select_item` / `add_to_cart` events.
 */
export function TrackViewItemList({
  products,
  listId,
  listName,
}: TrackViewItemListProps) {
  const firedRef = useRef<string | null>(null)

  useEffect(() => {
    const key = `${listId}:${products.map((p) => p.id).join(',')}`
    if (firedRef.current === key) return
    firedRef.current = key
    trackViewItemList({ products, listId, listName })
  }, [products, listId, listName])

  return null
}
