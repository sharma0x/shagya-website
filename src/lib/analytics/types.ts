/**
 * GA4 event taxonomy for Shayga.
 *
 * `GA4_STANDARD_EVENTS` maps to Google's predefined e-commerce event names —
 * GA4 will auto-populate its standard reports (Monetization, Engagement) from
 * these. `GA4_CUSTOM_EVENTS` are Shayga-specific interactive hooks that feed
 * custom reports/Explorations. Keep names snake_case and stable: renaming an
 * event retroactively breaks historical reporting.
 */

export const GA4_STANDARD_EVENTS = {
  PAGE_VIEW: 'page_view',
  VIEW_ITEM: 'view_item',
  VIEW_ITEM_LIST: 'view_item_list',
  SELECT_ITEM: 'select_item',
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  VIEW_CART: 'view_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  ADD_SHIPPING_INFO: 'add_shipping_info',
  ADD_PAYMENT_INFO: 'add_payment_info',
  PURCHASE: 'purchase',
  SEARCH: 'search',
  VIEW_SEARCH_RESULTS: 'view_search_results',
  SHARE: 'share',
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  GENERATE_LEAD: 'generate_lead',
} as const

export const GA4_CUSTOM_EVENTS = {
  SEARCH_NO_RESULTS: 'search_no_results',
  FILTER_APPLY: 'filter_apply',
  FILTER_CLEAR: 'filter_clear',
  SORT_ITEMS: 'sort_items',
  SELECT_COLOR: 'select_color',
  GALLERY_INTERACTION: 'gallery_interaction',
  IMAGE_ZOOM: 'image_zoom',
  ADD_TO_WISHLIST: 'add_to_wishlist',
  REMOVE_FROM_WISHLIST: 'remove_from_wishlist',
  BACK_IN_STOCK_NOTIFY: 'back_in_stock_notify',
  COUPON_APPLY: 'coupon_apply',
  COUPON_REMOVE: 'coupon_remove',
  COUPON_ERROR: 'coupon_error',
  PINCODE_CHECK: 'pincode_check',
  SUBMIT_REVIEW: 'submit_review',
  REVIEW_HELPFUL: 'review_helpful',
  SHIPPING_METHOD_SELECT: 'shipping_method_select',
  PAYMENT_METHOD_SELECT: 'payment_method_select',
  CHECKOUT_ERROR: 'checkout_error',
  WHATSAPP_ORDER_CLICK: 'whatsapp_order_click',
} as const

export type StandardEventName =
  (typeof GA4_STANDARD_EVENTS)[keyof typeof GA4_STANDARD_EVENTS]
export type CustomEventName =
  (typeof GA4_CUSTOM_EVENTS)[keyof typeof GA4_CUSTOM_EVENTS]
export type GA4EventName = StandardEventName | CustomEventName

/**
 * The canonical GA4 item object (payload from the `items` array).
 * `item_category` slots follow the Shayga taxonomy order:
 * weave → fabric → pattern → city of origin → occasion.
 */
export interface GA4Item {
  item_id: string
  item_name: string
  affiliation?: string
  coupon?: string
  currency?: string
  discount?: number
  index?: number
  item_brand?: string
  item_category?: string
  item_category2?: string
  item_category3?: string
  item_category4?: string
  item_category5?: string
  item_list_id?: string
  item_list_name?: string
  item_variant?: string
  price?: number
  quantity?: number
}

export interface GA4EventParams {
  [key: string]: unknown
}

export const SHAYGA_CURRENCY = 'INR'
