'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/components/product/ProductCard'
import { IconChevronDown } from '@tabler/icons-react'

const PAGE_SIZE = 8

interface ProductCarouselProps {
  products: any[]
  badge?: 'new' | 'sale' | 'bestseller'
  className?: string
}

export function ProductCarousel({
  products,
  badge,
  className,
}: ProductCarouselProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  if (!products || products.length === 0) return null

  const visibleProducts = products.slice(0, visibleCount)
  const hasMore = visibleCount < products.length

  return (
    <div className={cn('', className)}>
      {/* Mobile: 2-col grid with paginated Show More */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {visibleProducts.map((p) => (
          <ProductCard key={p.id} product={p} badge={badge} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-4 flex justify-center sm:hidden">
          <button
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="text-brand-700 border-brand-200 hover:bg-brand-50 inline-flex items-center gap-1.5 rounded-full border bg-white px-5 py-2 text-sm font-medium transition-colors active:scale-95"
          >
            Show more
            <IconChevronDown className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tablet + Desktop: full grid, all products visible */}
      <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} badge={badge} />
        ))}
      </div>
    </div>
  )
}
