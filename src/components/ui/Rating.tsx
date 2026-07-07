'use client'

import { cn } from '@/lib/utils'

interface RatingProps {
  value: number
  max?: number
  size?: 'sm' | 'md'
  className?: string
}

export function Rating({
  value,
  max = 5,
  size = 'sm',
  className,
}: RatingProps) {
  return (
    <div
      className={cn('flex items-center gap-0.5', className)}
      role="img"
      aria-label={`${value} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => (
        <svg
          key={i}
          className={cn(
            size === 'sm' ? 'h-3 w-3' : 'h-4 w-4',
            i < Math.round(value)
              ? 'text-gold-500 fill-gold-500'
              : 'fill-neutral-200 text-neutral-200',
          )}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}
