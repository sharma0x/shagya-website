import Link from 'next/link'
import Image from 'next/image'
import { WishlistButton } from '@/components/product/WishlistButton'
import { StockBadge } from '@/components/product/StockBadge'
import { ProductCardActions } from '@/components/product/ProductCardActions'
import { cn } from '@/lib/utils'

const ph = (w: number, h: number, bg: string, fg: string, text: string) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}&font=lora`

function getImageUrl(product: any): string {
  const g = product.gallery?.[0]
  if (g?.image && typeof g.image === 'object') {
    return g.image.sizes?.card?.url || g.image.url || ''
  }
  return ph(600, 800, '69254e', 'f5e8ee', product.name || 'Saree')
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
}

interface ProductCardProps {
  product: ProductCardProduct
  variant?: 'grid' | 'compact' | 'row'
  showWishlist?: boolean
  showActions?: boolean
  className?: string
}

export function ProductCard({
  product,
  variant = 'grid',
  showWishlist = true,
  showActions = true,
  className,
}: ProductCardProps) {
  const imageUrl = getImageUrl(product)
  const discountPct = getDiscountPercent(product)
  const isOOS =
    product.trackQuantity === true && (product.quantity ?? 0) <= 0

  const isCompact = variant === 'compact'

  if (variant === 'row') {
    return (
      <div className={cn('flex gap-4', className)}>
        <Link
          href={`/products/${product.slug}`}
          className="relative h-32 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-100"
        >
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes="96px"
            className="object-cover"
            unoptimized={imageUrl.startsWith('https://placehold.co')}
          />
        </Link>
        <div className="flex flex-1 flex-col justify-between py-1">
          <div>
            <Link
              href={`/products/${product.slug}`}
              className="font-display block text-sm font-semibold text-neutral-900 hover:text-brand-700 transition-colors"
            >
              {product.name}
            </Link>
            <p className="font-body mt-0.5 text-xs text-neutral-400">
              {product.weave} · {product.fabric}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div className="font-display text-sm font-semibold text-neutral-900">
              ₹{(product.basePrice ?? 0).toLocaleString('en-IN')}
            </div>
            {showActions && (
              <ProductCardActions
                productId={product.id}
                productName={product.name}
                product={product}
                isOutOfStock={isOOS}
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('group', className)}>
      <Link href={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div
          className={cn(
            'relative overflow-hidden bg-neutral-100',
            isCompact ? 'aspect-[4/5] rounded-lg' : 'aspect-[3/4] rounded-lg',
          )}
        >
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes={isCompact ? '144px' : '(max-width: 640px) 50vw, 25vw'}
            className="object-cover"
            unoptimized={imageUrl.startsWith('https://placehold.co')}
          />
          {showWishlist && (
            <div className="absolute top-1.5 right-1.5 z-10">
              <WishlistButton productId={product.id as number} />
            </div>
          )}
          {isOOS && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
              <span className="font-display rounded-md bg-white/90 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-700 shadow-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className={cn(isCompact ? 'mt-1.5' : 'mt-2')}>
          <p className="font-body truncate text-[10px] font-semibold tracking-wider text-neutral-500 uppercase">
            {product.weave}
          </p>
          <p
            className={cn(
              'font-display line-clamp-2 font-medium text-neutral-900',
              isCompact ? 'mt-0.5 text-[11px] leading-tight' : 'mt-0.5 text-xs leading-tight',
            )}
          >
            {product.name}
          </p>

          {/* Price */}
          <div
            className={cn(
              'flex flex-wrap items-baseline gap-1.5',
              isCompact ? 'mt-1' : 'mt-1.5',
            )}
          >
            <span
              className={cn(
                'font-display font-bold text-neutral-900',
                isCompact ? 'text-xs' : 'text-sm',
              )}
            >
              ₹{(product.basePrice ?? 0).toLocaleString('en-IN')}
            </span>
            {product.compareAtPrice &&
              product.basePrice &&
              product.compareAtPrice > product.basePrice && (
                <>
                  <span
                    className={cn(
                      'font-body text-neutral-400 line-through',
                      isCompact ? 'text-[10px]' : 'text-xs',
                    )}
                  >
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                  {discountPct && (
                    <span className="font-display font-semibold text-amber-600 text-[10px]">
                      ({discountPct}% OFF)
                    </span>
                  )}
                </>
              )}
          </div>
        </div>
      </Link>

      {/* Actions — always visible */}
      {showActions && (
        <div className={cn(isCompact ? 'mt-1.5' : 'mt-2')}>
          <ProductCardActions
            productId={product.id}
            productName={product.name}
            product={product}
            isOutOfStock={isOOS}
            variant={isCompact ? 'compact' : 'grid'}
          />
        </div>
      )}
    </div>
  )
}
