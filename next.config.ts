import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Tell Turbopack where the project root is (silences multi-lockfile warning)
  turbopack: {
    root: __dirname,
  },

  // Allow Payload admin to set its own headers (including CSP)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ]
  },
}

export default withPayload(nextConfig)
