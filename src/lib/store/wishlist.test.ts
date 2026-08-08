import { describe, expect, it, vi, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useWishlistStore } from './wishlist'

describe('Wishlist Store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useWishlistStore.getState().clearWishlist()
  })

  it('starts uninitialized with empty productIds', () => {
    const state = useWishlistStore.getState()
    expect(state.productIds).toEqual([])
    expect(state.isInitialized).toBe(false)
    expect(state.isLoading).toBe(false)
  })

  it('fetches wishlist and populates productIds', async () => {
    const mockItems = [{ product: { id: 101 } }, { product: { id: 102 } }]
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ items: mockItems }),
    })

    await act(async () => {
      await useWishlistStore.getState().fetchWishlist()
    })

    const state = useWishlistStore.getState()
    expect(state.productIds).toEqual(['101', '102'])
    expect(state.isInitialized).toBe(true)
  })

  it('optimistically adds product to wishlist and updates count instantly', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Product added to wishlist' }),
    })

    let togglePromise: Promise<boolean>
    act(() => {
      togglePromise = useWishlistStore.getState().toggleWishlist(105)
    })

    // Immediately after click, state is updated BEFORE fetch resolves!
    expect(useWishlistStore.getState().productIds).toContain('105')
    expect(useWishlistStore.getState().isInWishlist(105)).toBe(true)

    await act(async () => {
      await togglePromise
    })
  })

  it('optimistically removes product from wishlist', async () => {
    useWishlistStore.setState({
      productIds: ['105', '106'],
      isInitialized: true,
    })

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Product removed from wishlist' }),
    })

    let togglePromise: Promise<boolean>
    act(() => {
      togglePromise = useWishlistStore.getState().toggleWishlist('105')
    })

    // Immediately after click, state is updated BEFORE fetch resolves!
    expect(useWishlistStore.getState().productIds).not.toContain('105')
    expect(useWishlistStore.getState().isInWishlist(105)).toBe(false)

    await act(async () => {
      await togglePromise
    })
  })

  it('reverts optimistic update on network error', async () => {
    useWishlistStore.setState({ productIds: ['101'], isInitialized: true })

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    await act(async () => {
      await useWishlistStore.getState().toggleWishlist('102')
    })

    // Reverted back to initial state
    expect(useWishlistStore.getState().productIds).toEqual(['101'])
  })
})
