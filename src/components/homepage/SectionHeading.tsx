import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  viewAllHref?: string
  viewAllLabel?: string
  className?: string
}

export function SectionHeading({
  title,
  subtitle,
  align = 'center',
  viewAllHref,
  viewAllLabel = 'View All',
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-8 md:mb-12',
        align === 'center' && 'text-center',
        className,
      )}
    >
      {/* Decorative line above */}
      <div
        className={cn(
          'bg-brand-600/30 mx-auto mb-4 h-px w-12',
          align === 'center' ? 'mx-auto' : '',
        )}
      />
      <h2 className="font-display text-brand-950 text-2xl font-semibold tracking-tight md:text-3xl lg:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="text-brand-700/70 mt-2 max-w-xl text-sm md:text-base">
          {subtitle}
        </p>
      )}
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="text-brand-600 hover:text-brand-700 mt-4 inline-flex items-center gap-1 text-sm font-medium transition-colors"
        >
          {viewAllLabel}
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  )
}
