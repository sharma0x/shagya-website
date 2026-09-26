import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },

  async redirects() {
    return [
      // The cart is a drawer, not a standalone page — /cart is a plausible
      // typed/shared URL that would otherwise 404. Send it to the real flow.
      {
        source: '/cart',
        destination: '/checkout',
        permanent: false,
      },
    ]
  },

  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 300,
    },
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Staging serves media from the in-stack RustFS on a private address. The
    // optimizer refuses upstream images that resolve to a private IP (an SSRF
    // guard), so every staged image 400'd with a misleading "url parameter is
    // not allowed". Bypassing the optimizer lets the browser fetch the file
    // directly. Production is unaffected: this is off unless explicitly set.
    unoptimized: process.env.NEXT_UNOPTIMIZED_IMAGES === 'true',
    remotePatterns: [
      // Staging-only: the media host must be allowlisted by hostname AND port,
      // since Next matches the port separately. Unset on main/production, so
      // the production allowlist stays exactly as it was.
      ...(process.env.STAGING_S3_HOST
        ? [
            {
              protocol: 'http' as const,
              hostname: process.env.STAGING_S3_HOST,
              port: process.env.STAGING_MEDIA_PORT ?? '9000',
              pathname: '/**',
            },
          ]
        : []),
      // The image optimizer fetches upstream SERVER-SIDE, from inside the app
      // container. `localhost` there means the container itself, not the
      // machine hosting the published port, so every optimized image failed
      // with a 400 even though the browser could reach the same URL fine.
      // `host.docker.internal` resolves to the Docker host from a container and
      // is also valid in a browser on macOS/Windows, so one value serves both.
      ...(process.env.MEDIA_PUBLIC_BASE
        ? [
            {
              protocol: 'http' as const,
              hostname:
                process.env.STAGING_MEDIA_HOSTNAME ?? 'host.docker.internal',
              port: process.env.STAGING_MEDIA_PUBLIC_PORT ?? '19000',
              pathname: '/**',
            },
          ]
        : []),
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/**',
      },
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: 'cdn.shayga.in' },
      { protocol: 'https', hostname: 'shayga.in' },
      { protocol: 'https', hostname: 'www.shayga.in' },
    ],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      // NOTE: no Cache-Control override for /_next/static/* — Next already
      // emits immutable caching for hashed prod assets and no-store in dev.
      // Forcing immutable here poisons dev chunks (stable URLs) in the
      // browser cache for a year, serving stale code after rebuilds.
      {
        source: '/(fonts|images)/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=604800',
          },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: true })
