import { cn } from '@/lib/utils'

interface StockBadgeProps {
  quantity: number
  trackQuantity: boolean
  /**
   * True when the product has color variants — variant products always derive
   * their quantity from variant stocks, so the badge applies regardless of
   * `trackQuantity`.
   */
  hasVariants?: boolean
  lowStockThreshold?: number
  className?: string
}

export function StockBadge({
  quantity,
  trackQuantity,
  hasVariants = false,
  lowStockThreshold = 5,
  className,
}: StockBadgeProps) {
  const tracked = trackQuantity || hasVariants
  if (!tracked) return null

  const isOutOfStock = quantity <= 0
  const isLowStock = quantity > 0 && quantity <= lowStockThreshold

  if (isOutOfStock) {
    return (
      <span
        className={cn(
          'font-display inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-[10px] font-semibold text-red-600',
          className,
        )}
      >
        Out of Stock
      </span>
    )
  }

  if (isLowStock) {
    return (
      <span
        className={cn(
          'font-display inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700',
          className,
        )}
      >
        Only {quantity} left
      </span>
    )
  }

  return null
}
