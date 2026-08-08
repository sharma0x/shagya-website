import { create } from 'zustand'

interface WishlistState {
  productIds: string[]
  isLoading: boolean
  isInitialized: boolean
  fetchWishlist: () => Promise<void>
  toggleWishlist: (productId: string | number) => Promise<boolean>
  isInWishlist: (productId: string | number) => boolean
  clearWishlist: () => void
}

let inFlightFetch: Promise<void> | null = null

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  isLoading: false,
  isInitialized: false,

  fetchWishlist: async () => {
    // If a request is already in-flight, return the existing promise to prevent duplicate requests
    if (inFlightFetch) return inFlightFetch

    set({ isLoading: true })
    inFlightFetch = (async () => {
      try {
        const res = await fetch('/api/wishlist')
        if (res.ok) {
          const data = await res.json()
          const items = data.items || []
          const ids = items
            .map((item: any) => {
              const pid =
                typeof item.product === 'object'
                  ? item.product?.id
                  : item.product
              return pid != null ? String(pid) : null
            })
            .filter(Boolean) as string[]

          set({ productIds: Array.from(new Set(ids)), isInitialized: true })
        }
      } catch (error) {
        console.error('[WishlistStore] Error fetching wishlist:', error)
      } finally {
        set({ isLoading: false })
        inFlightFetch = null
      }
    })()

    return inFlightFetch
  },

  toggleWishlist: async (productId: string | number) => {
    const pidStr = String(productId)
    const currentIds = get().productIds
    const isCurrentlyIn = currentIds.includes(pidStr)

    // 1. Instant Optimistic State Update
    const updatedIds = isCurrentlyIn
      ? currentIds.filter((id) => id !== pidStr)
      : [...currentIds, pidStr]

    set({ productIds: updatedIds })

    // 2. Asynchronous API sync
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: pidStr }),
      })

      if (!res.ok) {
        // Rollback state if server returns error status
        set({ productIds: currentIds })
        return isCurrentlyIn
      }

      const data = await res.json()
      const added = data.message === 'Product added to wishlist'

      // Ensure state matches server response
      set((state) => {
        const exists = state.productIds.includes(pidStr)
        if (added && !exists) {
          return { productIds: [...state.productIds, pidStr] }
        }
        if (!added && exists) {
          return { productIds: state.productIds.filter((id) => id !== pidStr) }
        }
        return state
      })

      return added
    } catch (error) {
      console.error('[WishlistStore] Error toggling wishlist item:', error)
      // Rollback on network failure
      set({ productIds: currentIds })
      return isCurrentlyIn
    }
  },

  isInWishlist: (productId: string | number) => {
    return get().productIds.includes(String(productId))
  },

  clearWishlist: () => {
    set({ productIds: [], isInitialized: false, isLoading: false })
  },
}))
