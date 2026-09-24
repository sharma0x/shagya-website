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

  it('initializes once and queues events before the script loads', async () => {
    const { initializeMetaPixel, META_EVENTS, trackMetaEvent } =
      await import('../metaPixel')

    initializeMetaPixel()
    initializeMetaPixel()
    trackMetaEvent(META_EVENTS.PAGE_VIEW)

    const queue = window.fbq?.queue ?? []
    expect(queue[0]).toEqual(['init', 'test-pixel-id'])
    expect(queue.filter((entry) => entry[0] === 'init')).toHaveLength(1)
    expect(queue[1]).toEqual(['track', 'PageView', {}])
    expect(document.getElementById('meta-pixel-script')).not.toBeNull()
  })

  it('routes shared storefront events to Meta payloads', async () => {
    const { trackPurchase, trackSearch } = await import('../events')

    trackSearch('silk saree')
    trackPurchase({
      transactionId: 'ORD-30',
      value: 13500,
      items: [
        { item_id: '42', item_name: 'Silk Saree', price: 12000, quantity: 1 },
        { item_id: '7', item_name: 'Cotton Saree', price: 1500, quantity: 1 },
      ],
    })

    const queue = window.fbq?.queue ?? []
    expect(queue[0]).toEqual([
      'track',
      'Search',
      { search_string: 'silk saree' },
    ])
    expect(queue[1]).toEqual([
      'track',
      'Purchase',
      expect.objectContaining({
        order_id: 'ORD-30',
        content_ids: ['42', '7'],
        value: 13500,
      }),
    ])
  })

  it('does not load when the Pixel ID is absent', async () => {
    delete process.env.NEXT_PUBLIC_FB_PIXEL_ID
    const { initializeMetaPixel, isMetaPixelEnabled } =
      await import('../metaPixel')

    initializeMetaPixel()

    expect(isMetaPixelEnabled).toBe(false)
    expect(document.getElementById('meta-pixel-script')).toBeNull()
    expect(window.fbq?.queue).toEqual([])
  })
})
