'use client'

import { useState, useCallback } from 'react'
import { signIn } from '@/lib/auth-client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Mail,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOTP = useCallback(async () => {
    setError('')
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to send OTP')
      } else {
        setOtpSent(true)
        setCooldown(30)
        const timer = setInterval(() => {
          setCooldown((prev) => {
            if (prev <= 1) { clearInterval(timer); return 0 }
            return prev - 1
          })
        }, 1000)
      }
    } catch {
      setError('Could not send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }, [email])

  const handleVerifyOTP = useCallback(async () => {
    setError('')
    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Invalid OTP')
      } else {
        router.push('/account')
      }
    } catch {
      setError('Verification failed')
    } finally {
      setLoading(false)
    }
  }, [email, otp, router])

  const handleGoogleSignIn = async () => {
    try {
      await signIn.social({ provider: 'google', callbackURL: '/account' })
    } catch {
      setError('Google sign in failed')
    }
  }

  const inputClass =
    'font-body focus:border-brand-500 h-11 w-full rounded-xl border border-neutral-200 bg-white pr-4 pl-10 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400'

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full">
        <Link
          href="/"
          className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to store
        </Link>
        <h2 className="font-display mt-6 text-center text-3xl font-semibold tracking-tight text-neutral-900">
          Welcome back
        </h2>
        <p className="font-body mt-2 text-center text-sm text-neutral-500">
          Sign in to track orders, manage addresses, and your wishlist
        </p>

        <div className="mx-auto mt-8 w-full max-w-lg">
          <div className="border border-neutral-100 bg-white px-4 py-8 shadow-xs sm:rounded-2xl sm:px-10">
            <div className="space-y-5">
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-4 text-xs text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="font-display block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                  Email
                </label>
                <div className="relative mt-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@example.com"
                    disabled={otpSent}
                  />
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              {!otpSent ? (
                <button
                  onClick={handleSendOTP}
                  disabled={loading || cooldown > 0}
                  className="bg-brand-600 hover:bg-brand-700 font-display flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send OTP'}
                </button>
              ) : (
                <>
                  <div>
                    <label className="font-display block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                      Enter OTP
                    </label>
                    <div className="relative mt-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className={inputClass}
                        placeholder="6-digit code"
                      />
                    </div>
                    <p className="font-body mt-1.5 text-[11px] text-neutral-400">
                      OTP sent to {email}
                      {cooldown > 0 && ` · Resend in ${cooldown}s`}
                      {cooldown === 0 && (
                        <button
                          onClick={() => { setOtpSent(false); setOtp('') }}
                          className="text-brand-600 ml-1 font-semibold"
                        >
                          Change email
                        </button>
                      )}
                    </p>
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading || otp.length !== 6}
                    className="bg-brand-600 hover:bg-brand-700 font-display flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white shadow-xs transition-all active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Sign In'}
                  </button>
                </>
              )}

              <div className="relative border-t border-neutral-100 pt-5">
                <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[10px] text-neutral-400">
                  or continue with
                </span>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>
              </div>

              <p className="text-center text-xs text-neutral-400">
                Don&apos;t have an account?{' '}
                <Link href="/account/register" className="text-brand-700 font-semibold">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
