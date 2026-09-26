import type { Metadata } from 'next'

/**
 * Site-wide SEO helpers.
 *
 * The (frontend) layout sets a title/description but no OpenGraph or Twitter
 * tags, so every page was sharing one generic share preview and product pages
 * had no structured data. These builders centralise that so each route only
 * has to supply its own specifics.
 */

const SITE_NAME = 'Shayga'
const DEFAULT_OG_IMAGE = '/images/placeholder.svg'

/**
 * Canonical origin for absolute URLs in metadata. Deliberately NOT
 * NEXT_PUBLIC_SERVER_URL — that points at the build machine (localhost during
 * CI/Docker builds), which would bake `http://localhost:3000` into every
 * og:url and og:image. Override with NEXT_PUBLIC_SITE_URL when deploying to a
 * non-prod host.
 */
const SITE_ORIGIN = (
  process.env.NEXT_PUBLIC_SITE_URL || 'https://shayga.in'
).replace(/\/$/, '')

/** Absolute URL for a site-relative path — OG tags require absolute URLs. */
export function absoluteUrl(path?: string | null): string | undefined {
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return path
  return `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Normalise a Payload upload field into a usable absolute image URL.
 * Accepts a populated object (depth > 0), a bare numeric id (depth 0), or
 * nothing at all.
 */
export function imageUrl(
  field: unknown,
  preferredSizes: string[] = ['hero', 'card', 'thumbnail'],
): string | undefined {
  if (!field) return undefined
  if (typeof field === 'string') return absoluteUrl(field)
  if (typeof field === 'number') return undefined // depth 0 — not resolvable
  if (typeof field !== 'object') return undefined

  const img = field as Record<string, any>
  for (const size of preferredSizes) {
    const url = img?.sizes?.[size]?.url
    if (url) return absoluteUrl(url)
  }
  return absoluteUrl(img.url)
}

/** Trim a rich-text/lexical field down to a plain meta description. */
export function excerpt(content: unknown, maxLength = 155): string | undefined {
  if (!content) return undefined
  let text = ''
  if (typeof content === 'string') {
    text = content
  } else if (typeof content === 'object') {
    const walk = (node: any): string => {
      if (!node) return ''
      if (typeof node.text === 'string') return node.text
      if (Array.isArray(node.children)) return node.children.map(walk).join(' ')
      return ''
    }
    text = walk((content as any).root ?? content)
  }
  const clean = text.replace(/\s+/g, ' ').trim()
  if (!clean) return undefined
  if (clean.length <= maxLength) return clean
  return `${clean.slice(0, maxLength - 1).trimEnd()}…`
}

type OpenGraphInput = {
  title: string
  description: string
  /** Absolute or site-relative image URL. */
  image?: string | null
  /** Site-relative or absolute URL of this page. */
  url?: string | null
  /**
   * Next's OpenGraph type only models 'website' | 'article'. Product pages
   * still use 'website' here — the product identity that Google reads for rich
   * results comes from the schema.org/Product JSON-LD, not the OG type.
   */
  type?: 'website' | 'article'
}

/**
 * Build an OpenGraph + Twitter card pair. Every page should pass through here
 * so a share link never falls back to a bare, imageless preview.
 */
export function openGraph({
  title,
  description,
  image,
  url,
  type = 'website',
}: OpenGraphInput): Metadata {
  const imageUrl = absoluteUrl(image) ?? absoluteUrl(DEFAULT_OG_IMAGE)
  return {
    openGraph: {
      type,
      siteName: SITE_NAME,
      title,
      description,
      url: absoluteUrl(url),
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  }
}

type ProductJsonLdInput = {
  name: string
  description: string
  image?: string | null
  url?: string | null
  sku?: string | null
  price?: number | null
  currency?: string
  availability?: 'InStock' | 'OutOfStock'
  brand?: string | null
}

/**
 * schema.org/Product JSON-LD. This is what produces price/availability rich
 * results in Google. Emitted as a plain <script type="application/ld+json"> by
 * the page because Next's metadata API has no first-class JSON-LD field.
 */
export function productJsonLd(input: ProductJsonLdInput): string {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description,
  }
  if (input.url) data.url = absoluteUrl(input.url)
  if (input.image) data.image = absoluteUrl(input.image)
  if (input.sku) data.sku = input.sku
  if (input.brand) data.brand = { '@type': 'Brand', name: input.brand }
  if (typeof input.price === 'number') {
    data.offers = {
      '@type': 'Offer',
      price: input.price,
      priceCurrency: input.currency || 'INR',
      availability: `https://schema.org/${input.availability || 'InStock'}`,
      url: absoluteUrl(input.url),
    }
  }
  return JSON.stringify(data)
}

type BreadcrumbItem = { name: string; url: string }

export function breadcrumbJsonLd(items: BreadcrumbItem[]): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.url),
    })),
  })
}
