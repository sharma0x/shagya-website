'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { WishlistButton } from '@/components/product/WishlistButton'
import { ProductBadge } from '@/components/ui/ProductBadge'
import { cn } from '@/lib/utils'
import { getProductUrl } from '@/lib/product-url'
import { liftVariantGallery } from '@/lib/product-utils'

const ph = (w: number, h: number, _bg: string, _fg: string, text: string) =>
  `https://images.placeholders.dev/?width=${w}&height=${h}&text=${encodeURIComponent(text.substring(0, 20))}&bgColor=%2369254e&textColor=%23f5e8ee&fontFamily=lora&fontWeight=600`

function getGalleryUrls(product: any): string[] {
  const gallery = product.gallery
  if (!gallery || !Array.isArray(gallery) || gallery.length === 0) {
    return [ph(600, 800, '69254e', 'f5e8ee', product.name || 'Saree')]
  }
  return gallery
    .map((g: any) => {
      if (typeof g.image === 'object' && g.image !== null) {
        return g.image.sizes?.card?.url || g.image.url || ''
      }
      return ph(600, 800, '69254e', 'f5e8ee', product.name || 'Saree')
    })
    .filter(Boolean)
}

function getDiscountPercent(product: any): number | null {
  if (
    product.compareAtPrice &&
    product.compareAtPrice > 0 &&
    product.basePrice &&
    product.compareAtPrice > product.basePrice
  ) {
    return Math.round(
      ((product.compareAtPrice - product.basePrice) / product.compareAtPrice) *
        100,
    )
  }
  return null
}

export interface ProductCardProduct {
  id: string | number
  name: string
  slug?: string | null
  basePrice: number | null
  compareAtPrice?: number | null
  weave?: string | null
  fabric?: string | null
  gallery?: any
  quantity?: number | null
  trackQuantity?: boolean | null
  lowStockThreshold?: number | null
  color?: { slug: string; name: string; hex: string } | null
}

interface ProductCardProps {
  product: ProductCardProduct
  variant?: 'grid' | 'compact' | 'row'
  showWishlist?: boolean
  className?: string
}

export function ProductCard({
  product,
  variant = 'grid',
  showWishlist = true,
  className,
}: ProductCardProps) {
  // A top-level `color` means the caller already resolved a specific color
  // variant (e.g. exploded category cards) — trust its gallery as-is.
  // Otherwise lift the first enabled variant so image + color label match.
  const adapted = product.color ? product : liftVariantGallery(product)
  const galleryUrls = getGalleryUrls(adapted)
  const [activeImage, setActiveImage] = useState(0)
  const [isCardHovered, setIsCardHovered] = useState(false)
  const dotHoveredRef = useRef(false)
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const discountPct = getDiscountPercent(product)
  const isOOS = product.trackQuantity === true && (product.quantity ?? 0) <= 0

  // Auto-detect badge
  const badge = discountPct
    ? ('sale' as const)
    : (product as any).purchaseCount > 5
      ? ('bestseller' as const)
      : undefined

  // Auto-rotate carousel on hover — pause when dot is hovered
  useEffect(() => {
    if (isCardHovered && galleryUrls.length > 1) {
      autoTimerRef.current = setInterval(() => {
        if (!dotHoveredRef.current) {
          setActiveImage((prev) => (prev + 1) % galleryUrls.length)
        }
      }, 1500)
    }
    return () => {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current)
        autoTimerRef.current = null
      }
    }
  }, [isCardHovered, galleryUrls.length])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current)
    }
  }, [])

  const isCompact = variant === 'compact'

  if (variant === 'row') {
    return (
      <div className={cn('flex gap-4', className)}>
        <Link
          href={getProductUrl(product.slug, product.id, adapted.color?.slug)}
          className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
        >
          <Image
            src={galleryUrls[0]}
            alt={product.name}
            fill
            sizes="96px"
            className="object-cover"
            unoptimized={galleryUrls[0]?.startsWith('https://placehold.co')}
          />
        </Link>
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <Link
              href={getProductUrl(
                product.slug,
                product.id,
                adapted.color?.slug,
              )}
              className="font-display hover:text-brand-700 block text-sm font-semibold text-neutral-900 transition-colors"
            >
              {product.name}
            </Link>
            <p className="font-body mt-0.5 text-xs text-neutral-400">
              {[product.weave, product.fabric, adapted.color?.name]
                .filter(Boolean)
                .map((s) => (s ?? '').toLowerCase())
                .join(' · ')}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-display text-sm font-semibold text-neutral-900">
              ₹{(product.basePrice ?? 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn('group flex flex-col [perspective:800px]', className)}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => {
        setIsCardHovered(false)
        setActiveImage(0)
      }}
    >
      <Link
        href={getProductUrl(product.slug, product.id, adapted.color?.slug)}
        className={cn(
          'flex flex-1 flex-col transition-all duration-300 ease-out',
          'hover:-translate-y-1 hover:[transform:rotateY(-2deg)_translateZ(8px)]',
          'hover:shadow-xl hover:shadow-neutral-200/60',
          'rounded-lg',
        )}
      >
        {/* Image */}
        <div
          className={cn(
            'relative overflow-hidden bg-neutral-100',
            isCompact
              ? 'aspect-[3/4] rounded-t-lg'
              : 'aspect-[3/4] rounded-t-lg',
          )}
        >
          {galleryUrls.map((url, i) => (
            <Image
              key={i}
              src={url}
              alt={`${product.name} ${i + 1}`}
              fill
              sizes={isCompact ? '128px' : '(max-width: 640px) 50vw, 25vw'}
              priority={i === 0}
              className={cn(
                'object-cover transition-opacity duration-300',
                i === activeImage ? 'opacity-100' : 'opacity-0',
                galleryUrls.length > 1 &&
                  i === activeImage &&
                  'group-hover:scale-105',
              )}
              unoptimized={url.startsWith('https://placehold.co')}
            />
          ))}
          {showWishlist && (
            <div className="absolute top-1.5 right-1.5 z-10">
              <WishlistButton productId={product.id as number} />
            </div>
          )}
          {badge && (
            <div className="absolute top-1.5 left-1.5 z-10">
              <ProductBadge type={badge} />
            </div>
          )}
          {discountPct && (
            <div className="absolute bottom-2 left-2 z-10">
              <span className="rounded-full bg-red-500/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                {discountPct}% OFF
              </span>
            </div>
          )}
          {isOOS && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <span className="font-display bg-brand-600 rounded-md px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                Out of Stock
              </span>
            </div>
          )}

          {/* Dot indicators — visible on card hover, manual hover only */}
          {galleryUrls.length > 1 && (
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {galleryUrls.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onMouseEnter={() => {
                    dotHoveredRef.current = true
                    setActiveImage(i)
                  }}
                  onMouseLeave={() => {
                    dotHoveredRef.current = false
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setActiveImage(i)
                  }}
                  className={cn(
                    'h-2 w-2 rounded-full border border-white/60 transition-all duration-200',
                    i === activeImage
                      ? 'bg-white shadow-sm'
                      : 'bg-white/30 hover:bg-white/70',
                  )}
                  aria-label={`View image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-1 flex-col rounded-b-lg bg-white px-2.5 pt-2 pb-3">
          <p className="font-display text-brand-950 group-hover:text-brand-700 text-sm font-semibold transition-colors">
            {product.name}
          </p>
          {(product.weave || product.fabric || adapted.color) && (
            <p className="text-brand-700/60 mt-0.5 text-xs">
              {[product.weave, product.fabric, adapted.color?.name]
                .filter(Boolean)
                .map((s) => (s ?? '').toLowerCase())
                .join(' · ')}
            </p>
          )}

          {/* Price */}
          <div className="mt-auto min-h-[28px] pt-1.5">
            <div className="flex flex-wrap items-baseline gap-1.5">
              <span className="font-display text-brand-700 text-sm font-semibold">
                ₹{(product.basePrice ?? 0).toLocaleString('en-IN')}
              </span>
              {product.compareAtPrice &&
                product.basePrice &&
                product.compareAtPrice > product.basePrice && (
                  <span className="text-brand-700/40 text-xs line-through">
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
