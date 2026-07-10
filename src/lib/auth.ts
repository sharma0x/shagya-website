import { betterAuth } from 'better-auth'
import { passkey } from '@better-auth/passkey'
import { twoFactor, magicLink } from 'better-auth/plugins'
import { Pool } from 'pg'
import { getServerURL, getAllowedOrigins } from './env'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

/**
 * Lazy-load the centralized email senders so this module stays free of a
 * direct Payload dependency at import time (avoids circular imports with
 * payload.config). The Better Auth callbacks fire async at runtime, by
 * which point Payload is initialized.
 */
async function sendVerificationEmail(
  to: string,
  name: string,
  verificationUrl: string,
): Promise<void> {
  const { getPayload } = await import('payload')
  const config = (await import('@payload-config')).default
  const { sendVerificationEmail: send } = await import('@/email/send')
  const payload = await getPayload({ config })
  await send(payload, to, name, verificationUrl)
}

async function sendMagicLinkEmail(
  to: string,
  verificationUrl: string,
): Promise<void> {
  const { getPayload } = await import('payload')
  const config = (await import('@payload-config')).default
  const { sendMagicLinkEmail: send } = await import('@/email/send')
  const payload = await getPayload({ config })
  await send(payload, to, verificationUrl)
}

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET || 'dev-secret-change-in-production',
  baseURL: getServerURL(),
  trustedOrigins: getAllowedOrigins(),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      const { getPayload } = await import('payload')
      const config = (await import('@payload-config')).default
      const { sendResetPasswordEmail: send } = await import('@/email/send')
      const payload = await getPayload({ config })
      await send(payload, user.email, user.name || '', url)
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: 3600, // 1 hour
    sendVerificationEmail: async ({ user, url }) => {
      await sendVerificationEmail(user.email, user.name || '', url)
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
    facebook: {
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID || '',
      clientSecret: process.env.APPLE_CLIENT_SECRET || '',
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const { syncCustomer } = await import('./auth-sync')
          await syncCustomer(user)
        },
      },
    },
  },
  plugins: [
    twoFactor({
      issuer: 'Shayga',
      backupCodeOptions: {
        amount: 8,
      },
    }),
    passkey({
      rpName: 'Shayga',
      rpID: new URL(getServerURL()).hostname,
      origin: getServerURL(),
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendMagicLinkEmail(email, url)
      },
    }),
  ],
})
