import { createAuthClient } from 'better-auth/react'
import { firebaseAuthClientPlugin } from 'better-auth-firebase-auth/client'
import { getServerURL } from './env'

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? undefined : getServerURL(),
  plugins: [firebaseAuthClientPlugin()],
})

// Export TypeScript types for better type safety
export type Session = typeof authClient.$Infer.Session
export type User = Session extends { user: infer U } ? U : never

export const {
  signIn,
  signUp,
  useSession,
  signOut,
  signInWithPhone,
  signInWithGoogle,
  signInWithEmail,
  sendPasswordReset,
  verifyPasswordResetCode,
  confirmPasswordReset,
} = authClient
