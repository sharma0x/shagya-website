'use client'

import { useState } from 'react'
import { Mail, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotifyMeButtonProps {
  productId: string | number
  className?: string
}

export function NotifyMeButton({ productId, className }: NotifyMeButtonProps) {
  const [email, setEmail] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(
        `/api/products/${productId}/notify-back-in-stock`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      )
      const data = await res.json()
      if (res.ok) {
        setSent(true)
      } else {
        setError(data.error || 'Something went wrong')
      }
    } catch {
      setError('Could not submit. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <button
        disabled
        className={cn(
          'font-display inline-flex h-11 items-center gap-2 rounded-xl bg-green-50 px-5 text-xs font-semibold text-green-700',
          className,
        )}
      >
        <Check className="h-4 w-4" />
        Notify Me
      </button>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={(e) => {
          e.preventDefault()
          setOpen(!open)
        }}
        className="font-display bg-neutral-900 hover:bg-neutral-800 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-xs font-semibold text-white transition-colors"
      >
        <Mail className="h-4 w-4" />
        Notify Me
      </button>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg">
          <p className="font-display text-xs font-semibold text-neutral-900">
            Out of Stock? Get Notified
          </p>
          <p className="font-body mt-1 text-[11px] text-neutral-500">
            We&apos;ll email you as soon as this product is back.
          </p>
          <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="font-body focus:border-brand-500 h-9 flex-1 rounded-lg border border-neutral-200 px-2.5 text-xs outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-brand-600 hover:bg-brand-700 font-display flex h-9 items-center gap-1 rounded-lg px-3 text-[10px] font-semibold text-white transition-colors disabled:opacity-50"
            >
              {loading && <Loader2 className="h-3 w-3 animate-spin" />}
              Send
            </button>
          </form>
          {error && (
            <p className="mt-2 text-[10px] text-red-600">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
