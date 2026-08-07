export const getServerURL = (): string => {
  // Client-side: use the browser's current origin — always correct
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  // Server-side in Vercel: use the auto-assigned deployment URL
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // Local development
  return 'http://localhost:3000'
}

export const getAllowedOrigins = (): string[] => {
  return [
    getServerURL(),
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    process.env.VERCEL_BRANCH_URL
      ? `https://${process.env.VERCEL_BRANCH_URL}`
      : '',
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : '',
  ].filter(Boolean)
}
