import { betterAuth } from 'better-auth'
import { passkey } from '@better-auth/passkey'
import { phoneNumber, twoFactor, magicLink } from 'better-auth/plugins'
import { Pool } from 'pg'
import { sendEmail } from './email'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET || 'dev-secret-change-in-production',
  emailAndPassword: {
    enabled: true,
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
  // When a user registers, create a corresponding Customer record in Payload.
  // Uses dynamic import to avoid circular dependencies with Payload config.
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
    phoneNumber({
      sendOTP: ({ phoneNumber, code }) => {
        // Stub — Log for dev. Real SMS integration in CLO-35.
        console.log(`[Auth OTP] Code ${code} for ${phoneNumber}`)
        return Promise.resolve()
      },
    }),
    twoFactor({
      issuer: 'Shagya',
      backupCodeOptions: {
        amount: 8,
      },
    }),
    passkey({
      rpName: 'Shagya',
      rpID: process.env.NEXT_PUBLIC_SERVER_URL
        ? new URL(process.env.NEXT_PUBLIC_SERVER_URL).hostname
        : 'localhost',
      origin: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
    }),
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h1 style="color: #333;">Sign in to Shagya</h1>
            <p>Click the button below to sign in to your Shagya account. This link is valid for 10 minutes.</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: oklch(0.65 0.18 65); color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600;">Sign in to Shagya</a>
            <p style="margin-top: 16px; font-size: 14px; color: #666;">
              If you didn't request this, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="font-size: 12px; color: #999;">Shagya — Premium Fabrics</p>
          </div>
        `
        await sendEmail({
          to: email,
          subject: 'Sign in to Shagya',
          html,
        })
      },
    }),
  ],
})
