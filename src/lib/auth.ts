import { betterAuth } from 'better-auth'
import { passkey } from '@better-auth/passkey'
import { twoFactor } from 'better-auth/plugins'
import { emailOTP } from 'better-auth/plugins/email-otp'
import { firebaseAuthPlugin } from 'better-auth-firebase-auth/server'
import { getServerURL, getAllowedOrigins } from './env'
import { getDbPool } from './db-pool'

// Conditionally import Firebase Admin Auth
let firebaseAdminAuth:
  | ReturnType<typeof import('firebase-admin/auth').getAuth>
  | undefined

// Check if Firebase Admin credentials are available
const hasFirebaseCredentials =
  process.env.FIREBASE_ADMIN_PROJECT_ID &&
  process.env.FIREBASE_ADMIN_PRIVATE_KEY &&
  process.env.FIREBASE_ADMIN_CLIENT_EMAIL

if (hasFirebaseCredentials) {
  try {
    const { firebaseAdminAuth: auth } = await import('./firebase-admin')
    firebaseAdminAuth = auth
  } catch (error) {
    console.error('[Auth] Failed to initialize Firebase Admin Auth:', error)
    // Continue without Firebase Auth - it's optional
  }
}

// Use shared database pool to prevent connection exhaustion
const pool = getDbPool()

/**
 * Retry email sending with exponential backoff
 */
async function retryEmail(
  fn: () => Promise<void>,
  maxRetries = 3,
): Promise<void> {
  let lastError: Error | undefined
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await fn()
      return // Success
    } catch (error) {
      lastError = error as Error
      if (attempt < maxRetries - 1) {
        const delay = 1000 * Math.pow(2, attempt) // 1s, 2s, 4s
        console.log(
          `[Email] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`,
        )
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }
  throw lastError
}

/**
 * Run email sending in background with retry logic
 */
function runEmailInBackground(label: string, work: () => Promise<void>): void {
  void retryEmail(work)
    .then(() => {
      console.log(`[Email] ${label} sent successfully`)
    })
    .catch((err) => {
      console.error(`[Email] ${label} failed after retries:`, err)
      // TODO: Add monitoring/alerting here (e.g., Sentry, CloudWatch)
    })
}

// Validate critical environment variables at startup
if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error(
    'BETTER_AUTH_SECRET is required. Generate one with: openssl rand -base64 32',
  )
}

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: getServerURL(),
  trustedOrigins: getAllowedOrigins(),
  user: {
    additionalFields: {
      phoneNumber: {
        type: 'string',
        required: false,
        input: false, // Don't allow users to set this directly
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      runEmailInBackground('sendResetPasswordEmail', async () => {
        const { getPayload } = await import('payload')
        const config = (await import('@payload-config')).default
        const { sendResetPasswordEmail: send } = await import('@/email/send')
        const payload = await getPayload({ config })
        await send(payload, user.email, user.name || '', url)
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600,
    sendVerificationEmail: async ({ user, url }) => {
      runEmailInBackground('sendVerificationEmail', async () => {
        const { getPayload } = await import('payload')
        const config = (await import('@payload-config')).default
        const { sendVerificationEmail: send } = await import('@/email/send')
        const payload = await getPayload({ config })
        await send(payload, user.email, user.name || '', url)
      })
    },
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET
      ? {
          facebook: {
            clientId: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
          },
        }
      : {}),
    ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
      ? {
          apple: {
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET,
          },
        }
      : {}),
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          // Set friendly name for phone users
          if (!user.name || user.name === user.id) {
            // If no name or name is the Firebase UID, set a friendly name
            if (user.phoneNumber && typeof user.phoneNumber === 'string') {
              user.name = `User ${user.phoneNumber.slice(-4)}`
            }
          }
          return { data: user }
        },
        after: async (user) => {
          const { syncCustomer } = await import('./auth-sync')
          await syncCustomer(user)
        },
      },
    },
  },
  plugins: [
    emailOTP({
      resendStrategy: 'reuse',
      rateLimit: { window: 60, max: 3 },
      sendVerificationOTP: async ({ email, otp }) => {
        runEmailInBackground('sendOTPEmail', async () => {
          const { sendOTPEmail: send } = await import('@/email/send')
          await send(email, otp)
        })
      },
    }),
    twoFactor({
      issuer: 'Shayga',
      backupCodeOptions: { amount: 8 },
    }),
    passkey({
      rpName: 'Shayga',
      rpID: new URL(getServerURL()).hostname,
      origin: getServerURL(),
    }),
    ...(firebaseAdminAuth
      ? [
          firebaseAuthPlugin({
            useClientSideTokens: true,
            firebaseAdminAuth,
            getPhoneUserFallbackEmail: ({
              uid,
              phoneNumber,
            }: {
              uid: string
              phoneNumber?: string
            }) => {
              // Return a fallback email that will be filtered out in the UI
              // This is required by the Firebase plugin but won't be displayed
              return `${uid}@phone.shayga.in`
            },
          }),
        ]
      : []),
  ],
})
