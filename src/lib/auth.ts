import { betterAuth } from 'better-auth'
import { passkey } from '@better-auth/passkey'
import { twoFactor } from 'better-auth/plugins'
import { emailOTP } from 'better-auth/plugins/email-otp'
import { Pool } from 'pg'
import { sendOTPEmail } from '@/email/send'
import { getServerURL, getAllowedOrigins } from './env'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

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
    expiresIn: 3600,
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
    emailOTP({
      sendVerificationOTP: async ({ email, otp }) => {
        await sendOTPEmail(email, otp)
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
  ],
})
