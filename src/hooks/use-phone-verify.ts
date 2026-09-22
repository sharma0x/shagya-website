import { useState, useCallback, useRef, useEffect } from 'react'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth'
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
 *
 *   return (
 *     <>
 *       <div id="recaptcha-container" />
 *       {/ * Your form UI * /}
 *     </>
 *   )
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
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null)

  const clearRecaptcha = useCallback(() => {
    recaptchaVerifierRef.current?.clear()
    recaptchaVerifierRef.current = null
    document.getElementById(recaptchaContainerId)?.replaceChildren()
  }, [recaptchaContainerId])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const reset = useCallback(() => {
    setError(null)
    setIsSendingOTP(false)
    setIsVerifyingOTP(false)
    confirmationResultRef.current = null
    clearRecaptcha()
  }, [clearRecaptcha])

  // Initialize reCAPTCHA ahead of time to allow Firebase to fetch Enterprise configs
  // and inject the invisible script early, avoiding timeouts and visual challenge fallbacks
  // if the config fetch is too slow on click.
  useEffect(() => {
    if (typeof window === 'undefined' || recaptchaVerifierRef.current) return
    const el = document.getElementById(recaptchaContainerId)
    if (!el) return

    const auth = getFirebaseAuth()
    recaptchaVerifierRef.current = new RecaptchaVerifier(
      auth,
      recaptchaContainerId,
      {
        size: 'invisible',
        callback: () => {},
        'expired-callback': () => {
          clearRecaptcha()
        },
      },
    )
    recaptchaVerifierRef.current.render().catch((e) => {
      console.warn('[Phone verify] Lazy render warning:', e)
    })
  }, [recaptchaContainerId, clearRecaptcha])

  const sendOTP = useCallback(
    async (phoneNumber: string) => {
      try {
        setIsSendingOTP(true)
        setError(null)

        const auth = getFirebaseAuth()

        // Initialize reCAPTCHA verifier if not already done
        if (!recaptchaVerifierRef.current) {
          // Firebase can leave an iframe behind after a failed request.
          clearRecaptcha()
          recaptchaVerifierRef.current = new RecaptchaVerifier(
            auth,
            recaptchaContainerId,
            {
              size: 'invisible',
              callback: () => {
                // reCAPTCHA solved
              },
              'expired-callback': () => {
                clearRecaptcha()
              },
            },
          )

          // Pre-render the recaptcha to avoid the Enterprise config fallback warning
          try {
            await recaptchaVerifierRef.current.render()
          } catch (e) {
            console.error('[Phone verify] Failed to pre-render recaptcha', e)
          }
        }

        // Send OTP via Firebase
        confirmationResultRef.current = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          recaptchaVerifierRef.current,
        )
      } catch (err) {
        console.error('[Phone verify] Failed to send OTP:', err)
        const error = new Error(phoneAuthErrorMessage(err, 'send'))
        setError(error)
        onError?.(error)
        clearRecaptcha()
        throw error
      } finally {
        setIsSendingOTP(false)
      }
    },
    [clearRecaptcha, onError, recaptchaContainerId],
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

        // Clean up
        confirmationResultRef.current = null
        if (recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current.clear()
          recaptchaVerifierRef.current = null
        }

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
