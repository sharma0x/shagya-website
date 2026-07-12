'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from '@/lib/auth-client'
import { ArrowLeft, ShoppingBag, Trash2, Heart, Loader2 } from 'lucide-react'

interface WishlistItem {
  id: string
  product: {
    id: number
    name: string
    slug: string
    basePrice: number
    compareAtPrice?: number
    fabric?: string
    weave?: string
    gallery?: Array<{ image?: { url?: string }; alt?: string }>
  }
  variant?: number | { id: number } | null
}

const ph = (w: number, h: number, bg: string, fg: string, text: string) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}&font=lora`

export default function WishlistPage() {
  const router = useRouter()
  const { data: sessionData, isPending } = useSession()

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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: String(productId) }),
      })

      if (res.ok) {
        setItems(items.filter((item) => item.product.id !== productId))
      }
    } catch (err) {
      console.error('Failed to remove from wishlist', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleMoveToCart = async (product: WishlistItem['product']) => {
    setActionLoading(String(product.id))
    try {
      // 1. Fetch current cart to merge (don't replace existing items)
      const cartRes = await fetch('/api/cart')
      const cartData = cartRes.ok ? await cartRes.json() : null
      const existingItems = cartData?.items || []

      const newItem = {
        product: product.id,
        quantity: 1,
        unitPrice: product.basePrice,
      }

      // 2. Send merged cart (append to existing)
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [...existingItems, newItem] }),
      })

      if (!res.ok) throw new Error('Failed to add to cart')

      // 3. Remove from wishlist
      await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: String(product.id) }),
      })

      // 4. Remove from local state
      setItems(items.filter((item) => item.product.id !== product.id))
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {items.map((item) => {
              const product = item.product
              const imageUrl = product.gallery?.[0]?.image?.url
              const isThisLoading = actionLoading === String(product.id)
              return (
                <div
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xs transition-all duration-300 hover:shadow-md"
                >
                  {/* Image Frame */}
                  <Link
                    href={`/products/${product.slug}`}
                    className="relative block h-80 w-full overflow-hidden border-b border-neutral-100 bg-neutral-100"
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        sizes="33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        unoptimized={imageUrl.startsWith(
                          'https://placehold.co',
                        )}
                      />
                    ) : (
                      <div className="relative h-full w-full">
                        <Image
                          src={ph(
                            400,
                            500,
                            '69254e',
                            'f5e8ee',
                            product.name?.charAt(0) || 'S',
                          )}
                          alt={product.name || 'Shayga saree'}
                          fill
                          sizes="33vw"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <button
                      disabled={!!actionLoading}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleRemove(product.id)
                      }}
                      className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200/50 bg-white/90 text-neutral-600 shadow-xs transition-colors hover:bg-white hover:text-red-600"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </Link>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-display hover:text-brand-700 line-clamp-1 text-sm leading-snug font-semibold tracking-tight text-neutral-900 transition-colors">
                          {product.name}
                        </h3>
                      </Link>
                      {product.weave && (
                        <p className="font-body mt-1 text-[10px] tracking-wider text-neutral-400 uppercase">
                          {product.weave} · {product.fabric}
                        </p>
                      )}
                      <p className="font-body mt-2 text-sm font-bold text-neutral-950">
                        ₹{product.basePrice?.toLocaleString('en-IN')}
                      </p>
                    </div>

                    <button
                      disabled={isThisLoading}
                      onClick={() => handleMoveToCart(product)}
                      className="hover:bg-brand-700 font-display mt-5 inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-xl bg-neutral-900 text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isThisLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ShoppingBag className="h-3.5 w-3.5" />
                      )}
                      Move to Bag
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
