import { createAuthClient } from 'better-auth/react'
import { getServerURL } from './env'

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? undefined : getServerURL(),
})

export const { signIn, signUp, useSession, signOut } = authClient

// Manual Firebase auth methods (calling endpoints directly due to firebaseAuthClientPlugin type issues)
export const signInWithPhone = async (data: { idToken: string }) => {
  return authClient.$fetch('/firebase-auth/sign-in-with-phone', {
    method: 'POST',
    body: data,
  })
}

export const signInWithGoogle = async (data: { idToken: string }) => {
  return authClient.$fetch('/firebase-auth/sign-in-with-google', {
    method: 'POST',
    body: data,
  })
}

export const signInWithEmail = async (data: {
  idToken?: string
  email?: string
  password?: string
}) => {
  return authClient.$fetch('/firebase-auth/sign-in-with-email', {
    method: 'POST',
    body: data,
  })
}

export const sendPasswordReset = async (data: { email: string }) => {
  return authClient.$fetch('/firebase-auth/send-password-reset', {
    method: 'POST',
    body: data,
  })
}

export const verifyPasswordResetCode = async (data: { oobCode: string }) => {
  return authClient.$fetch('/firebase-auth/verify-password-reset-code', {
    method: 'POST',
    body: data,
  })
}

export const confirmPasswordReset = async (data: {
  oobCode: string
  newPassword: string
}) => {
  return authClient.$fetch('/firebase-auth/confirm-password-reset', {
    method: 'POST',
    body: data,
  })
}
