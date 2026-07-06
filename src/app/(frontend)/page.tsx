import {
  ArrowRight,
  Truck,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Lock,
} from 'lucide-react'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { NewsletterForm } from '@/components/newsletter/NewsletterForm'
import { SkeletonImage } from '@/components/ui/SkeletonImage'
import { RefreshRouteOnSave } from '@/components/live-preview/RefreshRouteOnSave'
import { SectionHeading } from '@/components/homepage/SectionHeading'
import { ProductCard, ProductCarousel } from '@/components/homepage/ProductCard'
import { CategoryCard } from '@/components/homepage/CategoryCard'
import { OccasionButton } from '@/components/homepage/OccasionButton'
import { TrendingColors } from '@/components/homepage/TrendingColors'
import { InstagramGallery } from '@/components/homepage/InstagramGallery'
import { TestimonialCard } from '@/components/homepage/TestimonialCard'

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

type Props = {
  searchParams: Promise<{ preview?: string; id?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { preview, id } = await searchParams
  const isPreview = preview === 'true' && id === 'site-settings'
  const payload = await getPayload({ config })

  // ─── Fetch home page doc ─────────────────────────────
  const pageRes = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    depth: 1,
  })
  const homeDoc = pageRes.docs[0]

  // ─── Fetch products ──────────────────────────────────
  const productsRes = await payload.find({
    collection: 'products',
    where: { status: { equals: 'published' } },
    limit: 24,
    sort: '-createdAt',
  })
  const dbProducts = productsRes.docs

  // ─── Fetch categories ────────────────────────────────
  const categoriesRes = await payload.find({
    collection: 'categories',
    limit: 20,
  })
  const dbCategories = categoriesRes.docs

  // ─── Fetch posts ─────────────────────────────────────
  const postsRes = await payload.find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    limit: 3,
    sort: '-publishedAt',
    depth: 1,
  })
  const dbPosts = postsRes.docs

  // ─── Helper to split products into sections ──────────
  function productsSlice(start: number, count: number) {
    return dbProducts.slice(start, start + count)
  }

  // ─── Extract CMS block headings ──────────────────────
  const contentBlocks = homeDoc?.content ?? []
  const heroBlock = contentBlocks.find((b: any) => b.blockType === 'hero') as
    | {
        heading?: string | null
        subheading?: string | null
        ctaText?: string | null
        ctaLink?: string | null
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
        blockType: 'testimonials'
      }
    | undefined

  const TRUST_FEATURES = [
    {
      icon: <Truck className="h-7 w-7" />,
      title: 'Free Shipping',
      description: 'On all orders above ₹1,999',
    },
    {
      icon: <RotateCcw className="h-7 w-7" />,
      title: 'Easy Returns',
      description: '15-day hassle-free returns',
    },
    {
      icon: <ShieldCheck className="h-7 w-7" />,
      title: 'Authentic Handloom',
      description: 'Verified by our craft team',
    },
    {
      icon: <Sparkles className="h-7 w-7" />,
      title: 'Premium Fabric',
      description: 'Handpicked quality materials',
    },
    {
      icon: <Lock className="h-7 w-7" />,
      title: 'Secure Payment',
      description: 'Protected checkout',
    },
  ]

  const OCCASIONS = [
    {
      label: 'Wedding',
      icon: (
        <svg
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      ),
      href: '/category/all?occasion=wedding',
    },
    {
      label: 'Festival',
      icon: (
        <svg
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 3l2 4h4l-3 3 1 4-4-2-4 2 1-4-3-3h4l2-4z" />
        </svg>
      ),
      href: '/category/all?occasion=festive',
    },
    {
      label: 'Daily Wear',
      icon: (
        <svg
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M6 6h12l2 4H4l2-4zM4 10h16v8a2 2 0 01-2 2H6a2 2 0 01-2-2v-8z" />
        </svg>
      ),
      href: '/category/cotton',
    },
    {
      label: 'Gifting',
      icon: (
        <svg
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <rect x="3" y="8" width="18" height="12" rx="2" />
          <path d="M12 8v14M8 8a4 4 0 118 0" />
        </svg>
      ),
      href: '/collections/gift-guide',
    },
    {
      label: 'Party',
      icon: (
        <svg
          className="h-7 w-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      href: '/category/designer',
    },
  ]

  // ─── Determine which product block is which ──────────
  const productBlockLimit = (block: any) => block?.limit || 4

  const heroBackgroundUrl =
    typeof heroBlock?.backgroundImage === 'object' &&
    heroBlock.backgroundImage?.url
      ? heroBlock.backgroundImage.url
      : '/images/hero/hero-main.png'

  return (
    <div className="overflow-hidden">
      {isPreview && <RefreshRouteOnSave />}

      {/* ═══════════════════════════════════════════════════
          SECTION 1: HERO — Full-bleed background image
          ═══════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        {/* Full-bleed background image */}
        <div className="absolute inset-0">
          <SkeletonImage
            src={heroBackgroundUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
            loading="eager"
            priority
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />
        </div>

        <div className="container-page relative flex items-center py-4 sm:py-6">
          <div className="max-w-xl">
            {/* Subtle branding tag */}
            <div className="mb-3 flex items-center gap-2 text-[10px] font-medium tracking-[0.2em] text-white/70 uppercase">
              <span className="bg-brand-400 h-px w-6" />
              Shayga Handlooms
            </div>

            {/* Tagline */}
            <h1 className="font-display text-3xl leading-[1.1] font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
              {heroBlock?.heading || (
                <>
                  <span className="text-white">Timeless</span>{' '}
                  <span className="text-white">Elegance</span>
                  <br />
                  <span className="text-brand-300">in every drape</span>
                </>
              )}
            </h1>

            <p className="mt-3 max-w-[50ch] text-sm leading-relaxed text-white/80 sm:text-base">
              {heroBlock?.subheading ||
                "Every saree carries the story of the hands that wove it. Direct from India's weaving clusters — no middlemen, no markup."}
            </p>

            {/* CTAs */}
            <div className="mt-5 flex flex-row flex-wrap items-center gap-3">
              <Link
                href={heroBlock?.ctaLink || '/category/all'}
                className="group bg-brand-600 hover:bg-brand-500 inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white transition-all active:scale-[0.97]"
              >
                {heroBlock?.ctaText || 'Shop the collection'}
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="group text-brand-950 inline-flex h-11 items-center gap-2 rounded-xl border border-white/20 bg-white/90 px-5 text-sm font-semibold shadow-sm transition-all hover:bg-white active:scale-[0.97]"
              >
                Our craft story
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Stats bar */}
            <div className="mt-6 flex items-center gap-5 text-xs text-white/60">
              <div>
                <span className="font-display block text-base font-semibold text-white">
                  6
                </span>
                <span className="text-[10px]">Weaving clusters</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="font-display block text-base font-semibold text-white">
                  10+
                </span>
                <span className="text-[10px]">Traditional weaves</span>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div>
                <span className="font-display block text-base font-semibold text-white">
                  100%
                </span>
                <span className="text-[10px]">Maker-traced</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 2: TRUST FEATURES
          ═══════════════════════════════════════════════════ */}
      <section className="border-brand-100/40 bg-brand-50/30 border-y">
        <div className="flex flex-wrap items-baseline justify-start gap-x-6 gap-y-3 px-4 py-4 sm:justify-center sm:gap-x-10 sm:py-5 md:gap-x-14 lg:gap-x-18">
          {TRUST_FEATURES.map((feature) => (
            <div key={feature.title} className="flex items-start gap-2">
              <div className="text-brand-600 flex h-8 w-8 shrink-0 items-center justify-center sm:h-9 sm:w-9">
                {feature.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-display text-brand-950 text-xs font-medium whitespace-nowrap sm:text-sm">
                  {feature.title}
                </span>
                <span className="text-brand-700/50 text-[10px] sm:text-xs">
                  {feature.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 3: SHOP BY CATEGORY
          ═══════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="container-page py-10 sm:py-14 md:py-20">
          <SectionHeading
            title="Our Collection"
            subtitle={
              categoriesBlock?.subheading ||
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

      {/* ═══════════════════════════════════════════════════
          SECTION 4: COMBINED — New Arrivals + Trending Now + Shop by Occasion
          ═══════════════════════════════════════════════════ */}
      {dbProducts.length > 0 && (
        <section className="bg-white">
          <div className="container-page py-10 sm:py-14 md:py-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-10">
              {/* ── New Arrivals ── */}
              <div>
                <SectionHeading
                  title="New Arrivals"
                  subtitle="Fresh off the loom"
                  viewAllHref="/category/all?sort=-createdAt"
                  viewAllLabel="View All"
                  size="sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  {productsSlice(0, 2).map((p) => (
                    <ProductCard key={p.id} product={p} badge="new" />
                  ))}
                </div>
              </div>

              {/* ── Trending Now ── */}
              <div>
                <SectionHeading
                  title="Trending Now"
                  subtitle="What everyone is loving"
                  viewAllHref="/category/all"
                  viewAllLabel="View more"
                  size="sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  {productsSlice(2, 2).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </div>

              {/* ── 3rd column: Shop by Occasion + Trending Colors ── */}
              <div className="flex flex-col gap-8">
                <div>
                  <SectionHeading
                    title="Shop by Occasion"
                    subtitle="Find the perfect saree"
                    size="sm"
                  />
                  <div className="flex items-center justify-center">
                    <div className="flex flex-wrap items-center justify-center gap-2">
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
                </div>
                <div>
                  <SectionHeading
                    title="Trending Colors"
                    subtitle="This season's most-loved shades"
                    size="sm"
                  />
                  <TrendingColors compact />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 5: BEST SELLERS
          ═══════════════════════════════════════════════════ */}
      {productBlocks[1] && dbProducts.length > 0 && (
        <section className="bg-brand-50/20">
          <div className="container-page py-10 sm:py-14 md:py-20">
            <SectionHeading
              title={productBlocks[1].heading || 'Best Sellers'}
              subtitle="Our community's most-loved weaves — for good reason"
              viewAllHref={productBlocks[1].ctaLink || '/category/all'}
              viewAllLabel={productBlocks[1].ctaText || 'Shop All'}
            />
            <ProductCarousel
              products={productsSlice(4, productBlockLimit(productBlocks[1]))}
            />
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 9: BLOG POSTS
          ═══════════════════════════════════════════════════ */}
      {dbPosts.length > 0 && (
        <section className="bg-white">
          <div className="container-page py-10 sm:py-14 md:py-20">
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
      )}

      {/* ═══════════════════════════════════════════════════
          SECTION 10: INSTAGRAM GALLERY
          ═══════════════════════════════════════════════════ */}
      <section className="bg-brand-50/20">
        <div className="container-page py-10 sm:py-14 md:py-20">
          <SectionHeading
            title="Follow the Loom"
            subtitle="@shayga — tag us for a chance to be featured"
            viewAllHref="https://instagram.com/shayga"
            viewAllLabel="Follow @shayga"
          />
          <InstagramGallery />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 11: TESTIMONIALS
          ═══════════════════════════════════════════════════ */}
      <section className="bg-white">
        <div className="container-page py-10 sm:py-14 md:py-20">
          <SectionHeading
            title={testimonialBlock?.heading || 'Loved by our community'}
            subtitle="Real stories from saree lovers across India"
          />

          <div className="grid gap-6 md:grid-cols-3">
            <TestimonialCard
              quote="The Banarasi I ordered is absolutely stunning. You can feel the weight of real silk. Every time I wear it, I get compliments — and I love telling people it's directly from the weaver."
              name="Ananya S."
              location="Mumbai"
              rating={5}
            />
            <TestimonialCard
              quote="I was nervous buying a saree online without seeing it first, but the handloom certificate and detailed photos made it easy. The fabric is even more beautiful in person. Will definitely be back."
              name="Priya M."
              location="Bangalore"
              rating={5}
            />
            <TestimonialCard
              quote="What sets Shayga apart is knowing exactly which cluster my saree came from and who wove it. It transforms a piece of clothing into a story. My Chanderi is easily my most treasured possession now."
              name="Rohini K."
              location="Pune"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          SECTION 12: NEWSLETTER + PROMISE (side by side)
          ═══════════════════════════════════════════════════ */}
      <section className="bg-brand-950 relative overflow-hidden">
        {/* Decorative pattern */}
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

        <div className="container-page relative py-10 sm:py-14 md:py-20">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-8">
            {/* ── Promise ── */}
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

            {/* ── Newsletter ── */}
            <div>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                A weekly note
                <br />
                from the loom
              </h2>
              <p className="text-brand-200/70 mt-4 max-w-md text-base leading-relaxed">
                One weave, one maker, one thing worth knowing. No marketing
                noise, no newsletters-that-are-really-sales-pitches. Unsubscribe
                anytime.
              </p>
              <div className="mt-8 max-w-md">
                <NewsletterForm />
              </div>
              <p className="text-brand-400/60 mt-3 text-xs">
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
