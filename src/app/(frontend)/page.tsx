import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*  Static content — see docs/homepage-design.md                              */
/* -------------------------------------------------------------------------- */

/* placehold.co — brand-tinted placeholders (wine #69254e / gold #a97e34 /
   cream #f5e8ee). Stand-ins until CMS product photography is wired in. */
const ph = (w: number, h: number, bg: string, fg: string, text: string) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}&font=lora`

const weaves = [
  'Banarasi',
  'Kanchipuram',
  'Chanderi',
  'Jamdani',
  'Patola',
  'Kanjivaram',
  'Phulkari',
  'Baluchari',
  'Maheshwari',
  'Ilkal',
]

const crafts = [
  {
    name: 'Silk',
    count: '24 weaves',
    region: 'Banaras · Kanchipuram',
    href: '/category/silk',
    img: ph(750, 1000, '69254e', 'f5e8ee', 'Silk'),
  },
  {
    name: 'Cotton',
    count: '18 weaves',
    region: 'Chanderi · Maheshwari',
    href: '/category/cotton',
    img: ph(750, 1000, 'a97e34', 'fff8ec', 'Cotton'),
  },
  {
    name: 'Handloom',
    count: '31 weaves',
    region: 'Jamdani · Ilkal',
    href: '/category/handloom',
    img: ph(750, 1000, '7a3a5d', 'f5e8ee', 'Handloom'),
  },
]

const products = [
  {
    name: 'Banarasi Silk Saree',
    region: 'Varanasi, UP',
    price: '₹12,400',
    href: '/product/banarasi-silk',
    img: ph(600, 800, '69254e', 'f5e8ee', 'Banarasi Silk'),
  },
  {
    name: 'Kanchipuram Silk',
    region: 'Tamil Nadu',
    price: '₹18,900',
    href: '/product/kanchipuram-silk',
    img: ph(600, 800, '5c1a3a', 'f5e8ee', 'Kanchipuram'),
  },
  {
    name: 'Chanderi Cotton',
    region: 'Madhya Pradesh',
    price: '₹4,200',
    href: '/product/chanderi-cotton',
    img: ph(600, 800, 'a97e34', 'fff8ec', 'Chanderi'),
  },
  {
    name: 'Jamdani Handloom',
    region: 'West Bengal',
    price: '₹7,650',
    href: '/product/jamdani-handloom',
    img: ph(600, 800, '8b2962', 'f5e8ee', 'Jamdani'),
  },
]

const journal = [
  {
    title: 'How to tell a real Banarasi from a powerloom copy',
    tag: 'Guide',
    read: '6 min',
  },
  {
    title: 'The last draw-boys of Varanasi',
    tag: 'Field notes',
    read: '9 min',
  },
]

/* -------------------------------------------------------------------------- */
/*  Small presentational helpers                                              */
/* -------------------------------------------------------------------------- */

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-display text-gold-600 text-xs font-semibold tracking-[0.22em] uppercase">
      {children}
    </p>
  )
}

/** Image-forward panel using placehold.co. Stand-in until CMS photos exist.
 *  Keeps a subtle woven-texture overlay + optional caption. */
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
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
        unoptimized
        loading={loading ?? 'lazy'}
      />
      {/* woven-texture hint */}
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

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function HomePage() {
  return (
    <div className="bg-surface">
      {/* ============================ HERO ============================ */}
      <section className="container-page pt-14 pb-20 md:pt-24 md:pb-32">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Copy */}
          <div className="animate-slide-up lg:col-span-6">
            <Eyebrow>Est. — Handloom, Indian-made</Eyebrow>
            <h1 className="text-hero font-display mt-6 font-semibold tracking-tight text-neutral-900">
              The art of the handwoven drape
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600">
              Sarees woven on wooden looms across India — silk, cotton and
              heritage weaves, delivered from the maker to you.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/category/silk"
                className="hover-lift group bg-brand-600 hover:bg-brand-700 inline-flex h-13 items-center gap-2 rounded-xl px-7 text-base font-semibold text-white transition-colors active:scale-95"
              >
                Explore the shop
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/about"
                className="inline-flex h-13 items-center gap-2 rounded-xl border border-neutral-300 bg-white px-7 text-base font-semibold text-neutral-800 transition-colors hover:border-neutral-400 hover:bg-neutral-50 active:scale-95"
              >
                Our craft story
              </Link>
            </div>

            {/* quiet proof line */}
            <div className="mt-12 flex items-center gap-6 text-sm text-neutral-500">
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
            </div>
          </div>

          {/* Editorial image */}
          <div className="lg:col-span-6">
            <div className="relative">
              <ImagePanel
                src={ph(800, 1000, '69254e', 'f5e8ee', 'Kanchipuram Silk')}
                alt="A handwoven Kanchipuram silk saree in wine and gold"
                caption="Kanchipuram silk"
                region="Tamil Nadu"
                className="aspect-[4/5] w-full shadow-xl"
                loading="eager"
              />
              {/* gold hairline frame accent */}
              <div className="rule-gold absolute -inset-x-3 -bottom-3 hidden h-px md:block" />
            </div>
          </div>
        </div>
      </section>

      {/* ====================== WEAVE MARQUEE ====================== */}
      <section
        aria-label="Weaves we carry"
        className="bg-brand-50/40 border-y border-neutral-200 py-5"
      >
        <div className="overflow-hidden">
          <div className="marquee">
            {[...weaves, ...weaves].map((w, i) => (
              <span
                key={`${w}-${i}`}
                className="font-display flex items-center text-sm font-medium tracking-wide text-neutral-500"
              >
                <span className="px-6">{w}</span>
                <span className="text-gold-500" aria-hidden="true">
                  ·
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ====================== SHOP BY CRAFT ====================== */}
      <section className="container-page py-20 md:py-28">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>Browse the collections</Eyebrow>
            <h2 className="text-headline font-display mt-4 font-semibold tracking-tight text-neutral-900">
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

        <div className="mt-12 grid gap-5 sm:gap-6 md:grid-cols-3">
          {crafts.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className="hover-lift group relative block overflow-hidden rounded-2xl"
            >
              <ImagePanel
                src={c.img}
                alt={`${c.name} sarees — ${c.region}`}
                className="aspect-[3/4] w-full transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-neutral-950/55 to-transparent p-5">
                <div>
                  <p className="font-display text-lg font-semibold text-white">
                    {c.name}
                  </p>
                  <p className="font-body mt-0.5 text-xs text-white/80">
                    {c.count} · {c.region}
                  </p>
                </div>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition-colors group-hover:bg-white/25">
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ====================== CRAFT STORY ====================== */}
      <section className="border-y border-neutral-200 bg-neutral-50/60">
        <div className="container-page grid items-center gap-10 py-20 md:py-28 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <ImagePanel
              src={ph(800, 800, '7a3a5d', 'f5e8ee', 'On the loom')}
              alt="An artisan weaving a saree on a wooden handloom"
              caption="On the loom"
              region="Varanasi"
              className="aspect-square w-full shadow-lg"
            />
          </div>
          <div className="lg:col-span-7">
            <Eyebrow>From the loom</Eyebrow>
            <h2 className="text-headline font-display mt-4 font-semibold tracking-tight text-neutral-900">
              Six hands, one saree
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-neutral-600">
              A single Banarasi can take eighteen days and three artisans — the
              weaver, the border-maker, the draw-boy. We work directly with
              these clusters, so the hand that wove it is the hand that&apos;s
              paid for it.
            </p>
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
      <section className="container-page py-20 md:py-28">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Eyebrow>New this week</Eyebrow>
            <h2 className="text-headline font-display mt-4 font-semibold tracking-tight text-neutral-900">
              Quietly chosen
            </h2>
          </div>
          <Link
            href="/new-arrivals"
            className="group font-display text-brand-700 hover:text-brand-800 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
          >
            View all new arrivals
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((p) => (
            <Link key={p.href} href={p.href} className="hover-lift group block">
              <ImagePanel
                src={p.img}
                alt={`${p.name} from ${p.region}`}
                className="aspect-[3/4] w-full"
                rounded="rounded-xl"
              />
              <div className="mt-4">
                <p className="font-display text-base font-semibold text-neutral-900">
                  {p.name}
                </p>
                <p className="font-body mt-0.5 text-xs text-neutral-500">
                  {p.region}
                </p>
                <p className="text-brand-700 font-display mt-2 text-sm font-semibold">
                  {p.price}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ====================== WINE FEATURE BAND ====================== */}
      <section className="bg-brand-950">
        <div className="rule-gold" />
        <div className="container-page py-20 text-center md:py-28">
          <Eyebrow>A note from Shagya</Eyebrow>
          <h2 className="text-headline font-display mt-6 font-semibold tracking-tight text-white">
            Every saree is signed by its maker
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-neutral-300">
            Handloom-verified. Maker-traced. No middleman markup, no warehouse
            mystery stock — just the cloth, the cluster it came from, and a fair
            price on both sides.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/category/silk"
              className="group text-brand-800 hover:bg-gold-200 inline-flex h-13 items-center gap-2 rounded-xl bg-white px-7 text-base font-semibold transition-colors active:scale-95"
            >
              Begin browsing
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/about"
              className="inline-flex h-13 items-center rounded-xl border border-white/25 px-7 text-base font-semibold text-white transition-colors hover:border-white/40 hover:bg-white/5 active:scale-95"
            >
              Meet the weavers
            </Link>
          </div>
        </div>
      </section>

      {/* =================== JOURNAL + NEWSLETTER =================== */}
      <section className="container-page py-20 md:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Journal */}
          <div className="lg:col-span-7">
            <Eyebrow>From the journal</Eyebrow>
            <h2 className="text-headline font-display mt-4 font-semibold tracking-tight text-neutral-900">
              Worth knowing
            </h2>
            <ul className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
              {journal.map((post) => (
                <li key={post.title}>
                  <Link
                    href="/blog"
                    className="group flex items-center justify-between gap-4 py-6 transition-colors"
                  >
                    <div>
                      <p className="font-display group-hover:text-brand-700 text-lg font-semibold text-neutral-900 transition-colors">
                        {post.title}
                      </p>
                      <p className="font-body mt-1 text-xs text-neutral-500">
                        {post.tag} · {post.read}
                      </p>
                    </div>
                    <ArrowUpRight className="group-hover:text-brand-700 h-5 w-5 shrink-0 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-5">
            <div className="bg-brand-50/70 rounded-2xl p-8 md:p-10">
              <Eyebrow>Letters on craft</Eyebrow>
              <h3 className="font-display mt-4 text-2xl font-semibold tracking-tight text-neutral-900">
                A weekly note from the loom
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                One weave, one maker, one thing worth knowing. No marketing
                noise — unsubscribe anytime.
              </p>
              <form
                className="mt-6 flex flex-col gap-3 sm:flex-row"
                action="/api/newsletter"
                method="post"
              >
                <label className="sr-only" htmlFor="newsletter-email">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="font-body focus:border-brand-500 h-12 flex-1 rounded-xl border border-neutral-300 bg-white px-4 text-sm text-neutral-900 transition-colors outline-none placeholder:text-neutral-400"
                />
                <button
                  type="submit"
                  className="bg-brand-600 font-display hover:bg-brand-700 inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white transition-colors active:scale-95"
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
