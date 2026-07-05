import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { SortSelect } from '@/components/ui/sort-select'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
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

export default async function CollectionDetailPage({
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

  // Find collection
  const colRes = await payload.find({
    collection: 'collections',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  if (colRes.docs.length === 0) {
    return notFound()
  }

  const collection = colRes.docs[0]

  // Build dynamic where clause from searchParams, scoped to this collection
  const urlParams = new URLSearchParams()
  for (const [key, value] of Object.entries(sParams)) {
    if (typeof value === 'string') {
      urlParams.set(key, value)
    }
  }
  const where = buildWhereClause(urlParams, {
    collections: { contains: collection.id },
    status: { equals: 'published' },
  })

  // Handle sorting
  let sort = '-createdAt'
  if (sortParam === 'price-asc') {
    sort = 'basePrice'
  } else if (sortParam === 'price-desc') {
    sort = '-basePrice'
  }

  const productsRes = await payload.find({
    collection: 'products',
    where,
    sort,
    limit: 100,
  })
  const products = productsRes.docs

  return (
    <div className="bg-surface min-h-screen py-10">
      <div className="container-page">
        {/* Back Link */}
        <Link
          href="/collections"
          className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Collections
        </Link>

        {/* Hero Header */}
        <div className="mt-8 border-b border-neutral-200 pb-10">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
            {collection.name}
          </h1>
          <p className="font-body mt-4 max-w-3xl text-base leading-relaxed text-neutral-500">
            {collection.description || 'Explore our curated edit.'}
          </p>
        </div>

        {/* Toolbar */}
        <div className="mt-8 flex flex-col gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span>{products.length} sarees in this collection</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Sort by:</span>
            <SortSelect defaultValue={sortParam} />
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
                  There are currently no products available in this collection
                  matching your filters.
                </p>
                <Link
                  href={`/collections/${slug}`}
                  className="bg-brand-600 hover:bg-brand-700 font-display mt-6 inline-flex h-10 items-center justify-center rounded-xl px-5 text-xs font-semibold text-white transition-colors"
                >
                  Clear Filters
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
    </div>
  )
}
