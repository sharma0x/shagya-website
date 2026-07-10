import { cn } from '@/lib/utils'

const TRENDING_COLORS = [
  { name: 'Wine', hex: '#7A294B', slug: 'burgundy' },
  { name: 'Teal', hex: '#1A6B65', slug: 'teal' },
  { name: 'Blush', hex: '#E8A0B4', slug: 'pink' },
  { name: 'Saffron', hex: '#E8A020', slug: 'gold' },
  { name: 'Forest', hex: '#2D5A3A', slug: 'green' },
  { name: 'Ivory', hex: '#F5F0E8', slug: 'ivory' },
]

interface ColorSwatchProps {
  name: string
  hex: string
  href?: string
  compact?: boolean
  className?: string
}

function ColorSwatch({
  name,
  hex,
  href = '#',
  compact,
  className,
}: ColorSwatchProps) {
  return (
    <a
      href={href}
      className={cn(
        'group flex flex-col items-center transition-all duration-300 hover:-translate-y-0.5',
        compact ? 'gap-0.5' : 'gap-2',
        className,
      )}
    >
      <div
        className={cn(
          'rounded-full border-2 border-white shadow-sm transition-transform duration-300 group-hover:scale-110',
          compact
            ? 'h-11 w-11 ring-0'
            : 'ring-brand-100/30 group-hover:ring-brand-300/50 h-14 w-14 ring-1 sm:h-16 sm:w-16',
        )}
        style={{ backgroundColor: hex }}
      >
        <span className="sr-only">{name}</span>
      </div>
      <span
        className={cn(
          'font-body text-brand-700/70 group-hover:text-brand-700 font-medium transition-colors',
          compact ? 'text-[10px]' : 'text-[11px] sm:text-xs',
        )}
      >
        {name}
      </span>
    </a>
  )
}

interface TrendingColorsProps {
  compact?: boolean
  className?: string
}

export function TrendingColors({ compact, className }: TrendingColorsProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap justify-center',
        compact ? 'gap-1' : 'gap-4 sm:gap-6',
        className,
      )}
    >
      {TRENDING_COLORS.map((color) => (
        <ColorSwatch
          key={color.slug}
          name={color.name}
          hex={color.hex}
          href={`/category/all?color=${color.slug}`}
          compact={compact}
        />
      ))}
    </div>
  )
}
