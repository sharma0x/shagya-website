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

interface GalleryItem {
  url: string
  colorName?: string
  colorHex?: string
  colorSlug?: string
}

function getMultiColorGallery(product: any): GalleryItem[] {
  const items: GalleryItem[] = []
  const variants = (product.colorVariants || []).filter(
    (v: any) =>
      v.enabled !== false && v.color && v.gallery && v.gallery.length > 0,
  )

  if (variants.length > 0) {
    // 1st Pass: Pick the primary (first) image from EVERY enabled color variant in order
    for (const v of variants) {
      const firstImage = v.gallery[0]?.image
      const url =
        typeof firstImage === 'object' && firstImage !== null
          ? firstImage.sizes?.card?.url || firstImage.url || ''
          : typeof firstImage === 'string'
            ? firstImage
            : ''

      if (url) {
        items.push({
          url,
          colorName: v.color?.name,
          colorHex: v.color?.hex,
          colorSlug: v.color?.slug,
        })
      }
    }

    // 2nd Pass: Add remaining secondary images from each color variant
    for (const v of variants) {
      for (let i = 1; i < v.gallery.length; i++) {
        const img = v.gallery[i]?.image
        const url =
          typeof img === 'object' && img !== null
            ? img.sizes?.card?.url || img.url || ''
            : typeof img === 'string'
              ? img
              : ''

        if (url && !items.some((item) => item.url === url)) {
          items.push({
            url,
            colorName: v.color?.name,
            colorHex: v.color?.hex,
            colorSlug: v.color?.slug,
          })
        }
      }
    }
  }

  // Fallback to top-level product.gallery if no color variants gallery items were found
  if (items.length === 0) {
    const gallery = product.gallery || []
    for (const g of gallery) {
      const url =
        typeof g.image === 'object' && g.image !== null
          ? g.image.sizes?.card?.url || g.image.url || ''
          : typeof g.image === 'string'
            ? g.image
            : ''
      if (url) {
        items.push({
          url,
          colorName: product.color?.name,
          colorHex: product.color?.hex,
          colorSlug: product.color?.slug,
        })
      }
    }
  }

  // Final placeholder fallback if completely empty
  if (items.length === 0) {
    items.push({
      url: ph(600, 800, '69254e', 'f5e8ee', product.name || 'Saree'),
      colorName: product.color?.name,
    })
  }

  return items
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
  colorVariants?: any[] | null
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
  const adapted = product.color ? product : liftVariantGallery(product)
  const galleryItems = getMultiColorGallery(product)
  const [activeImage, setActiveImage] = useState(0)
  const [isCardHovered, setIsCardHovered] = useState(false)
  const dotHoveredRef = useRef(false)
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const discountPct = getDiscountPercent(product)
  const isOOS = product.trackQuantity === true && (product.quantity ?? 0) <= 0

  // Unique color variants for color swatches
  const availableColorVariants = (product.colorVariants || []).filter(
    (v: any) => v.enabled !== false && v.color && v.color.hex,
  )

  const activeItem = galleryItems[activeImage] || galleryItems[0]
  const activeColorName = activeItem?.colorName || adapted.color?.name
  const activeColorSlug = activeItem?.colorSlug || adapted.color?.slug

  // Auto-rotate carousel on hover — cycles through images across all color variants
  useEffect(() => {
    if (isCardHovered && galleryItems.length > 1) {
      autoTimerRef.current = setInterval(() => {
        if (!dotHoveredRef.current) {
          setActiveImage((prev) => (prev + 1) % galleryItems.length)
        }
      }, 1400)
    }
    return () => {
      if (autoTimerRef.current) {
        clearInterval(autoTimerRef.current)
        autoTimerRef.current = null
      }
    }
  }, [isCardHovered, galleryItems.length])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current)
    }
  }, [])

  // Auto-detect badge
  const badge = discountPct
    ? ('sale' as const)
    : (product as any).purchaseCount > 5
      ? ('bestseller' as const)
      : undefined

  const isCompact = variant === 'compact'

  if (variant === 'row') {
    return (
      <div className={cn('flex gap-4', className)}>
        <Link
          href={getProductUrl(product.slug, product.id, activeColorSlug)}
          className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
        >
          <Image
            src={galleryItems[0]?.url}
            alt={product.name}
            fill
            sizes="96px"
            className="object-cover"
            unoptimized={galleryItems[0]?.url.startsWith(
              'https://placehold.co',
            )}
          />
        </Link>
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <Link
              href={getProductUrl(product.slug, product.id, activeColorSlug)}
              className="font-display hover:text-brand-700 block text-sm font-semibold text-neutral-900 transition-colors"
            >
              {product.name}
            </Link>
            <p className="font-body mt-0.5 text-xs text-neutral-400">
              {[product.weave, product.fabric, activeColorName]
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
        href={getProductUrl(product.slug, product.id, activeColorSlug)}
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
          {galleryItems.map((item, i) => (
            <Image
              key={i}
              src={item.url}
              alt={`${product.name} ${item.colorName ? `- ${item.colorName}` : ''} ${i + 1}`}
              fill
              sizes={isCompact ? '128px' : '(max-width: 640px) 50vw, 25vw'}
              priority={i === 0}
              className={cn(
                'object-cover transition-opacity duration-300',
                i === activeImage ? 'opacity-100' : 'opacity-0',
                galleryItems.length > 1 &&
                  i === activeImage &&
                  'group-hover:scale-105',
              )}
              unoptimized={item.url.startsWith('https://placehold.co')}
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

          {/* Color Indicator Badge (when product has multiple colors) */}
          {availableColorVariants.length > 1 && (
            <div className="absolute top-2 left-2 z-10">
              <span className="rounded-full border border-neutral-200/40 bg-neutral-900/75 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur-xs">
                {availableColorVariants.length} Colors
              </span>
            </div>
          )}

          {/* Dot indicators — visible on card hover */}
          {galleryItems.length > 1 && (
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              {galleryItems.map((_, i) => (
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
          <p className="font-display text-brand-950 group-hover:text-brand-700 truncate text-sm font-semibold transition-colors">
            {product.name}
          </p>

          {(product.weave || product.fabric || activeColorName) && (
            <p className="text-brand-700/60 mt-0.5 truncate text-xs">
              {[product.weave, product.fabric, activeColorName]
                .filter(Boolean)
                .map((s) => (s ?? '').toLowerCase())
                .join(' · ')}
            </p>
          )}

          {/* Color Swatches */}
          {availableColorVariants.length > 1 && (
            <div className="mt-1.5 flex items-center gap-1.5">
              {availableColorVariants.map((v: any) => {
                const isSelected = activeColorSlug === v.color.slug
                const targetIdx = galleryItems.findIndex(
                  (g) => g.colorSlug === v.color.slug,
                )
                return (
                  <button
                    key={v.color.slug}
                    type="button"
                    title={v.color.name}
                    onMouseEnter={() => {
                      dotHoveredRef.current = true
                      if (targetIdx !== -1) setActiveImage(targetIdx)
                    }}
                    onMouseLeave={() => {
                      dotHoveredRef.current = false
                    }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      if (targetIdx !== -1) setActiveImage(targetIdx)
                    }}
                    className={cn(
                      'h-3.5 w-3.5 rounded-full border transition-all',
                      isSelected
                        ? 'border-brand-700 ring-brand-700/30 scale-125 ring-1'
                        : 'border-neutral-200 hover:scale-110',
                    )}
                    style={{ backgroundColor: v.color.hex || '#69254e' }}
                    aria-label={`Select color ${v.color.name}`}
                  />
                )
              })}
            </div>
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
