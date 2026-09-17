import type { Payload } from 'payload'

/**
 * Tolerant normalizers for the `weave` product field.
 *
 * `weave` used to be a hardcoded enum string; it is now a relationship to the
 * `weaves` collection. Depending on query depth the value can be:
 *   - a string (legacy docs / depth 0 on old data)
 *   - a `Weave` object `{ id, name, slug }` (depth >= 1)
 *   - an ID (number | string) at depth 0
 *   - null / undefined (weave is optional)
 *
 * These helpers let every consumer render or query it safely.
 */

export function weaveLabel(weave: unknown): string {
  if (!weave) return ''
  if (typeof weave === 'string') return weave
  if (typeof weave === 'object') {
    const w = weave as { name?: unknown; slug?: unknown; title?: unknown }
    const value = w.name ?? w.title ?? w.slug
    if (typeof value === 'string') return value
  }
  return ''
}

export function weaveIdOf(weave: unknown): string | number | null {
  if (!weave) return null
  if (typeof weave === 'string' || typeof weave === 'number') {
    return weave as string | number
  }
  if (typeof weave === 'object' && (weave as any)?.id != null) {
    return (weave as any).id as string | number
  }
  return null
}

/**
 * Resolve weave slugs (URL filter params) into weave document IDs so they can
 * be used in a relationship `where` clause.
 */
export async function resolveWeaveIds(
  payload: Payload,
  slugs: string[],
): Promise<(string | number)[]> {
  if (slugs.length === 0) return []
  const res = await payload.find({
    collection: 'weaves',
    where: { slug: { in: slugs } },
    limit: slugs.length,
    depth: 0,
    pagination: false,
  })
  return res.docs.map((d) => d.id as string | number)
}

/**
 * Resolve fabric slugs (URL filter params) into fabric document IDs so they can
 * be used in a relationship `where` clause.
 */
export async function resolveFabricIds(
  payload: Payload,
  slugs: string[],
): Promise<(string | number)[]> {
  if (slugs.length === 0) return []
  const res = await payload.find({
    collection: 'fabric-types',
    where: { slug: { in: slugs } },
    limit: slugs.length,
    depth: 0,
    pagination: false,
  })
  return res.docs.map((d) => d.id as string | number)
}

export const fabricLabel = weaveLabel
export const fabricIdOf = weaveIdOf
