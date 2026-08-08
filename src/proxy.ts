import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export async function proxy(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  const cleanPath = pathname.replace(/\/$/, '')

  // 1. Better Auth session check for customers
  const sessionCookie = getSessionCookie(request)
  const isLoginPage =
    cleanPath === '/account/login' || cleanPath === '/account/register'
  const isCustomerProtected = cleanPath.startsWith('/account') && !isLoginPage

  if (isCustomerProtected && !sessionCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/account/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // If logged in customer tries to access login/register, redirect to account
  if (isLoginPage && sessionCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/account'
    return NextResponse.redirect(url)
  }

  // 2. Payload token check for admin panel
  const payloadToken = request.cookies.get('payload-token')
  const isAdminPath = cleanPath.startsWith('/admin')
  const isAdminLoginPath =
    cleanPath.startsWith('/admin/login') ||
    cleanPath.startsWith('/admin/logout')

  if (isAdminPath && !isAdminLoginPath && !payloadToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  const requestHeaders = new Headers(request.headers)
  // @clocklimited/payload-2fa formats admin URLs with serverURL (e.g. https://shayga.in/admin/setup-totp).
  // Setting full origin+pathname on x-pathname satisfies strict equality check in TOTPProvider,
  // preventing infinite 308/307 redirect loops on /admin/setup-totp.
  const fullUrl = `${origin}${pathname}`
  requestHeaders.set('x-pathname', fullUrl)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*', '/admin', '/admin/:path*'],
}
