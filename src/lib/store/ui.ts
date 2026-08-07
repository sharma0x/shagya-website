import { create } from 'zustand'

interface UIState {
  cartOpen: boolean
  searchOpen: boolean
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
  openSearch: () => void
  closeSearch: () => void
}

export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleCart: () => set((s) => ({ cartOpen: !s.cartOpen })),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
}))
