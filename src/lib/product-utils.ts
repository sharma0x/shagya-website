/**
 * Index of the color variant matching `colorSlug` (for `?color=` deep links).
 * Falls back to 0 when the slug is missing/unknown or there are no variants.
 */
export function resolveVariantIndex(
  variants: readonly { color?: { slug?: string | null } | null }[],
  colorSlug?: string | null,
): number {
  if (!colorSlug) return 0
  const idx = variants.findIndex((v) => v.color?.slug === colorSlug)
  return idx === -1 ? 0 : idx
}

export function liftVariantGallery(product: any) {
  const firstVariant = (product.colorVariants || []).find(
    (v: any) => v.enabled !== false && v.color,
  )
  return {
    ...product,
    gallery: firstVariant?.gallery || product.gallery || [],
    color: firstVariant?.color
      ? {
          slug: firstVariant.color.slug,
          name: firstVariant.color.name,
          hex: firstVariant.color.hex,
        }
      : null,
    basePrice: firstVariant?.priceOverride ?? product.basePrice,
    colorVariants: product.colorVariants || [],
  }
}
/**
 * Gallery for a specific color variant. Falls back to the product-level
 * gallery (legacy products / stale carts) and then to the first enabled
 * variant's gallery, so callers always get a usable image list.
 */
export function galleryForColor(
  product: any,
  colorSlug?: string | null,
): any[] {
  const variants = product?.colorVariants || []
  const bySlug = colorSlug
    ? variants.find(
        (v: any) => v?.enabled !== false && v?.color?.slug === colorSlug,
      )
    : null
  const fallback = variants.find((v: any) => v?.enabled !== false)
  const gallery =
    bySlug?.gallery || product?.gallery || fallback?.gallery || []
  return Array.isArray(gallery) ? gallery : []
}
