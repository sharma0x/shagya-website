import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SortSelect } from '@/components/ui/sort-select'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
import { MobileFilterBar } from '@/components/filters/MobileFilterBar'
import { FilterDrawerProvider } from '@/components/filters/filter-drawer-context'
import { ActiveFilterChips } from '@/components/filters/ActiveFilterChips'
import { buildWhereClause } from '@/lib/filters/build-where-clause'

const ph = (w: number, h: number, bg: string, fg: string, text: string) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}&font=lora`

function ImagePanel({
  src,
  alt,
  className,
  rounded = 'rounded-2xl',
}: {
  src: string
  alt: string
  className?: string
  rounded?: string
}) {
  return (
    <div
      className={`relative overflow-hidden bg-neutral-100 ${rounded} ${className ?? ''}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        className="object-cover"
        unoptimized={src.startsWith('https://placehold.co')}
      />
    </div>
  )
}

interface FTSProductResult {
  id: number
  type: 'product'
  name: string
  slug: string
  basePrice: number | null
  compareAtPrice: number | null
  fabric: string | null
  weave: string | null
  rank: number
}

interface FTSPostResult {
  id: number
  type: 'post'
  title: string
  slug: string
  excerpt: string | null
  rank: number
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string
    [key: string]: string | string[] | undefined
  }>
}) {
  const sParams = await searchParams
  const { q = '', ...restParams } = sParams
  const sortParam = (restParams.sort as string) || 'newest'

  const payload = await getPayload({ config })
  let products: FTSProductResult[] = []
  let posts: FTSPostResult[] = []

  // Determine if any filter params are active (besides sort and q)
  const filterParams = new URLSearchParams()
  let hasFilters = false
  for (const [key, value] of Object.entries(restParams)) {
    if (key !== 'sort' && typeof value === 'string') {
      filterParams.set(key, value)
      hasFilters = true
    }
  }

  if (q.trim()) {
    // Handle sorting
    let sort = '-createdAt'
    if (sortParam === 'price-asc') {
      sort = 'basePrice'
    } else if (sortParam === 'price-desc') {
      sort = '-basePrice'
    }

    if (hasFilters) {
      // Bypass FTS — query products directly with where clause + search term
      const where = buildWhereClause(filterParams, {
        name: { like: q },
        status: { equals: 'published' },
      })

      const result = await payload.find({
        collection: 'products',
        where,
        sort,
        limit: 50,
        depth: 1,
      })

      products = result.docs.map((doc: any, index: number) => ({
        id: doc.id,
        type: 'product' as const,
        name: doc.name,
        slug: doc.slug,
        basePrice: doc.basePrice || null,
        compareAtPrice: doc.compareAtPrice || null,
        fabric: doc.fabric,
        weave: doc.weave,
        rank: 50 - index,
      }))
    } else {
      // Use existing FTS behavior
      const limit = 50
      const ftsResult = await payload.find({
        collection: 'search',
        where: {
          title: {
            like: q,
          },
        },
        limit,
        depth: 1,
      })

      const docs = ftsResult.docs
        .filter(
          (d: any) =>
            d.doc &&
            typeof d.doc.value === 'object' &&
            ['products', 'posts'].includes(d.doc.relationTo),
        )
        .map((d: any, index: number) => {
          const type = d.doc.relationTo === 'products' ? 'product' : 'post'
          const docValue = d.doc.value

          if (type === 'product') {
            return {
              id: docValue.id,
              type: 'product' as const,
              name: docValue.name,
              slug: docValue.slug,
              basePrice: docValue.basePrice || null,
              compareAtPrice: docValue.compareAtPrice || null,
              fabric:
                typeof docValue.fabric === 'object'
                  ? docValue.fabric?.title
                  : docValue.fabric,
              weave: docValue.weave,
              rank: d.priority || limit - index,
            } as FTSProductResult
          }

          return {
            id: docValue.id,
            type: 'post' as const,
            title: docValue.title,
            slug: docValue.slug,
            excerpt: docValue.excerpt,
            rank: d.priority || limit - index,
          } as FTSPostResult
        })
        .sort((a, b) => b.rank - a.rank)

      products = docs.filter((d): d is FTSProductResult => d.type === 'product')
      posts = docs.filter((d): d is FTSPostResult => d.type === 'post')
    }
  }

  const hasResults = products.length > 0 || posts.length > 0

  return (
    <div className="bg-surface min-h-screen py-10">
      <div className="container-page">
        {/* Back Link */}
        <Link
          href="/"
          className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        {/* Search Header */}
        <div className="mt-8 border-b border-neutral-200 pb-10">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
            Search Results
          </h1>
          <p className="font-body mt-4 text-base text-neutral-500">
            {q.trim()
              ? `Showing results for "${q}"`
              : 'Enter a search query to browse sarees.'}
          </p>

          <form
            action="/search"
            method="GET"
            className="mt-8 flex max-w-md gap-3"
          >
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by fabric, weave, occasion..."
              className="font-body focus:border-brand-500 h-12 flex-1 rounded-xl border border-neutral-200 bg-white px-4 text-sm outline-none placeholder:text-neutral-400"
            />
            <button
              type="submit"
              className="bg-brand-600 hover:bg-brand-700 font-display inline-flex h-12 items-center justify-center rounded-xl px-6 text-sm font-semibold text-white transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Results */}
        <FilterDrawerProvider>
          {q.trim() && (
            <div className="mt-10">
              {!hasResults ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <h3 className="font-display text-lg font-semibold text-neutral-800">
                    No results found
                  </h3>
                  <p className="font-body mt-2 text-sm text-neutral-500">
                    We couldn&apos;t find anything matching your search terms.
                    Try searching for &quot;Silk&quot;, &quot;Banarasi&quot;, or
                    &quot;Cotton&quot;.
                  </p>
                </div>
              ) : (
                <>
                  {/* Toolbar + Filter chips (only show when products exist) */}
                  {products.length > 0 && (
                    <>
                      <div className="flex flex-col gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                          <span>{products.length} sarees found</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="lg:hidden">
                            <MobileFilterBar />
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-400">
                              Sort by:
                            </span>
                            <SortSelect defaultValue={sortParam} />
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <ActiveFilterChips />
                      </div>
                    </>
                  )}

                  <div className="mt-6 flex gap-8">
                    {/* Only show sidebar when there are products */}
                    {products.length > 0 && <FilterSidebar />}

                    <div className="min-w-0 flex-1 space-y-16">
                      {/* Sarees */}
                      {products.length > 0 && (
                        <section>
                          <h2 className="font-display text-gold-600 mb-6 text-xs font-semibold tracking-[0.18em] uppercase">
                            Sarees ({products.length})
                          </h2>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
                            {products.map((p) => (
                              <Link
                                key={p.id}
                                href={`/products/${p.slug}`}
                                className="group block"
                              >
                                <div className="relative overflow-hidden rounded-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                                  <ImagePanel
                                    src={ph(
                                      600,
                                      800,
                                      '69254e',
                                      'f5e8ee',
                                      p.name,
                                    )}
                                    alt={p.name}
                                    className="aspect-[3/4] w-full"
                                    rounded="none"
                                  />
                                </div>
                                <div className="mt-4 px-1">
                                  <p className="font-display group-hover:text-brand-700 text-sm font-semibold text-neutral-900 transition-colors">
                                    {p.name}
                                  </p>
                                  <p className="font-body mt-0.5 text-xs text-neutral-400">
                                    {p.weave} · {p.fabric}
                                  </p>
                                  {p.basePrice && (
                                    <div className="text-brand-700 font-display mt-2 flex flex-wrap items-baseline gap-2 text-sm font-semibold">
                                      <span>
                                        ₹{p.basePrice.toLocaleString('en-IN')}
                                      </span>
                                      {p.compareAtPrice &&
                                        p.compareAtPrice > p.basePrice && (
                                          <>
                                            <span className="text-xs font-normal text-neutral-400 line-through">
                                              ₹
                                              {p.compareAtPrice.toLocaleString(
                                                'en-IN',
                                              )}
                                            </span>
                                            <span className="text-[11px] font-semibold text-green-600">
                                              (
                                              {Math.round(
                                                ((p.compareAtPrice -
                                                  p.basePrice) /
                                                  p.compareAtPrice) *
                                                  100,
                                              )}
                                              % OFF)
                                            </span>
                                          </>
                                        )}
                                    </div>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Journal */}
                      {posts.length > 0 && (
                        <section>
                          <div className="rule-gold mb-6" />
                          <h2 className="font-display text-gold-600 mb-6 text-xs font-semibold tracking-[0.18em] uppercase">
                            Journal ({posts.length})
                          </h2>
                          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                              <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="group block"
                              >
                                <p className="font-display group-hover:text-brand-700 text-base font-semibold text-neutral-900 transition-colors">
                                  {post.title}
                                </p>
                                {post.excerpt && (
                                  <p className="font-body mt-2 line-clamp-2 text-sm text-neutral-500">
                                    {post.excerpt}
                                  </p>
                                )}
                                <p className="font-display text-brand-700 mt-3 text-xs font-medium">
                                  Read article →
                                </p>
                              </Link>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </FilterDrawerProvider>
      </div>
    </div>
  )
}
