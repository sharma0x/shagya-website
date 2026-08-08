'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { useCart } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import { liftVariantGallery } from '@/lib/product-utils'
import { ArrowLeft, ShoppingBag, Heart, Loader2, Trash2 } from 'lucide-react'
import {
  ProductCard,
  type ProductCardProduct,
} from '@/components/product/ProductCard'

interface WishlistItem {
  id: string
  product: ProductCardProduct & {
    gallery?: any
    trackQuantity?: boolean
    quantity?: number
  }
  variant?: number | { id: number } | null
}

export default function WishlistPage() {
  const router = useRouter()
  const { data: sessionData, isPending } = useSession()
  const { addItem } = useCart()

  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isPending) return
    if (!sessionData?.user) {
      router.push('/account/login?redirect=/wishlist')
      return
    }

    async function loadWishlist() {
      try {
        const res = await fetch('/api/wishlist')
        if (res.ok) {
          const data = await res.json()
          setItems(data.items || [])
        }
      } catch (err) {
        console.error('Failed to load wishlist', err)
      } finally {
        setLoading(false)
      }
    }

    loadWishlist()
  }, [sessionData, isPending, router])

  const handleRemove = async (productId: number) => {
    setActionLoading(String(productId))
    try {
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: String(productId) }),
      })

      if (res.ok) {
        setItems((prev) =>
          prev.filter((item) => Number(item.product.id) !== Number(productId)),
        )
        useWishlistStore.getState().fetchWishlist()
      }
    } catch (err) {
      console.error('Failed to remove from wishlist', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleMoveToCart = async (item: WishlistItem) => {
    const product = item.product
    if (product.trackQuantity && (product.quantity ?? 0) <= 0) {
      return
    }
    setActionLoading(String(product.id))
    try {
      const adapted = liftVariantGallery(product)
      const variantColor =
        item.variant &&
        typeof item.variant === 'object' &&
        'color' in item.variant
          ? (item.variant as any).color
          : undefined

      addItem(
        {
          id: Number(product.id),
          name: product.name,
          slug: product.slug || '',
          basePrice: adapted.basePrice || 0,
          compareAtPrice: product.compareAtPrice ?? undefined,
          gallery: adapted.gallery as any,
          fabric: product.fabric || '',
          weave: product.weave || '',
        },
        1,
        variantColor ? { color: variantColor } : undefined,
      )

      await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: String(product.id) }),
      })

      setItems((prev) =>
        prev.filter((i) => Number(i.product.id) !== Number(product.id)),
      )
      useWishlistStore.getState().fetchWishlist()
    } catch (err) {
      console.error(err)
    } finally {
      setActionLoading(null)
    }
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand-600 h-8 w-8 animate-spin" />
        <p className="font-body text-sm text-neutral-500">
          Curating your wishlist shelf...
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="container-page mx-auto max-w-5xl">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between border-b border-neutral-200 pb-6">
          <div>
            <Link
              href="/account"
              className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <h1 className="font-display mt-2 flex items-center gap-2 text-2xl font-bold text-neutral-900">
              <Heart className="text-brand-600 fill-brand-600 h-6 w-6" />
              Your Wishlist
            </h1>
          </div>
          <span className="font-body rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-400">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Wishlist Grid */}
        {items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-neutral-100 bg-white p-12 text-center shadow-xs">
            <Heart className="mx-auto mb-3 h-12 w-12 text-neutral-200" />
            <h3 className="font-display text-base font-semibold text-neutral-900">
              Your Wishlist is Empty
            </h3>
            <p className="font-body mt-2 text-xs leading-relaxed text-neutral-500">
              Explore Shayga's handloom collections and save the drapes that
              resonate with your heritage.
            </p>
            <Link
              href="/"
              className="font-display bg-brand-600 hover:bg-brand-700 mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-semibold text-white transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const product = liftVariantGallery(item.product)
              const isThisLoading = actionLoading === String(product.id)
              const isOOS =
                product.trackQuantity === true && (product.quantity ?? 0) <= 0
              return (
                <div key={item.id} className="flex flex-col">
                  <ProductCard
                    product={product}
                    variant="grid"
                    showWishlist={false}
                    className="h-full"
                  />
                  <div className="mt-2 flex gap-2">
                    {isOOS ? (
                      <span className="font-display flex h-9 flex-1 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-[11px] font-semibold text-neutral-400">
                        Out of Stock
                      </span>
                    ) : (
                      <button
                        disabled={isThisLoading}
                        onClick={() => handleMoveToCart(item)}
                        className="bg-brand-600 hover:bg-brand-700 font-display flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg text-[11px] font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isThisLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <ShoppingBag className="h-3 w-3" />
                        )}
                        Move to Bag
                      </button>
                    )}
                    <button
                      disabled={isThisLoading}
                      onClick={() => handleRemove(Number(product.id))}
                      className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-medium text-neutral-500 transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-600 active:scale-95 disabled:opacity-50"
                      title="Remove from Wishlist"
                      aria-label="Remove from Wishlist"
                    >
                      {isThisLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                      <span className="hidden sm:inline">Remove</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
