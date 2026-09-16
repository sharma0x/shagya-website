import { NextResponse } from 'next/server'

/**
 * GET /api/version
 *
 * Reports which build/version of the app is running. The version is baked
 * into the Docker image at build time via the APP_VERSION build arg (the
 * workflows pass the semantic-release version, e.g. "v1.1.0"). Falls back
 * to "latest" for locally-built images that didn't set APP_VERSION.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      version: process.env.APP_VERSION ?? 'latest',
      environment: process.env.NODE_ENV ?? 'unknown',
    },
    { status: 200 },
  )
}
