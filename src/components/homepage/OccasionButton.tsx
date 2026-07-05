import Link from 'next/link'
import { cn } from '@/lib/utils'

interface OccasionButtonProps {
  label: string
  icon: React.ReactNode
  href?: string
  className?: string
}

export function OccasionButton({
  label,
  icon,
  href = '#',
  className,
}: OccasionButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col items-center gap-3 transition-all duration-300 hover:-translate-y-1',
        className,
      )}
    >
      <div className="border-brand-100 text-brand-600 group-hover:border-brand-300 group-hover:bg-brand-50 group-hover:text-brand-700 flex h-20 w-20 items-center justify-center rounded-full border-2 bg-white/80 transition-all duration-300 group-hover:shadow-md sm:h-24 sm:w-24">
        {icon}
      </div>
      <span className="font-display text-brand-800 group-hover:text-brand-600 text-xs font-semibold transition-colors sm:text-sm">
        {label}
      </span>
    </Link>
  )
}
