'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/components/product/ProductCard'
import { IconChevronDown } from '@tabler/icons-react'

interface ProductCarouselProps {
  products: any[]
  badge?: 'new' | 'sale' | 'bestseller'
  className?: string
  /**
   * How many products to show initially on mobile before the "Show more" button.
   * Defaults to 4 (a full 2×2 on small screens, 2×3 visible above the fold on larger phones).
   */
  mobileInitialCount?: number
}

export function ProductCarousel({
  products,
  badge,
  className,
  mobileInitialCount = 4,
}: ProductCarouselProps) {
  const [showAll, setShowAll] = useState(false)

  if (!products || products.length === 0) return null

  const hasMore = products.length > mobileInitialCount
  const visibleProducts = showAll
    ? products
    : products.slice(0, mobileInitialCount)

  return (
    <div className={cn('', className)}>
      {/*
       * Mobile: 2-column grid.
       *   - Shows mobileInitialCount products by default.
       *   - "Show more" button reveals the rest (no page navigation required).
       * Tablet (sm): 2-column grid — same layout, just larger cards.
       * Desktop (lg): 4-column grid — full row.
       */}

      {/* Mobile grid — controlled visibility */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {visibleProducts.map((p) => (
          <ProductCard key={p.id} product={p} badge={badge} />
        ))}
      </div>

      {/* Show more / Show less — mobile only */}
      {hasMore && (
        <div className="mt-4 flex justify-center sm:hidden">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="text-brand-700 border-brand-200 hover:bg-brand-50 inline-flex items-center gap-1.5 rounded-full border bg-white px-5 py-2 text-sm font-medium transition-colors active:scale-95"
            aria-expanded={showAll}
          >
            {showAll ? (
              <>
                Show less
                <IconChevronDown className="h-4 w-4 rotate-180 transition-transform" />
              </>
            ) : (
              <>
                Show more ({products.length - mobileInitialCount} more)
                <IconChevronDown className="h-4 w-4 transition-transform" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Tablet + Desktop grid — always shows all products */}
      <div className="hidden sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} badge={badge} />
        ))}
      </div>
    </div>
  )
}
