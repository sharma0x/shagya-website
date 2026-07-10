import Link from 'next/link'
import { ArrowLeft, Filter } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { SortSelect } from '@/components/ui/sort-select'
import { WishlistButton } from '@/components/product/WishlistButton'
import { SkeletonImage } from '@/components/ui/SkeletonImage'
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
  caption,
  region,
}: {
  src: string
  alt: string
  className?: string
  rounded?: string
  caption?: string
  region?: string
}) {
  return (
    <div
      className={`relative overflow-hidden bg-neutral-100 ${rounded} ${className ?? ''}`}
    >
      <SkeletonImage
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 33vw"
        className="object-cover"
        unoptimized={src.startsWith('https://placehold.co')}
      />
      {caption && (
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-neutral-950/55 to-transparent p-4">
          <div>
            <p className="font-display text-xs font-semibold text-white">
              {caption}
            </p>
            {region && (
              <p className="font-body mt-0.5 text-[10px] text-white/80">
                {region}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const sParams = await searchParams
  const sortParam = (sParams.sort as string) || 'newest'

  const payload = await getPayload({ config })

  // Determine standard filter based on category type
  const baseWhere: any = {
    status: { equals: 'published' },
  }

  let title = slug.charAt(0).toUpperCase() + slug.slice(1)
  let description = `Discover our curated selection of ${slug} sarees.`

  const fabrics = [
    'silk',
    'cotton',
    'linen',
    'georgette',
    'chiffon',
    'crepe',
    'velvet',
    'net',
    'blend',
  ]
  const weaves = [
    'banarasi',
    'kanchipuram',
    'bandhani',
    'patola',
    'kalamkari',
    'ikkat',
    'paithani',
    'maheshwari',
    'chanderi',
    'tant',
    'baluchari',
  ]

  if (fabrics.includes(slug.toLowerCase())) {
    baseWhere.fabric = { equals: slug.toLowerCase() }
    title = `${title} Sarees`
    description = `Premium handwoven pure ${slug} sarees, sourced directly from weaver clusters across India.`
  } else if (weaves.includes(slug.toLowerCase())) {
    baseWhere.weave = { equals: slug.toLowerCase() }
    title = `${title} Weave`
    description = `Authentic, heritage ${slug} sarees featuring signature regional patterns and pure zari borders.`
  } else {
    // Look up in Categories collection
    const catDoc = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    if (catDoc.docs.length > 0) {
      title = catDoc.docs[0].name
      description = catDoc.docs[0].description || description
      if (slug.toLowerCase() === 'bridal') {
        baseWhere.occasion = { like: 'Bridal' }
      } else if (slug.toLowerCase() === 'festive') {
        baseWhere.occasion = { like: 'Festive' }
      }
    }
  }

  // Build dynamic where clause from searchParams
  const urlParams = new URLSearchParams()
  for (const [key, value] of Object.entries(sParams)) {
    if (typeof value === 'string') {
      urlParams.set(key, value)
    }
  }
  const where = buildWhereClause(urlParams, baseWhere)

  // Handle sorting
  let sort = '-createdAt'
  if (sortParam === 'price-asc') {
    sort = 'basePrice'
  } else if (sortParam === 'price-desc') {
    sort = '-basePrice'
  }

  const result = await payload.find({
    collection: 'products',
    where,
    sort,
    limit: 100,
  })
  const products = result.docs

  return (
    <div className="bg-surface min-h-screen py-10">
      <FilterDrawerProvider>
        <div className="container-page">
          {/* Back Link */}
          <Link
            href="/"
            className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>

          {/* Hero Header */}
          <div className="mt-8 border-b border-neutral-200 pb-10">
            <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
              {title}
            </h1>
            <p className="font-body mt-4 max-w-3xl text-base leading-relaxed text-neutral-500">
              {description}
            </p>
          </div>

          {/* Toolbar */}
          <div className="mt-8 flex flex-col gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 text-sm text-neutral-500">
              <span>{products.length} products found</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Mobile Filter Button — shows inline below Sort by on mobile */}
              <span className="lg:hidden">
                <MobileFilterBar />
              </span>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Sort by:</span>
                <SortSelect defaultValue={sortParam} />
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          <div className="mt-4">
            <ActiveFilterChips />
          </div>

          {/* Content: Sidebar + Product Grid */}
          <div className="mt-6 flex gap-8">
            <FilterSidebar />

            {/* Product Grid */}
            <div className="min-w-0 flex-1">
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <h3 className="font-display text-lg font-semibold text-neutral-800">
                    No products found
                  </h3>
                  <p className="font-body mt-2 text-sm text-neutral-500">
                    We couldn&apos;t find any sarees matching these filters. Try
                    clearing some selections.
                  </p>
                  <Link
                    href={`/category/${slug}`}
                    className="bg-brand-600 hover:bg-brand-700 font-display mt-6 inline-flex h-10 items-center justify-center rounded-xl px-5 text-xs font-semibold text-white transition-colors"
                  >
                    Reset Filters
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((p) => {
                    const imageUrl =
                      p.gallery?.[0]?.image &&
                      typeof p.gallery[0].image === 'object'
                        ? p.gallery[0].image.sizes?.card?.url ||
                          p.gallery[0].image.url
                        : ph(600, 800, '69254e', 'f5e8ee', p.name)

                    return (
                      <Link
                        key={p.id}
                        href={`/products/${p.slug}`}
                        className="group block"
                      >
                        <div className="relative overflow-hidden rounded-xl transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
                          <ImagePanel
                            src={imageUrl || ''}
                            alt={p.name}
                            className="aspect-[3/4] w-full"
                            rounded="none"
                          />
                          <div className="absolute top-3 right-3 z-10">
                            <WishlistButton productId={p.id} />
                          </div>
                        </div>
                        <div className="mt-4 px-1">
                          <p className="font-display group-hover:text-brand-700 text-sm font-semibold text-neutral-900 transition-colors">
                            {p.name}
                          </p>
                          <p className="font-body mt-0.5 text-xs text-neutral-400">
                            {p.weave} · {p.fabric}
                          </p>
                          <div className="text-brand-700 font-display mt-2 flex flex-wrap items-baseline gap-2 text-sm font-semibold">
                            <span>₹{p.basePrice.toLocaleString('en-IN')}</span>
                            {p.compareAtPrice &&
                              p.compareAtPrice > p.basePrice && (
                                <>
                                  <span className="text-xs font-normal text-neutral-400 line-through">
                                    ₹{p.compareAtPrice.toLocaleString('en-IN')}
                                  </span>
                                  <span className="text-[11px] font-semibold text-green-600">
                                    (
                                    {Math.round(
                                      ((p.compareAtPrice - p.basePrice) /
                                        p.compareAtPrice) *
                                        100,
                                    )}
                                    % OFF)
                                  </span>
                                </>
                              )}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </FilterDrawerProvider>
    </div>
  )
}
