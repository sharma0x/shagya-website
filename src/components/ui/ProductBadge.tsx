import { cn } from '@/lib/utils'

interface ProductBadgeProps {
  type: 'new' | 'sale' | 'bestseller'
  className?: string
}

const badgeStyles: Record<ProductBadgeProps['type'], string> = {
  new: 'bg-brand-600 text-white',
  sale: 'bg-red-500 text-white',
  bestseller: 'bg-gold-500 text-brand-900',
}

const badgeLabels: Record<ProductBadgeProps['type'], string> = {
  new: 'New',
  sale: 'Sale',
  bestseller: 'Best Seller',
}

export function ProductBadge({ type, className }: ProductBadgeProps) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase',
        badgeStyles[type],
        className,
      )}
    >
      {badgeLabels[type]}
    </span>
  )
}
