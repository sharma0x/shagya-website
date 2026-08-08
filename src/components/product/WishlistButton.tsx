'use client'

import { useEffect, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSession } from '@/lib/auth-client'
import { useWishlistStore } from '@/lib/store/wishlist'
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

  const productIds = useWishlistStore((state) => state.productIds)
  const isInitialized = useWishlistStore((state) => state.isInitialized)
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist)
  const toggleWishlist = useWishlistStore((state) => state.toggleWishlist)

  const inWishlist = productIds.includes(String(productId))

  useEffect(() => {
    if (session?.user && !isInitialized) {
      fetchWishlist()
    }
  }, [session?.user, isInitialized, fetchWishlist])

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (!session?.user) {
        router.push(
          `/account/login?redirect=${encodeURIComponent(window.location.pathname)}`,
        )
        return
      }

      await toggleWishlist(productId)
    },
    [session?.user, productId, router, toggleWishlist],
  )

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200/50 bg-white/90 text-neutral-600 shadow-xs transition-colors hover:bg-white active:scale-90',
        className,
      )}
      aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-all duration-200',
          inWishlist ? 'scale-110 fill-red-500 text-red-500' : '',
          iconClassName,
        )}
      />
    </button>
  )
}
