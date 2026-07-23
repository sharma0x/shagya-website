'use client'

import { useState, useEffect, useCallback } from 'react'
import { Heart, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

interface WishlistButtonProps {
  productId: string | number
  className?: string
  iconClassName?: string
}

export function WishlistButton({
  productId,
  className,
  iconClassName,
}: WishlistButtonProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [inWishlist, setInWishlist] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!session?.user) return
    let cancelled = false
    fetch('/api/wishlist')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return
        const items = data.items || []
        const found = items.some((item: any) => {
          const pid =
            typeof item.product === 'object' ? item.product?.id : item.product
          return String(pid) === String(productId)
        })
        setInWishlist(found)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setChecked(true)
      })
    return () => {
      cancelled = true
    }
  }, [session?.user, productId])

  const handleToggle = useCallback(async () => {
    if (!session?.user) {
      router.push(
        `/account/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      )
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: String(productId) }),
      })
      if (res.ok) {
        const data = await res.json()
        setInWishlist(data.message === 'Product added to wishlist')
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false)
    }
  }, [session?.user, productId, router])

  return (
    <button
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        handleToggle()
      }}
      disabled={loading}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200/50 bg-white/90 text-neutral-600 shadow-xs transition-colors hover:bg-white cursor-pointer',
        className,
      )}
      aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn(
            'h-4 w-4 transition-all',
            inWishlist ? 'fill-red-500 text-red-500' : '',
            iconClassName,
          )}
        />
      )}
    </button>
  )
}
