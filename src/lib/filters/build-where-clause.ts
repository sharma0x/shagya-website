/**
 * Transforms URLSearchParams into a Payload-compatible `where` object.
 * Merges with an optional baseWhere (e.g., status: { equals: 'published' }).
 *
 * Only includes params that are present and non-empty in the URL.
 */
export function buildWhereClause(
  params: URLSearchParams,
  baseWhere: Record<string, any> = {},
): Record<string, any> {
  const where: Record<string, any> = { ...baseWhere }

  // Multi-value enum filters (comma-separated)
  const multiFilters = [
    'weave',
    'fabric',
    'pattern',
    'occasion',
    'color',
  ] as const
  for (const key of multiFilters) {
    const value = params.get(key)
    if (value) {
      const values = value.split(',').filter(Boolean)
      if (values.length === 1) {
        where[key] = { equals: values[0] }
      } else if (values.length > 1) {
        where[key] = { in: values }
      }
    }
  }

  // Collection filter — comma-separated slugs
  const collection = params.get('collection')
  if (collection) {
    const slugs = collection.split(',').filter(Boolean)
    if (slugs.length === 1) {
      where.collections = { equals: slugs[0] }
    } else if (slugs.length > 1) {
      where.collections = { in: slugs }
    }
  }

  // Price range
  const priceMin = params.get('priceRange_min')
  const priceMax = params.get('priceRange_max')

  if (priceMin && priceMax) {
    where.basePrice = {
      greater_than_equal: parseFloat(priceMin),
      less_than_equal: parseFloat(priceMax),
    }
  } else if (priceMin) {
    where.basePrice = { greater_than_equal: parseFloat(priceMin) }
  } else if (priceMax) {
    where.basePrice = { less_than_equal: parseFloat(priceMax) }
  }

  return where
}
