'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCart } from '@/lib/store/cart'
import { ShoppingCart, Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'

interface ProductActionsProps {
  product: {
    id: number | string
    name: string
    slug: string
    basePrice: number
    compareAtPrice?: number
    gallery?: Array<{ image: any; alt?: string }>
    fabric: string
    weave: string
  }
}

const SAREE_SIZES = ['Standard (Free Size)', '5.5 Meters', '6.0 Meters (+₹600)']
const BLOUSE_SIZES = [
  'Unstitched',
  'Stitched: XS',
  'Stitched: S',
  'Stitched: M',
  'Stitched: L',
  'Stitched: XL',
]

export function ProductActions({ product }: ProductActionsProps) {
  const { addItem } = useCart()
  const router = useRouter()
  const { data: session } = useSession()

  const [size, setSize] = useState(SAREE_SIZES[0])
  const [blouseSize, setBlouseSize] = useState(BLOUSE_SIZES[0])
  const [addedState, setAddedState] = useState<'idle' | 'added'>('idle')
  const [inWishlist, setInWishlist] = useState(false)
  const [wishlistLoading, setWishlistLoading] = useState(false)

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
    addItem(product, 1, { size, blouseSize })
    setAddedState('added')
    setTimeout(() => setAddedState('idle'), 2200)
  }

  const handleBuyNow = () => {
    addItem(product, 1, { size, blouseSize })
    router.push('/checkout')
  }

  return (
    <div className="space-y-7">
      {/* Saree Size */}
      <div>
        <p className="font-display text-xs font-semibold text-neutral-500">
          Saree Size
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {SAREE_SIZES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`font-body rounded-xl border px-4 py-2.5 text-xs font-medium transition-all ${
                size === s
                  ? 'border-brand-600 bg-brand-50/60 text-brand-700'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Blouse Stitching */}
      <div>
        <p className="font-display text-xs font-semibold text-neutral-500">
          Blouse Stitching
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {BLOUSE_SIZES.map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBlouseSize(b)}
              className={`font-body rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all ${
                blouseSize === b
                  ? 'border-brand-600 bg-brand-50/60 text-brand-700'
                  : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
        <p className="font-body mt-2 text-[11px] leading-relaxed text-neutral-400">
          Stitching adds 3–5 days. Unstitched blouse piece included as standard.
        </p>
      </div>

      {/* CTAs — Cart, Buy Now, Wishlist in one row */}
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

        {/* Wishlist — icon only */}
        <button
          onClick={handleToggleWishlist}
          disabled={wishlistLoading}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
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
    </div>
  )
}
