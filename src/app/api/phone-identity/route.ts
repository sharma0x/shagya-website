import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import {
  getPhoneIdentityByUserId,
  createPhoneIdentity,
  deletePhoneIdentity,
  updatePhoneIdentity,
  isPhoneNumberTaken,
} from '@/lib/phone-identity'
import { rateLimiter, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit'

// Conditionally import Firebase Admin Auth
let firebaseAdminAuth:
  | ReturnType<typeof import('firebase-admin/auth').getAuth>
  | undefined

const hasFirebaseCredentials =
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL

if (hasFirebaseCredentials) {
  try {
    const { firebaseAdminAuth: auth } = await import('@/lib/firebase-admin')
    firebaseAdminAuth = auth
  } catch (error) {
    console.error('[API] Failed to initialize Firebase Admin Auth:', error)
  }
}

/**
 * GET /api/phone-identity
 * Get the current user's phone identity (verified phone for login)
 */
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const phoneIdentity = await getPhoneIdentityByUserId(session.user.id)

    if (!phoneIdentity) {
      return NextResponse.json({ phoneIdentity: null })
    }

    // Return phone identity without sensitive Firebase UID
    return NextResponse.json({
      phoneIdentity: {
        phoneNumber: phoneIdentity.phoneNumber,
        verifiedAt: phoneIdentity.verifiedAt,
      },
    })
  } catch (error: any) {
    console.error('[API] GET /api/phone-identity error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    )
  }
}

/**
 * POST /api/phone-identity
 * Verify and add a phone number for authentication
 *
 * Body: { phoneNumber: string, firebaseIdToken: string }
 */
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting - check before processing
    const identifier = getClientIdentifier(request, session.user.id)
    const rateLimit = rateLimiter.check(
      identifier,
      RATE_LIMITS.PHONE_VERIFY.maxRequests,
      RATE_LIMITS.PHONE_VERIFY.windowMs,
    )

    if (rateLimit.limited) {
      return NextResponse.json(
        {
          error: RATE_LIMITS.PHONE_VERIFY.message,
          retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(
              (rateLimit.resetAt - Date.now()) / 1000,
            ).toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetAt).toISOString(),
          },
        },
      )
    }

    const body = await request.json()
    const { phoneNumber, firebaseIdToken } = body

    if (!phoneNumber || !firebaseIdToken) {
      return NextResponse.json(
        { error: 'Missing phoneNumber or firebaseIdToken' },
        { status: 400 },
      )
    }

    // Verify the Firebase ID token
    if (!firebaseAdminAuth) {
      console.warn('[API] POST /api/phone-identity - Firebase not configured')
      return NextResponse.json(
        { error: 'Phone authentication is currently unavailable' },
        { status: 503 }, // Service Unavailable instead of 500
      )
    }

    // Rate limit Firebase token verification
    const tokenRateLimit = rateLimiter.check(
      `firebase-post:${identifier}`,
      RATE_LIMITS.FIREBASE_TOKEN.maxRequests,
      RATE_LIMITS.FIREBASE_TOKEN.windowMs,
    )

    if (tokenRateLimit.limited) {
      return NextResponse.json(
        { error: RATE_LIMITS.FIREBASE_TOKEN.message },
        { status: 429 },
      )
    }

    let decodedToken
    try {
      decodedToken = await firebaseAdminAuth.verifyIdToken(firebaseIdToken)
    } catch (err) {
      console.error('[API] Firebase token verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid or expired Firebase token' },
        { status: 401 },
      )
    }

    // Verify that the phone number in the token matches the provided phone number
    const tokenPhoneNumber = decodedToken.phone_number
    if (!tokenPhoneNumber || tokenPhoneNumber !== phoneNumber) {
      console.warn('[API] Phone number mismatch:', {
        provided: phoneNumber,
        inToken: tokenPhoneNumber,
      })
      return NextResponse.json(
        { error: 'Phone number mismatch' },
        { status: 400 },
      )
    }

    // Check if phone number is already taken
    const isTaken = await isPhoneNumberTaken(phoneNumber)
    if (isTaken) {
      return NextResponse.json(
        {
          error:
            'This phone number is already linked to another account. Please log in with that account or use a different number.',
        },
        { status: 409 },
      )
    }

    // Create phone identity
    const phoneIdentity = await createPhoneIdentity({
      userId: session.user.id,
      phoneNumber,
      firebaseUid: decodedToken.uid,
    })

    return NextResponse.json({
      success: true,
      phoneIdentity: {
        phoneNumber: phoneIdentity.phoneNumber,
        verifiedAt: phoneIdentity.verifiedAt,
      },
    })
  } catch (error: any) {
    console.error('[API] POST /api/phone-identity error:', error)

    // Only expose known safe error messages
    const safeErrors = [
      'Invalid phone number format',
      'This phone number is already linked to another account',
      'User already has a verified phone number',
      'This Firebase UID is already linked to another account',
    ]

    const isSafeError = safeErrors.some((safe) => error.message?.includes(safe))
    const errorMessage = isSafeError
      ? error.message
      : 'Failed to add phone number. Please try again.'

    const status = error.message?.includes('already linked') ? 409 : 500

    return NextResponse.json({ error: errorMessage }, { status })
  }
}

/**
 * PUT /api/phone-identity
 * Update phone number (requires re-verification via Firebase OTP)
 *
 * Body: { phoneNumber: string, firebaseIdToken: string }
 */
export async function PUT(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const identifier = getClientIdentifier(request, session.user.id)
    const rateLimit = rateLimiter.check(
      `phone-update:${identifier}`,
      RATE_LIMITS.PHONE_VERIFY.maxRequests,
      RATE_LIMITS.PHONE_VERIFY.windowMs,
    )

    if (rateLimit.limited) {
      return NextResponse.json(
        { error: RATE_LIMITS.PHONE_VERIFY.message },
        { status: 429 },
      )
    }

    const body = await request.json()
    const { phoneNumber, firebaseIdToken } = body

    if (!phoneNumber || !firebaseIdToken) {
      return NextResponse.json(
        { error: 'Missing phoneNumber or firebaseIdToken' },
        { status: 400 },
      )
    }

    // Verify the Firebase ID token
    if (!firebaseAdminAuth) {
      console.warn('[API] PUT /api/phone-identity - Firebase not configured')
      return NextResponse.json(
        { error: 'Phone authentication is currently unavailable' },
        { status: 503 },
      )
    }

    // Rate limit Firebase token verification
    const tokenRateLimit = rateLimiter.check(
      `firebase-put:${identifier}`,
      RATE_LIMITS.FIREBASE_TOKEN.maxRequests,
      RATE_LIMITS.FIREBASE_TOKEN.windowMs,
    )

    if (tokenRateLimit.limited) {
      return NextResponse.json(
        { error: RATE_LIMITS.FIREBASE_TOKEN.message },
        { status: 429 },
      )
    }

    let decodedToken
    try {
      decodedToken = await firebaseAdminAuth.verifyIdToken(firebaseIdToken)
    } catch (err) {
      console.error('[API] Firebase token verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid or expired Firebase token' },
        { status: 401 },
      )
    }

    // Verify that the phone number in the token matches the provided phone number
    const tokenPhoneNumber = decodedToken.phone_number
    if (!tokenPhoneNumber || tokenPhoneNumber !== phoneNumber) {
      console.warn('[API] Phone number mismatch:', {
        provided: phoneNumber,
        inToken: tokenPhoneNumber,
      })
      return NextResponse.json(
        { error: 'Phone number mismatch' },
        { status: 400 },
      )
    }

    // Update phone identity
    const phoneIdentity = await updatePhoneIdentity(session.user.id, {
      phoneNumber,
      firebaseUid: decodedToken.uid,
    })

    return NextResponse.json({
      success: true,
      phoneIdentity: {
        phoneNumber: phoneIdentity.phoneNumber,
        verifiedAt: phoneIdentity.verifiedAt,
      },
    })
  } catch (error: any) {
    console.error('[API] PUT /api/phone-identity error:', error)

    // Only expose known safe error messages
    const safeErrors = [
      'Invalid phone number format',
      'This phone number is already linked to another account',
      'No phone identity found for this user',
      'This Firebase UID is already linked to another account',
    ]

    const isSafeError = safeErrors.some((safe) => error.message?.includes(safe))
    const errorMessage = isSafeError
      ? error.message
      : 'Failed to update phone number. Please try again.'

    const status = error.message?.includes('already linked') ? 409 : 500

    return NextResponse.json({ error: errorMessage }, { status })
  }
}

/**
 * DELETE /api/phone-identity
 * Remove phone login method from account
 */
export async function DELETE(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await deletePhoneIdentity(session.user.id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[API] DELETE /api/phone-identity error:', error)
    return NextResponse.json(
      { error: 'Failed to remove phone login. Please try again.' },
      { status: 500 },
    )
  }
}
