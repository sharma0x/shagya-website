import { createAuthClient } from 'better-auth/react'
import { emailOTPClient } from 'better-auth/client/plugins'
import { getServerURL } from './env'

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? undefined : getServerURL(),
  plugins: [emailOTPClient()],
})

export const { signIn, signUp, useSession, signOut, emailOtp } = authClient
