import { Suspense } from 'react'
import { ArrowRight } from 'lucide-react'

// Rendered per-request. The page can't be statically prerendered at build time
// (the build environment has no DB access), and the DB is now colocated (RDS in
// the same region as the VPS) so per-request SSR is fast. A CDN/edge cache
// should sit in front for production.
export const dynamic = 'force-dynamic'

import {
  IconBrandInstagram,
  IconBrandFacebook,
  IconBrandYoutube,
  IconBrandPinterest,
  IconHeart,
  IconSparkles,
  IconSun,
  IconGift,
  IconGlassFull,
} from '@tabler/icons-react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import type { Product } from '@/payload-types'
import { liftVariantGallery } from '@/lib/product-utils'
import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { SkeletonImage } from '@/components/ui/SkeletonImage'
import {
  CategoriesGridSkeleton,
  SpotlightsGridSkeleton,
  ProductSectionSkeleton,
  BlogGridSkeleton,
} from '@/components/ui/Skeleton'
import { RefreshRouteOnSave } from '@/components/live-preview/RefreshRouteOnSave'
import { SectionHeading } from '@/components/homepage/SectionHeading'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductCarousel } from '@/components/product/ProductCarousel'
import { CategoryCard } from '@/components/homepage/CategoryCard'
import { InstagramGallery } from '@/components/homepage/InstagramGallery'
import { OccasionButton } from '@/components/homepage/OccasionButton'
import { TestimonialCard } from '@/components/homepage/TestimonialCard'
import { TrendingColors } from '@/components/homepage/TrendingColors'
import { HeroCarousel } from '@/components/homepage/HeroCarousel'
import { isUnoptimizedImage } from '@/lib/image-url'

function LexicalRenderer({ content }: { content: any }) {
  if (!content || !content.root || !Array.isArray(content.root.children)) {
    return null
  }
  return (
    <div className="font-body space-y-4 text-[1.125rem] leading-relaxed text-neutral-600">
      {content.root.children.map((block: any, idx: number) => {
        if (block.type === 'paragraph' && Array.isArray(block.children)) {
          return (
            <p key={idx}>
              {block.children.map((node: any, nIdx: number) => {
                if (node.type === 'text') {
                  return node.text
                }
                return null
              })}
            </p>
          )
        }
        return null
      })}
    </div>
  )
}

function ImagePanel({
  src,
  alt,
  className,
  rounded = 'rounded-2xl',
  caption,
  region,
  loading,
}: {
  src: string
  alt: string
  className?: string
  rounded?: string
  caption?: string
  region?: string
  loading?: 'lazy' | 'eager'
}) {
  return (
    <div
      className={`relative overflow-hidden bg-neutral-100 ${rounded} ${className ?? ''}`}
    >
      <SkeletonImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
        unoptimized={isUnoptimizedImage(src)}
        loading={loading ?? 'lazy'}
      />
      {caption && (
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-neutral-950/55 to-transparent p-5">
          <div>
            <p className="font-display text-sm font-semibold text-white drop-shadow-sm">
              {caption}
            </p>
            {region && (
              <p className="font-body mt-0.5 text-xs text-white/80">{region}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function mapProductWithVariant(p: any) {
  return liftVariantGallery(p)
}

const OCCASIONS = [
  {
    label: 'Wedding',
    icon: <IconHeart className="h-6 w-6" />,
    href: '/category/all?occasion=wedding',
  },
  {
    label: 'Festival',
    icon: <IconSparkles className="h-6 w-6" />,
    href: '/category/all?occasion=festive',
  },
  {
    label: 'Daily Wear',
    icon: <IconSun className="h-6 w-6" />,
    href: '/category/cotton',
  },
  {
    label: 'Gifting',
    icon: <IconGift className="h-6 w-6" />,
    href: '/collections/gift-guide',
  },
  {
    label: 'Party',
    icon: <IconGlassFull className="h-6 w-6" />,
    href: '/category/designer',
  },
]

const DEFAULT_TESTIMONIALS = [
  {
    quote:
      "The Banarasi I ordered is absolutely stunning. You can feel the weight of real silk. Every time I wear it, I get compliments — and I love telling people it's directly from the weaver.",
    name: 'Ananya S.',
    role: 'Mumbai',
    rating: 5,
  },
  {
    quote:
      'I was nervous buying a saree online without seeing it first, but the handloom certificate and detailed photos made it easy. The fabric is even more beautiful in person. Will definitely be back.',
    name: 'Priya M.',
    role: 'Bangalore',
    rating: 5,
  },
  {
    quote:
      'What sets Shayga apart is knowing exactly which cluster my saree came from and who wove it. It transforms a piece of clothing into a story. My Chanderi is easily my most treasured possession now.',
    name: 'Rohini K.',
    role: 'Pune',
    rating: 5,
  },
]

// ─── Progressive Server Component Sections ──────────────────────────

async function HomeCategoriesSection({
  subtitle,
}: {
  subtitle?: string | null
}) {
  const payload = await getPayload({ config })
  const categoriesRes = await payload.find({
    collection: 'categories',
    limit: 20,
  })
  const dbCategories = categoriesRes.docs

  return (
    <section className="bg-white">
      <div className="container-page py-6 sm:py-8 md:py-10">
        <SectionHeading
          title="Our Collection"
          subtitle={
            subtitle ||
            'Explore our collection of handloom sarees, each woven with tradition and care'
          }
          viewAllHref="/category/all"
          viewAllLabel="Browse All"
        />

        {dbCategories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {dbCategories.slice(0, 6).map((cat) => {
              const imgUrl =
                cat.image && typeof cat.image === 'object'
                  ? cat.image.sizes?.card?.url || cat.image.url
                  : null
              return (
                <CategoryCard
                  key={cat.id}
                  name={cat.name}
                  slug={cat.slug}
                  imageUrl={imgUrl}
                />
              )
            })}
          </div>
        ) : (
          <p className="text-brand-700/50 py-16 text-center text-sm">
            Categories coming soon.
          </p>
        )}
      </div>
    </section>
  )
}

async function HomeProductSpotlightsSection() {
  const payload = await getPayload({ config })
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const THIRTY_DAYS_AGO = thirtyDaysAgo.toISOString()

  // Run independent queries in parallel for this section
  const [initialNewArrivals, recentOrdersRes] = await Promise.all([
    payload.find({
      collection: 'products',
      where: {
        and: [
          { status: { equals: 'published' } },
          { createdAt: { greater_than: THIRTY_DAYS_AGO } },
        ],
      },
      limit: 2,
      sort: '-createdAt',
      depth: 2,
    }),
    payload.find({
      collection: 'orders',
      where: {
        and: [
          { createdAt: { greater_than: THIRTY_DAYS_AGO } },
          {
            or: [
              { status: { equals: 'confirmed' } },
              { status: { equals: 'processing' } },
              { status: { equals: 'shipped' } },
              { status: { equals: 'delivered' } },
              { status: { equals: 'pending' } },
            ],
          },
        ],
      },
      limit: 50,
      depth: 0,
    }),
  ])

  let newArrivalsRes = initialNewArrivals
  if (newArrivalsRes.totalDocs === 0) {
    newArrivalsRes = await payload.find({
      collection: 'products',
      where: { status: { equals: 'published' } },
      limit: 2,
      sort: '-createdAt',
      depth: 2,
    })
  }
  const newArrivals = newArrivalsRes.docs as Product[]
  const newArrivalIds = new Set(newArrivals.map((p) => p.id))

  const productQuantities = new Map<number, number>()
  for (const order of recentOrdersRes.docs) {
    for (const item of (order as any).items ?? []) {
      const pid =
        typeof item.product === 'number' ? item.product : item.product?.id
      if (!pid) continue
      productQuantities.set(
        pid,
        (productQuantities.get(pid) ?? 0) + (item.quantity ?? 1),
      )
    }
  }
  const sortedProductIds = [...productQuantities.entries()]
    .sort((a, b) => b[1] - a[1])
    .filter(([id]) => !newArrivalIds.has(id))
    .map(([id]) => id)

  let trendingNowDocs: Product[] = []
  if (sortedProductIds.length > 0) {
    const topIds = sortedProductIds.slice(0, 2)
    const trendingRes = await payload.find({
      collection: 'products',
      where: { id: { in: topIds } },
      limit: 2,
      depth: 2,
    })
    trendingNowDocs = trendingRes.docs as Product[]
  }
  if (trendingNowDocs.length === 0) {
    const fallbackRes = await payload.find({
      collection: 'products',
      where: {
        and: [
          { status: { equals: 'published' } },
          { id: { not_in: [...newArrivalIds] } },
        ],
      },
      limit: 2,
      sort: '-createdAt',
      depth: 2,
    })
    trendingNowDocs = fallbackRes.docs as Product[]
  }
  const trendingNow = trendingNowDocs
  const trendingIds = new Set(trendingNow.map((p) => p.id))

  const bestOffersWhere: any[] = [
    { status: { equals: 'published' } },
    { compareAtPrice: { exists: true } },
  ]
  const dedupIds = [...newArrivalIds, ...trendingIds]
  if (dedupIds.length > 0) {
    bestOffersWhere.push({ id: { not_in: dedupIds } })
  }
  const bestOffersRes = await payload.find({
    collection: 'products',
    where: { and: bestOffersWhere },
    limit: 10,
    sort: '-compareAtPrice',
    depth: 2,
  })
  const bestOffers = (bestOffersRes.docs as Product[])
    .filter((p) => (p as any).compareAtPrice > (p as any).basePrice)
    .slice(0, 2)

  if (
    newArrivals.length === 0 &&
    trendingNow.length === 0 &&
    bestOffers.length === 0
  ) {
    return null
  }

  return (
    <section className="bg-white">
      <div className="container-page py-6 sm:py-8 md:py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-10">
          {/* New Arrivals */}
          {newArrivals.length > 0 && (
            <div>
              <SectionHeading
                title="New Arrivals"
                subtitle="Fresh off the loom"
                viewAllHref="/category/all?sort=-createdAt"
                viewAllLabel="View All"
                size="sm"
              />
              <div className="grid grid-cols-2 gap-2">
                {newArrivals.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={mapProductWithVariant(p)}
                    badge="new"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Trending Now */}
          {trendingNow.length > 0 && (
            <div>
              <SectionHeading
                title="Trending Now"
                subtitle="What everyone is loving"
                viewAllHref="/category/all"
                viewAllLabel="View more"
                size="sm"
              />
              <div className="grid grid-cols-2 gap-2">
                {trendingNow.map((p) => (
                  <ProductCard key={p.id} product={mapProductWithVariant(p)} />
                ))}
              </div>
            </div>
          )}

          {/* Best Offers */}
          {bestOffers.length > 0 && (
            <div>
              <SectionHeading
                title="Best Offers"
                subtitle="Handpicked deals just for you"
                viewAllHref="/category/all?sale=true"
                viewAllLabel="View all deals"
                size="sm"
              />
              <div className="grid grid-cols-2 gap-2">
                {bestOffers.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={mapProductWithVariant(p)}
                    badge="sale"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

async function HomeBestSellersSection({
  productBlock,
}: {
  productBlock?: {
    heading?: string | null
    ctaText?: string | null
    ctaLink?: string | null
    limit?: number | null
  }
}) {
  const payload = await getPayload({ config })
  const allProductsRes = await payload.find({
    collection: 'products',
    where: { status: { equals: 'published' } },
    limit: 12,
    sort: '-createdAt',
    depth: 2,
  })

  if (allProductsRes.docs.length === 0) return null
  const limit = productBlock?.limit || 4

  return (
    <section className="bg-brand-50/20">
      <div className="container-page py-6 sm:py-8 md:py-10">
        <SectionHeading
          title={productBlock?.heading || 'Best Sellers'}
          subtitle="Our community's most-loved weaves — for good reason"
          viewAllHref={productBlock?.ctaLink || '/category/all'}
          viewAllLabel={productBlock?.ctaText || 'Shop All'}
        />
        <ProductCarousel
          products={(allProductsRes.docs as Product[])
            .slice(0, limit)
            .map(mapProductWithVariant)}
        />
      </div>
    </section>
  )
}

async function HomeBlogSection({
  postBlock,
}: {
  postBlock?: {
    heading?: string | null
    ctaText?: string | null
    ctaLink?: string | null
  }
}) {
  const payload = await getPayload({ config })
  const postsRes = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    limit: 3,
    sort: '-publishedAt',
    depth: 1,
  })
  const dbPosts = postsRes.docs
  if (dbPosts.length === 0) return null

  return (
    <section className="bg-white">
      <div className="container-page py-6 sm:py-8 md:py-10">
        <SectionHeading
          title={postBlock?.heading || 'From the Loom'}
          subtitle="Stories from India's weaving clusters"
          viewAllHref={postBlock?.ctaLink || '/blog'}
          viewAllLabel={postBlock?.ctaText || 'Read Journal'}
        />
        <div className="grid gap-6 md:grid-cols-3">
          {dbPosts.slice(0, 3).map((post) => {
            const thumbSrc =
              post.featuredImage && typeof post.featuredImage === 'object'
                ? (post.featuredImage as any).sizes?.thumbnail?.url ||
                  (post.featuredImage as any).url
                : null
            const postDate = post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : ''
            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group border-brand-100/50 flex flex-col overflow-hidden rounded-2xl border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                {thumbSrc && (
                  <div className="relative aspect-[16/10] overflow-hidden bg-neutral-100">
                    <SkeletonImage
                      src={thumbSrc}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  {postDate && (
                    <time className="text-brand-700/50 text-xs">
                      {postDate}
                    </time>
                  )}
                  <h3 className="font-display text-brand-950 group-hover:text-brand-700 mt-1.5 text-base font-semibold transition-colors">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-brand-700/70 mt-2 line-clamp-2 text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="mt-auto pt-4">
                    <span className="text-brand-600 inline-flex items-center gap-1 text-xs font-medium">
                      Read more
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default async function HomePage() {
  const payload = await getPayload({ config })

  // Fast fetch for page doc shell settings
  const pageRes = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 1,
  })
  const homeDoc = pageRes.docs[0]

  // Extract CMS block headings
  const contentBlocks = homeDoc?.content ?? []
  const heroBlock = contentBlocks.find((b: any) => b.blockType === 'hero') as
    | {
        heading?: string | null
        subheading?: string | null
        ctaText?: string | null
        ctaLink?: string | null
        images?:
          | { image: { url?: string | null } | number; id?: string }[]
          | null
        backgroundImage?: { url?: string | null } | number | null
        blockType: 'hero'
      }
    | undefined
  const categoriesBlock = contentBlocks.find(
    (b: any) => b.blockType === 'categoriesGrid',
  ) as
    | {
        heading?: string | null
        subheading?: string | null
        blockType: 'categoriesGrid'
      }
    | undefined
  const productBlocks = contentBlocks.filter(
    (b: any) => b.blockType === 'productGrid',
  ) as {
    heading?: string | null
    subheading?: string | null
    ctaText?: string | null
    ctaLink?: string | null
    limit?: number | null
    blockType: 'productGrid'
  }[]
  const postBlock = contentBlocks.find(
    (b: any) => b.blockType === 'postGrid',
  ) as
    | {
        heading?: string | null
        ctaText?: string | null
        ctaLink?: string | null
        blockType: 'postGrid'
      }
    | undefined
  const testimonialBlock = contentBlocks.find(
    (b: any) => b.blockType === 'testimonials',
  ) as
    | {
        heading?: string | null
        items?: {
          id?: string | null
          name?: string | null
          role?: string | null
          quote?: string | null
          rating?: number | null
          avatar?: { url?: string | null; sizes?: any } | number | null
        }[]
        blockType: 'testimonials'
      }
    | undefined

  const testimonialItems = testimonialBlock?.items || []
  const displayTestimonials =
    testimonialItems.length > 0 ? testimonialItems : DEFAULT_TESTIMONIALS

  const fallbackHeroUrl =
    typeof heroBlock?.backgroundImage === 'object' &&
    heroBlock.backgroundImage?.url
      ? heroBlock.backgroundImage.url
      : '/images/hero/hero-main.png'

  const heroSlides = (() => {
    const imgs = heroBlock?.images
    if (imgs && imgs.length > 0) {
      return imgs.map((entry) => {
        const url =
          typeof entry.image === 'object' && entry.image?.url
            ? entry.image.url
            : fallbackHeroUrl
        return {
          imageUrl: url,
          heading: heroBlock?.heading || (
            <>
              <span className="text-white">Timeless</span>{' '}
              <span className="text-white">Elegance</span>
              <br />
              <span className="text-brand-300">in every drape</span>
            </>
          ),
          subheading:
            heroBlock?.subheading ||
            "Every saree carries the story of the hands that wove it. Direct from India's weaving clusters — no middlemen, no markup.",
          ctaText: heroBlock?.ctaText || 'Shop the collection',
          ctaLink: heroBlock?.ctaLink || '/category/all',
          secondaryCtaText: 'Our craft story',
          secondaryCtaLink: '/about',
        }
      })
    }
    return [
      {
        imageUrl: fallbackHeroUrl,
        heading: heroBlock?.heading || (
          <>
            <span className="text-white">Timeless</span>{' '}
            <span className="text-white">Elegance</span>
            <br />
            <span className="text-brand-300">in every drape</span>
          </>
        ),
        subheading:
          heroBlock?.subheading ||
          "Every saree carries the story of the hands that wove it. Direct from India's weaving clusters — no middlemen, no markup.",
        ctaText: heroBlock?.ctaText || 'Shop the collection',
        ctaLink: heroBlock?.ctaLink || '/category/all',
        secondaryCtaText: 'Our craft story',
        secondaryCtaLink: '/about',
      },
    ]
  })()

  return (
    <div className="overflow-hidden">
      <RefreshRouteOnSave />

      {/* ─── SECTION 1: HERO (Renders instantly) ─── */}
      <HeroCarousel slides={heroSlides} />

      {/* ─── SECTION 2: SHOP BY CATEGORY (Progressive Stream) ─── */}
      <Suspense fallback={<CategoriesGridSkeleton />}>
        <HomeCategoriesSection subtitle={categoriesBlock?.subheading} />
      </Suspense>

      {/* ─── SECTION 3: PRODUCT SPOTLIGHTS (Progressive Stream) ─── */}
      <Suspense fallback={<SpotlightsGridSkeleton />}>
        <HomeProductSpotlightsSection />
      </Suspense>

      {/* ─── SECTION 4: SHOP BY OCCASION + TRENDING COLORS + SOCIAL (Renders instantly) ─── */}
      <section className="bg-brand-50/20">
        <div className="container-page py-6 sm:py-8 md:py-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-10">
            {/* Shop by Occasion */}
            <div>
              <SectionHeading
                title="Shop by Occasion"
                subtitle="Find the perfect saree"
                align="center"
                size="sm"
              />
              <div className="flex flex-wrap justify-center gap-2">
                {OCCASIONS.map((occ) => (
                  <OccasionButton
                    key={occ.label}
                    label={occ.label}
                    icon={occ.icon}
                    href={occ.href}
                    compact
                  />
                ))}
              </div>
            </div>

            {/* Trending Colors */}
            <div>
              <SectionHeading
                title="Trending Colors"
                subtitle="This season's most-loved shades"
                align="center"
                size="sm"
              />
              <div className="flex justify-center">
                <TrendingColors compact />
              </div>
            </div>

            {/* Social */}
            <div>
              <SectionHeading
                title="Follow the Loom"
                subtitle="Behind the weave, in real time"
                align="center"
                size="sm"
              />
              <div className="flex flex-wrap items-center justify-center gap-3">
                <a
                  href="https://instagram.com/shayga"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="bg-brand-100 hover:bg-brand-600/10 text-brand-700 hover:text-brand-600 flex h-12 w-12 items-center justify-center rounded-full transition-colors"
                >
                  <IconBrandInstagram className="h-5 w-5" />
                </a>
                <a
                  href="https://facebook.com/shayga"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="bg-brand-100 hover:bg-brand-600/10 text-brand-700 hover:text-brand-600 flex h-12 w-12 items-center justify-center rounded-full transition-colors"
                >
                  <IconBrandFacebook className="h-5 w-5" />
                </a>
                <a
                  href="https://youtube.com/@shayga"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="bg-brand-100 hover:bg-brand-600/10 text-brand-700 hover:text-brand-600 flex h-12 w-12 items-center justify-center rounded-full transition-colors"
                >
                  <IconBrandYoutube className="h-5 w-5" />
                </a>
                <a
                  href="https://pinterest.com/shayga"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Pinterest"
                  className="bg-brand-100 hover:bg-brand-600/10 text-brand-700 hover:text-brand-600 flex h-12 w-12 items-center justify-center rounded-full transition-colors"
                >
                  <IconBrandPinterest className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: BEST SELLERS (Progressive Stream) ─── */}
      <Suspense fallback={<ProductSectionSkeleton count={4} />}>
        <HomeBestSellersSection productBlock={productBlocks[1]} />
      </Suspense>

      {/* ─── SECTION 7: BLOG POSTS (Progressive Stream) ─── */}
      <Suspense fallback={<BlogGridSkeleton />}>
        <HomeBlogSection postBlock={postBlock} />
      </Suspense>

      {/* ─── SECTION 8: INSTAGRAM GALLERY (Renders instantly) ─── */}
      <section className="bg-brand-50/20">
        <div className="container-page py-6 sm:py-8 md:py-10">
          <SectionHeading
            title="Follow the Loom"
            subtitle="@shayga — tag us for a chance to be featured"
            viewAllHref="https://instagram.com/shayga"
            viewAllLabel="Follow @shayga"
          />
          <InstagramGallery />
        </div>
      </section>

      {/* ─── SECTION 9: TESTIMONIALS (Renders instantly) ─── */}
      <section className="bg-white">
        <div className="container-page py-6 sm:py-8 md:py-10">
          <SectionHeading
            title={testimonialBlock?.heading || 'Loved by our community'}
            subtitle="Real stories from saree lovers across India"
          />

          <div className="grid gap-6 md:grid-cols-3">
            {displayTestimonials.slice(0, 3).map((item: any) => (
              <TestimonialCard
                key={item.id || item.name}
                quote={item.quote || ''}
                name={item.name || 'Customer'}
                location={item.role || undefined}
                rating={item.rating || 5}
                avatarUrl={
                  item.avatar && typeof item.avatar === 'object'
                    ? item.avatar.sizes?.thumbnail?.url ||
                      item.avatar.url ||
                      null
                    : null
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CMS CONTENT BLOCKS (Renders instantly) ─── */}
      {homeDoc?.content?.map((block: any, idx: number) => {
        if (block.blockType === 'textImage') {
          const imgSrc =
            block.image && typeof block.image === 'object'
              ? block.image.sizes?.card?.url || block.image.url
              : '/images/blogs/blog-1.jpg'

          return (
            <section
              key={`cms-${idx}`}
              className="scroll-reveal border-y border-neutral-200 bg-neutral-50"
            >
              <div className="container-page grid items-center gap-8 py-16 sm:gap-12 sm:py-24 md:py-32 lg:grid-cols-12 lg:gap-20">
                <div
                  className={`lg:col-span-5 ${block.imagePosition === 'right' ? 'lg:order-2' : ''}`}
                >
                  <ImagePanel
                    src={imgSrc}
                    alt={block.heading}
                    className="aspect-square w-full shadow-lg"
                  />
                </div>
                <div
                  className={`lg:col-span-7 ${block.imagePosition === 'right' ? 'lg:order-1' : ''}`}
                >
                  <div
                    className="bg-gold-400 mb-5 h-px w-12"
                    aria-hidden="true"
                  />
                  <h2 className="text-headline font-display font-semibold tracking-tight text-neutral-900">
                    {block.heading}
                  </h2>
                  <div className="mt-6 max-w-[58ch]">
                    {block.body ? (
                      <LexicalRenderer content={block.body} />
                    ) : null}
                  </div>
                </div>
              </div>
            </section>
          )
        }
        return null
      })}

      {/* ─── SECTION 10: NEWSLETTER + PROMISE (Renders instantly) ─── */}
      <section className="bg-brand-950 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          aria-hidden="true"
        >
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                'radial-gradient(circle at 25% 25%, oklch(0.85 0.1 65) 0%, transparent 50%), radial-gradient(circle at 75% 75%, oklch(0.85 0.1 65) 0%, transparent 50%)',
            }}
          />
        </div>

        <div className="rule-gold" />

        <div className="container-page relative py-6 sm:py-8 md:py-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8">
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                Every saree is signed by its maker
              </h2>
              <p className="text-brand-200/70 mt-4 max-w-[50ch] text-base leading-relaxed sm:text-lg">
                Handloom-verified. Maker-traced. No middleman markup, no
                warehouse mystery stock — just the cloth, the cluster it came
                from, and a fair price on both sides.
              </p>
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row">
                <Link
                  href="/category/all"
                  className="text-brand-800 hover:bg-gold-100 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold transition-all active:scale-[0.97]"
                >
                  Begin browsing
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/about"
                  className="group text-brand-300 inline-flex h-11 items-center gap-2 text-sm font-medium transition-colors hover:text-white"
                >
                  Meet the weavers
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            <div className="self-start rounded-2xl bg-white p-5 shadow-lg sm:p-6">
              <h2 className="font-display text-brand-950 text-lg font-semibold tracking-tight sm:text-xl">
                A weekly note from the loom
              </h2>
              <p className="text-brand-700/70 mt-2 text-sm leading-relaxed">
                One weave, one maker, one thing worth knowing. Unsubscribe
                anytime.
              </p>
              <div className="mt-4">
                <NewsletterForm />
              </div>
              <p className="text-brand-700/40 mt-2 text-xs">
                No spam. One email a week. Unsubscribe in one click.
              </p>
            </div>
          </div>
        </div>

        <div className="rule-gold" />
      </section>
    </div>
  )
}
