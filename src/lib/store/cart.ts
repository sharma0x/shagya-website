import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { normalizeVariant, dedupeCartItems, cartQtyCap } from '@/lib/cart-merge'
import { weaveLabel } from '@/lib/weaves'
import {
  suppressCartAnalytics,
  resumeCartAnalytics,
} from '@/lib/analytics/flags'

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
    weave?: string
    quantity?: number | null
    trackQuantity?: boolean | null
  }
  variant?: {
    color?: {
      id?: number | string
      slug: string
      name: string
      hex: string
      /** Add-time stock snapshot for this color variant */
      stock?: number
    }
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
    promotionType?: 'standard' | 'buy_quantity'
    type: 'percentage' | 'fixed_amount' | 'free_shipping'
    value: number
    minimumQuantity?: number
    discount?: number
    maxDiscount?: number | null
  } | null
  isLoading: boolean
  addItem: (
    product: CartItem['product'],
    quantity?: number,
    variant?: CartItem['variant'],
  ) => void
  removeItem: (productId: number | string, colorSlug?: string) => void
  updateQuantity: (
    productId: number | string,
    quantity: number,
    colorSlug?: string,
  ) => void
  clearCart: () => void
  setItems: (items: CartItem[]) => void
  setCoupon: (coupon: CartState['coupon']) => void
  syncWithServer: (action?: 'overwrite' | 'merge') => Promise<void>
  loadFromServer: () => Promise<void>
  refreshPrices: () => Promise<void>
  getSubtotal: () => number
  getTotal: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,
      isLoading: false,

      addItem: (product, quantity = 1, variant = null) => {
        const currentItems = dedupeCartItems(get().items)
        const normalizedVariant = normalizeVariant(
          variant,
        ) as CartItem['variant']
        const colorSlug = normalizedVariant?.color?.slug ?? ''

        const existingIndex = currentItems.findIndex((item) => {
          const sameProduct = item.product.id === product.id
          const itemColorSlug = item.variant?.color?.slug ?? ''
          return sameProduct && itemColorSlug === colorSlug
        })

        let newItems = [...currentItems]
        if (existingIndex > -1) {
          const existing = currentItems[existingIndex]
          const capped = cartQtyCap({
            product: { ...existing.product },
            variant: normalizedVariant ?? existing.variant,
          })
          newItems[existingIndex] = {
            ...existing,
            quantity: Math.min(capped, existing.quantity + quantity),
            variant: normalizedVariant ?? existing.variant,
          }
        } else {
          if (colorSlug) {
            newItems = newItems.filter(
              (item) =>
                !(item.product.id === product.id && !item.variant?.color?.slug),
            )
          }
          const capped = cartQtyCap({
            product: { ...product },
            variant: normalizedVariant,
          })
          newItems.push({
            product,
            variant: normalizedVariant,
            quantity: Math.min(capped, quantity),
            unitPrice: product.basePrice,
          })
        }

        set({ items: newItems })
        get().syncWithServer()
      },

      removeItem: (productId, colorSlug?) => {
        const newItems = get().items.filter((item) => {
          const sameProduct = item.product.id === productId
          if (colorSlug !== undefined) {
            const itemColorSlug = item.variant?.color?.slug ?? ''
            return !(sameProduct && itemColorSlug === colorSlug)
          }
          return !sameProduct
        })
        set({ items: newItems })
        get().syncWithServer()
      },

      updateQuantity: (productId, quantity, colorSlug?) => {
        const newItems = get().items.map((item) => {
          const sameProduct = item.product.id === productId
          if (colorSlug !== undefined) {
            const itemColorSlug = item.variant?.color?.slug ?? ''
            if (sameProduct && itemColorSlug === colorSlug) {
              const capped = cartQtyCap(item)
              return {
                ...item,
                quantity: Math.min(capped, Math.max(1, quantity)),
              }
            }
            return item
          }
          if (sameProduct) {
            const capped = cartQtyCap(item)
            return {
              ...item,
              quantity: Math.min(capped, Math.max(1, quantity)),
            }
          }
          return item
        })
        set({ items: newItems })
        get().syncWithServer()
      },

      clearCart: () => {
        suppressCartAnalytics()
        set({ items: [], coupon: null })
        resumeCartAnalytics()
      },

      setItems: (items) => {
        // Programmatic transition (used by server syncs) — no events.
        suppressCartAnalytics()
        set({ items })
        resumeCartAnalytics()
      },

      setCoupon: (coupon) => {
        set({ coupon })
      },

      syncWithServer: async (action = 'overwrite') => {
        try {
          // Verify session via fetch rather than Client SDK directly in hooks to avoid circular dependencies
          const res = await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: get().items,
              couponId: get().coupon?.id || null,
              action,
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
                product: {
                  ...item.product,
                  // The cart API returns products at depth 2, so `weave` is a
                  // populated relationship object — normalize it to a label
                  // string for the cart snapshot.
                  weave: weaveLabel(item.product?.weave),
                },
                variant: item.variant,
                quantity: item.quantity,
                // Prefer the CURRENT product price (the server re-prices
                // every cart against the products collection)
                unitPrice: item.product?.basePrice ?? item.unitPrice ?? 0,
              }))
              // Programmatic transition (login merge / hydration) — no events.
              suppressCartAnalytics()
              set({
                items: dedupeCartItems(formattedItems),
                coupon: data.coupon || null,
              })
              resumeCartAnalytics()
            }
          }
        } catch (error) {
          console.warn('[Cart Store] Loading from server failed:', error)
        } finally {
          set({ isLoading: false })
        }
      },

      refreshPrices: async () => {
        const items = get().items
        if (items.length === 0) return
        const ids = [...new Set(items.map((i) => i.product.id))]
        try {
          const res = await fetch(
            `/api/products?where[id][in]=${ids.join(',')}&limit=${ids.length}&depth=0`,
          )
          if (!res.ok) return
          const data = await res.json()
          const priceMap = new Map<string, number>()
          for (const doc of data.docs || []) {
            if (typeof doc.basePrice === 'number' && doc.basePrice > 0) {
              priceMap.set(String(doc.id), doc.basePrice)
            }
          }
          const updated = items.map((item) => {
            const current = priceMap.get(String(item.product.id))
            if (current == null) return item
            return {
              ...item,
              unitPrice: current,
              product: {
                ...item.product,
                weave: weaveLabel(item.product.weave),
                basePrice: current,
              },
            }
          })
          set({ items: dedupeCartItems(updated) })
          await get().syncWithServer()
        } catch (error) {
          console.warn('[Cart Store] refreshPrices failed:', error)
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

        if (typeof coupon.discount === 'number') {
          return Math.max(0, subtotal - coupon.discount)
        }

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
