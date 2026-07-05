import { cn } from '@/lib/utils'

interface TrustFeatureProps {
  icon: React.ReactNode
  title: string
  description: string
  className?: string
}

export function TrustFeature({
  icon,
  title,
  description,
  className,
}: TrustFeatureProps) {
  return (
    <div
      className={cn(
        'border-brand-100/60 hover:border-brand-200 flex items-center gap-4 rounded-xl border bg-white/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-sm sm:flex-col sm:items-start sm:gap-3 sm:p-5 sm:text-center',
        className,
      )}
    >
      <div className="bg-brand-50 text-brand-600 flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-12 sm:w-12">
        {icon}
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-brand-950 text-sm font-semibold sm:text-base">
          {title}
        </h3>
        <p className="text-brand-700/70 mt-0.5 text-xs leading-relaxed sm:text-sm">
          {description}
        </p>
      </div>
    </div>
  )
}
