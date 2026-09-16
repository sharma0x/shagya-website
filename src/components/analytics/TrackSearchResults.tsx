'use client'

import { useEffect, useRef } from 'react'
import {
  trackSearch,
  trackSearchNoResults,
  trackViewSearchResults,
} from '@/lib/analytics/events'

interface TrackSearchResultsProps {
  searchTerm: string
  productCount: number
  postCount: number
}

/**
 * Fires the GA4 search events for the server-rendered `/search` page:
 * `search` (the query was submitted) followed by `view_search_results` or
 * `search_no_results` depending on what came back.
 *
 * The ref tracks the last fired TERM (not a boolean): the component instance
 * survives client-side query refinements (`/search?q=a` → `?q=b`), and every
 * committed search must emit its own events.
 */
export function TrackSearchResults({
  searchTerm,
  productCount,
  postCount,
}: TrackSearchResultsProps) {
  const firedTerm = useRef<string | null>(null)

  useEffect(() => {
    const term = searchTerm.trim()
    if (!term || firedTerm.current === term) return
    firedTerm.current = term

    trackSearch(term)

    const total = productCount + postCount
    if (total === 0) {
      trackSearchNoResults(term)
    } else {
      trackViewSearchResults({ searchTerm: term, resultCount: total })
    }
  }, [searchTerm, productCount, postCount])

  return null
}
