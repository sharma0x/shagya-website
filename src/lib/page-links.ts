import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * Slugs of `pages` documents that are actually published, i.e. the ones the
 * `[slug]` catch-all will render rather than 404.
 *
 * Both the Header and Footer link to CMS-backed pages, and a link to a missing
 * or draft document is a dead end for the visitor. Both are rendered from the
 * (frontend) layout, so the lookup happens there once and the result is passed
 * down — Header is a client component and cannot query the DB itself.
 *
 * Returns `null` when the lookup fails, so callers can fail open and keep
 * every link rather than silently emptying the navigation.
 */
export async function getPublishedPageSlugs(): Promise<Set<string> | null> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'pages',
      where: { status: { equals: 'published' } },
      depth: 0,
      limit: 500,
      pagination: false,
    })

    return new Set(
      (result.docs as any[])
        .map((p) => p.slug)
        .filter((slug): slug is string => typeof slug === 'string'),
    )
  } catch (error) {
    console.error('Failed to resolve published page slugs', error)
    return null
  }
}

export type NavLink = { label: string; href: string }

/**
 * Drop links whose target is a CMS-backed page that is missing or draft.
 *
 * Only links listed in `cmsBacked` are candidates — `/collections` and
 * `/blog` are real App Router routes and must never be filtered against the
 * `pages` collection, or valid navigation silently disappears.
 *
 * `null` slugs (lookup failed) keep everything, so a transient DB error cannot
 * empty the nav.
 */
export function filterCmsLinks<T extends NavLink>(
  links: T[],
  publishedSlugs: Set<string> | null,
  cmsBacked: readonly string[] = [],
): T[] {
  if (publishedSlugs === null) return links

  const managed = new Set(cmsBacked.map((href) => href.replace(/^\//, '')))
  return links.filter((link) => {
    if (!link.href.startsWith('/') || link.href === '/') return true
    const slug = link.href.replace(/^\//, '').split('?')[0]
    // Not a CMS page — a real route, so it is always kept.
    if (!managed.has(slug)) return true
    return publishedSlugs.has(slug)
  })
}
