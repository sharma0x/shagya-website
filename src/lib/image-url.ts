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
    url.startsWith('https://placehold.co') ||
    url.includes('.r2.cloudflarestorage.com') ||
    url.includes('cdn.shayga.in') ||
    // Local dev: media is served directly from MinIO (generateFileURL falls
    // back to R2_ENDPOINT when R2_CDN is unset), which the Next.js image
    // optimizer rejects as an unconfigured host.
    isLocalMinioUrl(url)
  )
}

function isLocalMinioUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return (
      (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
      parsed.port === '9000'
    )
  } catch {
    return false
  }
}
