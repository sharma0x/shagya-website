import Link from 'next/link'
import { cn } from '@/lib/utils'

type LogoProps = {
  className?: string
  showWordmark?: boolean
  wordmarkClassName?: string
  href?: string | null
}

export function Logo({
  className,
  showWordmark = true,
  wordmarkClassName,
  href = '/',
}: LogoProps) {
  const mark = (
    <>
      <img
        src="/shagya-logo.svg"
        alt=""
        aria-hidden="true"
        className={cn('h-9 w-9 select-none', className)}
      />
      {showWordmark && (
        <span
          className={cn(
            'font-display text-xl font-semibold tracking-tight',
            wordmarkClassName,
          )}
        >
          Shagya
        </span>
      )}
    </>
  )

  if (href === null) {
    return (
      <span className="text-brand-600 inline-flex items-center gap-2.5">
        {mark}
      </span>
    )
  }

  return (
    <Link
      href={href}
      className="text-brand-600 hover:text-brand-700 inline-flex items-center gap-2.5 transition-colors"
      aria-label="Shagya — home"
    >
      {mark}
    </Link>
  )
}
