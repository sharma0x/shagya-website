export function getProductUrl(
  slug: string | null | undefined,
  productId: string | number,
): string {
  return `/products/${slug ?? 'product'}/${productId}`
}
