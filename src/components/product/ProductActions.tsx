'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCart } from '@/lib/store/cart'
import { ShoppingCart, Heart, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'

interface ProductActionsProps {
  product: {
    id: number | string
    name: string
    slug: string
    basePrice: number
    compareAtPrice?: number
    brand?: string | null
    tags?: string[]
    features?: string[]
    discountPercentage?: number
    purchaseCount?: number
    quantity?: number
    lowStockThreshold?: number
    rating?: { average: number; count: number }
    colorVariants: Array<{
      color: { slug: string; name: string; hex: string }
      gallery: Array<{ image: any; alt?: string }>
      priceOverride: number | null
      stock: number
    }>
    fabric: string
    weave: string
  }
  isOutOfStock?: boolean
  onVariantChange?: (imageUrls: string[]) => void
}

/* Temporarily disabled — size and blouse selection
const SAREE_SIZES = ['Standard (Free Size)', '5.5 Meters', '6.0 Meters (+₹600)']
const BLOUSE_SIZES = [
  'Unstitched',
  'Stitched: XS',
  'Stitched: S',
  'Stitched: M',
  'Stitched: L',
  'Stitched: XL',
]
*/

export function ProductActions({
  product,
  isOutOfStock,
  onVariantChange,
}: ProductActionsProps) {
  const { addItem } = useCart()
  const router = useRouter()
  const { data: session } = useSession()

  /* Temporarily disabled — size and blouse selection
  const [size, setSize] = useState(SAREE_SIZES[0])
  const [blouseSize, setBlouseSize] = useState(BLOUSE_SIZES[0])
  */
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [addedState, setAddedState] = useState<'idle' | 'added'>('idle')
  const [inWishlist, setInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

  const variants = product.colorVariants || []
  const selectedVariant = variants[selectedVariantIndex] ?? null
  const displayPrice = selectedVariant?.priceOverride ?? product.basePrice
  const displayCompareAt =
    selectedVariant?.priceOverride &&
    product.basePrice > (selectedVariant.priceOverride ?? 0)
      ? undefined
      : product.compareAtPrice
  const isVariantOOS = selectedVariant ? selectedVariant.stock <= 0 : false
  const effectiveOOS = isOutOfStock || isVariantOOS

  useEffect(() => {
    if (!session?.user) return
    fetch('/api/wishlist')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return
        setInWishlist(
          (data.items ?? []).some(
            (item: any) =>
              String(item.product?.id ?? item.product) === String(product.id),
          ),
        )
      })
      .catch(() => {})
  }, [session?.user, product.id])

  const handleToggleWishlist = useCallback(async () => {
    if (!session?.user) {
      router.push(
        `/account/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      )
      return
    }
    setWishlistLoading(true)
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: String(product.id) }),
      })
      if (res.ok) {
        const data = await res.json()
        setInWishlist(data.message === 'Product added to wishlist')
      }
    } catch {
    } finally {
      setWishlistLoading(false)
    }
  }, [session?.user, product.id, router])

  const handleAddToCart = () => {
    if (!selectedVariant) return
    addItem(
      { ...product, basePrice: displayPrice, gallery: selectedVariant.gallery },
      1,
      { color: selectedVariant.color },
    )
    setAddedState('added')
    setTimeout(() => setAddedState('idle'), 2200)
  }

  const handleBuyNow = () => {
    if (!selectedVariant) return
    addItem(
      { ...product, basePrice: displayPrice, gallery: selectedVariant.gallery },
      1,
      { color: selectedVariant.color },
    )
    router.push('/checkout')
  }

  return (
    <div className="space-y-7">
      {/* Color Variant Picker */}
      {variants.length > 1 ? (
        <div>
          <p className="font-display text-xs font-semibold text-neutral-500">
            Color —{' '}
            <span className="text-neutral-800">
              {selectedVariant?.color?.name || ''}
            </span>
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {variants.map((v, idx) => (
              <button
                key={v.color.slug}
                type="button"
                onClick={() => {
                  setSelectedVariantIndex(idx)
                  if (onVariantChange && v.gallery.length > 0) {
                    const urls = v.gallery.map((g: any) =>
                      typeof g.image === 'object' && g.image !== null
                        ? g.image.url
                        : '/images/placeholder.jpg',
                    )
                    onVariantChange(urls)
                  }
                }}
                title={v.color.name}
                className={`h-9 w-9 rounded-full transition-all duration-200 ${
                  selectedVariantIndex === idx
                    ? 'scale-110 shadow-md'
                    : 'opacity-70 hover:scale-105 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: v.color.hex,
                  outline:
                    selectedVariantIndex === idx
                      ? `2px solid ${v.color.hex}`
                      : '2px solid transparent',
                  outlineOffset: '2px',
                }}
              />
            ))}
          </div>
        </div>
      ) : variants.length === 1 ? (
        <div>
          <p className="font-display text-xs font-semibold text-neutral-500">
            Color —{' '}
            <span className="text-neutral-800">{variants[0].color.name}</span>
          </p>
        </div>
      ) : null}

      {selectedVariant?.priceOverride &&
        selectedVariant.priceOverride !== product.basePrice && (
          <p className="font-body mt-1 text-[11px] text-neutral-500">
            This color: ₹{displayPrice.toLocaleString('en-IN')}
          </p>
        )}

      {/* Temporarily disabled — size and blouse selection
      <div>
        <p className="font-display text-xs font-semibold text-neutral-500">Saree Size</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {SAREE_SIZES.map((s) => (
            <button key={s} type="button" onClick={() => setSize(s)}
              className={`font-body rounded-xl border px-4 py-2.5 text-xs font-medium transition-all ${
                size === s ? 'border-brand-600 bg-brand-50/60 text-brand-700' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="font-display text-xs font-semibold text-neutral-500">Blouse Stitching</p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {BLOUSE_SIZES.map((b) => (
            <button key={b} type="button" onClick={() => setBlouseSize(b)}
              className={`font-body rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all ${
                blouseSize === b ? 'border-brand-600 bg-brand-50/60 text-brand-700' : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}>{b}</button>
          ))}
        </div>
        <p className="font-body mt-2 text-[11px] leading-relaxed text-neutral-400">
          Stitching adds 3–5 days. Unstitched blouse piece included as standard.
        </p>
      </div>
      */}

      {/* CTAs — Out of Stock or Cart / Buy Now / Wishlist */}
      {effectiveOOS ? (
        <div className="space-y-3">
          <div className="border-brand-200 bg-brand-50 flex items-center gap-2 rounded-lg border px-3 py-2">
            <AlertTriangle className="text-brand-600 h-4 w-4 shrink-0" />
            <span className="font-body text-brand-800 text-xs font-bold">
              Out of Stock
            </span>
          </div>
          <div className="rounded-xl border-2 border-dashed border-neutral-200 bg-neutral-50 p-4 text-center">
            <Heart className="text-brand-600 mx-auto h-5 w-5" />
            <p className="font-display mt-2 text-sm font-semibold text-neutral-900">
              Save to Wishlist
            </p>
            <p className="font-body mt-1 text-xs text-neutral-500">
              We will notify you when this piece is back from the loom
            </p>
            <button
              onClick={handleToggleWishlist}
              disabled={wishlistLoading}
              className={`font-display mt-3 inline-flex h-10 items-center gap-2 rounded-xl px-5 text-xs font-semibold transition-all active:scale-[0.97] disabled:opacity-50 ${
                inWishlist
                  ? 'border border-red-200 bg-red-50 text-red-600'
                  : 'bg-brand-600 hover:bg-brand-700 text-white shadow-xs'
              }`}
            >
              <Heart
                className={`h-4 w-4 ${inWishlist ? 'fill-red-500' : ''}`}
              />
              {inWishlist ? 'Saved — You will be notified' : 'Add to Wishlist'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2.5">
          <button
            onClick={handleAddToCart}
            className={`font-display flex h-13 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold shadow-xs transition-all active:scale-[0.97] ${
              addedState === 'added'
                ? 'bg-success text-white'
                : 'border border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50'
            }`}
          >
            <ShoppingCart className="h-4 w-4 shrink-0" />
            {addedState === 'added' ? 'Added!' : 'Add to Cart'}
          </button>

          <button
            onClick={handleBuyNow}
            className="bg-brand-600 hover:bg-brand-700 font-display flex h-13 flex-1 items-center justify-center rounded-xl text-sm font-semibold text-white shadow-xs transition-all active:scale-[0.97]"
          >
            Buy Now
          </button>

          <button
            onClick={handleToggleWishlist}
            disabled={wishlistLoading}
            aria-label={
              inWishlist ? 'Remove from wishlist' : 'Save to wishlist'
            }
            className={`flex h-13 w-13 shrink-0 items-center justify-center rounded-xl border transition-all active:scale-[0.97] disabled:opacity-50 ${
              inWishlist
                ? 'border-red-200 bg-red-50 text-red-500'
                : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-700'
            }`}
          >
            <Heart
              className={`h-4.5 w-4.5 ${inWishlist ? 'fill-red-500' : ''}`}
            />
          </button>
        </div>
      )}
    </div>
  )
}
