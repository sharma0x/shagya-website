'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getProductUrl } from '@/lib/product-url'
import { SkeletonImage } from '@/components/ui/SkeletonImage'
import { WishlistButton } from '@/components/product/WishlistButton'
import { ProductBadge } from '@/components/ui/ProductBadge'
import { Rating } from '@/components/ui/Rating'
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react'

const ph = (w: number, h: number, bg: string, fg: string, text: string) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}&font=lora`

interface ProductCardProduct {
  id: number
  slug?: string | null
  name: string
  basePrice: number
  compareAtPrice?: number | null
  weave?: string | null
  fabric?: string | null
  gallery?:
    | {
        image:
          | number
          | {
              url?: string | null
              sizes?: {
                card?: { url?: string | null }
              }
            }
        alt?: string | null
        id?: string | null
      }[]
    | null
  color?: { slug: string; name: string; hex: string } | null
}

interface ProductCardProps {
  product: ProductCardProduct
  badge?: 'new' | 'sale' | 'bestseller'
  rating?: number
  className?: string
}

export function ProductCard({
  product,
  badge,
  rating,
  className,
}: ProductCardProps) {
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
      className={cn('group block', className)}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden rounded-xl bg-neutral-100 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
        <div className="aspect-[4/5] w-full">
          <SkeletonImage
            src={imageUrl || ''}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            unoptimized={imageUrl?.startsWith('https://placehold.co')}
          />
        </div>

        {/* Top-right actions */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
          <WishlistButton productId={product.id} />
        </div>

        {/* Badge */}
        {badge && (
          <div className="absolute top-2 left-2 z-10">
            <ProductBadge type={badge} />
          </div>
        )}

        {/* Discount pill */}
        {discount > 0 && (
          <div className="absolute bottom-2 left-2 z-10">
            <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
              {discount}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="mt-3 px-0.5">
        <p className="font-display text-brand-950 group-hover:text-brand-700 text-sm font-semibold transition-colors">
          {product.name}
        </p>
        {product.color && (
          <div className="mt-1 flex items-center gap-1.5">
            <span
              className="inline-block h-3 w-3 flex-shrink-0 rounded-full border border-neutral-300"
              style={{ backgroundColor: product.color.hex }}
            />
            <span className="font-body truncate text-[10px] text-neutral-500">
              {product.color.name}
            </span>
          </div>
        )}
        {(product.weave || product.fabric) && (
          <p className="text-brand-700/60 mt-0.5 text-xs">
            {[product.weave, product.fabric].filter(Boolean).join(' · ')}
          </p>
        )}
        {rating && rating > 0 && <Rating value={rating} className="mt-1.5" />}
        <div className="mt-1.5 flex min-h-[28px] flex-wrap items-baseline gap-1.5">
          <span className="font-display text-brand-700 text-sm font-semibold">
            ₹{product.basePrice.toLocaleString('en-IN')}
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

// ──────────────────────────────────────────────
// Horizontal scrolling carousel for product sections
// ──────────────────────────────────────────────

interface ProductCarouselProps {
  products: ProductCardProduct[]
  title?: string
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
