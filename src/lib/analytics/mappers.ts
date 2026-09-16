/**
 * Tolerant mappers that convert the various Payload/Cart/Checkout product
 * shapes used across the app into the canonical GA4 `item` object.
 *
 * Every mapper accepts loose (`any`-ish) inputs and only copies fields that
 * actually exist, so a product fetched at depth 0, a serialized PDP product,
 * a cart line item, or a checkout order line can all flow through the same
 * pipeline without runtime errors.
 */

import { SHAYGA_CURRENCY, type GA4Item } from './types'

type AnyRecord = Record<string, any>

export interface AnalyticsProduct {
  id?: number | string | null
  name?: string | null
  slug?: string | null
  basePrice?: number | null
  compareAtPrice?: number | null
  weave?: string | null
  fabric?: string | null
  pattern?: string | null
  cityOfOrigin?: string | null
  occasions?: Array<string | number | { name?: string | null }> | null
  brand?: { name?: string | null } | string | number | null
  color?: { slug?: string; name?: string; hex?: string } | null
  variant?: { color?: { slug?: string; name?: string } | null } | null
  colorVariants?: AnyRecord[] | null
  quantity?: number | null
  unitPrice?: number | null
  price?: number | null
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : String(value ?? '')
}

function firstString(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value.trim()
  return undefined
}

function occasionLabel(occasions: unknown): string | undefined {
  if (!Array.isArray(occasions)) return undefined
  const labels = occasions
    .map((o) =>
      typeof o === 'object' && o !== null && 'name' in o
        ? (o as { name?: unknown }).name
        : typeof o === 'string'
          ? o
          : null,
    )
    .filter((l): l is string => typeof l === 'string' && l.trim().length > 0)
  return labels.length > 0 ? labels.join(', ') : undefined
}

function brandLabel(brand: unknown): string | undefined {
  if (!brand) return undefined
  if (typeof brand === 'string') return brand || undefined
  if (typeof brand === 'object' && 'name' in brand) {
    return firstString((brand as { name?: unknown }).name)
  }
  return undefined
}

/**
 * Normalize a product of any shape into a GA4 item.
 *
 * @param product loose product record (Payload doc, cart line, checkout line)
 * @param overrides explicit values that win over auto-detected ones
 */
export function mapProductToGA4Item(
  product: AnyRecord | AnalyticsProduct | null | undefined,
  overrides: Partial<GA4Item> = {},
): GA4Item {
  const p = (product ?? {}) as AnalyticsProduct
  const id = overrides.item_id ?? asString(p.id ?? p.slug ?? '')
  const name = overrides.item_name ?? asString(p.name ?? '')

  const categories = [
    firstString(p.weave),
    firstString(p.fabric),
    firstString(p.pattern),
    firstString(p.cityOfOrigin),
    occasionLabel(p.occasions),
  ]

  const price =
    p.unitPrice ?? p.price ?? p.basePrice ?? overrides.price ?? undefined

  const variantName = firstString(
    p.color?.name ?? p.variant?.color?.name ?? undefined,
  )

  return {
    item_id: id,
    item_name: name,
    affiliation: overrides.affiliation ?? 'Shayga',
    coupon: overrides.coupon,
    currency: overrides.currency ?? SHAYGA_CURRENCY,
    discount: overrides.discount,
    index: overrides.index,
    item_brand: overrides.item_brand ?? brandLabel(p.brand),
    item_category: overrides.item_category ?? categories[0],
    item_category2: overrides.item_category2 ?? categories[1],
    item_category3: overrides.item_category3 ?? categories[2],
    item_category4: overrides.item_category4 ?? categories[3],
    item_category5: overrides.item_category5 ?? categories[4],
    item_list_id: overrides.item_list_id,
    item_list_name: overrides.item_list_name,
    item_variant: overrides.item_variant ?? variantName ?? undefined,
    price: price != null ? Number(price) : undefined,
    quantity:
      overrides.quantity ??
      (p.quantity != null ? Number(p.quantity) : undefined),
  }
}

/** Strip undefined values so payloads stay clean on the wire / in logs. */
export function compactParams<T extends Record<string, unknown>>(params: T): T {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null),
  ) as T
}

/** Simple 0–2dp rounder for currency values. */
export function round(value: number): number {
  return Math.round(value * 100) / 100
}
