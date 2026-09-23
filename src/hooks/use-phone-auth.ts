import { useState, useCallback, useRef } from 'react'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import type { ConfirmationResult } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase-client'
import { signInWithPhone } from '@/lib/auth-client'
import { phoneAuthErrorMessage } from '@/lib/firebase-auth-errors'

interface UsePhoneAuthOptions {
  /**
   * ID of the HTML element where the invisible reCAPTCHA will be rendered
   * @default 'recaptcha-container'
   */
  recaptchaContainerId?: string
  /**
   * Callback invoked when phone sign-in is successful
   */
  onSuccess?: () => void
  /**
   * Callback invoked when an error occurs
   */
  onError?: (error: Error) => void
}

interface UsePhoneAuthReturn {
  /**
   * Send OTP to the provided phone number
   * @param phoneNumber - Phone number in E.164 format (e.g., +15555550100)
   */
  sendOTP: (phoneNumber: string) => Promise<void>
  /**
   * Verify the OTP code and create a Better Auth session
   * @param code - 6-digit OTP code
   */
  verifyOTP: (code: string) => Promise<void>
  /**
   * Loading state for sending OTP
   */
  isSendingOTP: boolean
  /**
   * Loading state for verifying OTP
   */
  isVerifyingOTP: boolean
  /**
   * Error that occurred during the auth flow
   */
  error: Error | null
  /**
   * Clear the current error
   */
  clearError: () => void
  /**
   * Reset the auth flow to start over
   */
  reset: () => void
}

/**
 * React hook for Firebase Phone Authentication with Better Auth integration
 *
 * @example
 * ```tsx
 * function LoginForm() {
 *   const { sendOTP, verifyOTP, isSendingOTP, isVerifyingOTP, error } = usePhoneAuth({
 *     onSuccess: () => router.push('/dashboard'),
 *     onError: (error) => console.error(error),
 *   })
 *
 *   const handleSendOTP = async () => {
 *     await sendOTP('+15555550100')
 *   }
 *
 *   const handleVerifyOTP = async (code: string) => {
 *     await verifyOTP(code)
 *   }
 * }
 * ```
 */
export function usePhoneAuth(
  options: UsePhoneAuthOptions = {},
): UsePhoneAuthReturn {
  const {
    recaptchaContainerId = 'recaptcha-container',
    onSuccess,
    onError,
  } = options

  const [isSendingOTP, setIsSendingOTP] = useState(false)
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const confirmationResultRef = useRef<ConfirmationResult | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setIsSendingOTP(false)
    setIsVerifyingOTP(false)
    confirmationResultRef.current = null
  }, [])

  const sendOTP = useCallback(
    async (phoneNumber: string) => {
      try {
        setIsSendingOTP(true)
        setError(null)

        const auth = getFirebaseAuth()
        const verifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
          size: 'invisible',
        })
        console.log('[Phone auth] Sending OTP to', phoneNumber)
        confirmationResultRef.current = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          verifier,
        )
        console.log('[Phone auth] OTP sent successfully')
      } catch (err) {
        console.error('[Phone auth] Failed to send OTP:', err)
        const error = new Error(phoneAuthErrorMessage(err, 'send'))
        setError(error)
        onError?.(error)
        throw error
      } finally {
        setIsSendingOTP(false)
      }
    },
    [onError, recaptchaContainerId],
  )

  const verifyOTP = useCallback(
    async (code: string) => {
      try {
        setIsVerifyingOTP(true)
        setError(null)

        if (!confirmationResultRef.current) {
          throw new Error('No confirmation result. Please send OTP first.')
        }

        // Verify OTP with Firebase
        const credential = await confirmationResultRef.current.confirm(code)

        // Get Firebase ID token
        const idToken = await credential.user.getIdToken()

        // Sign in with Better Auth
        await signInWithPhone({ idToken })

        confirmationResultRef.current = null

        onSuccess?.()
      } catch (err) {
        console.error('[Phone auth] Failed to verify OTP:', err)
        const error = new Error(phoneAuthErrorMessage(err, 'verify'))
        setError(error)
        onError?.(error)
        throw error
      } finally {
        setIsVerifyingOTP(false)
      }
    },
    [onSuccess, onError],
  )

  return {
    sendOTP,
    verifyOTP,
    isSendingOTP,
    isVerifyingOTP,
    error,
    clearError,
    reset,
  }
}
