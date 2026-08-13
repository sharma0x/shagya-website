'use client'

import { useRef } from 'react'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/components/product/ProductCard'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

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
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!products || products.length === 0) return null

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const cardWidth = el.children[0]?.getBoundingClientRect().width ?? 200
    el.scrollBy({
      left: direction === 'left' ? -cardWidth : cardWidth,
      behavior: 'smooth',
    })
  }

  return (
    <div className={cn('relative', className)}>
      {/* Left arrow — mobile only */}
      <button
        onClick={() => scroll('left')}
        className="text-brand-700 absolute top-1/2 left-1 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-1.5 shadow-md transition-colors hover:bg-white active:scale-95 max-sm:flex"
        aria-label="Scroll left"
      >
        <IconChevronLeft className="h-4 w-4" />
      </button>

      {/* Right arrow — mobile only */}
      <button
        onClick={() => scroll('right')}
        className="text-brand-700 absolute top-1/2 right-1 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-1.5 shadow-md transition-colors hover:bg-white active:scale-95 max-sm:flex"
        aria-label="Scroll right"
      >
        <IconChevronRight className="h-4 w-4" />
      </button>

      {/* Scroll container — snap scroll on mobile */}
      <div
        ref={scrollRef}
        className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="max-w-[200px] min-w-[170px] flex-shrink-0 snap-start sm:max-w-none sm:min-w-0"
          >
            <ProductCard product={p} badge={badge} />
          </div>
        ))}
      </div>
    </div>
  )
}
