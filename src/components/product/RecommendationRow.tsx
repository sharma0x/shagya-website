import { ProductCard } from '@/components/product/ProductCard'
import { cn } from '@/lib/utils'

interface RecommendationRowProps {
  title: string
  products: any[]
  className?: string
}

export function RecommendationRow({
  title,
  products,
  className,
}: RecommendationRowProps) {
  if (products.length === 0) return null

  return (
    <section className={className}>
      {title && (
        <h2 className="font-display text-lg font-semibold tracking-tight text-neutral-900">
          {title}
        </h2>
      )}
      <div className={cn('mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-hide')}>
        {products.map((p) => (
          <div key={p.id} className="w-48 min-w-[192px] shrink-0">
            <ProductCard
              product={p}
              variant="grid"
              showWishlist
              showActions
            />
          </div>
        ))}
      </div>
    </section>
  )
}
