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
 * Drop internal links whose target page is not published. `null` slugs (lookup
 * failed) keep everything.
 */
export function filterCmsLinks<T extends NavLink>(
  links: T[],
  publishedSlugs: Set<string> | null,
): T[] {
  if (publishedSlugs === null) return links
  return links.filter(
    (link) =>
      !link.href.startsWith('/') ||
      link.href === '/' ||
      publishedSlugs.has(link.href.replace(/^\//, '').split('?')[0]),
  )
}
