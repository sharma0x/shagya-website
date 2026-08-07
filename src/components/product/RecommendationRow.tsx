'use client'

import { useRef, useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getProductUrl } from '@/lib/product-url'

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
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const updateArrows = () => {
    const el = scrollRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 10)
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
  }

  useEffect(() => {
    updateArrows()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', updateArrows, { passive: true })
    return () => el.removeEventListener('scroll', updateArrows)
  }, [products])

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollBy({
      left: direction === 'left' ? -220 : 220,
      behavior: 'smooth',
    })
  }

  if (!products.length) return null

  // Compute discount for each product
  const getBadge = (p: any) => {
    if (p.compareAtPrice && p.basePrice && p.compareAtPrice > p.basePrice)
      return 'sale'
    if (p.purchaseCount > 5) return 'bestseller'
    return undefined
  }

  return (
    <section className={cn('relative', className)}>
      {title && (
        <h2 className="font-display text-lg font-semibold tracking-tight text-neutral-900">
          {title}
        </h2>
      )}

      <div className="relative mt-4">
        {/* Left arrow */}
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="text-brand-600 hover:text-brand-700 absolute top-[42%] -left-3 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-colors hover:bg-white"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Right arrow */}
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="text-brand-600 hover:text-brand-700 absolute top-[42%] -right-3 z-10 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-colors hover:bg-white"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="scrollbar-hide flex gap-4 overflow-x-auto px-1 pb-2"
        >
          {products.map((p) => (
            <HomepageCard key={p.id} product={p} badge={getBadge(p)} />
          ))}
        </div>
      </div>
    </section>
  )
}

// Inline lightweight homepage-style card for recommendations
import Link from 'next/link'
import { SkeletonImage } from '@/components/ui/SkeletonImage'
import { WishlistButton } from '@/components/product/WishlistButton'
import { ProductBadge } from '@/components/ui/ProductBadge'

const ph = (w: number, h: number, bg: string, fg: string, text: string) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}&font=lora`

interface HomepageCardProps {
  product: any
  badge?: 'new' | 'sale' | 'bestseller'
}

function HomepageCard({ product, badge }: HomepageCardProps) {
  const imageUrl =
    product.gallery?.[0]?.image && typeof product.gallery[0].image === 'object'
      ? product.gallery[0].image.sizes?.card?.url ||
        product.gallery[0].image.url
      : ph(600, 800, '69254e', 'f5e8ee', product.name)

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.basePrice
      ? Math.round(
          ((product.compareAtPrice - product.basePrice) /
            product.compareAtPrice) *
            100,
        )
      : 0

  return (
    <Link
      href={getProductUrl(product.slug, product.id)}
      className="group block w-48 min-w-[192px] shrink-0"
    >
      <div className="relative overflow-hidden rounded-xl bg-neutral-100 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
        <div className="aspect-[4/5] w-full">
          <SkeletonImage
            src={imageUrl || ''}
            alt={product.name}
            fill
            sizes="192px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            unoptimized={imageUrl?.startsWith('https://placehold.co')}
          />
        </div>

        <div className="absolute top-2 right-2 z-10">
          <WishlistButton productId={product.id} />
        </div>

        {badge && (
          <div className="absolute top-2 left-2 z-10">
            <ProductBadge type={badge} />
          </div>
        )}

        {discount > 0 && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              {discount}% OFF
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 px-0.5">
        <p className="font-display text-brand-950 group-hover:text-brand-700 text-sm font-semibold transition-colors">
          {product.name}
        </p>
        <div className="mt-1.5 flex flex-wrap items-baseline gap-1.5">
          <span className="font-display text-brand-700 text-sm font-semibold">
            ₹{(product.basePrice ?? 0).toLocaleString('en-IN')}
          </span>
          {product.compareAtPrice &&
            product.compareAtPrice > product.basePrice && (
              <span className="text-brand-700/40 text-xs line-through">
                ₹{product.compareAtPrice.toLocaleString('en-IN')}
              </span>
            )}
        </div>
      </div>
    </Link>
  )
}
