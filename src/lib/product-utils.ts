export function liftVariantGallery(product: any) {
  const firstVariant = (product.colorVariants || []).find(
    (v: any) => v.enabled !== false && v.color,
  )
  return {
    ...product,
    gallery: firstVariant?.gallery || [],
    color: firstVariant?.color
      ? {
          slug: firstVariant.color.slug,
          name: firstVariant.color.name,
          hex: firstVariant.color.hex,
        }
      : null,
    basePrice: firstVariant?.priceOverride ?? product.basePrice,
  }
}
