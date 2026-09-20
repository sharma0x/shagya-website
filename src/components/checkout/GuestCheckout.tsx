'use client'

import { useState, useCallback, useRef } from 'react'
import { useOtpCooldown } from '@/lib/use-otp-cooldown'
import { usePhoneAuth } from '@/hooks/use-phone-auth'
import { authClient } from '@/lib/auth-client'
import {
  Loader2,
  AlertCircle,
  UserPlus,
  UserCheck,
  Mail,
  Phone,
  KeyRound,
} from 'lucide-react'

interface GuestCheckoutProps {
  onVerified: (data: {
    name: string
    email: string
    phone?: string
    isExisting: boolean
  }) => void
}

type LoginMethod = 'email' | 'phone'

export function GuestCheckout({ onVerified }: GuestCheckoutProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [method, setMethod] = useState<LoginMethod>('email')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOTP, setSendingOTP] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [isExisting, setIsExisting] = useState(false)
  const [error, setError] = useState('')
  const [otpDestination, setOtpDestination] = useState('')
  const { cooldown, startCooldown } = useOtpCooldown()

  const formattedPhoneRef = useRef('')

  const phoneAuth = usePhoneAuth({
    onSuccess: async () => {
      try {
        // Fetch the actual customer data from the API which filters out
        // fallback emails and returns real user information
        const customerRes = await fetch('/api/customers/me')
        if (!customerRes.ok) {
          throw new Error('Failed to fetch customer data')
        }
        const customerData = await customerRes.json()

        onVerified({
          name: customerData.name || name.trim(),
          email: customerData.email || '',
          phone: customerData.phone || formattedPhoneRef.current,
          isExisting,
        })
      } catch (err: any) {
        setError(err?.message || 'Verification failed')
      } finally {
        setVerifying(false)
      }
    },
    onError: (err) => setError(err.message),
  })

  const switchMethod = (next: LoginMethod) => {
    if (otpSent) return
    setMethod(next)
    setOtp('')
    setError('')
  }

  const handleSendEmailOTP = useCallback(async () => {
    setError('')
    if (!name.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setSendingOTP(true)
    try {
      // Check account existence before the OTP screen flips, so we know
      // whether to fetch saved addresses (existing) or prompt for a new one.
      const statusRes = await fetch(
        `/api/auth/account-status?email=${encodeURIComponent(email)}`,
      )
      const statusData = await statusRes.json()
      setIsExisting(statusData.exists)

      const res = await fetch('/api/auth/email-otp/send-verification-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'sign-in' }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to send OTP')
      }
      setOtpDestination(email)
      setOtpSent(true)
      startCooldown()
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP')
    } finally {
      setSendingOTP(false)
    }
  }, [name, email, startCooldown])

  const handleSendPhoneOTP = useCallback(async () => {
    setError('')
    if (!name.trim()) {
      setError('Please enter your full name')
      return
    }
    const digits = phone.replace(/\D/g, '')
    if (digits.length < 10) {
      setError('Please enter a valid phone number')
      return
    }

    const formatted = phone.startsWith('+') ? phone : `+91${digits}`
    formattedPhoneRef.current = formatted

    setSendingOTP(true)
    try {
      const statusRes = await fetch(
        `/api/auth/account-status?phone=${encodeURIComponent(formatted)}`,
      )
      const statusData = await statusRes.json()
      setIsExisting(statusData.exists)

      await phoneAuth.sendOTP(formatted)
      setOtpDestination(formatted)
      setOtpSent(true)
      startCooldown()
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP')
    } finally {
      setSendingOTP(false)
    }
  }, [name, phone, phoneAuth, startCooldown])

  const handleVerifyEmailOTP = useCallback(async () => {
    setError('')
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }

    setVerifying(true)
    try {
      const res = await fetch('/api/auth/sign-in/email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Invalid OTP')
      onVerified({ name: name.trim(), email, isExisting })
    } catch (err: any) {
      setError(err?.message || 'Invalid OTP')
    } finally {
      setVerifying(false)
    }
  }, [otp, email, name, isExisting, onVerified])

  const handleVerifyPhoneOTP = useCallback(async () => {
    setError('')
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    try {
      await phoneAuth.verifyOTP(otp)
    } catch (err: any) {
      setError(err?.message || 'Verification failed')
    }
  }, [otp, phoneAuth])

  const handleSendOTP = () => {
    if (method === 'email') return handleSendEmailOTP()
    return handleSendPhoneOTP()
  }

  const handleVerifyOTP = () => {
    if (method === 'email') return handleVerifyEmailOTP()
    return handleVerifyPhoneOTP()
  }

  const isVerifying = verifying || phoneAuth.isVerifyingOTP
  const isSending = sendingOTP || phoneAuth.isSendingOTP

  const inputClass =
    'font-body focus:border-brand-500 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none placeholder:text-neutral-400 disabled:opacity-50'

  return (
    <div className="space-y-4">
      <h3 className="font-display text-xs font-semibold tracking-wider text-neutral-500 uppercase">
        Your Details
      </h3>

      {/* Login method toggle */}
      <div className="flex gap-2 rounded-xl border border-neutral-100 bg-neutral-50 p-1">
        <button
          type="button"
          onClick={() => switchMethod('email')}
          disabled={otpSent}
          className={`font-display flex-1 rounded-lg px-4 py-2 text-[11px] font-semibold transition-all ${
            method === 'email'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-700'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <Mail className="mx-auto mb-0.5 h-3.5 w-3.5" />
          Email
        </button>
        <button
          type="button"
          onClick={() => switchMethod('phone')}
          disabled={otpSent}
          className={`font-display flex-1 rounded-lg px-4 py-2 text-[11px] font-semibold transition-all ${
            method === 'phone'
              ? 'bg-white text-neutral-900 shadow-xs'
              : 'text-neutral-500 hover:text-neutral-700'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <Phone className="mx-auto mb-0.5 h-3.5 w-3.5" />
          Phone
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-[11px] text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="font-display mb-1 block text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
          Full Name
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Your full name"
          disabled={otpSent}
        />
      </div>

      {method === 'email' ? (
        <div>
          <label className="font-display mb-1 block text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
            Email
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} pl-9`}
                placeholder="you@example.com"
                disabled={otpSent}
              />
              <Mail className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            </div>
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={isSending || cooldown > 0}
              className="font-display bg-brand-600 hover:bg-brand-700 shrink-0 rounded-xl px-4 text-xs font-semibold text-white transition-colors disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              {isSending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : cooldown > 0 ? (
                `Resend (${cooldown}s)`
              ) : (
                'Send OTP'
              )}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <label className="font-display mb-1 block text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
            Phone Number
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="tel"
                inputMode="tel"
                required
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/[^\d+]/g, ''))
                }
                className={`${inputClass} pl-9`}
                placeholder="9876543210"
                disabled={otpSent}
              />
              <Phone className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
            </div>
            <button
              type="button"
              onClick={handleSendOTP}
              disabled={isSending || cooldown > 0}
              className="font-display bg-brand-600 hover:bg-brand-700 shrink-0 rounded-xl px-4 text-xs font-semibold text-white transition-colors disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              {isSending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : cooldown > 0 ? (
                `Resend (${cooldown}s)`
              ) : (
                'Send OTP'
              )}
            </button>
          </div>
          <p className="mt-1 text-[10px] text-neutral-400">
            Enter 10-digit mobile number (India +91)
          </p>
          {/* Invisible reCAPTCHA container for Firebase phone auth */}
          <div id="recaptcha-container" />
        </div>
      )}

      {otpSent && (
        <div>
          <label className="font-display mb-1 block text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
            Enter OTP
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                className={`${inputClass} pl-9`}
                placeholder="6-digit code"
              />
              <KeyRound className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            </div>
            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={isVerifying || otp.length !== 6}
              className="font-display bg-brand-600 hover:bg-brand-700 shrink-0 rounded-xl px-4 text-xs font-semibold text-white transition-colors disabled:bg-neutral-200 disabled:text-neutral-400"
            >
              {isVerifying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                'Verify'
              )}
            </button>
          </div>
          <p className="mt-1 text-[10px] text-neutral-400">
            We sent a 6-digit code to {otpDestination}
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setOtpSent(false)
                setOtp('')
                setError('')
              }}
              className="text-brand-600 font-semibold"
            >
              Change {method === 'email' ? 'email' : 'phone'}
            </button>
          </div>
        </div>
      )}

      {otpSent && (
        <div className="rounded-xl border border-neutral-100 bg-neutral-50/60 p-3">
          {isExisting ? (
            <div className="flex items-center gap-2">
              <UserCheck className="text-brand-600 h-4 w-4 shrink-0" />
              <p className="font-body text-[11px] text-neutral-600">
                An account exists for this{' '}
                {method === 'email' ? 'email' : 'phone number'} — we&apos;ll
                load your saved addresses.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <UserPlus className="text-brand-600 h-4 w-4 shrink-0" />
              <p className="font-body text-[11px] text-neutral-600">
                New to Shayga? We&apos;ll create an account and ask for a
                delivery address.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
