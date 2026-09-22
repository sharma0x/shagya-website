'use client'

import { useState } from 'react'
import { usePhoneAuth } from '@/hooks/use-phone-auth'
import { useRouter } from 'next/navigation'

/**
 * Example Phone Login Component
 *
 * This is a complete example showing how to use the usePhoneAuth hook
 * for Firebase Phone Authentication with Better Auth.
 *
 * Features:
 * - Phone number input with E.164 format validation
 * - SMS OTP sending via Firebase
 * - OTP verification and Better Auth session creation
 * - Loading states and error handling
 * - Invisible reCAPTCHA integration
 */
export function PhoneLoginExample() {
  const router = useRouter()

  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)

  const { sendOTP, verifyOTP, isSendingOTP, isVerifyingOTP, error, reset } =
    usePhoneAuth({
      onSuccess: () => {
        console.log('Phone authentication successful!')
        router.push('/dashboard')
      },
      onError: (error) => {
        console.error('Phone authentication error:', error.message)
      },
    })

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic validation for E.164 format
    if (!phoneNumber.startsWith('+')) {
      alert(
        'Phone number must start with + and country code (e.g., +15555550100)',
      )
      return
    }

    try {
      await sendOTP(phoneNumber)
      setOtpSent(true)
    } catch (err) {
      // Error is already handled by the hook
      console.error('Failed to send OTP:', err)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otpCode.length !== 6) {
      alert('Please enter a 6-digit code')
      return
    }

    try {
      await verifyOTP(otpCode)
      // onSuccess callback will handle navigation
    } catch (err) {
      // Error is already handled by the hook
      console.error('Failed to verify OTP:', err)
    }
  }

  const handleStartOver = () => {
    setPhoneNumber('')
    setOtpCode('')
    setOtpSent(false)
    reset()
  }

  return (
    <div className="mx-auto max-w-md space-y-6 rounded-lg border p-8 shadow-lg">
      <div>
        <h2 className="text-2xl font-bold">Phone Login</h2>
        <p className="mt-2 text-sm text-gray-600">
          {!otpSent
            ? 'Enter your phone number to receive a verification code'
            : 'Enter the 6-digit code sent to your phone'}
        </p>
      </div>

      {/* Removed recaptcha-container from here to place it at root */}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">Error</p>
          <p>{error.message}</p>
        </div>
      )}

      {!otpSent ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              placeholder="+1 555 555 0100"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2"
              required
              disabled={isSendingOTP}
            />
            <p className="mt-1 text-xs text-gray-500">
              Include country code (e.g., +1 for US, +91 for India)
            </p>
          </div>

          <button
            type="submit"
            disabled={isSendingOTP}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSendingOTP ? 'Sending...' : 'Send Verification Code'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label htmlFor="otp" className="block text-sm font-medium">
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              className="mt-1 w-full rounded-md border px-3 py-2 text-center text-2xl tracking-widest"
              required
              disabled={isVerifyingOTP}
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500">
              Code sent to {phoneNumber}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleStartOver}
              disabled={isVerifyingOTP}
              className="flex-1 rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Change Number
            </button>
            <button
              type="submit"
              disabled={isVerifyingOTP}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isVerifyingOTP ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>
      )}

      <div className="border-t pt-4">
        <p className="text-center text-xs text-gray-500">
          By continuing, you agree to receive SMS messages. Standard message
          rates may apply.
        </p>
      </div>
    </div>
  )
}
