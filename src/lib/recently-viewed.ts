import { cookies } from 'next/headers'

const COOKIE_NAME = 'shayga_recently_viewed'
const MAX_ITEMS = 8

/**
 * Read recently viewed product IDs from cookie.
 * Returns them in order (most recent first).
 */
export async function getRecentlyViewedIds(): Promise<string[]> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(COOKIE_NAME)?.value
  if (!raw) return []
  return raw.split(',').filter((id) => id && /^\d+$/.test(id))
}

/**
 * Add a product ID to the recently viewed cookie.
 * Call this from a Server Action or middleware.
 */
export async function addRecentlyViewed(productId: string | number) {
  const cookieStore = await cookies()
  const existing = await getRecentlyViewedIds()
  const id = String(productId)
  const filtered = existing.filter((e) => e !== id)
  const updated = [id, ...filtered].slice(0, MAX_ITEMS)
  cookieStore.set(COOKIE_NAME, updated.join(','), {
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: 'lax',
  })
}
