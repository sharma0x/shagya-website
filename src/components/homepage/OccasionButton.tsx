import Link from 'next/link'
import { cn } from '@/lib/utils'

interface OccasionButtonProps {
  label: string
  icon: React.ReactNode
  href?: string
  compact?: boolean
  className?: string
}

export function OccasionButton({
  label,
  icon,
  href = '#',
  compact,
  className,
}: OccasionButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col items-center transition-all duration-300 hover:-translate-y-0.5',
        compact ? 'gap-1' : 'gap-3',
        className,
      )}
    >
      <div
        className={cn(
          'flex items-center justify-center rounded-full border-2 bg-white/80 transition-all duration-300 group-hover:shadow-sm',
          compact
            ? 'border-brand-200 text-gold-500 group-hover:border-gold-400 group-hover:bg-gold-50 group-hover:text-gold-600 h-12 w-12'
            : 'border-brand-100 text-brand-600 group-hover:border-brand-300 group-hover:bg-brand-50 group-hover:text-brand-700 h-20 w-20 group-hover:shadow-md sm:h-24 sm:w-24',
        )}
      >
        {icon}
      </div>
      <span
        className={cn(
          'font-display text-brand-800 group-hover:text-brand-600 font-semibold transition-colors',
          compact ? 'text-[10px]' : 'text-xs sm:text-sm',
        )}
      >
        {label}
      </span>
    </Link>
  )
}
