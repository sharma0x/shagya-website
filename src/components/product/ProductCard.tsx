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
  return ph(600, 750, '69254e', 'f5e8ee', product.name || 'Saree')
}

function getDiscountPercent(product: any): number | null {
  if (product.compareAtPrice && product.compareAtPrice > 0 && product.basePrice && product.compareAtPrice > product.basePrice) {
    return Math.round(
      ((product.compareAtPrice - product.basePrice) / product.compareAtPrice) * 100,
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
  const isRow = variant === 'row'

  if (isRow) {
    // Row variant — used on wishlist page
    return (
      <div className={cn('flex gap-4', className)}>
        <Link
          href={`/products/${product.slug}`}
          className="relative h-32 w-24 shrink-0 overflow-hidden rounded-xl bg-neutral-100"
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
            <div className="font-display text-sm font-semibold text-brand-700">
              ₹{(product.basePrice ?? 0).toLocaleString('en-IN')}
            </div>
            {showActions && (
              <ProductCardActions
                productId={product.id}
                productName={product.name}
                product={product}
                isOutOfStock={isOOS}
                variant="compact"
              />
            )}
          </div>
        </div>
      </div>
    )
  }

  // Grid + Compact variants
  return (
    <div className={cn('group block', className)}>
      <Link
        href={`/products/${product.slug}`}
        className="block"
      >
        <div
          className={cn(
            'relative overflow-hidden bg-neutral-100 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md',
            isCompact ? 'aspect-[4/5] rounded-lg' : 'aspect-[4/5] rounded-xl',
          )}
        >
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            sizes={isCompact ? '160px' : '(max-width: 640px) 50vw, 25vw'}
            className="object-cover"
            unoptimized={imageUrl.startsWith('https://placehold.co')}
          />
          {/* Wishlist + Stock overlay */}
          <div className="absolute top-2 right-2 z-10 flex flex-col items-end gap-1">
            {showWishlist && <WishlistButton productId={product.id as number} />}
            <StockBadge
              quantity={product.quantity ?? 0}
              trackQuantity={product.trackQuantity ?? false}
              lowStockThreshold={product.lowStockThreshold ?? 5}
            />
          </div>
        </div>

        {/* Info */}
        <div className={cn(isCompact ? 'mt-2 px-0.5' : 'mt-3 px-1')}>
          <p
            className={cn(
              'font-display font-semibold text-neutral-900 transition-colors group-hover:text-brand-700',
              isCompact ? 'line-clamp-2 text-xs' : 'line-clamp-2 text-sm',
            )}
          >
            {product.name}
          </p>
          <p
            className={cn(
              'font-body text-neutral-400',
              isCompact ? 'mt-0.5 text-[10px]' : 'mt-0.5 text-xs',
            )}
          >
            {product.weave} · {product.fabric}
          </p>

          {/* Price */}
          <div
            className={cn(
              'font-display flex flex-wrap items-baseline gap-1.5 font-semibold text-brand-700',
              isCompact ? 'mt-1 text-xs' : 'mt-1.5 text-sm',
            )}
          >
            <span>₹{(product.basePrice ?? 0).toLocaleString('en-IN')}</span>
            {product.compareAtPrice &&
              product.basePrice &&
              product.compareAtPrice > product.basePrice && (
                <>
                  <span
                    className={cn(
                      'font-normal text-neutral-400 line-through',
                      isCompact ? 'text-[10px]' : 'text-xs',
                    )}
                  >
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                  {discountPct && (
                    <span
                      className={cn(
                        'font-semibold text-green-600',
                        isCompact ? 'text-[10px]' : 'text-xs',
                      )}
                    >
                      {discountPct}% OFF
                    </span>
                  )}
                </>
              )}
          </div>
        </div>
      </Link>

      {/* Add to Cart + Buy Now — outside the Link */}
      {showActions && !isOOS && (
        <div className={cn(isCompact ? 'px-0.5' : 'px-1')}>
          <ProductCardActions
            productId={product.id}
            productName={product.name}
            product={product}
            isOutOfStock={isOOS}
            variant={variant}
          />
        </div>
      )}
    </div>
  )
}
