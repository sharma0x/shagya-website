/**
 * Whether an image URL should bypass Next.js Image Optimization (`unoptimized`)
 * and load directly from its origin.
 *
 * Payload already resizes media into per-size variants, so R2 / CDN images
 * don't need the Next.js optimizer — loading them directly avoids a full VPS
 * round-trip (and the optimizer's 400 on unlisted hosts).
 */
export function isUnoptimizedImage(url?: string | null): boolean {
  if (!url) return false

  return (
    url.includes('.r2.cloudflarestorage.com') ||
    url.includes('cdn.shayga.in') ||
    // Local MinIO (dev): the Next.js optimizer refuses to fetch private-IP
    // origins (localhost → 127.0.0.1) unless `dangerouslyAllowLocalIP` is set,
    // and Payload already serves pre-sized variants, so optimization is wasted.
    url.includes('://localhost:') ||
    url.includes('://127.0.0.1:')
  )
}
