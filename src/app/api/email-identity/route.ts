import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getAccountSecurityDetails,
  sendEmailVerificationOtp,
  verifyAndLinkEmailForUser,
  signBetterAuthCookie,
} from '@/lib/account-linking'
import { getClientIdentifier } from '@/lib/rate-limit'

/**
 * GET /api/email-identity
 * Returns the verified status of the user's email and phone login methods.
 */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const details = await getAccountSecurityDetails(session.user.id)
    return NextResponse.json(details)
  } catch (error: any) {
    console.error('[API] GET /api/email-identity error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/email-identity
 * Body:
 *   1) { action: 'send-otp', email: string }
 *   2) { action: 'verify-otp', email: string, otp: string }
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, email, otp } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
        { status: 400 },
      )
    }

    if (action === 'send-otp') {
      if (!email) {
        return NextResponse.json(
          { error: 'Email address is required' },
          { status: 400 },
        )
      }

      const clientIp = getClientIdentifier(request, session.user.id)
      const result = await sendEmailVerificationOtp({
        currentUserId: session.user.id,
        email,
        clientIp,
      })

      return NextResponse.json(result)
    }

    if (action === 'verify-otp') {
      if (!email || !otp) {
        return NextResponse.json(
          { error: 'Both email and OTP code are required' },
          { status: 400 },
        )
      }

      const result = await verifyAndLinkEmailForUser({
        currentUserId: session.user.id,
        email,
        otp,
      })

      const response = NextResponse.json({
        success: true,
        email: result.email,
        linked: result.linked,
        isEmailVerified: result.isEmailVerified,
      })

      // If accounts were merged into an existing user, update the Better Auth session cookie
      if (result.newSession && process.env.BETTER_AUTH_SECRET) {
        const isProduction = process.env.NODE_ENV === 'production'
        const signedToken = await signBetterAuthCookie(
          result.newSession.token,
          process.env.BETTER_AUTH_SECRET,
        )

        const cookieOptions = {
          path: '/',
          httpOnly: true,
          sameSite: 'lax' as const,
          secure: isProduction,
          maxAge: 7 * 24 * 60 * 60, // 7 days
        }

        // Set the primary session token cookie
        response.cookies.set(
          'better-auth.session_token',
          signedToken,
          cookieOptions,
        )
        if (isProduction) {
          response.cookies.set(
            '__Secure-better-auth.session_token',
            signedToken,
            cookieOptions,
          )
        }

        // Clear session data cache cookie so Next.js doesn't use old user cache
        response.cookies.set('better-auth.session_data', '', {
          path: '/',
          maxAge: 0,
        })
        if (isProduction) {
          response.cookies.set('__Secure-better-auth.session_data', '', {
            path: '/',
            maxAge: 0,
          })
        }
      }

      return response
    }

    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 },
    )
  } catch (error: any) {
    console.error('[API] POST /api/email-identity error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Failed to process email verification request',
      },
      { status: error.status || 400 },
    )
  }
}
