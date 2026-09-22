import { useState, useCallback, useRef, useEffect } from 'react'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth'
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
    if (!el) {
      console.error(
        `[Phone auth] reCAPTCHA container #${recaptchaContainerId} not found`,
      )
      return
    }

    const auth = getFirebaseAuth()
    console.log(
      '[Phone auth] Initializing reCAPTCHA verifier on',
      window.location.hostname,
    )
    recaptchaVerifierRef.current = new RecaptchaVerifier(
      auth,
      recaptchaContainerId,
      {
        size: 'invisible',
        callback: () => {
          console.log('[Phone auth] reCAPTCHA solved successfully')
        },
        'expired-callback': () => {
          console.warn('[Phone auth] reCAPTCHA expired, clearing')
          clearRecaptcha()
        },
      },
    )
    recaptchaVerifierRef.current.render().catch((e) => {
      console.error('[Phone auth] Failed to render reCAPTCHA:', e)
    })
  }, [recaptchaContainerId, clearRecaptcha])

  const sendOTP = useCallback(
    async (phoneNumber: string) => {
      try {
        setIsSendingOTP(true)
        setError(null)

        const auth = getFirebaseAuth()
        console.log('[Phone auth] Sending OTP to', phoneNumber)

        // Initialize reCAPTCHA verifier if not already done
        if (!recaptchaVerifierRef.current) {
          console.log('[Phone auth] Creating new reCAPTCHA verifier')
          // Firebase can leave an iframe behind after a failed request.
          clearRecaptcha()
          recaptchaVerifierRef.current = new RecaptchaVerifier(
            auth,
            recaptchaContainerId,
            {
              size: 'invisible',
              callback: () => {
                console.log('[Phone auth] reCAPTCHA callback triggered')
              },
              'expired-callback': () => {
                console.warn('[Phone auth] reCAPTCHA expired in sendOTP')
                clearRecaptcha()
              },
            },
          )

          // Pre-render the recaptcha to avoid the Enterprise config fallback warning
          try {
            console.log('[Phone auth] Pre-rendering reCAPTCHA widget')
            await recaptchaVerifierRef.current.render()
            console.log('[Phone auth] reCAPTCHA widget rendered successfully')
          } catch (e) {
            console.error('[Phone auth] Failed to pre-render recaptcha', e)
          }
        } else {
          console.log('[Phone auth] Reusing existing reCAPTCHA verifier')
        }

        // Send OTP via Firebase
        console.log('[Phone auth] Calling signInWithPhoneNumber')
        confirmationResultRef.current = await signInWithPhoneNumber(
          auth,
          phoneNumber,
          recaptchaVerifierRef.current,
        )
        console.log('[Phone auth] OTP sent successfully')
      } catch (err) {
        console.error('[Phone auth] Failed to send OTP:', err)
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

        // Clean up
        confirmationResultRef.current = null
        if (recaptchaVerifierRef.current) {
          recaptchaVerifierRef.current.clear()
          recaptchaVerifierRef.current = null
        }

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
