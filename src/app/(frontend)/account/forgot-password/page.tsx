'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, AlertCircle, Loader2, Check } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/account/reset-password`,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || data.error || 'Failed to send reset email')
      }

      setSent(true)
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'font-body focus:border-brand-500 h-11 w-full rounded-xl border border-neutral-200 bg-white pr-4 pl-10 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400'

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
          Reset your password
        </h2>
        <p className="font-body mt-2 text-center text-sm text-neutral-500">
          We&apos;ll send you a link to create a new one
        </p>
      </div>

      <div className="mx-auto mt-8 w-full max-w-lg">
        <div className="border border-neutral-100 bg-white px-4 py-8 shadow-xs sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 p-4 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {sent ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-body text-sm text-neutral-600">
                If an account exists with <strong>{email}</strong>, we&apos;ve
                sent a password reset link. Check your inbox and spam folder.
              </p>
              <Link
                href="/account/login"
                className="text-brand-700 hover:text-brand-800 font-display mt-4 inline-block text-sm font-semibold"
              >
                Return to login
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
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

              <button
                type="submit"
                disabled={loading}
                className="bg-brand-600 hover:bg-brand-700 font-display flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white shadow-xs transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}