const DEFAULT_ACCOUNT_PATH = '/account'
const ACCOUNT_AUTH_PATHS = new Set(['/account/login', '/account/register'])

function getSafeAccountPath(value: string | null): string | null {
  if (!value) return null

  try {
    const baseURL = new URL('https://shayga.in')
    const targetURL = new URL(value, baseURL)

    if (
      targetURL.origin !== baseURL.origin ||
      (targetURL.pathname !== '/account' &&
        !targetURL.pathname.startsWith('/account/')) ||
      ACCOUNT_AUTH_PATHS.has(targetURL.pathname)
    ) {
      return null
    }

    return `${targetURL.pathname}${targetURL.search}${targetURL.hash}`
  } catch {
    return null
  }
}

export function getPostLoginRedirect(search: string): string {
  const redirect = new URLSearchParams(search).get('redirect')
  return getSafeAccountPath(redirect) ?? DEFAULT_ACCOUNT_PATH
}
