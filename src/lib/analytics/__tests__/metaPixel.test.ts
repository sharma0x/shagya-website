import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const originalPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID

beforeEach(() => {
  vi.resetModules()
  process.env.NEXT_PUBLIC_FB_PIXEL_ID = 'test-pixel-id'
  delete window.fbq
  document.head.innerHTML = ''
})

afterEach(() => {
  process.env.NEXT_PUBLIC_FB_PIXEL_ID = originalPixelId
  delete window.fbq
  document.head.innerHTML = ''
})

describe('Meta Pixel adapter', () => {
  it('maps a product to Meta content parameters', async () => {
    const { mapProductToMetaContent } = await import('../metaPixel')

    expect(
      mapProductToMetaContent(
        { id: 42, name: 'Kanchipuram Saree', basePrice: 45000 },
        { quantity: 2 },
      ),
    ).toEqual({ id: '42', quantity: 2, item_price: 45000 })
  })

  it('maps GA4 items to Meta content and value', async () => {
    const { metaProductParams } = await import('../metaPixel')

    expect(
      metaProductParams([
        { item_id: '1', item_name: 'Silk Saree', price: 12000, quantity: 2 },
        { item_id: '2', item_name: 'Cotton Saree', price: 3000 },
      ]),
    ).toEqual({
      content_ids: ['1', '2'],
      content_type: 'product',
      contents: [
        { id: '1', quantity: 2, item_price: 12000 },
        { id: '2', quantity: 1, item_price: 3000 },
      ],
      currency: 'INR',
      value: 27000,
    })
  })

  it('initializes once and flushes events after the script loads', async () => {
    const { initializeMetaPixel, META_EVENTS, trackMetaEvent } =
      await import('../metaPixel')

    initializeMetaPixel()
    initializeMetaPixel()
    trackMetaEvent(META_EVENTS.PAGE_VIEW)

    expect(window.fbq).toBeUndefined()
    const script = document.getElementById('meta-pixel-script')
    expect(script).not.toBeNull()

    const fbq = vi.fn()
    window.fbq = fbq as typeof window.fbq
    script?.dispatchEvent(new Event('load'))

    expect(fbq).toHaveBeenNthCalledWith(1, 'init', 'test-pixel-id')
    expect(fbq).toHaveBeenNthCalledWith(2, 'track', 'PageView', {})
    expect(fbq.mock.calls.filter(([event]) => event === 'init')).toHaveLength(1)
  })

  it('routes shared storefront events to Meta payloads', async () => {
    const { initializeMetaPixel } = await import('../metaPixel')
    const { trackPurchase, trackSearch } = await import('../events')

    initializeMetaPixel()
    trackSearch('silk saree')
    trackPurchase({
      transactionId: 'ORD-30',
      value: 13500,
      items: [
        { item_id: '42', item_name: 'Silk Saree', price: 12000, quantity: 1 },
        { item_id: '7', item_name: 'Cotton Saree', price: 1500, quantity: 1 },
      ],
    })

    const fbq = vi.fn()
    window.fbq = fbq as typeof window.fbq
    document
      .getElementById('meta-pixel-script')
      ?.dispatchEvent(new Event('load'))

    expect(fbq).toHaveBeenNthCalledWith(1, 'init', 'test-pixel-id')
    expect(fbq).toHaveBeenNthCalledWith(2, 'track', 'Search', {
      search_string: 'silk saree',
    })
    expect(fbq).toHaveBeenNthCalledWith(
      3,
      'track',
      'Purchase',
      expect.objectContaining({
        order_id: 'ORD-30',
        content_ids: ['42', '7'],
        value: 13500,
      }),
      { eventID: 'ORD-30' },
    )
  })

  it('routes custom events through trackCustom', async () => {
    const { initializeMetaPixel } = await import('../metaPixel')
    const { trackViewCart, trackShare } = await import('../events')

    initializeMetaPixel()
    trackViewCart({
      items: [
        { item_id: '10', item_name: 'Organza Saree', price: 8000, quantity: 1 },
      ],
      value: 8000,
    })
    trackShare({
      method: 'whatsapp',
      contentType: 'product',
      itemId: '10',
    })

    const fbq = vi.fn()
    window.fbq = fbq as typeof window.fbq
    document
      .getElementById('meta-pixel-script')
      ?.dispatchEvent(new Event('load'))

    expect(fbq).toHaveBeenNthCalledWith(1, 'init', 'test-pixel-id')
    expect(fbq).toHaveBeenNthCalledWith(
      2,
      'trackCustom',
      'ViewCart',
      expect.objectContaining({
        content_ids: ['10'],
        value: 8000,
      }),
    )
    expect(fbq).toHaveBeenNthCalledWith(
      3,
      'trackCustom',
      'Share',
      expect.objectContaining({
        method: 'whatsapp',
        content_type: 'product',
        content_ids: ['10'],
      }),
    )
  })

  it('includes complete standard parameters for AddToWishlist and AddToCart', async () => {
    const { initializeMetaPixel } = await import('../metaPixel')
    const { trackAddToWishlist, trackAddToCart } = await import('../events')

    initializeMetaPixel()
    trackAddToWishlist({
      id: 55,
      name: 'Paithani Saree',
      basePrice: 22000,
      weave: 'paithani',
    })
    trackAddToCart({
      item: {
        item_id: '55',
        item_name: 'Paithani Saree',
        item_category: 'paithani',
        price: 22000,
        quantity: 1,
      },
    })

    const fbq = vi.fn()
    window.fbq = fbq as typeof window.fbq
    document
      .getElementById('meta-pixel-script')
      ?.dispatchEvent(new Event('load'))

    expect(fbq).toHaveBeenNthCalledWith(
      2,
      'track',
      'AddToWishlist',
      expect.objectContaining({
        content_ids: ['55'],
        content_name: 'Paithani Saree',
        currency: 'INR',
        value: 22000,
      }),
    )
    expect(fbq).toHaveBeenNthCalledWith(
      3,
      'track',
      'AddToCart',
      expect.objectContaining({
        content_ids: ['55'],
        content_name: 'Paithani Saree',
        content_category: 'paithani',
        currency: 'INR',
        value: 22000,
      }),
    )
  })

  it('does not send duplicate init when window.fbq was already initialized', async () => {
    const existingFbq = Object.assign(vi.fn(), { loaded: true })
    window.fbq = existingFbq as unknown as typeof window.fbq

    const { initializeMetaPixel } = await import('../metaPixel')
    initializeMetaPixel()

    expect(existingFbq).not.toHaveBeenCalledWith('init', 'test-pixel-id')
  })

  it('does not load when the Pixel ID is absent', async () => {
    delete process.env.NEXT_PUBLIC_FB_PIXEL_ID
    const { initializeMetaPixel, isMetaPixelEnabled } =
      await import('../metaPixel')

    initializeMetaPixel()

    expect(isMetaPixelEnabled).toBe(false)
    expect(document.getElementById('meta-pixel-script')).toBeNull()
    expect(window.fbq).toBeUndefined()
  })
})
