export function getProductUrl(
  slug: string | null | undefined,
  productId: string | number,
  colorSlug?: string | null,
): string {
  const base = `/products/${slug ?? 'product'}/${productId}`
  return colorSlug ? `${base}?color=${encodeURIComponent(colorSlug)}` : base
}
