/**
 * Typed event constructors. Every function is:
 *  - SSR-safe (all paths go through the guarded `trackEvent`),
 *  - side-effect free when analytics is disabled,
 *  - typed so Payload data flows into GA4 params with correct keys.
 *
 * Call sites read as one-liners: `trackAddToCart(item, listName)`.
 */

import { trackEvent } from './gtag'
import {
  META_EVENTS,
  metaProductParams,
  mapProductToMetaContent,
  trackMetaEvent,
} from './metaPixel'
import {
  compactParams,
  mapProductToGA4Item,
  round,
  type AnalyticsProduct,
} from './mappers'
import {
  GA4_CUSTOM_EVENTS,
  GA4_STANDARD_EVENTS,
  SHAYGA_CURRENCY,
  type GA4Item,
} from './types'

// ───────────────────────────────────────────────────────────────────────────
// Page + list views
// ───────────────────────────────────────────────────────────────────────────

/** Query keys that must never reach GA4 (PII / credentials). */
const SENSITIVE_QUERY_KEYS = new Set(['email', 'otp', 'token', 'signature'])

/**
 * Removes sensitive query params (e.g. the `email` on the checkout-success
 * URL) before a location is sent to GA4 — a GA4 TOS requirement.
 */
export function sanitizePagePath(pagePath: string): string {
  const questionIndex = pagePath.indexOf('?')
  if (questionIndex === -1) return pagePath

  const base = pagePath.slice(0, questionIndex)
  const query = pagePath.slice(questionIndex + 1)
  const params = new URLSearchParams(query)
  let removed = false
  for (const key of [...params.keys()]) {
    if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase())) {
      params.delete(key)
      removed = true
    }
  }
  if (!removed) return pagePath
  const qs = params.toString()
  return qs ? `${base}?${qs}` : base
}

export function trackPageView(params: {
  pagePath: string
  pageTitle?: string
  pageReferrer?: string
}): void {
  trackEvent(GA4_STANDARD_EVENTS.PAGE_VIEW, {
    page_location: sanitizePagePath(params.pagePath),
    page_title: params.pageTitle ?? undefined,
    page_referrer: params.pageReferrer ?? undefined,
  })
}

export function trackViewItem(params: {
  product: AnalyticsProduct
  listName?: string
  value?: number
}): void {
  const item = mapProductToGA4Item(params.product, {
    item_list_name: params.listName,
  })
  trackEvent(
    GA4_STANDARD_EVENTS.VIEW_ITEM,
    compactParams({
      currency: SHAYGA_CURRENCY,
      value: params.value ?? item.price,
      items: [item],
    }),
  )
  trackMetaEvent(META_EVENTS.VIEW_CONTENT, {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_category: item.item_category,
    content_type: 'product',
    currency: SHAYGA_CURRENCY,
    value: params.value ?? item.price ?? 0,
    contents: [
      mapProductToMetaContent(params.product, {
        price: item.price,
        quantity: 1,
      }),
    ],
  })
}

export function trackViewItemList(params: {
  products: AnalyticsProduct[]
  listId: string
  listName: string
}): void {
  if (params.products.length === 0) return
  const items: GA4Item[] = params.products.map((p, i) =>
    mapProductToGA4Item(p, {
      index: i + 1,
      item_list_id: params.listId,
      item_list_name: params.listName,
    }),
  )
  trackEvent(
    GA4_STANDARD_EVENTS.VIEW_ITEM_LIST,
    compactParams({
      item_list_id: params.listId,
      item_list_name: params.listName,
      items,
    }),
  )
  trackMetaEvent(META_EVENTS.VIEW_CONTENT, {
    content_name: params.listName,
    content_category: params.listName,
    content_type: 'product_group',
    content_ids: items.map((item) => item.item_id),
    contents: items.map((item) => ({
      id: item.item_id,
      quantity: 1,
      item_price: item.price ?? 0,
    })),
    currency: SHAYGA_CURRENCY,
  })
}

export function trackSelectItem(params: {
  product: AnalyticsProduct
  listId?: string
  listName?: string
}): void {
  const item = mapProductToGA4Item(params.product, {
    item_list_id: params.listId,
    item_list_name: params.listName,
  })
  trackEvent(
    GA4_STANDARD_EVENTS.SELECT_ITEM,
    compactParams({
      item_list_id: params.listId ?? undefined,
      item_list_name: params.listName ?? undefined,
      items: [item],
    }),
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Cart
// ───────────────────────────────────────────────────────────────────────────

export function trackAddToCart(params: {
  item: GA4Item
  quantity?: number
}): void {
  const item = { ...params.item }
  if (params.quantity != null) item.quantity = params.quantity
  trackEvent(GA4_STANDARD_EVENTS.ADD_TO_CART, {
    currency: SHAYGA_CURRENCY,
    value: round((item.price ?? 0) * (item.quantity ?? 1)),
    items: [item],
  })
  trackMetaEvent(META_EVENTS.ADD_TO_CART, {
    ...metaProductParams([item]),
    content_name: item.item_name,
    content_category: item.item_category,
    contents: [
      mapProductToMetaContent(
        { id: item.item_id, name: item.item_name },
        { price: item.price, quantity: item.quantity },
      ),
    ],
  })
}

export function trackRemoveFromCart(params: {
  item: GA4Item
  quantity?: number
}): void {
  const item = { ...params.item }
  if (params.quantity != null) item.quantity = params.quantity
  trackEvent(GA4_STANDARD_EVENTS.REMOVE_FROM_CART, {
    currency: SHAYGA_CURRENCY,
    value: round((item.price ?? 0) * (item.quantity ?? 1)),
    items: [item],
  })
}

export function trackViewCart(params: {
  items: GA4Item[]
  value?: number
}): void {
  trackEvent(
    GA4_STANDARD_EVENTS.VIEW_CART,
    compactParams({
      currency: SHAYGA_CURRENCY,
      value: params.value,
      items: params.items,
    }),
  )
  trackMetaEvent(
    META_EVENTS.VIEW_CART,
    metaProductParams(params.items, params.value),
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Checkout funnel
// ───────────────────────────────────────────────────────────────────────────

export function trackBeginCheckout(params: {
  items: GA4Item[]
  coupon?: string
  value?: number
}): void {
  trackEvent(
    GA4_STANDARD_EVENTS.BEGIN_CHECKOUT,
    compactParams({
      currency: SHAYGA_CURRENCY,
      value: params.value,
      coupon: params.coupon ?? undefined,
      items: params.items,
    }),
  )
  trackMetaEvent(META_EVENTS.INITIATE_CHECKOUT, {
    ...metaProductParams(params.items, params.value),
    num_items: params.items.reduce(
      (total, item) => total + (item.quantity ?? 1),
      0,
    ),
    coupon: params.coupon,
  })
}

export function trackAddShippingInfo(params: {
  items: GA4Item[]
  shippingTier: string
  coupon?: string
  value?: number
}): void {
  trackEvent(
    GA4_STANDARD_EVENTS.ADD_SHIPPING_INFO,
    compactParams({
      currency: SHAYGA_CURRENCY,
      value: params.value,
      coupon: params.coupon ?? undefined,
      shipping_tier: params.shippingTier,
      items: params.items,
    }),
  )
}

export function trackAddPaymentInfo(params: {
  items: GA4Item[]
  paymentType: string
  coupon?: string
  value?: number
}): void {
  trackEvent(
    GA4_STANDARD_EVENTS.ADD_PAYMENT_INFO,
    compactParams({
      currency: SHAYGA_CURRENCY,
      value: params.value,
      coupon: params.coupon ?? undefined,
      payment_type: params.paymentType,
      items: params.items,
    }),
  )
  trackMetaEvent(META_EVENTS.ADD_PAYMENT_INFO, {
    ...metaProductParams(params.items, params.value),
    payment_type: params.paymentType,
  })
}

export function trackPurchase(params: {
  transactionId: string
  items: GA4Item[]
  value: number
  shipping?: number
  discount?: number
  coupon?: string
  paymentType?: string
  shippingTier?: string
}): void {
  const items = params.items.map((i) => ({
    ...i,
    coupon: i.coupon ?? params.coupon,
  }))
  trackEvent(
    GA4_STANDARD_EVENTS.PURCHASE,
    compactParams({
      currency: SHAYGA_CURRENCY,
      transaction_id: params.transactionId,
      value: round(params.value),
      shipping: params.shipping != null ? round(params.shipping) : undefined,
      discount: params.discount != null ? round(params.discount) : undefined,
      coupon: params.coupon ?? undefined,
      payment_type: params.paymentType ?? undefined,
      shipping_tier: params.shippingTier ?? undefined,
      items,
    }),
  )
  trackMetaEvent(
    META_EVENTS.PURCHASE,
    {
      ...metaProductParams(items, params.value),
      order_id: params.transactionId,
      num_items: items.reduce((total, item) => total + (item.quantity ?? 1), 0),
    },
    { eventID: params.transactionId },
  )
}

// ───────────────────────────────────────────────────────────────────────────
// Search
// ───────────────────────────────────────────────────────────────────────────

export function trackSearch(searchTerm: string): void {
  trackEvent(GA4_STANDARD_EVENTS.SEARCH, { search_term: searchTerm })
  trackMetaEvent(META_EVENTS.SEARCH, { search_string: searchTerm })
}

export function trackViewSearchResults(params: {
  searchTerm: string
  resultCount: number
}): void {
  trackEvent(GA4_STANDARD_EVENTS.VIEW_SEARCH_RESULTS, {
    search_term: params.searchTerm,
    result_count: params.resultCount,
  })
}

export function trackSearchNoResults(searchTerm: string): void {
  trackEvent(GA4_CUSTOM_EVENTS.SEARCH_NO_RESULTS, { search_term: searchTerm })
}

// ───────────────────────────────────────────────────────────────────────────
// Discovery: filters + sorting + variants + gallery
// ───────────────────────────────────────────────────────────────────────────

export function trackFilterApply(params: {
  dimension: string
  value: string
}): void {
  trackEvent(GA4_CUSTOM_EVENTS.FILTER_APPLY, {
    filter_dimension: params.dimension,
    filter_value: params.value,
  })
}

export function trackFilterClear(): void {
  trackEvent(GA4_CUSTOM_EVENTS.FILTER_CLEAR, {})
}

export function trackSortItems(method: string): void {
  trackEvent(GA4_CUSTOM_EVENTS.SORT_ITEMS, { sort_method: method })
}

export function trackSelectColor(params: {
  product: AnalyticsProduct
  colorName: string
  colorSlug: string
}): void {
  const item = mapProductToGA4Item(params.product, {
    item_variant: params.colorName,
  })
  trackEvent(GA4_CUSTOM_EVENTS.SELECT_COLOR, {
    items: [item],
    color_name: params.colorName,
    color_slug: params.colorSlug,
  })
}

export function trackGalleryInteraction(params: {
  product: AnalyticsProduct
  action: 'next' | 'prev' | 'select'
  index: number
  total: number
}): void {
  trackEvent(GA4_CUSTOM_EVENTS.GALLERY_INTERACTION, {
    product_id: String(params.product.id ?? ''),
    product_name: params.product.name ?? '',
    gallery_action: params.action,
    gallery_index: params.index,
    gallery_total: params.total,
  })
}

export function trackImageZoom(params: {
  product: AnalyticsProduct
  mode: 'hover' | 'pinch'
}): void {
  trackEvent(GA4_CUSTOM_EVENTS.IMAGE_ZOOM, {
    product_id: String(params.product.id ?? ''),
    product_name: params.product.name ?? '',
    zoom_mode: params.mode,
  })
}

// ───────────────────────────────────────────────────────────────────────────
// Wishlist / back-in-stock
// ───────────────────────────────────────────────────────────────────────────

export function trackAddToWishlist(product: AnalyticsProduct): void {
  const item = mapProductToGA4Item(product)
  trackEvent(GA4_CUSTOM_EVENTS.ADD_TO_WISHLIST, {
    currency: SHAYGA_CURRENCY,
    value: item.price,
    items: [item],
  })
  trackMetaEvent(META_EVENTS.ADD_TO_WISHLIST, {
    content_ids: [item.item_id],
    content_name: item.item_name,
    content_category: item.item_category,
    content_type: 'product',
    currency: SHAYGA_CURRENCY,
    value: item.price ?? 0,
    contents: [
      mapProductToMetaContent(product, {
        price: item.price,
        quantity: 1,
      }),
    ],
  })
}

export function trackRemoveFromWishlist(product: AnalyticsProduct): void {
  const item = mapProductToGA4Item(product)
  trackEvent(GA4_CUSTOM_EVENTS.REMOVE_FROM_WISHLIST, {
    currency: SHAYGA_CURRENCY,
    value: item.price,
    items: [item],
  })
}

export function trackBackInStockNotify(product: AnalyticsProduct): void {
  const item = mapProductToGA4Item(product)
  trackEvent(GA4_CUSTOM_EVENTS.BACK_IN_STOCK_NOTIFY, { items: [item] })
}

// ───────────────────────────────────────────────────────────────────────────
// Social + engagement
// ───────────────────────────────────────────────────────────────────────────

export function trackShare(params: {
  method: string
  contentType: string
  itemId?: string
}): void {
  trackEvent(
    GA4_STANDARD_EVENTS.SHARE,
    compactParams({
      method: params.method,
      content_type: params.contentType,
      item_id: params.itemId ?? undefined,
    }),
  )
  trackMetaEvent(META_EVENTS.SHARE, {
    method: params.method,
    content_type: params.contentType,
    content_ids: params.itemId ? [params.itemId] : undefined,
  })
}

export function trackWhatsAppOrderClick(params: {
  product: AnalyticsProduct
}): void {
  const item = mapProductToGA4Item(params.product)
  trackEvent(GA4_CUSTOM_EVENTS.WHATSAPP_ORDER_CLICK, { items: [item] })
}

// ───────────────────────────────────────────────────────────────────────────
// Identity + forms
// ───────────────────────────────────────────────────────────────────────────

export function trackSignUp(method: string): void {
  trackEvent(GA4_STANDARD_EVENTS.SIGN_UP, { method })
  trackMetaEvent(META_EVENTS.COMPLETE_REGISTRATION, {
    content_name: method,
    status: 'completed',
    registration_method: method,
    currency: SHAYGA_CURRENCY,
  })
}

export function trackLogin(method: string): void {
  trackEvent(GA4_STANDARD_EVENTS.LOGIN, { method })
}

export function trackGenerateLead(params: { formId: string }): void {
  trackEvent(GA4_STANDARD_EVENTS.GENERATE_LEAD, {
    form_id: params.formId,
  })
  trackMetaEvent(META_EVENTS.LEAD, {
    content_name: params.formId,
    content_category: 'Lead',
    form_id: params.formId,
    currency: SHAYGA_CURRENCY,
  })
}

export function trackPincodeCheck(params: {
  pincode: string
  verified: boolean
}): void {
  trackEvent(GA4_CUSTOM_EVENTS.PINCODE_CHECK, {
    pincode: params.pincode,
    verified: params.verified,
  })
}

export function trackSubmitReview(params: {
  productId: string
  rating: number
}): void {
  trackEvent(GA4_CUSTOM_EVENTS.SUBMIT_REVIEW, {
    product_id: params.productId,
    rating: params.rating,
  })
}

export function trackReviewHelpful(params: {
  reviewId: string
  action: 'add' | 'remove'
}): void {
  trackEvent(GA4_CUSTOM_EVENTS.REVIEW_HELPFUL, {
    review_id: params.reviewId,
    action: params.action,
  })
}

// ───────────────────────────────────────────────────────────────────────────
// Checkout micro-interactions
// ───────────────────────────────────────────────────────────────────────────

export function trackCoupon(params: {
  couponCode: string
  action: 'apply' | 'remove' | 'error'
}): void {
  const eventName =
    params.action === 'apply'
      ? GA4_CUSTOM_EVENTS.COUPON_APPLY
      : params.action === 'remove'
        ? GA4_CUSTOM_EVENTS.COUPON_REMOVE
        : GA4_CUSTOM_EVENTS.COUPON_ERROR
  trackEvent(eventName, { coupon_code: params.couponCode })
}

export function trackShippingMethodSelect(params: {
  method: string
  shippingCost?: number
}): void {
  trackEvent(
    GA4_CUSTOM_EVENTS.SHIPPING_METHOD_SELECT,
    compactParams({
      shipping_method: params.method,
      shipping_cost: params.shippingCost,
    }),
  )
}

export function trackPaymentMethodSelect(method: string): void {
  trackEvent(GA4_CUSTOM_EVENTS.PAYMENT_METHOD_SELECT, {
    payment_method: method,
  })
}

export function trackCheckoutError(params: {
  step?: string
  error: string
}): void {
  trackEvent(
    GA4_CUSTOM_EVENTS.CHECKOUT_ERROR,
    compactParams({
      checkout_step: params.step ?? undefined,
      error_message: params.error,
    }),
  )
}
