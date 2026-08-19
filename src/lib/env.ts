export const getServerURL = (): string => {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Server-side. NEXT_PUBLIC_* vars are inlined at build time, so read the
  // runtime-only PAYLOAD_PUBLIC_SERVER_URL first. NEXT_PUBLIC_SERVER_URL is
  // kept only as a fallback (it works in `next dev`, where it isn't inlined).
  if (process.env.PAYLOAD_PUBLIC_SERVER_URL) {
    return process.env.PAYLOAD_PUBLIC_SERVER_URL
  }

  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:3000'
}

export const getAllowedOrigins = (): string[] => {
  const extraOrigins = (process.env.EXTRA_ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  const serverURL = getServerURL()

  // Also allow the www. variant (e.g. https://www.shayga.in) so requests
  // made from the www subdomain aren't rejected by CORS/CSRF/trustedOrigins.
  let wwwURL = ''
  try {
    const url = new URL(serverURL)
    if (!url.hostname.startsWith('www.')) {
      url.hostname = `www.${url.hostname}`
      wwwURL = url.toString().replace(/\/+$/, '')
    }
  } catch {
    wwwURL = ''
  }

  return [
    serverURL,
    wwwURL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    process.env.VERCEL_BRANCH_URL
      ? `https://${process.env.VERCEL_BRANCH_URL}`
      : '',
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '',
    ...extraOrigins,
  ].filter(Boolean)
}
