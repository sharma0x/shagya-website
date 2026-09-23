import { useState, useCallback, useRef } from 'react'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import type { ConfirmationResult } from 'firebase/auth'
import { getFirebaseAuth } from '@/lib/firebase-client'
import { phoneAuthErrorMessage } from '@/lib/firebase-auth-errors'

interface UsePhoneVerifyOptions {
  /**
   * ID of the HTML element where the invisible reCAPTCHA will be rendered
   * @default 'recaptcha-container'
   */
  recaptchaContainerId?: string
  /**
   * Callback invoked when phone verification is successful
   */
  onSuccess?: (idToken: string) => void | Promise<void>
  /**
   * Callback invoked when an error occurs
   */
  onError?: (error: Error) => void
}

interface UsePhoneVerifyReturn {
  /**
   * Send OTP to the provided phone number
   * @param phoneNumber - Phone number in E.164 format (e.g., +15555550100)
   */
  sendOTP: (phoneNumber: string) => Promise<void>
  /**
   * Verify the OTP code and return the Firebase ID token
   * @param code - 6-digit OTP code
   * @returns Firebase ID token
   */
  verifyOTP: (code: string) => Promise<string>
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
 * React hook for Firebase Phone Verification (without Better Auth integration)
 * Use this for adding phone numbers to existing accounts
 *
 * @example
 * ```tsx
 * function AddPhoneForm() {
 *   const { sendOTP, verifyOTP, isSendingOTP, isVerifyingOTP, error } = usePhoneVerify({
 *     onSuccess: async (idToken) => {
 *       await linkPhoneToAccount(idToken)
 *     },
 *   })
 * }
 * ```
 */
export function usePhoneVerify(
  options: UsePhoneVerifyOptions = {},
): UsePhoneVerifyReturn {
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
        confirmationResultRef.current = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          verifier,
        )
      } catch (err) {
        console.error('[Phone verify] Failed to send OTP:', err)
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
    async (code: string): Promise<string> => {
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

        confirmationResultRef.current = null

        // Call success callback
        await onSuccess?.(idToken)

        return idToken
      } catch (err) {
        console.error('[Phone verify] Failed to verify OTP:', err)
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
