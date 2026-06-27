import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { HeroGallery, type HeroImage } from '@/components/homepage/HeroGallery'
import { SkeletonImage } from '@/components/ui/SkeletonImage'

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

const WEAVES = [
  {
    name: 'Banarasi',
    origin: 'Varanasi, UP',
    imagePath: '/images/products/saree-01.jpg',
  },
  {
    name: 'Kanchipuram',
    origin: 'Kanchipuram, TN',
    imagePath: '/images/products/saree-02.jpg',
  },
  {
    name: 'Chanderi',
    origin: 'Chanderi, MP',
    imagePath: '/images/products/saree-05.jpg',
  },
  {
    name: 'Jamdani',
    origin: 'Dhaka, Bengal',
    imagePath: '/images/products/saree-03.jpg',
  },
  {
    name: 'Patola',
    origin: 'Patan, GJ',
    imagePath: '/images/products/saree-06.jpg',
  },
  {
    name: 'Phulkari',
    origin: 'Punjab',
    imagePath: '/images/products/saree-04.jpg',
  },
  {
    name: 'Baluchari',
    origin: 'Murshidabad, WB',
    imagePath: '/images/products/saree-10.jpg',
  },
  {
    name: 'Maheshwari',
    origin: 'Maheshwar, MP',
    imagePath: '/images/products/saree-09.jpg',
  },
]

function WeaveFilmstrip() {
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
          {[...WEAVES, ...WEAVES].map((w, i) => (
            <div
              key={`${w.name}-${i}`}
              className="relative flex h-24 w-40 shrink-0 items-end overflow-hidden rounded-lg bg-neutral-100 sm:h-28 sm:w-48"
            >
              <SkeletonImage
                src={w.imagePath}
                alt={w.name}
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
                  {w.name}
                </p>
                <p className="mt-0.5 text-xs text-white/70">{w.origin}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default async function HomePage() {
  const payload = await getPayload({ config })

  const pageRes = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
  })
  const homeDoc = pageRes.docs[0]

  const heroHeading =
    homeDoc?.content?.[0]?.blockType === 'hero'
      ? (homeDoc.content[0] as any).heading
      : 'The art of the handwoven drape'

  const heroSubheading =
    homeDoc?.content?.[0]?.blockType === 'hero'
      ? (homeDoc.content[0] as any).subheading
      : 'Sarees woven on wooden looms across India — silk, cotton and heritage weaves, delivered from the maker to you.'

  const productsRes = await payload.find({
    collection: 'products',
    where: { status: { equals: 'published' } },
    limit: 6,
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
    limit: 3,
  })
  const dbCategories = categoriesRes.docs

  const postsRes = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    limit: 2,
    sort: '-publishedAt',
    depth: 1,
  })
  const dbPosts = postsRes.docs

  const categoryFallbackImages: Record<string, string> = {
    silk: ph(750, 1000, '69254e', 'f5e8ee', 'Silk'),
    cotton: ph(750, 1000, 'a97e34', 'fff8ec', 'Cotton'),
    handloom: ph(750, 1000, '7a3a5d', 'f5e8ee', 'Handloom'),
  }

  return (
    <div className="bg-surface">
      {/* ============================ HERO ============================ */}
      <section className="container-page pt-16 pb-24 md:pt-28 md:pb-40">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
          <div className="animate-slide-up max-w-xl lg:col-span-6">
            <h1 className="text-hero font-display font-semibold tracking-tight text-neutral-900">
              {heroHeading}
            </h1>
            <p className="mt-6 max-w-[55ch] text-lg leading-relaxed text-neutral-600">
              {heroSubheading}
            </p>
            <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">
              <Link
                href="/category/silk"
                className="bg-brand-600 hover:bg-brand-700 focus-visible:ring-brand-400 inline-flex h-13 items-center gap-2 rounded-xl px-7 text-base font-semibold text-white transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
              >
                Explore the shop
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 text-base font-medium text-neutral-600 transition-colors hover:text-neutral-900"
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

      {/* ====================== WEAVE FILMSTRIP ====================== */}
      <WeaveFilmstrip />

      {/* ====================== SHOP BY CRAFT ====================== */}
      <section className="container-page scroll-reveal py-24 md:py-32">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="bg-gold-400 mb-5 h-px w-12" aria-hidden="true" />
            <h2 className="text-headline font-display font-semibold tracking-tight text-neutral-900">
              Find your weave
            </h2>
          </div>
          <Link
            href="/collections"
            className="group font-display text-brand-700 hover:text-brand-800 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
          >
            All collections
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-14 grid gap-5 sm:gap-6 md:grid-cols-3">
          {dbCategories.length > 0 ? (
            dbCategories.slice(0, 3).map((cat) => {
              const slug = cat.slug || cat.name.toLowerCase()
              const img =
                (cat.image && typeof cat.image === 'object'
                  ? cat.image.sizes?.card?.url || cat.image.url
                  : typeof cat.image === 'string'
                    ? cat.image
                    : null) ||
                categoryFallbackImages[slug] ||
                ph(750, 1000, '7a3a5d', 'f5e8ee', cat.name)

              return (
                <Link
                  key={cat.id}
                  href={`/category/${slug}`}
                  className="group relative block overflow-hidden rounded-2xl"
                >
                  <ImagePanel
                    src={img}
                    alt={`${cat.name} sarees`}
                    className="aspect-[3/4] w-full transition-transform duration-500 group-hover:scale-[1.03]"
                    rounded="rounded-2xl"
                  />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-neutral-950/55 to-transparent p-6">
                    <div>
                      <p className="font-display text-lg font-semibold text-white">
                        {cat.name}
                      </p>
                      <p className="font-body mt-0.5 text-xs text-white/80">
                        {cat.description || 'Explore our handwoven selection'}
                      </p>
                    </div>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors group-hover:bg-white/25">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              )
            })
          ) : (
            <p className="col-span-3 py-16 text-center text-sm text-neutral-400">
              Collections arriving soon.
            </p>
          )}
        </div>
      </section>

      {/* ====================== CRAFT STORY ====================== */}
      <section className="scroll-reveal border-y border-neutral-200 bg-neutral-50">
        <div className="container-page grid items-center gap-12 py-24 md:py-32 lg:grid-cols-12 lg:gap-20">
          <div className="lg:col-span-5">
            <ImagePanel
              src="/images/hero/hero-1.jpg"
              alt="An artisan weaving a saree on a wooden handloom"
              caption="On the loom"
              region="Varanasi"
              className="aspect-square w-full shadow-lg"
            />
          </div>
          <div className="lg:col-span-7">
            <div className="bg-gold-400 mb-5 h-px w-12" aria-hidden="true" />
            <h2 className="text-headline font-display font-semibold tracking-tight text-neutral-900">
              Six hands, one saree
            </h2>
            <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-neutral-600">
              A single Banarasi can take eighteen days and three artisans — the
              weaver, the border-maker, the draw-boy. We work directly with
              these clusters, so the hand that wove it is the hand that&apos;s
              paid for it.
            </p>
            <dl className="mt-8 grid grid-cols-3 gap-6 border-t border-neutral-200 pt-8">
              <div>
                <dt className="font-body text-xs text-neutral-500">
                  days per Banarasi
                </dt>
                <dd className="font-display mt-1 text-2xl font-semibold text-neutral-900">
                  18
                </dd>
              </div>
              <div>
                <dt className="font-body text-xs text-neutral-500">
                  artisans per saree
                </dt>
                <dd className="font-display mt-1 text-2xl font-semibold text-neutral-900">
                  3
                </dd>
              </div>
              <div>
                <dt className="font-body text-xs text-neutral-500">
                  weaving clusters
                </dt>
                <dd className="font-display mt-1 text-2xl font-semibold text-neutral-900">
                  6
                </dd>
              </div>
            </dl>
            <Link
              href="/blog"
              className="group font-display text-brand-700 hover:text-brand-800 mt-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
            >
              Read the journal
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ====================== CURATED PICKS ====================== */}
      <section className="container-page scroll-reveal py-24 md:py-32">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-headline font-display font-semibold tracking-tight text-neutral-900">
            Quietly chosen
          </h2>
          <Link
            href="/category/silk"
            className="group font-display text-brand-700 hover:text-brand-800 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
          >
            View all sarees
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {dbProducts.length > 0 ? (
            dbProducts.slice(0, 4).map((p) => {
              const imageUrl =
                p.gallery?.[0]?.image && typeof p.gallery[0].image === 'object'
                  ? p.gallery[0].image.sizes?.card?.url ||
                    p.gallery[0].image.url
                  : ph(600, 800, '69254e', 'f5e8ee', p.name)

              return (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-xl shadow-sm transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                    <ImagePanel
                      src={imageUrl || ''}
                      alt={p.name}
                      className="aspect-[3/4] w-full transition-transform duration-500 group-hover:scale-[1.04]"
                      rounded="rounded-xl"
                    />
                  </div>
                  <div className="mt-4 px-1">
                    <p className="font-display group-hover:text-brand-700 text-base font-semibold text-neutral-900 transition-colors">
                      {p.name}
                    </p>
                    <p className="font-body mt-0.5 text-xs text-neutral-500">
                      {p.weave} · {p.fabric}
                    </p>
                    <div className="text-brand-700 font-display mt-2 flex flex-wrap items-baseline gap-2 text-sm font-semibold">
                      <span>₹{p.basePrice.toLocaleString('en-IN')}</span>
                      {p.compareAtPrice && p.compareAtPrice > p.basePrice && (
                        <span className="text-xs font-normal text-neutral-400 line-through">
                          ₹{p.compareAtPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })
          ) : (
            <p className="col-span-4 py-16 text-center text-sm text-neutral-400">
              New pieces arriving soon.
            </p>
          )}
        </div>
      </section>

      {/* ====================== PROMISE BAND ====================== */}
      <section className="scroll-reveal bg-brand-950">
        <div className="rule-gold" />
        <div className="container-page py-24 text-center md:py-32">
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
              className="text-brand-800 hover:bg-gold-200 focus-visible:ring-gold-300 inline-flex h-13 items-center gap-2 rounded-xl bg-white px-7 text-base font-semibold transition-all focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97]"
            >
              Begin browsing
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="group inline-flex items-center gap-2 text-base font-medium text-neutral-300 transition-colors hover:text-white"
            >
              Meet the weavers
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* =================== JOURNAL + NEWSLETTER =================== */}
      <section className="scroll-reveal border-b border-neutral-200">
        <div className="container-page py-24 md:py-32">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-20">
            {/* Journal */}
            <div className="lg:col-span-7">
              <h2 className="text-headline font-display font-semibold tracking-tight text-neutral-900">
                Worth knowing
              </h2>
              <ul className="mt-10 divide-y divide-neutral-200 border-y border-neutral-200">
                {dbPosts.length > 0 ? (
                  dbPosts.map((post) => {
                    const thumbSrc =
                      post.featuredImage &&
                      typeof post.featuredImage === 'object'
                        ? (post.featuredImage as any).sizes?.thumbnail?.url ||
                          (post.featuredImage as any).url
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
              <Link
                href="/blog"
                className="group font-display text-brand-700 hover:text-brand-800 mt-8 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              >
                All journal entries
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Newsletter */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm md:p-10">
                <div className="rule-gold mb-6" />
                <h3 className="font-display text-2xl font-semibold tracking-tight text-neutral-900">
                  A weekly note from the loom
                </h3>
                <p className="mt-3 max-w-[45ch] text-sm leading-relaxed text-neutral-600">
                  One weave, one maker, one thing worth knowing. No marketing
                  noise, no newsletters-that-are-really-sales-pitches.
                  Unsubscribe anytime.
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
    </div>
  )
}
