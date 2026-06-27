import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  product: {
    id: number | string
    name: string
    slug: string
    basePrice: number
    compareAtPrice?: number
    gallery?: Array<{
      image:
        | {
            url: string
            sizes?: {
              thumbnail?: { url: string }
              card?: { url: string }
            }
          }
        | string
      alt?: string
    }>
    fabric: string
    weave: string
  }
  variant?: {
    size?: string
    blouseCustomization?: string
    [key: string]: any
  } | null
  quantity: number
  unitPrice: number
}

interface CartState {
  items: CartItem[]
  coupon: {
    id: string
    code: string
    type: 'percentage' | 'fixed_amount' | 'free_shipping'
    value: number
  } | null
  isLoading: boolean
  addItem: (
    product: CartItem['product'],
    quantity?: number,
    variant?: CartItem['variant'],
  ) => void
  removeItem: (
    productId: number | string,
    variant?: CartItem['variant'],
  ) => void
  updateQuantity: (
    productId: number | string,
    quantity: number,
    variant?: CartItem['variant'],
  ) => void
  clearCart: () => void
  setItems: (items: CartItem[]) => void
  setCoupon: (coupon: CartState['coupon']) => void
  syncWithServer: () => Promise<void>
  loadFromServer: () => Promise<void>
  getSubtotal: () => number
  getTotal: () => number
}

// Helper to compare variants
const isSameVariant = (v1: any, v2: any) => {
  if (!v1 && !v2) return true
  if (!v1 || !v2) return false
  return JSON.stringify(v1) === JSON.stringify(v2)
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isLoading: false,

      addItem: (product, quantity = 1, variant = null) => {
        const currentItems = get().items
        const existingIndex = currentItems.findIndex(
          (item) =>
            item.product.id === product.id &&
            isSameVariant(item.variant, variant),
        )

        let newItems = [...currentItems]
        if (existingIndex > -1) {
          const newQty = Math.min(
            10,
            currentItems[existingIndex].quantity + quantity,
          )
          newItems[existingIndex] = {
            ...currentItems[existingIndex],
            quantity: newQty,
          }
        } else {
          newItems.push({
            product,
            variant,
            quantity: Math.min(10, quantity),
            unitPrice: product.basePrice,
          })
        }

        set({ items: newItems })
        get().syncWithServer()
      },

      removeItem: (productId, variant = null) => {
        const newItems = get().items.filter(
          (item) =>
            !(
              item.product.id === productId &&
              isSameVariant(item.variant, variant)
            ),
        )
        set({ items: newItems })
        get().syncWithServer()
      },

      updateQuantity: (productId, quantity, variant = null) => {
        const qty = Math.max(1, Math.min(10, quantity))
        const newItems = get().items.map((item) => {
          if (
            item.product.id === productId &&
            isSameVariant(item.variant, variant)
          ) {
            return { ...item, quantity: qty }
          }
          return item
        })
        set({ items: newItems })
        get().syncWithServer()
      },

      clearCart: () => {
        set({ items: [], coupon: null })
        get().syncWithServer()
      },

      setItems: (items) => {
        set({ items })
      },

      setCoupon: (coupon) => {
        set({ coupon })
      },

      syncWithServer: async () => {
        try {
          // Verify session via fetch rather than Client SDK directly in hooks to avoid circular dependencies
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: get().items,
              couponId: get().coupon?.id || null,
            }),
          })
          if (res.status === 401) {
            // Unauthenticated, skip sync, localstorage handles it
            return
          }
        } catch (error) {
          console.warn(
            '[Cart Store] Server sync failed (likely offline or unauthenticated):',
            error,
          )
        }
      },

      loadFromServer: async () => {
        set({ isLoading: true })
        try {
          const res = await fetch('/api/cart')
          if (res.ok) {
            const data = await res.json()
            if (data.items) {
              const formattedItems = data.items.map((item: any) => ({
                product: item.product,
                variant: item.variant,
                quantity: item.quantity,
                unitPrice: item.unitPrice || item.product.basePrice,
              }))
              set({ items: formattedItems, coupon: data.coupon || null })
            }
          }
        } catch (error) {
          console.warn('[Cart Store] Loading from server failed:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      getSubtotal: () => {
        return get().items.reduce(
          (acc, item) => acc + item.unitPrice * item.quantity,
          0,
        )
      },

      getTotal: () => {
        const subtotal = get().getSubtotal()
        const coupon = get().coupon
        if (!coupon) return subtotal

        if (coupon.type === 'percentage') {
          return subtotal * (1 - coupon.value / 100)
        } else if (coupon.type === 'fixed_amount') {
          return Math.max(0, subtotal - coupon.value)
        }
        return subtotal
      },
    }),
    {
      name: 'shayga-cart', // Persists in localStorage
      partialize: (state) => ({ items: state.items, coupon: state.coupon }), // save only items and coupon
    },
  ),
)
