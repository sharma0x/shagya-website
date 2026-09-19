import { betterAuth } from 'better-auth'
import { passkey } from '@better-auth/passkey'
import { twoFactor } from 'better-auth/plugins'
import { emailOTP } from 'better-auth/plugins/email-otp'
import { firebaseAuthPlugin } from 'better-auth-firebase-auth/server'
import { Pool } from 'pg'
import { getServerURL, getAllowedOrigins } from './env'

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

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.DATABASE_URL?.includes('sslmode=require') ||
    process.env.DATABASE_URL?.includes('neon.tech') ||
    process.env.DATABASE_URL?.includes('rds.amazonaws.com')
      ? { rejectUnauthorized: false }
      : undefined,
})

function runEmailInBackground(label: string, work: () => Promise<void>): void {
  void work().catch((err) => {
    console.error(`[Email] ${label} failed: ${err}`)
  })
}

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET || 'dev-secret-change-in-production',
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
        before: async (user, _context: null | any) => {
          // Set friendly name for phone users
          if (!user.name || user.name === user.id) {
            // If no name or name is the Firebase UID, set a friendly name
            const phoneNumber = (user as any).phoneNumber
            if (phoneNumber && typeof phoneNumber === 'string') {
              user.name = `User ${phoneNumber.slice(-4)}`
            }
          }
          return user
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
              // Don't return fallback email - let it be null for phone-only users
              // This prevents showing fake email addresses in the UI
              return null as any
            },
          }),
        ]
      : []),
  ],
})
