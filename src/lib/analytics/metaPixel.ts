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
let queuedCalls: unknown[][] = []

function flushQueuedCalls(): void {
  if (typeof window === 'undefined' || !window.fbq) return

  const pendingCalls = queuedCalls
  queuedCalls = []
  pendingCalls.forEach((args) => window.fbq?.(...args))
}

export function fbq(...args: unknown[]): void {
  if (typeof window === 'undefined') return

  if (window.fbq) {
    window.fbq(...args)
    return
  }

  queuedCalls.push(args)
}

export function loadMetaPixelScript(): void {
  if (typeof document === 'undefined' || !isMetaPixelEnabled) return

  const existingScript = document.getElementById(META_SCRIPT_ID)
  if (existingScript) {
    if (window.fbq?.loaded) flushQueuedCalls()
    return
  }

  const script = document.createElement('script')
  script.id = META_SCRIPT_ID
  script.async = true
  script.defer = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  script.addEventListener('load', flushQueuedCalls, { once: true })
  document.head.appendChild(script)
}

export function initializeMetaPixel(): void {
  if (!isMetaPixelEnabled || pixelInitialized) return
  pixelInitialized = true

  // Avoid duplicate fbq('init') if the canonical base script in <head> already initialized it.
  const isAlreadyInitialized =
    typeof window !== 'undefined' &&
    Boolean(window.fbq) &&
    (Boolean(window.fbq?.loaded) ||
      Boolean(
        window.fbq?.queue?.some(
          (call) =>
            Array.isArray(call) &&
            call[0] === 'init' &&
            call[1] === META_PIXEL_ID,
        ),
      ))

  if (!isAlreadyInitialized) {
    fbq('init', META_PIXEL_ID)
  }

  loadMetaPixelScript()
}

export function resetMetaPixelState(): void {
  pixelInitialized = false
  queuedCalls = []
}

export const META_STANDARD_EVENTS = new Set<string>([
  'AddPaymentInfo',
  'AddToCart',
  'AddToWishlist',
  'CompleteRegistration',
  'Contact',
  'CustomizeProduct',
  'Donate',
  'FindLocation',
  'InitiateCheckout',
  'Lead',
  'PageView',
  'Purchase',
  'Schedule',
  'Search',
  'StartTrial',
  'SubmitApplication',
  'Subscribe',
  'ViewContent',
])

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

export type MetaEventName =
  | (typeof META_EVENTS)[keyof typeof META_EVENTS]
  | (string & {})

export interface MetaContent {
  id: string
  quantity: number
  item_price: number
}

export interface MetaEventParams {
  [key: string]: unknown
}

export interface MetaEventOptions {
  eventID?: string
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
  options?: MetaEventOptions,
): void {
  if (typeof window === 'undefined' || !isMetaPixelEnabled) return
  const trackMethod = META_STANDARD_EVENTS.has(eventName)
    ? 'track'
    : 'trackCustom'
  const cleanParams = compactParams(params)
  if (options && Object.keys(options).length > 0) {
    fbq(trackMethod, eventName, cleanParams, options)
  } else {
    fbq(trackMethod, eventName, cleanParams)
  }
}

export function trackMetaCustomEvent(
  eventName: string,
  params: MetaEventParams = {},
  options?: MetaEventOptions,
): void {
  if (typeof window === 'undefined' || !isMetaPixelEnabled) return
  const cleanParams = compactParams(params)
  if (options && Object.keys(options).length > 0) {
    fbq('trackCustom', eventName, cleanParams, options)
  } else {
    fbq('trackCustom', eventName, cleanParams)
  }
}
