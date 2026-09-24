'use client'

import { useState } from 'react'
import { usePhoneVerify } from '@/hooks/use-phone-verify'
import { PhoneInput } from '@/components/ui/phone-input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  isValidE164PhoneNumber,
  normalizePhoneNumber,
} from '@/lib/phone-number'
import { Loader2, Smartphone, CheckCircle2, ArrowLeft, X } from 'lucide-react'

interface AddPhoneIdentityProps {
  onSuccess?: (result?: { merged?: boolean; phoneNumber?: string }) => void
  onCancel?: () => void
}

/**
 * Component for adding verified phone number as a login method.
 * Uses Firebase OTP verification, then calls /api/phone-identity to link phone.
 * Supports auto-merging with pre-existing phone accounts.
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

      const normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)
      const response = await fetch('/api/phone-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: normalizedPhoneNumber,
          firebaseIdToken: idToken,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to link phone number')
      }

      onSuccess?.({
        merged: Boolean(data.merged),
        phoneNumber: normalizedPhoneNumber,
      })
    } catch (err: any) {
      setLinkError(err.message || 'Failed to link phone number')
      throw err
    }
  }

  const { sendOTP, verifyOTP, isSendingOTP, isVerifyingOTP, error, reset } =
    usePhoneVerify({
      onSuccess: linkPhoneToAccount,
      onError: (err) => {
        console.error('Phone verification error:', err.message)
      },
    })

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLinkError(null)

    let normalizedPhoneNumber: string
    try {
      normalizedPhoneNumber = normalizePhoneNumber(phoneNumber)
      if (!isValidE164PhoneNumber(normalizedPhoneNumber)) {
        throw new Error('Enter a valid phone number')
      }
    } catch {
      setLinkError(
        'Phone number must include a valid country code (e.g. +91 98765 43210)',
      )
      return
    }

    try {
      await sendOTP(normalizedPhoneNumber)
      setOtpSent(true)
    } catch (err) {
      console.error('Failed to send OTP:', err)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLinkError(null)

    const cleanedOtp = otpCode.trim()
    if (cleanedOtp.length !== 6) {
      setLinkError('Please enter the 6-digit verification code')
      return
    }

    try {
      await verifyOTP(cleanedOtp)
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
        <div className="bg-brand-50 text-brand-700 flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
          <Smartphone className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold text-neutral-900">
            Add Phone Login
          </h3>
          <p className="font-body text-xs text-neutral-500">
            {!otpSent
              ? 'Verify your phone number to enable SMS OTP login and fast checkout'
              : `Enter the 6-digit code sent to ${phoneNumber}`}
          </p>
        </div>
      </div>

      {(error || linkError) && (
        <Alert variant="destructive">
          <AlertDescription>{linkError || error?.message}</AlertDescription>
        </Alert>
      )}

      {!otpSent ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label
              htmlFor="phone-identity-input"
              className="font-body mb-1.5 block text-xs font-medium text-neutral-700"
            >
              Phone Number
            </label>
            <PhoneInput
              id="phone-identity-input"
              value={phoneNumber}
              onChange={setPhoneNumber}
              placeholder="98765 43210"
              disabled={isSendingOTP}
            />
            <p className="font-body mt-1 text-xs text-neutral-500">
              Select your country code and enter your mobile number.
            </p>
          </div>

          <div className="flex gap-2.5">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSendingOTP}
                className="flex-1"
              >
                <X className="mr-1.5 h-4 w-4" />
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSendingOTP || !phoneNumber.trim()}
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
            <label
              htmlFor="phone-otp-input"
              className="font-body mb-1.5 block text-xs font-medium text-neutral-700"
            >
              6-Digit SMS Code
            </label>
            <input
              id="phone-otp-input"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={otpCode}
              onChange={(e) =>
                setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              maxLength={6}
              className="focus:border-brand-500 focus:ring-brand-500/20 h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 text-center font-mono text-2xl tracking-[0.35em] text-neutral-900 transition-colors outline-none placeholder:text-neutral-300 focus:ring-2"
              required
              disabled={isVerifyingOTP}
              autoFocus
            />
            <p className="font-body mt-2 text-center text-xs text-neutral-500">
              Code sent via SMS to {phoneNumber}
            </p>
          </div>

          <div className="flex gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={handleStartOver}
              disabled={isVerifyingOTP}
              className="flex-1"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
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
                  Verify & Save
                </>
              )}
            </Button>
          </div>
        </form>
      )}

      <div className="border-t border-neutral-100 pt-3">
        <p className="font-body text-center text-[11px] text-neutral-500">
          By continuing, you agree to receive an SMS code for account
          verification. Standard carrier rates may apply.
        </p>
      </div>
    </div>
  )
}
