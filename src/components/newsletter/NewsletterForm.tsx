'use client'

import { useState } from 'react'

type FormState = 'idle' | 'loading' | 'success' | 'error'

export function NewsletterForm() {
  const [state, setState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setState('loading')
    const email = new FormData(e.currentTarget).get('email') as string
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setState('success')
      } else {
        const data = await res.json().catch(() => ({}))
        setErrorMsg(data.message ?? 'Something went wrong. Please try again.')
        setState('error')
      }
    } catch {
      setErrorMsg('Unable to subscribe right now. Please try again.')
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="py-5">
        <p className="font-display text-base font-semibold text-neutral-900">
          You&apos;re on the list.
        </p>
        <p className="mt-1 text-sm leading-relaxed text-neutral-500">
          First letter arrives this week. One weave, one maker, nothing else.
        </p>
      </div>
    )
  }

  return (
    <form className="mt-6 flex flex-col gap-3" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <input
        id="newsletter-email"
        name="email"
        type="email"
        required
        disabled={state === 'loading'}
        placeholder="you@example.com"
        className="font-body focus:border-brand-500 h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400 disabled:opacity-60"
        aria-describedby={state === 'error' ? 'newsletter-error' : undefined}
      />
      {state === 'error' && (
        <p
          id="newsletter-error"
          className="text-error text-xs"
          role="alert"
          aria-live="polite"
        >
          {errorMsg}
        </p>
      )}
      <button
        type="submit"
        disabled={state === 'loading'}
        className="bg-brand-600 font-display hover:bg-brand-700 focus-visible:ring-brand-400 inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {state === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  )
}
