'use client'

import { useState } from 'react'
import { usePhoneVerify } from '@/hooks/use-phone-verify'
import { PhoneInput } from '@/components/ui/phone-input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Smartphone, CheckCircle2, X } from 'lucide-react'

interface AddPhoneIdentityProps {
  onSuccess?: () => void
  onCancel?: () => void
}

/**
 * Component for adding verified phone number as a login method
 * Uses Firebase OTP verification, then calls /api/phone-identity to link phone
 */
export function AddPhoneIdentity({
  onSuccess,
  onCancel,
}: AddPhoneIdentityProps) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)

  const linkPhoneToAccount = async (idToken: string) => {
    try {
      setLinkError(null)

      // Call API to link phone identity
      const response = await fetch('/api/phone-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          firebaseIdToken: idToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link phone number')
      }

      // Success!
      onSuccess?.()
    } catch (err: any) {
      setLinkError(err.message || 'Failed to link phone number')
      throw err
    }
  }

  const { sendOTP, verifyOTP, isSendingOTP, isVerifyingOTP, error, reset } =
    usePhoneVerify({
      onSuccess: linkPhoneToAccount,
      onError: (error) => {
        console.error('Phone verification error:', error.message)
      },
    })

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLinkError(null)

    if (!phoneNumber.startsWith('+')) {
      setLinkError(
        'Phone number must include country code (e.g., +919876543210)',
      )
      return
    }

    try {
      await sendOTP(phoneNumber)
      setOtpSent(true)
    } catch (err) {
      console.error('Failed to send OTP:', err)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLinkError(null)

    if (otpCode.length !== 6) {
      setLinkError('Please enter a 6-digit code')
      return
    }

    try {
      await verifyOTP(otpCode)
      // onSuccess callback will trigger linkPhoneToAccount
    } catch (err) {
      console.error('Failed to verify OTP:', err)
    }
  }

  const handleStartOver = () => {
    setPhoneNumber('')
    setOtpCode('')
    setOtpSent(false)
    setLinkError(null)
    reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
          <Smartphone className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Add Phone Login</h3>
          <p className="text-sm text-gray-600">
            {!otpSent
              ? 'Verify your phone number to enable phone-based login'
              : 'Enter the 6-digit code sent to your phone'}
          </p>
        </div>
      </div>

      {/* Removed recaptcha-container from here to place it at root */}

      {(error || linkError) && (
        <Alert variant="destructive">
          <AlertDescription>{error?.message || linkError}</AlertDescription>
        </Alert>
      )}

      {!otpSent ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label htmlFor="phone" className="mb-2 block text-sm font-medium">
              Phone Number
            </label>
            <PhoneInput
              id="phone"
              value={phoneNumber}
              onChange={setPhoneNumber}
              placeholder="+91 98765 43210"
              disabled={isSendingOTP}
            />
            <p className="mt-1 text-xs text-gray-500">
              Include country code (e.g., +91 for India, +1 for US)
            </p>
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSendingOTP}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSendingOTP || !phoneNumber}
              className="flex-1"
            >
              {isSendingOTP ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label htmlFor="otp" className="mb-2 block text-sm font-medium">
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              placeholder="000000"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
              className="w-full rounded-md border border-gray-300 px-4 py-3 text-center text-2xl tracking-widest focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
              disabled={isVerifyingOTP}
              autoFocus
            />
            <p className="mt-2 text-center text-xs text-gray-500">
              Code sent to {phoneNumber}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleStartOver}
              disabled={isVerifyingOTP}
              className="flex-1"
            >
              Change Number
            </Button>
            <Button
              type="submit"
              disabled={isVerifyingOTP || otpCode.length !== 6}
              className="flex-1"
            >
              {isVerifyingOTP ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying & Linking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify & Link
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      <div className="border-t pt-4">
        <p className="text-center text-xs text-gray-500">
          By continuing, you agree to receive SMS messages for account
          verification. Standard message rates may apply.
        </p>
      </div>
    </div>
  )
}
