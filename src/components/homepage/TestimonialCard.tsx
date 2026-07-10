import { cn } from '@/lib/utils'
import { Rating } from '@/components/ui/Rating'

interface TestimonialCardProps {
  quote: string
  name: string
  location?: string
  rating?: number
  className?: string
}

export function TestimonialCard({
  quote,
  name,
  location,
  rating = 5,
  className,
}: TestimonialCardProps) {
  return (
    <div
      className={cn(
        'border-brand-100/60 relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-8',
        className,
      )}
    >
      {/* Quote icon */}
      <svg
        className="text-brand-100/50 absolute top-5 right-5 h-8 w-8"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>

      {rating && rating > 0 && (
        <Rating value={rating} size="md" className="mb-3" />
      )}

      {/* Quote */}
      <blockquote className="font-body text-brand-800/80 relative z-10 flex-1 text-sm leading-relaxed sm:text-base">
        &ldquo;{quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="border-brand-100/40 mt-5 flex items-center gap-3 border-t pt-4">
        <div className="bg-brand-100 text-brand-600 flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <cite className="font-display text-brand-900 text-sm font-semibold not-italic">
            {name}
          </cite>
          {location && <p className="text-brand-700/60 text-xs">{location}</p>}
        </div>
      </div>
    </div>
  )
}
