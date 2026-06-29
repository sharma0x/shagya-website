import { createAuthClient } from 'better-auth/react'
import { getServerURL } from './env'

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? undefined : getServerURL(),
})

export const { signIn, signUp, useSession, signOut } = authClient
