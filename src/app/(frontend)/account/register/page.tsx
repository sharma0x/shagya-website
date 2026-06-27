'use client'

import { useState } from 'react'
import { signUp } from '@/lib/auth-client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  KeyRound,
  Mail,
  User,
  Phone,
  AlertCircle,
} from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const res = await signUp.email({
        email,
        password,
        name,
        phoneNumber: phoneNumber || undefined,
        callbackURL: '/account',
      } as any)

      if (res?.error) {
        setError(res.error.message || 'Registration failed. Please try again.')
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-surface flex min-h-[70vh] flex-col py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg">
        <Link
          href="/account/login"
          className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 pl-4 text-xs font-semibold text-neutral-500 transition-colors sm:pl-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Login
        </Link>
        <h2 className="font-display mt-6 text-center text-3xl font-semibold tracking-tight text-neutral-900">
          Create an account
        </h2>
        <p className="font-body mt-2 text-center text-sm text-neutral-500">
          Join Shayga to track orders, manage addresses, and curate your
          wishlist
        </p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-lg">
        <div className="border border-neutral-100 bg-white px-4 py-8 shadow-xs sm:rounded-2xl sm:px-10">
          {success ? (
            <div className="space-y-4 py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-semibold text-neutral-900">
                Check your email
              </h3>
              <p className="font-body text-sm text-neutral-500">
                We've sent a verification link to{' '}
                <span className="font-semibold text-neutral-900">{email}</span>.
                Please verify your email address to complete your account
                creation.
              </p>
              <div className="pt-4">
                <Link
                  href="/account/login"
                  className="font-display flex w-full items-center justify-center rounded-xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
                >
                  Return to Login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-4 text-xs text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="name"
                  className="font-display block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
                >
                  Full Name
                </label>
                <div className="relative mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="font-body focus:border-brand-500 h-11 w-full rounded-xl border border-neutral-200 bg-white pr-4 pl-10 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400"
                    placeholder="Aarav Sharma"
                  />
                  <User className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="font-display block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
                >
                  Email Address
                </label>
                <div className="relative mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="font-body focus:border-brand-500 h-11 w-full rounded-xl border border-neutral-200 bg-white pr-4 pl-10 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400"
                    placeholder="you@example.com"
                  />
                  <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="font-display block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
                >
                  Phone Number (Optional)
                </label>
                <div className="relative mt-2">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="font-body focus:border-brand-500 h-11 w-full rounded-xl border border-neutral-200 bg-white pr-4 pl-10 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400"
                    placeholder="+91 98765 43210"
                  />
                  <Phone className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="font-display block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
                >
                  Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="font-body focus:border-brand-500 h-11 w-full rounded-xl border border-neutral-200 bg-white pr-4 pl-10 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400"
                    placeholder="••••••••"
                  />
                  <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="font-display block text-xs font-semibold tracking-wider text-neutral-500 uppercase"
                >
                  Confirm Password
                </label>
                <div className="relative mt-2">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="font-body focus:border-brand-500 h-11 w-full rounded-xl border border-neutral-200 bg-white pr-4 pl-10 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400"
                    placeholder="••••••••"
                  />
                  <KeyRound className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-600 hover:bg-brand-700 font-display flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white shadow-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          <p className="font-body mt-6 text-center text-xs text-neutral-400">
            Already have an account?{' '}
            <Link
              href="/account/login"
              className="text-brand-700 hover:text-brand-800 font-semibold underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
