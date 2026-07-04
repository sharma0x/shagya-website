import { createAuthClient } from 'better-auth/react'
import { phoneNumberClient } from 'better-auth/client/plugins'
import { getServerURL } from './env'

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? undefined : getServerURL(),
  plugins: [phoneNumberClient()],
})

export const { signIn, signUp, useSession, signOut } = authClient
export const { phoneNumber } = authClient
