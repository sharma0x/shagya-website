'use client'

import { useState } from 'react'
import {
  Mail,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  RefreshCw,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useOtpCooldown } from '@/lib/use-otp-cooldown'

interface AddEmailIdentityProps {
  initialEmail?: string | null
  isUnverified?: boolean
  onSuccess?: (result: { email: string; linked: boolean }) => void
  onCancel?: () => void
}

/**
 * Component for adding or verifying an email address using a 6-digit OTP.
 * Supports linking existing email accounts seamlessly without conflicts.
 */
export function AddEmailIdentity({
  initialEmail,
  isUnverified = false,
  onSuccess,
  onCancel,
}: AddEmailIdentityProps) {
  const [email, setEmail] = useState(initialEmail || '')
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [isSendingOTP, setIsSendingOTP] = useState(false)
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { cooldown, startCooldown } = useOtpCooldown(60)

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())
  }

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setError('Please enter a valid email address')
      return
    }

    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address format')
      return
    }

    try {
      setIsSendingOTP(true)
      const res = await fetch('/api/email-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-otp',
          email: trimmedEmail,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send verification code')
      }

      setOtpSent(true)
      startCooldown(60)
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code')
    } finally {
      setIsSendingOTP(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanedOtp = otpCode.trim()
    if (cleanedOtp.length !== 6) {
      setError('Please enter the complete 6-digit verification code')
      return
    }

    try {
      setIsVerifyingOTP(true)
      const res = await fetch('/api/email-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify-otp',
          email: email.trim(),
          otp: cleanedOtp,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(
          data.error || 'Verification failed. Please check the code.',
        )
      }

      onSuccess?.({
        email: data.email,
        linked: Boolean(data.linked),
      })
    } catch (err: any) {
      setError(err.message || 'Failed to verify code')
    } finally {
      setIsVerifyingOTP(false)
    }
  }

  const handleStartOver = () => {
    if (!isUnverified) {
      setEmail('')
    }
    setOtpCode('')
    setOtpSent(false)
    setError(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-brand-50 text-brand-700 flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
          <Mail className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-base font-semibold text-neutral-900">
            {isUnverified ? 'Verify Email Address' : 'Add Email Login'}
          </h3>
          <p className="font-body text-xs text-neutral-500">
            {!otpSent
              ? 'Receive order updates and use your email to sign in.'
              : `Enter the 6-digit code sent to ${email}`}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!otpSent ? (
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label
              htmlFor="email-identity-input"
              className="font-body mb-1.5 block text-xs font-medium text-neutral-700"
            >
              Email Address
            </label>
            <input
              id="email-identity-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isSendingOTP}
              required
              autoFocus
              className="font-body focus:border-brand-500 focus:ring-brand-500 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3.5 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400 focus:ring-1"
            />
            <p className="font-body mt-1 text-xs text-neutral-500">
              If an account with this email already exists, your accounts will
              be merged securely.
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
              disabled={isSendingOTP || !email.trim()}
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
              htmlFor="email-otp-input"
              className="font-body mb-1.5 block text-xs font-medium text-neutral-700"
            >
              6-Digit Verification Code
            </label>
            <input
              id="email-otp-input"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={otpCode}
              onChange={(e) =>
                setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              maxLength={6}
              disabled={isVerifyingOTP}
              required
              autoFocus
              className="focus:border-brand-500 focus:ring-brand-500/20 h-12 w-full rounded-lg border border-neutral-200 bg-white px-4 text-center font-mono text-2xl tracking-[0.35em] text-neutral-900 transition-colors outline-none placeholder:text-neutral-300 focus:ring-2"
            />
            <div className="font-body mt-2 flex items-center justify-between text-xs text-neutral-500">
              <span>Code sent to {email}</span>
              <button
                type="button"
                onClick={() => handleSendOTP()}
                disabled={cooldown > 0 || isSendingOTP}
                className="text-brand-600 hover:text-brand-700 cursor-pointer font-medium disabled:cursor-not-allowed disabled:text-neutral-400"
              >
                {cooldown > 0 ? (
                  `Resend in ${cooldown}s`
                ) : (
                  <span className="inline-flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" /> Resend Code
                  </span>
                )}
              </button>
            </div>
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
              Change Email
            </Button>
            <Button
              type="submit"
              disabled={isVerifyingOTP || otpCode.length !== 6}
              className="flex-1"
            >
              {isVerifyingOTP ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
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
          We will never share your email address. You will receive account
          alerts and order confirmations.
        </p>
      </div>
    </div>
  )
}
