import Link from 'next/link'
import { ArrowRight, Home } from 'lucide-react'

const QUICK_LINKS = [
  { label: 'Silk Sarees', href: '/category/silk' },
  { label: 'Cotton Sarees', href: '/category/cotton' },
  { label: 'Handloom', href: '/category/handloom' },
  { label: 'New Arrivals', href: '/collections' },
  { label: 'Journal', href: '/blog' },
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-24 text-center">
      {/* Decorative top rule */}
      <div className="rule-gold mb-10 w-12" aria-hidden="true" />

      {/* Large faded 404 */}
      <p
        className="font-display text-[9rem] leading-none font-bold tracking-tight text-neutral-100 select-none sm:text-[13rem]"
        aria-hidden="true"
      >
        404
      </p>

      {/* Headline */}
      <h1 className="font-display -mt-4 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
        This thread has gone astray
      </h1>

      {/* Body */}
      <p className="font-body mt-4 max-w-[42ch] text-sm leading-relaxed text-neutral-500">
        The page you&apos;re looking for may have been moved, renamed, or was
        never woven into our loom. Let us guide you back to something beautiful.
      </p>

      {/* Primary CTAs */}
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/"
          className="bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-400 inline-flex h-12 items-center gap-2 rounded-xl px-7 text-sm font-semibold text-white transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
        >
          <Home className="h-4 w-4" />
          Go home
        </Link>
        <Link
          href="/category/silk"
          className="group inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
        >
          Browse the collection
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Divider + quick links */}
      <div className="mt-16 w-full max-w-md border-t border-neutral-100 pt-10">
        <p className="font-display mb-5 text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
          You might be looking for
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-medium text-neutral-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Page Not Found — Shayga',
  description: 'The page you are looking for does not exist.',
}
