'use client'

import { useEffect } from 'react'

const COOKIE_NAME = 'shayga_recently_viewed'
const MAX_ITEMS = 8

export function TrackRecentlyViewed({ productId }: { productId: string }) {
  useEffect(() => {
    try {
      const existing = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${COOKIE_NAME}=`))
        ?.split('=')[1]
        ?.split(',')
        .filter(Boolean) || []

      const filtered = existing.filter((id) => id !== productId)
      const updated = [productId, ...filtered].slice(0, MAX_ITEMS)

      const expiry = new Date()
      expiry.setDate(expiry.getDate() + 30)
      document.cookie = `${COOKIE_NAME}=${updated.join(',')}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`
    } catch {}
  }, [productId])

  return null
}
