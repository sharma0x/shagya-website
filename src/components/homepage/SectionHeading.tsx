import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SectionHeadingProps {
  title: string
  subtitle?: string
  align?: 'left' | 'center'
  viewAllHref?: string
  viewAllLabel?: string
  size?: 'default' | 'sm'
  className?: string
}

export function SectionHeading({
  title,
  subtitle,
  align = 'left',
  viewAllHref,
  viewAllLabel = 'View All',
  size = 'default',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn(size === 'sm' ? 'mb-4' : 'mb-8 md:mb-12', className)}>
      {/* Decorative line above */}
      <div
        className={cn(
          'bg-brand-600/30 mb-3 h-px w-10',
          align === 'center' && 'mx-auto',
          align === 'left' && 'mx-auto sm:mx-0',
        )}
      />

      {/* Title row with optional view-all link */}
      <div
        className={cn(
          'flex flex-col gap-1',
          align === 'center'
            ? 'items-center text-center'
            : 'items-center text-center sm:flex-row sm:items-end sm:items-start sm:justify-between sm:text-left',
        )}
      >
        <h2
          className={cn(
            'font-display text-brand-950 font-semibold tracking-tight',
            size === 'sm'
              ? 'text-2xl md:text-2xl'
              : 'text-2xl md:text-3xl lg:text-4xl',
          )}
        >
          {title}
        </h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-brand-600 hover:text-brand-700 inline-flex shrink-0 items-center gap-1 text-sm font-medium transition-colors"
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

      {subtitle && (
        <p
          className={cn(
            'text-brand-700/70 mt-1 max-w-xl',
            size === 'sm' ? 'text-xs md:text-sm' : 'text-sm md:text-base',
            align === 'center' && 'mx-auto text-center',
            align === 'left' && 'mx-auto text-center sm:mx-0 sm:text-left',
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
