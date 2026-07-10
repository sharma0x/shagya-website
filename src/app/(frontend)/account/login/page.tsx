'use client'

import { useState, useCallback } from 'react'
import { signIn } from '@/lib/auth-client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  KeyRound,
  Mail,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react'

type LoginMode = 'email' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<LoginMode>('email')

  // Email login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // OTP login state
  const [otpEmail, setOtpEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await signIn.email({
        email,
        password,
        callbackURL: '/account',
      })
      if (res?.error) {
        setError(res.error.message || 'Invalid email or password')
      } else {
        router.push('/account')
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSendOTP = useCallback(async () => {
    setError('')
    if (!otpEmail || !otpEmail.includes('@')) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/checkout/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
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
      setError('Could not send OTP')
    } finally {
      setLoading(false)
    }
  }, [otpEmail])

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
        body: JSON.stringify({ email: otpEmail, otp }),
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
  }, [otpEmail, otp])

  const handleGoogleSignIn = async () => {
    try {
      await signIn.social({ provider: 'google', callbackURL: '/account' })
    } catch (err: any) {
      setError(err?.message || 'Google sign in failed')
    }
  }

  const inputClass =
    'font-body focus:border-brand-500 h-11 w-full rounded-xl border border-neutral-200 bg-white pr-4 pl-10 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400'

  return (
    <div className="bg-surface flex min-h-[70vh] flex-col py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg">
        <Link
          href="/"
          className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 pl-4 text-xs font-semibold text-neutral-500 transition-colors sm:pl-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>
        <h2 className="font-display mt-6 text-center text-3xl font-semibold tracking-tight text-neutral-900">
          Welcome back
        </h2>
        <p className="font-body mt-2 text-center text-sm text-neutral-500">
          Sign in to track orders, manage addresses, and your wishlist
        </p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-lg">
        <div className="border border-neutral-100 bg-white px-4 py-8 shadow-xs sm:rounded-2xl sm:px-10">
          {/* Tab switcher */}
          <div className="mb-6 flex gap-2 rounded-xl bg-neutral-50 p-1">
            <button
              onClick={() => { setMode('email'); setError('') }}
              className={`font-display flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                mode === 'email'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Email
            </button>
            <button
              onClick={() => { setMode('otp'); setError('') }}
              className={`font-display flex-1 rounded-lg py-2 text-xs font-semibold transition-colors ${
                mode === 'otp'
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-600'
              }`}
            >
              Login with OTP
            </button>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-4 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email Login */}
          {mode === 'email' && (
            <form className="space-y-5" onSubmit={handleEmailLogin}>
              <div>
                <label className="font-display block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                  Email Address
                </label>
                <div className="relative mt-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="you@example.com"
                  />
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              <div>
                <label className="font-display block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputClass}
                    placeholder="••••••••"
                  />
                  <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/account/forgot-password"
                  className="text-brand-700 hover:text-brand-800 font-body text-xs font-semibold"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-brand-600 hover:bg-brand-700 font-display flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          {/* Email OTP / Login with OTP */}
          {mode === 'otp' && (
            <div className="space-y-5">
              <div>
                <label className="font-display block text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                  Email
                </label>
                <div className="relative mt-2">
                  <input
                    type="email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
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
                      OTP sent to {otpEmail}
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
            </div>
          )}

          {/* Social login divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-neutral-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="font-body bg-white px-3 text-neutral-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid gap-3">
            <button
              onClick={handleGoogleSignIn}
              className="font-display flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 active:scale-95"
            >
              <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
          </div>

          <p className="font-body mt-6 text-center text-xs text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link
              href="/account/register"
              className="text-brand-700 hover:text-brand-800 font-semibold underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
