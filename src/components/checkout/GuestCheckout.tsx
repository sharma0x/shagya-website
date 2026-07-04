'use client'

import { useState, useCallback } from 'react'
import { Loader2, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GuestCheckoutProps {
  onVerified: (data: {
    name: string
    email: string
    phone: string
    customerId: string | number
  }) => void
}

export function GuestCheckout({ onVerified }: GuestCheckoutProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [sendingOTP, setSendingOTP] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const handleSendOTP = useCallback(async () => {
    setError('')
    if (!phone || phone.length < 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    if (!name.trim()) {
      setError('Please enter your full name')
      return
    }

    setSendingOTP(true)
    try {
      const res = await fetch('/api/checkout/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, email }),
      })
      const data = await res.json()
      if (res.ok) {
        setOtpSent(true)
        setCooldown(30)
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) { clearInterval(timer); return 0 }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(data.error || 'Failed to send OTP')
      }
    } catch {
      setError('Could not send OTP. Try again.')
    } finally {
      setSendingOTP(false)
    }
  }, [phone, email, name])

  const handleVerifyOTP = useCallback(async () => {
    setError('')
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }

    setVerifying(true)
    try {
      const res = await fetch('/api/checkout/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, name, email }),
      })
      const data = await res.json()
      if (res.ok && data.verified) {
        setVerified(true)
        onVerified({
          name: data.name,
          email: data.email,
          phone: data.phone,
          customerId: data.customerId,
        })
      } else {
        setError(data.error || 'Invalid OTP')
      }
    } catch {
      setError('Could not verify OTP. Try again.')
    } finally {
      setVerifying(false)
    }
  }, [otp, phone, name, onVerified])

  if (verified) {
    return (
      <div className="rounded-xl border border-green-100 bg-green-50 p-4">
        <div className="flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600" />
          <span className="font-display text-xs font-semibold text-green-700">
            Phone verified — {name} · {phone}
          </span>
        </div>
      </div>
    )
  }

  const inputClass =
    'font-body focus:border-brand-500 h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none placeholder:text-neutral-400 disabled:opacity-50'

  return (
    <div className="space-y-4">
      <h3 className="font-display text-xs font-semibold tracking-wider text-neutral-500 uppercase">
        Your Details
      </h3>

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

      <div>
        <label className="font-display mb-1 block text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
          disabled={otpSent}
        />
      </div>

      <div>
        <label className="font-display mb-1 block text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
          Phone Number
        </label>
        <div className="flex gap-2">
          <input
            type="tel"
            required
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
            className={inputClass}
            placeholder="10-digit mobile"
            disabled={otpSent}
          />
          <button
            type="button"
            onClick={handleSendOTP}
            disabled={sendingOTP || cooldown > 0 || otpSent}
            className="font-display bg-brand-600 hover:bg-brand-700 disabled:bg-neutral-200 shrink-0 rounded-xl px-4 text-xs font-semibold text-white transition-colors disabled:text-neutral-400"
          >
            {sendingOTP ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : cooldown > 0 ? (
              `Resend (${cooldown}s)`
            ) : (
              'Send OTP'
            )}
          </button>
        </div>
      </div>

      {otpSent && (
        <div>
          <label className="font-display mb-1 block text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
            Enter OTP
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={inputClass}
              placeholder="6-digit code"
            />
            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={verifying || otp.length !== 6}
              className="font-display bg-brand-600 hover:bg-brand-700 disabled:bg-neutral-200 shrink-0 rounded-xl px-4 text-xs font-semibold text-white transition-colors disabled:text-neutral-400"
            >
              {verifying ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                'Verify'
              )}
            </button>
          </div>
          <p className="mt-1 text-[10px] text-neutral-400">
            We sent a 6-digit code to {phone}
          </p>
        </div>
      )}
    </div>
  )
}
