import Link from 'next/link'
import { cn } from '@/lib/utils'
import { SkeletonImage } from '@/components/ui/SkeletonImage'

const ph = (w: number, h: number, bg: string, fg: string, text: string) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}&font=lora`

interface CategoryCardProps {
  name: string
  slug?: string | null
  imageUrl?: string | null
  productCount?: number
  className?: string
}

export function CategoryCard({
  name,
  slug,
  imageUrl,
  productCount,
  className,
}: CategoryCardProps) {
  const imgSrc = imageUrl || ph(300, 400, '7a3a5d', 'f5e8ee', name)

  return (
    <Link
      href={slug ? `/category/${slug}` : '#'}
      className={cn(
        'group relative block overflow-hidden rounded-2xl bg-neutral-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
        className,
      )}
    >
      <div className="aspect-[4/5] w-full sm:aspect-square">
        <SkeletonImage
          src={imgSrc}
          alt={name}
          fill
          sizes="(max-width: 640px) 60vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized={imgSrc.startsWith('https://placehold.co')}
        />
      </div>

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Decorative corner accent */}
      <div className="pointer-events-none absolute top-3 right-3 h-12 w-12 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <svg
          viewBox="0 0 48 48"
          fill="none"
          className="h-full w-full text-white/30"
        >
          <path
            d="M12 4h32v32M4 12h32v32"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      {/* Label */}
      <div className="absolute right-0 bottom-0 left-0 p-4 sm:p-5">
        <h3 className="font-display text-lg font-semibold text-white drop-shadow-sm sm:text-xl">
          {name}
        </h3>
        {productCount !== undefined && (
          <p className="mt-1 text-xs text-white/70">
            {productCount} {productCount === 1 ? 'piece' : 'pieces'}
          </p>
        )}
        <div className="text-gold-400 mt-2 flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          Explore
          <svg
            className="h-3 w-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}
