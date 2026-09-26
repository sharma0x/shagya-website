import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { FabricType, SiteSetting } from '@/payload-types'
import { Logo } from '@/components/layout/Logo'

type FooterLink = { label: string; href: string }
type FooterSection = { title: string; links: FooterLink[] }

const staticFooterLinks: FooterSection[] = [
  {
    title: 'Shayga',
    links: [
      { label: 'About Us', href: '/about' },
      { label: 'Journal', href: '/blog' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Shipping', href: '/shipping' },
      { label: 'Returns & Exchange', href: '/shipping' },
      { label: 'FAQs', href: '/faq' },
      { label: 'Terms', href: '/terms' },
      { label: 'Privacy', href: '/privacy' },
    ],
  },
]

/**
 * CMS-backed footer links. These resolve through the `[slug]` catch-all, so a
 * link here 404s whenever the corresponding Pages document is missing or
 * unpublished — which is exactly how `/careers` ended up as a dead footer link
 * in production. `publishedSlugs` is the set of slugs that actually exist, so
 * we can drop the link rather than ship a 404.
 */
const CMS_BACKED_FOOTER_LINKS: FooterSection[] = staticFooterLinks

const defaultSocialLinks: FooterLink[] = [
  { label: 'Instagram', href: 'https://instagram.com/shayga' },
  { label: 'Facebook', href: 'https://facebook.com/shayga' },
  { label: 'WhatsApp', href: 'https://wa.me/91906566511' },
]

const DEFAULT_WHATSAPP_URL = 'https://wa.me/91906566511'

function socialLinksFromSettings(settings: SiteSetting): FooterLink[] {
  const links: FooterLink[] = []
  if (settings.instagramUrl) {
    links.push({ label: 'Instagram', href: settings.instagramUrl })
  }
  if (settings.facebookUrl) {
    links.push({ label: 'Facebook', href: settings.facebookUrl })
  }
  if (settings.youtubeUrl) {
    links.push({ label: 'YouTube', href: settings.youtubeUrl })
  }
  links.push({
    label: 'WhatsApp',
    href: settings.whatsappUrl || DEFAULT_WHATSAPP_URL,
  })
  return links
}

function shopLinksFromFabrics(fabrics: FabricType[]): FooterLink[] {
  const fabricLinks = fabrics.flatMap((fabric) => {
    if (!fabric.slug) return []

    return [
      {
        label: `${fabric.name} Sarees`,
        href: `/category/all?fabric=${encodeURIComponent(fabric.slug)}`,
      },
    ]
  })

  return [...fabricLinks, { label: 'All Sarees', href: '/category/all' }]
}

export async function Footer() {
  let fabrics: FabricType[] = []
  let siteSettings: SiteSetting | null = null
  let publishedPageSlugs: Set<string> | null = null

  try {
    const payload = await getPayload({ config })
    const [fabricResult, settingsResult, pagesResult] = await Promise.all([
      payload.find({
        collection: 'fabric-types',
        depth: 0,
        limit: 100,
        pagination: false,
        sort: 'name',
      }),
      payload.findGlobal({
        slug: 'site-settings',
        depth: 0,
      }),
      // Only published pages resolve through the [slug] catch-all, so this is
      // exactly the set of footer hrefs that will render instead of 404.
      payload.find({
        collection: 'pages',
        where: { status: { equals: 'published' } },
        depth: 0,
        limit: 200,
        pagination: false,
      }),
    ])

    fabrics = fabricResult.docs
    siteSettings = settingsResult
    publishedPageSlugs = new Set(
      (pagesResult.docs as any[])
        .map((p) => p.slug)
        .filter((slug): slug is string => typeof slug === 'string'),
    )
  } catch (error) {
    console.error('Failed to load footer content', error)
  }

  // When the page list is unavailable, keep every link (fail open — a transient
  // DB error must not silently strip the footer).
  const resolvedLinks: FooterSection[] =
    publishedPageSlugs === null
      ? CMS_BACKED_FOOTER_LINKS
      : CMS_BACKED_FOOTER_LINKS.map((section) => ({
          ...section,
          links: section.links.filter(
            (link) =>
              !link.href.startsWith('/') ||
              publishedPageSlugs.has(link.href.slice(1)),
          ),
        })).filter((section) => section.links.length > 0)

  const sections: FooterSection[] = [
    { title: 'Shop', links: shopLinksFromFabrics(fabrics) },
    ...resolvedLinks,
    {
      title: 'Connect',
      links: siteSettings
        ? socialLinksFromSettings(siteSettings)
        : defaultSocialLinks,
    },
  ]

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="container-page py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-12 lg:gap-10">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-4">
            <Logo wordmarkClassName="text-neutral-900" className="h-8 w-8" />
            <p className="mt-4 text-sm leading-relaxed text-neutral-500">
              Handcrafted Indian sarees, woven with tradition. Premium silk,
              cotton, and designer sarees delivered to your doorstep.
            </p>
          </div>

          {/* Links */}
          {sections.map((section) => (
            <div key={section.title} className="col-span-1 lg:col-span-2">
              <h3 className="font-display mb-4 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="hover:text-brand-700 inline-block py-1.5 text-sm text-neutral-600 transition-colors sm:py-1"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-neutral-200 pt-8 sm:mt-16 sm:flex-row sm:gap-4">
          <p className="text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} Shayga. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400">We accept:</span>
            {['💳', '📱', '🏦', '⚡'].map((icon, i) => (
              <span key={i} className="text-base" aria-hidden="true">
                {icon}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
