import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { ProductCard } from '@/components/product/ProductCard'
import { RecommendationRow } from '@/components/product/RecommendationRow'
import { getTrendingProducts } from '@/lib/recommendations'
import { HeroGallery, type HeroImage } from '@/components/homepage/HeroGallery'
import { SkeletonImage } from '@/components/ui/SkeletonImage'
import { RefreshRouteOnSave } from '@/components/live-preview/RefreshRouteOnSave'

const ph = (w: number, h: number, bg: string, fg: string, text: string) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}&font=lora`

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
        unoptimized={src.startsWith('https://placehold.co')}
        loading={loading ?? 'lazy'}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent 0 3px, oklch(0.13 0.04 346) 3px 4px)',
        }}
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

function WeaveFilmstrip({
  categories,
  heading,
  subheading,
}: {
  categories: any[]
  heading?: string
  subheading?: string
}) {
  if (!categories || categories.length === 0) return null

  // Duplicate categories to ensure enough items for infinite scroll
  const dupCount = Math.max(2, Math.ceil(16 / categories.length))
  const items = Array.from({ length: dupCount }).flatMap(() => categories)

  return (
    <section
      aria-label="Weaves we carry"
      className="bg-brand-50/40 border-y border-neutral-200 py-5"
    >
      <div className="overflow-hidden">
        <div
          className="filmstrip-track"
          style={
            {
              '--filmstrip-gap': '1.25rem',
              '--filmstrip-duration': '50s',
            } as React.CSSProperties
          }
        >
          {items.map((cat, i) => {
            const img =
              (cat.image && typeof cat.image === 'object'
                ? cat.image.sizes?.card?.url || cat.image.url
                : null) || ph(200, 150, '7a3a5d', 'f5e8ee', cat.name)

            return (
              <div
                key={`${cat.id || cat.name}-${i}`}
                className="relative flex h-28 w-44 shrink-0 items-end overflow-hidden rounded-lg bg-neutral-100 sm:h-32 sm:w-48"
              >
                <SkeletonImage
                  src={img}
                  alt={cat.name}
                  fill
                  sizes="192px"
                  className="object-cover"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.15) 55%, transparent 100%)',
                  }}
                />
                <div className="relative z-10 p-3">
                  <p className="font-display text-sm font-semibold text-white drop-shadow-sm">
                    {cat.name}
                  </p>
                  <p className="mt-0.5 text-xs text-white/70">
                    {cat.description
                      ? cat.description.length > 25
                        ? cat.description.substring(0, 22) + '...'
                        : cat.description
                      : 'Handwoven'}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

type Props = {
  searchParams: Promise<{ preview?: string; id?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { preview, id } = await searchParams
  const isPreview = preview === 'true' && id === 'site-settings'
  const payload = await getPayload({ config })

  const pageRes = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
  })
  const homeDoc = pageRes.docs[0]

  const productsRes = await payload.find({
    collection: 'products',
    where: { status: { equals: 'published' } },
    limit: 12, // fetch enough for grids
    sort: '-createdAt',
  })
  const dbProducts = productsRes.docs

  // Hero gallery — product images padded with weave placeholders if needed
  const WEAVE_FALLBACKS: HeroImage[] = [
    {
      src: ph(800, 1000, '69254e', 'f5e8ee', 'Kanchipuram+Silk'),
      alt: 'A handwoven Kanchipuram silk saree in deep wine',
      caption: 'Kanchipuram Silk',
      region: 'Tamil Nadu',
    },
    {
      src: ph(800, 1000, '7a3a5d', 'f5e8ee', 'Banarasi'),
      alt: 'A handwoven Banarasi silk saree',
      caption: 'Banarasi Silk',
      region: 'Varanasi, UP',
    },
    {
      src: ph(800, 1000, 'a97e34', 'fff8ec', 'Chanderi'),
      alt: 'A Chanderi cotton saree in warm gold',
      caption: 'Chanderi Cotton',
      region: 'Madhya Pradesh',
    },
    {
      src: ph(800, 1000, '4a6b5d', 'f0f5f1', 'Jamdani'),
      alt: 'A Jamdani muslin saree from Bengal',
      caption: 'Jamdani Muslin',
      region: 'Dhaka, Bengal',
    },
    {
      src: ph(800, 1000, '8b3a3a', 'fdf2f0', 'Patola'),
      alt: 'A handwoven Patola silk saree from Gujarat',
      caption: 'Patola Silk',
      region: 'Patan, Gujarat',
    },
    {
      src: ph(800, 1000, 'c47a4a', 'fff8ec', 'Phulkari'),
      alt: 'A Phulkari embroidered dupatta from Punjab',
      caption: 'Phulkari',
      region: 'Punjab',
    },
  ]

  const productHeroImages: HeroImage[] = dbProducts
    .map((p) => {
      const src =
        p.gallery?.[0]?.image && typeof p.gallery[0].image === 'object'
          ? p.gallery[0].image.sizes?.card?.url || p.gallery[0].image.url || ''
          : ''
      return { src, alt: p.name, caption: p.name, region: p.weave }
    })
    .filter((img) => img.src !== '')

  const heroImages: HeroImage[] =
    productHeroImages.length >= 3
      ? productHeroImages.slice(0, 6)
      : [...productHeroImages, ...WEAVE_FALLBACKS].slice(0, 6)

  const categoriesRes = await payload.find({
    collection: 'categories',
    limit: 20,
  })
  const dbCategories = categoriesRes.docs

  const postsRes = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    limit: 4,
    sort: '-publishedAt',
    depth: 1,
  })
  const dbPosts = postsRes.docs

  const trendingProducts = await getTrendingProducts(6)

  const categoryFallbackImages: Record<string, string> = {
    silk: ph(750, 1000, '69254e', 'f5e8ee', 'Silk'),
    cotton: ph(750, 1000, 'a97e34', 'fff8ec', 'Cotton'),
    handloom: ph(750, 1000, '7a3a5d', 'f5e8ee', 'Handloom'),
  }

  // Track product iteration so multiple product grids show distinct products
  let productOffset = 0

  return (
    <div className="bg-surface">
      {isPreview && <RefreshRouteOnSave />}

      {homeDoc?.content?.map((block: any, idx: number) => {
        if (block.blockType === 'hero') {
          return (
            <section
              key={idx}
              className="container-page pt-12 pb-16 sm:pt-16 sm:pb-24 md:pt-28 md:pb-40"
            >
              <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
                <div className="animate-slide-up max-w-xl lg:col-span-6">
                  <h1 className="text-hero font-display font-semibold tracking-tight text-neutral-900">
                    {block.heading}
                  </h1>
                  <p className="mt-6 max-w-[55ch] text-lg leading-relaxed text-neutral-600">
                    {block.subheading}
                  </p>
                  <div className="mt-10 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                    <Link
                      href={block.ctaLink || '/category/all'}
                      className="bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-400 inline-flex h-12 items-center gap-2 rounded-xl px-6 text-base font-semibold text-white transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] sm:h-13 sm:px-7"
                    >
                      {block.ctaText || 'Shop the collection'}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      href="/about"
                      className="group flex min-h-[44px] items-center gap-2 text-base font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                      Our craft story
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>

                  <div className="mt-14 flex items-center gap-6 text-sm text-neutral-500">
                    <span>
                      <span className="font-display font-semibold text-neutral-900">
                        6 clusters
                      </span>{' '}
                      across India
                    </span>
                    <span className="h-4 w-px bg-neutral-300" />
                    <span>
                      <span className="font-display font-semibold text-neutral-900">
                        Maker-traced
                      </span>{' '}
                      every piece
                    </span>
                    <span className="hidden h-4 w-px bg-neutral-300 sm:block" />
                    <span className="hidden sm:inline">
                      <span className="font-display font-semibold text-neutral-900">
                        10 weaves
                      </span>{' '}
                      and counting
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <HeroGallery images={heroImages} />
                </div>
              </div>
            </section>
          )
        }

        if (block.blockType === 'categoriesGrid') {
          return (
            <WeaveFilmstrip
              key={idx}
              categories={dbCategories}
              heading={block.heading}
              subheading={block.subheading}
            />
          )
        }

        if (block.blockType === 'textImage') {
          const imgSrc =
            block.image && typeof block.image === 'object'
              ? block.image.sizes?.card?.url || block.image.url
              : ph(800, 800, 'a97e34', 'fff8ec', 'Craft Story')

          return (
            <section
              key={idx}
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

        if (block.blockType === 'productGrid') {
          const pLimit = block.limit || 4
          const gridProducts = dbProducts.slice(
            productOffset,
            productOffset + pLimit,
          )
          productOffset += pLimit // Advance offset so next product grid shows different products

          return (
            <section
              key={idx}
              className="container-page scroll-reveal py-16 sm:py-24 md:py-32"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <h2 className="text-headline font-display font-semibold tracking-tight text-neutral-900">
                  {block.heading}
                </h2>
                {block.ctaText && block.ctaLink && (
                  <Link
                    href={block.ctaLink}
                    className="group font-display text-brand-700 hover:text-brand-800 flex min-h-[44px] items-center gap-1.5 text-sm font-semibold transition-colors"
                  >
                    {block.ctaText}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
              </div>
              <div className="mt-10 grid grid-cols-2 gap-x-2 gap-y-4 sm:gap-x-3 sm:gap-y-6 lg:grid-cols-4">
                {gridProducts.length > 0 ? (
                  gridProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      variant="grid"
                      showWishlist={false}
                      showActions
                    />
                  ))
                ) : (
                  <p className="col-span-4 py-16 text-center text-sm text-neutral-400">
                    New pieces arriving soon.
                  </p>
                )}
              </div>
            </section>
          )
        }

        if (block.blockType === 'postGrid') {
          const limit = block.limit || 2
          const gridPosts = dbPosts.slice(0, limit)

          return (
            <section
              key={idx}
              className="scroll-reveal border-b border-neutral-200"
            >
              <div className="container-page py-16 sm:py-24 md:py-32">
                <div className="grid gap-12 lg:grid-cols-12 lg:gap-20">
                  <div className="lg:col-span-7">
                    <h2 className="text-headline font-display font-semibold tracking-tight text-neutral-900">
                      {block.heading}
                    </h2>
                    <ul className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200">
                      {gridPosts.length > 0 ? (
                        gridPosts.map((post) => {
                          const thumbSrc =
                            post.featuredImage &&
                            typeof post.featuredImage === 'object'
                              ? (post.featuredImage as any).sizes?.thumbnail
                                  ?.url || (post.featuredImage as any).url
                              : null
                          return (
                            <li key={post.id}>
                              <Link
                                href={`/blog/${post.slug}`}
                                className="group flex items-center gap-5 py-6 transition-colors"
                              >
                                {thumbSrc && (
                                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                                    <SkeletonImage
                                      src={thumbSrc}
                                      alt={post.title}
                                      fill
                                      sizes="80px"
                                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                  </div>
                                )}
                                <div className="min-w-0 flex-1">
                                  <p className="font-display group-hover:text-brand-700 text-lg font-semibold text-neutral-900 transition-colors">
                                    {post.title}
                                  </p>
                                  <p className="font-body mt-1 text-xs text-neutral-500">
                                    {post.excerpt
                                      ? post.excerpt.substring(0, 100) + '…'
                                      : 'Read post'}
                                  </p>
                                </div>
                                <ArrowUpRight className="group-hover:text-brand-700 h-5 w-5 shrink-0 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </Link>
                            </li>
                          )
                        })
                      ) : (
                        <li className="py-10 text-center text-sm text-neutral-400">
                          Journal entries coming soon.
                        </li>
                      )}
                    </ul>
                    {block.ctaText && block.ctaLink && (
                      <Link
                        href={block.ctaLink}
                        className="group font-display text-brand-700 hover:text-brand-800 mt-8 flex min-h-[44px] items-center gap-2 text-sm font-semibold transition-colors"
                      >
                        {block.ctaText}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    )}
                  </div>

                  <div className="lg:col-span-5">
                    <div className="sticky top-28 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm md:p-10">
                      <div className="rule-gold mb-6" />
                      <h3 className="font-display text-2xl font-semibold tracking-tight text-neutral-900">
                        A weekly note from the loom
                      </h3>
                      <p className="mt-3 max-w-[45ch] text-sm leading-relaxed text-neutral-600">
                        One weave, one maker, one thing worth knowing. No
                        marketing noise, no
                        newsletters-that-are-really-sales-pitches. Unsubscribe
                        anytime.
                      </p>
                      <NewsletterForm />
                      <p className="mt-4 text-xs text-neutral-400">
                        No spam. One email a week. Unsubscribe in one click.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )
        }

        return null
      })}

      {/* Trending Products */}
      {trendingProducts.length > 0 && (
        <section className="scroll-reveal">
          <div className="container-page py-16 sm:py-24 md:py-32">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-900">
              Trending Now
            </h2>
            <p className="font-body mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
              The most loved sarees by our customers.
            </p>
            <div className="mt-8">
              <RecommendationRow
                title=""
                products={trendingProducts}
              />
            </div>
          </div>
        </section>
      )}

      {/* Promise Band is kept at bottom as a global element */}
      <section className="scroll-reveal bg-brand-950">
        <div className="rule-gold" />
        <div className="container-page py-16 text-center sm:py-24 md:py-32">
          <h2 className="text-headline font-display mx-auto max-w-3xl font-semibold tracking-tight text-white">
            Every saree is signed by its maker
          </h2>
          <p className="mx-auto mt-6 max-w-[55ch] text-lg leading-relaxed text-neutral-300">
            Handloom-verified. Maker-traced. No middleman markup, no warehouse
            mystery stock — just the cloth, the cluster it came from, and a fair
            price on both sides.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Link
              href="/category/silk"
              className="text-brand-800 hover:bg-gold-200 focus-visible:ring-gold-300 flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-base font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] sm:h-13 sm:px-7"
            >
              Begin browsing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="group flex min-h-[44px] items-center gap-2 text-base font-medium text-neutral-300 transition-colors hover:text-white"
            >
              Meet the weavers
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
