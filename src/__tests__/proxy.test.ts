import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { proxy, config } from '../proxy'
import { getPostLoginRedirect } from '../lib/auth-redirect'

describe('Next.js 16 Proxy', () => {
  it('defines matcher covering admin, account, and checkout routes', () => {
    expect(config.matcher).toEqual([
      '/account/:path*',
      '/checkout/:path*',
      '/admin',
      '/admin/:path*',
    ])
  })

  it('attaches relative x-pathname request header for admin requests', async () => {
    const req = new NextRequest('http://localhost:3000/admin/setup-totp', {
      headers: {
        cookie: 'payload-token=mock-token',
      },
    })
    const res = await proxy(req)
    const headerVal =
      res.headers.get('x-middleware-request-x-pathname') ||
      res.headers.get('x-pathname')
    expect(headerVal).toBe('/admin/setup-totp')
  })

  it('redirects unauthenticated users attempting to access protected admin pages', async () => {
    const req = new NextRequest('http://localhost:3000/admin/setup-totp')
    const res = await proxy(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/admin/login')
  })

  it('allows access to admin login page without payload token and sets request pathname header', async () => {
    const req = new NextRequest('http://localhost:3000/admin/login')
    const res = await proxy(req)
    const headerVal =
      res.headers.get('x-middleware-request-x-pathname') ||
      res.headers.get('x-pathname')
    expect(headerVal).toBe('/admin/login')
  })

  it('includes the requested order page in the login redirect', async () => {
    const req = new NextRequest(
      'http://localhost:3000/account/orders/ORD-00001',
    )
    const res = await proxy(req)
    const location = new URL(res.headers.get('location')!)

    expect(location.pathname).toBe('/account/login')
    expect(location.searchParams.get('redirect')).toBe(
      '/account/orders/ORD-00001',
    )
  })

  it('preserves an internal account destination after login', () => {
    expect(
      getPostLoginRedirect('?redirect=%2Faccount%2Forders%2FORD-00001'),
    ).toBe('/account/orders/ORD-00001')
  })

  it('rejects external and non-account login destinations', () => {
    expect(getPostLoginRedirect('?redirect=https%3A%2F%2Fevil.example')).toBe(
      '/account',
    )
    expect(getPostLoginRedirect('?redirect=%2Fcheckout')).toBe('/account')
  })
})
