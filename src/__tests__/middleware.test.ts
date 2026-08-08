import { describe, it, expect } from 'vitest'
import { NextRequest } from 'next/server'
import { middleware, config } from '../middleware'

describe('Next.js Middleware', () => {
  it('defines matcher covering admin and account routes', () => {
    expect(config.matcher).toEqual([
      '/account/:path*',
      '/checkout/:path*',
      '/admin/:path*',
    ])
  })

  it('attaches x-pathname request header for admin requests', async () => {
    const req = new NextRequest('http://localhost:3000/admin/setup-totp', {
      headers: {
        cookie: 'payload-token=mock-token',
      },
    })
    const res = await middleware(req)
    // Next.js passes modified request headers via x-middleware-request-x-pathname
    const headerVal =
      res.headers.get('x-middleware-request-x-pathname') ||
      res.headers.get('x-pathname')
    expect(headerVal).toBe('/admin/setup-totp')
  })

  it('redirects unauthenticated users attempting to access protected admin pages', async () => {
    const req = new NextRequest('http://localhost:3000/admin/setup-totp')
    const res = await middleware(req)
    expect(res.status).toBe(307)
    expect(res.headers.get('location')).toContain('/admin/login')
  })

  it('allows access to admin login page without payload token and sets request pathname header', async () => {
    const req = new NextRequest('http://localhost:3000/admin/login')
    const res = await middleware(req)
    const headerVal =
      res.headers.get('x-middleware-request-x-pathname') ||
      res.headers.get('x-pathname')
    expect(headerVal).toBe('/admin/login')
  })
})
