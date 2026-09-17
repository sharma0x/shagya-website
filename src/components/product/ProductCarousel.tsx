'use client'

import { useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { ProductCard } from '@/components/product/ProductCard'
import { IconChevronDown, IconLoader2 } from '@tabler/icons-react'

const PAGE_SIZE = 8

interface ProductCarouselProps {
  initialProducts: any[]
  initialHasMore?: boolean
  badge?: 'new' | 'sale' | 'bestseller'
  className?: string
}

export function ProductCarousel({
  initialProducts,
  initialHasMore = false,
  badge,
  className,
}: ProductCarouselProps) {
  const [products, setProducts] = useState(initialProducts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loading, setLoading] = useState(false)

  const fetchMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    try {
      const nextPage = page + 1
      const res = await fetch(
        `/api/products/list?page=${nextPage}&limit=${PAGE_SIZE}`,
      )
      if (!res.ok) throw new Error('Failed to fetch')

      const data = await res.json()
      setProducts((prev) => [...prev, ...data.products])
      setPage(nextPage)
      setHasMore(data.hasMore)
    } catch (err) {
      console.error('Error fetching more products:', err)
    } finally {
      setLoading(false)
    }
  }, [page, hasMore, loading])

  return (
    <div className={cn('', className)}>
      {/* Mobile: 2-col grid with paginated Show More */}
      <div className="grid grid-cols-2 gap-3 sm:hidden">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} badge={badge} />
        ))}
      </div>

      {/* Show more button — mobile only */}
      {hasMore && (
        <div className="mt-4 flex justify-center sm:hidden">
          <button
            onClick={fetchMore}
            disabled={loading}
            className={cn(
              'border-brand-200 text-brand-700 hover:bg-brand-50 inline-flex items-center gap-1.5 rounded-full border bg-white px-5 py-2 text-sm font-medium transition-colors active:scale-95 disabled:opacity-60',
            )}
          >
            {loading ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Show more
                <IconChevronDown className="h-4 w-4" />
              </>
            )}
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
