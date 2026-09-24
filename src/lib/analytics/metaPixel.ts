import {
  compactParams,
  mapProductToGA4Item,
  type AnalyticsProduct,
} from './mappers'
import { SHAYGA_CURRENCY, type GA4Item } from './types'

type Fbq = ((...args: unknown[]) => void) & {
  queue?: unknown[][]
  loaded?: boolean
  version?: string
  callMethod?: (...args: unknown[]) => void
}

declare global {
  interface Window {
    fbq?: Fbq
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? ''
export const isMetaPixelEnabled = META_PIXEL_ID.length > 0

const META_SCRIPT_ID = 'meta-pixel-script'
let pixelInitialized = false

function createFbq(): Fbq {
  const fbq = ((...args: unknown[]) => {
    fbq.queue?.push(args)
  }) as Fbq
  fbq.queue = []
  fbq.loaded = true
  fbq.version = '2.0'
  return fbq
}

if (typeof window !== 'undefined' && !window.fbq) {
  window.fbq = createFbq()
}

export function fbq(...args: unknown[]): void {
  if (typeof window === 'undefined') return
  window.fbq?.(...args)
}

export function loadMetaPixelScript(): void {
  if (typeof document === 'undefined' || !isMetaPixelEnabled) return
  if (document.getElementById(META_SCRIPT_ID)) return

  const script = document.createElement('script')
  script.id = META_SCRIPT_ID
  script.async = true
  script.defer = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)
}

export function initializeMetaPixel(): void {
  if (!isMetaPixelEnabled || pixelInitialized) return
  pixelInitialized = true
  fbq('init', META_PIXEL_ID)
  loadMetaPixelScript()
}

export const META_EVENTS = {
  PAGE_VIEW: 'PageView',
  VIEW_CONTENT: 'ViewContent',
  ADD_TO_CART: 'AddToCart',
  VIEW_CART: 'ViewCart',
  INITIATE_CHECKOUT: 'InitiateCheckout',
  ADD_PAYMENT_INFO: 'AddPaymentInfo',
  PURCHASE: 'Purchase',
  SEARCH: 'Search',
  ADD_TO_WISHLIST: 'AddToWishlist',
  COMPLETE_REGISTRATION: 'CompleteRegistration',
  LEAD: 'Lead',
  SHARE: 'Share',
} as const

export type MetaEventName = (typeof META_EVENTS)[keyof typeof META_EVENTS]

export interface MetaContent {
  id: string
  quantity: number
  item_price: number
}

export interface MetaEventParams {
  [key: string]: unknown
}

export function mapProductToMetaContent(
  product: AnalyticsProduct | null | undefined,
  overrides: Partial<GA4Item> = {},
): MetaContent {
  const item = mapProductToGA4Item(product, overrides)
  return {
    id: item.item_id,
    quantity: item.quantity ?? 1,
    item_price: item.price ?? 0,
  }
}

export function mapGA4ItemToMetaContent(item: GA4Item): MetaContent {
  return {
    id: item.item_id,
    quantity: item.quantity ?? 1,
    item_price: item.price ?? 0,
  }
}

export function metaProductParams(
  items: GA4Item[],
  value?: number,
): MetaEventParams {
  const contents = items.map(mapGA4ItemToMetaContent)
  return {
    content_ids: contents.map((item) => item.id),
    content_type: 'product',
    contents,
    currency: SHAYGA_CURRENCY,
    value:
      value ??
      items.reduce(
        (total, item) => total + (item.price ?? 0) * (item.quantity ?? 1),
        0,
      ),
  }
}

export function trackMetaEvent(
  eventName: MetaEventName,
  params: MetaEventParams = {},
): void {
  if (typeof window === 'undefined' || !isMetaPixelEnabled) return
  fbq('track', eventName, compactParams(params))
}
