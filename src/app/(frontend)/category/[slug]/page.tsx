import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cn } from '@/lib/utils'
import { resolveWeaveIds } from '@/lib/weaves'
import { SortSelect } from '@/components/ui/sort-select'
import { ProductFilters } from '@/components/product/ProductFilters'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { TrackViewItemList } from '@/components/analytics/TrackViewItemList'
import { cachedFindProducts } from '@/lib/product-cache'

// ISR cache for 5 minutes
export const revalidate = 300

function getCommaParam(
  params: { [key: string]: string | string[] | undefined },
  key: string,
): string[] {
  const val = params[key]
  if (!val) return []
  const str = Array.isArray(val) ? val[0] : (val as string)
  return str.split(',').filter(Boolean)
}

interface FilterParams {
  [key: string]: string | string[] | undefined
}

/**
 * A chip in the category page's "Quick:" row. `kind` drives both the active
 * check and the URL mutation, so adding a chip type means handling it in one
 * place rather than extending a label-based switch.
 */
type QuickChip =
  | { kind: 'all'; key: string; label: string }
  | { kind: 'sale'; key: string; label: string }
  | { kind: 'weave'; key: string; label: string; slug: string }

/**
 * URL params that describe *how* results are shown rather than *which*
 * results. They never make a filter active, so the All chip ignores them
 * when deciding whether it is highlighted.
 */
const NON_FILTER_PARAMS = new Set(['sort', 'page', 'limit'])

// Products are rendered as 1 card per product with hover image flips across all color variants

function buildWhere(sParams: FilterParams, slug: string) {
  const where: Record<string, any> = {
    _status: { equals: 'published' },
    status: { equals: 'published' },
  }

  const patternFilter = getCommaParam(sParams, 'pattern')
  if (patternFilter.length > 0) {
    where.pattern = { in: patternFilter }
  }

  const minPrice = sParams.minPrice as string | undefined
  const maxPrice = sParams.maxPrice as string | undefined
  if (minPrice || maxPrice) {
    const basePrice: Record<string, number> = {}
    if (minPrice) basePrice.greater_than_equal = parseInt(minPrice, 10)
    if (maxPrice) basePrice.less_than_equal = parseInt(maxPrice, 10)
    where.basePrice = basePrice
  }

  if (sParams.onSale === 'true') {
    where.compareAtPrice = { greater_than: 0 }
  }

  const minDiscount = sParams.minDiscount as string | undefined
  if (minDiscount) {
    where.discountPercentage = {
      greater_than_equal: parseInt(minDiscount, 10),
    }
  }

  const deliveryTime = sParams.deliveryTime as string | undefined
  if (deliveryTime) {
    where.deliveryTime = { equals: deliveryTime }
  }

  const city = sParams.city as string | undefined
  if (city === '__unknown__') {
    where.or = [
      { cityOfOrigin: { exists: false } },
      { cityOfOrigin: { equals: '' } },
    ]
  } else if (city) {
    where.cityOfOrigin = { equals: city }
  }

  if (sParams.excludeOOS === 'true') {
    where.trackQuantity = { equals: true }
    where.quantity = { greater_than: 0 }
  }

  return where
}

function CategoryProductGridSkeleton() {
  return (
    <div className="flex-1" aria-hidden="true">
      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  )
}

async function CategoryProductsStream({
  slug,
  sParams,
  sortParam,
  weaveSlugSet,
  fabricSlugSet,
}: {
  slug: string
  sParams: FilterParams
  sortParam: string
  weaveSlugSet: Set<string>
  fabricSlugSet: Set<string>
}) {
  const payload = await getPayload({ config })
  const where = buildWhere(sParams, slug)

  const lowerSlug = slug.toLowerCase()

  const hasFabricParam = sParams.fabric !== undefined
  const fabricSlugs = hasFabricParam
    ? getCommaParam(sParams, 'fabric')
    : fabricSlugSet.has(lowerSlug)
      ? [lowerSlug]
      : []
  if (fabricSlugs.length > 0) {
    const fabricRes = await payload.find({
      collection: 'fabric-types',
      where: { slug: { in: fabricSlugs } },
      limit: 100,
      depth: 0,
    })
    const fabricIds = fabricRes.docs.map((d) => d.id)
    if (fabricIds.length === 1) {
      where.fabric = { equals: fabricIds[0] }
    } else if (fabricIds.length > 1) {
      where.fabric = { in: fabricIds }
    }
  }
  const hasWeaveParam = sParams.weave !== undefined
  const weaveSlugs = hasWeaveParam
    ? getCommaParam(sParams, 'weave')
    : weaveSlugSet.has(lowerSlug)
      ? [lowerSlug]
      : []
  if (weaveSlugs.length > 0) {
    const weaveIds = await resolveWeaveIds(payload, weaveSlugs)
    if (weaveIds.length === 1) {
      where.weave = { equals: weaveIds[0] }
    } else if (weaveIds.length > 1) {
      where.weave = { in: weaveIds }
    }
  }
  const occasionSlugs = getCommaParam(sParams, 'occasion')
  // Legacy category slugs bridal/festive map to the occasions relationship
  // (they were formerly filtered via the free-text occasion field).
  if (lowerSlug === 'bridal' || lowerSlug === 'festive') {
    occasionSlugs.push(lowerSlug)
  }
  if (occasionSlugs.length > 0) {
    const occRes = await payload.find({
      collection: 'occasions',
      where: { slug: { in: occasionSlugs } },
      limit: 100,
      depth: 0,
    })
    const occasionIds = occRes.docs.map((d) => d.id)
    if (occasionIds.length === 1) {
      where.occasions = { contains: occasionIds[0] }
    } else if (occasionIds.length > 1) {
      where.occasions = { in: occasionIds }
    }
  }

  const brandSlugs = getCommaParam(sParams, 'brand')
  if (brandSlugs.length > 0) {
    const brandRes = await payload.find({
      collection: 'brands',
      where: { slug: { in: brandSlugs } },
      limit: 100,
      depth: 0,
    })
    const brandIds = brandRes.docs.map((d) => d.id)
    if (brandIds.length === 1) {
      where.brand = { equals: brandIds[0] }
    } else if (brandIds.length > 1) {
      where.brand = { in: brandIds }
    }
  }

  const page = Math.max(1, parseInt((sParams.page as string) || '1', 10))
  const prodLimit = Math.max(
    1,
    Math.min(50, parseInt((sParams.limit as string) || '20', 10)),
  )

  let sort = '-createdAt'
  if (sortParam === 'price-asc') sort = 'basePrice'
  else if (sortParam === 'price-desc') sort = '-basePrice'

  const result = await cachedFindProducts({
    where,
    sort,
    page,
    limit: prodLimit,
    depth: 2,
  })
  const products = result.docs
  const totalPages = result.totalPages

  const colorParam = getCommaParam(sParams, 'color')
  const filteredProducts =
    colorParam.length > 0
      ? products.filter((p: any) =>
          (p.colorVariants || []).some(
            (v: any) =>
              v.enabled !== false &&
              v.color &&
              colorParam.includes(v.color.slug),
          ),
        )
      : products

  // Quick-filter chips. Weaves are admin-curated: the `featured` flag opts a
  // weave in and `sortOrder` orders them, so merchandising changes need no
  // deploy. Capped at MAX_QUICK_WEAVES to keep the row scannable.
  const MAX_QUICK_WEAVES = 5
  let featuredWeaves: { slug: string; name: string }[] = []
  try {
    const weavesRes = await payload.find({
      collection: 'weaves',
      where: { featured: { equals: true } },
      // sortOrder alone is not a total order — weaves sharing a value (the
      // default is 0, so any newly featured pair ties) would come back in
      // whatever order the heap yields, which shifts after updates and
      // vacuums. createdAt is a stable tiebreak so the curated order stays
      // reproducible across requests.
      sort: ['sortOrder', 'createdAt'],
      limit: MAX_QUICK_WEAVES,
      depth: 0,
      pagination: false,
      select: { name: true, slug: true, featured: true, sortOrder: true },
    })
    featuredWeaves = (weavesRes.docs as any[])
      .filter((w) => w.slug)
      .map((w) => ({ slug: w.slug, name: w.name }))
  } catch (err) {
    // Taxonomy query is non-critical — render the row without weave chips.
    console.error('[category] featured weaves fetch failed:', err)
  }

  // Order is fixed: All, then the promotional On Sale shortcut, then the
  // admin-curated weaves. A weave that is currently applied stays reachable
  // even if it has since been un-featured, otherwise the active filter would
  // have no chip to turn off.
  const appliedWeave = getCommaParam(sParams, 'weave')[0]
  const weaveChips = [
    ...featuredWeaves.map((w) => ({ kind: 'weave' as const, ...w })),
    ...(appliedWeave && !featuredWeaves.some((w) => w.slug === appliedWeave)
      ? [{ kind: 'weave' as const, slug: appliedWeave, name: appliedWeave }]
      : []),
  ]

  const quickChips: QuickChip[] = [
    { kind: 'all', key: 'all', label: 'All' },
    { kind: 'sale', key: 'sale', label: 'On Sale' },
    ...weaveChips.map((w) => ({
      kind: w.kind,
      key: `weave-${w.slug}`,
      label: w.name,
      slug: w.slug,
    })),
  ]

  return (
    <div className="flex-1">
      <TrackViewItemList
        products={filteredProducts}
        listId={`category/${slug}`}
        listName={`category_${slug}`}
      />
      <div className="border-b border-neutral-100 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span>
              {filteredProducts.length > 0
                ? `Showing ${filteredProducts.length} products`
                : '0 products found'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Sort by:</span>
            <SortSelect defaultValue={sortParam} />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="shrink-0 text-xs text-neutral-400">Quick:</span>
        <div className="scrollbar-hide flex gap-1.5 overflow-x-auto whitespace-nowrap">
          {quickChips.map((chip) => {
            const params = new URLSearchParams(
              sParams as Record<string, string>,
            )
            let isActive = false

            if (chip.kind === 'all') {
              // Active only when no *filter* is applied. sort/page/limit are
              // display and pagination state, not filters, so they must be
              // skipped before testing — testing them inline would make All
              // go dark the moment a sort is applied.
              isActive = [...params.keys()]
                .filter((key) => !NON_FILTER_PARAMS.has(key))
                .every((key) => !params.get(key))
              // "All" clears every filter param, not just weave/onSale —
              // otherwise it silently keeps fabric/color/price applied.
              // `sort` is a display preference rather than a filter, so it
              // survives; `page` resets so we land on page 1 of the full set.
              const sort = params.get('sort')
              for (const key of [...params.keys()]) {
                if (key !== 'sort') params.delete(key)
              }
              if (sort) params.set('sort', sort)
            } else if (chip.kind === 'sale') {
              isActive = params.get('onSale') === 'true'
              // Delete rather than set 'false': a literal `onSale=false`
              // satisfies neither the All chip nor the On Sale chip, which
              // leaves no way back to an unfiltered state.
              if (isActive) params.delete('onSale')
              else params.set('onSale', 'true')
              // A narrower result set can be shorter than the current page.
              params.delete('page')
            } else {
              // Match on the facet's own slug rather than lowercasing the
              // label — multi-word weave names don't slugify by lowercasing.
              // The sidebar can put several slugs in one comma-joined param,
              // so a chip is active when the param *contains* its slug.
              const selected = getCommaParam(sParams, 'weave')
              isActive = selected.includes(chip.slug)
              // Toggling one chip rewrites the whole param, so preserve the
              // other selected weaves instead of silently dropping them.
              const next = isActive
                ? selected.filter((s) => s !== chip.slug)
                : [...selected, chip.slug]
              if (next.length > 0) params.set('weave', next.join(','))
              // Delete rather than set '': a present-but-empty `weave=` still
              // counts as "weave param supplied" upstream, which would skip
              // the category-slug fallback and unfilter the grid.
              else params.delete('weave')
              params.delete('page')
            }

            const qs = params.toString()
            return (
              <Link
                key={chip.key}
                href={qs ? `?${qs}` : '?'}
                className={cn(
                  'font-body rounded-lg px-3 py-1 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200',
                )}
              >
                {chip.label}
              </Link>
            )
          })}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
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
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p: any) => (
            <ProductCard
              key={p.id}
              product={p}
              variant="grid"
              showWishlist
              analyticsListId={`category/${slug}`}
              analyticsListName={`category_${slug}`}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {page > 1 && (
            <Link
              href={(() => {
                const p = new URLSearchParams(sParams as Record<string, string>)
                p.set('page', String(page - 1))
                return `?${p.toString()}`
              })()}
              className="font-display flex h-8 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              <ChevronLeft className="h-3 w-3" />
              Prev
            </Link>
          )}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const pageNum =
              totalPages <= 7
                ? i + 1
                : page <= 4
                  ? i + 1
                  : page >= totalPages - 3
                    ? totalPages - 6 + i
                    : page - 3 + i
            return (
              <Link
                key={pageNum}
                href={(() => {
                  const p = new URLSearchParams(
                    sParams as Record<string, string>,
                  )
                  p.set('page', String(pageNum))
                  return `?${p.toString()}`
                })()}
                className={cn(
                  'font-body flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium transition-colors',
                  pageNum === page
                    ? 'bg-brand-600 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100',
                )}
              >
                {pageNum}
              </Link>
            )
          })}
          {page < totalPages && (
            <Link
              href={(() => {
                const p = new URLSearchParams(sParams as Record<string, string>)
                p.set('page', String(page + 1))
                return `?${p.toString()}`
              })()}
              className="font-display flex h-8 items-center gap-1 rounded-lg border border-neutral-200 px-3 text-xs font-semibold text-neutral-600 transition-colors hover:bg-neutral-50"
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
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
  searchParams: Promise<FilterParams>
}) {
  const { slug } = await params
  const sParams = await searchParams
  const sortParam = (sParams.sort as string) || 'newest'

  const payload = await getPayload({ config })
  const weavesRes = await payload.find({
    collection: 'weaves',
    limit: 500,
    pagination: false,
    depth: 0,
  })
  const weaveSlugSet = new Set(
    (weavesRes.docs as any[]).map((w) => w.slug).filter(Boolean),
  )

  const fabricsRes = await payload.find({
    collection: 'fabric-types',
    limit: 500,
    pagination: false,
    depth: 0,
  })
  const fabricSlugSet = new Set(
    (fabricsRes.docs as any[]).map((f) => f.slug).filter(Boolean),
  )

  const contextFilter: { fabric?: string; weave?: string } = {}
  if (fabricSlugSet.has(slug.toLowerCase())) {
    contextFilter.fabric = slug.toLowerCase()
  } else if (weaveSlugSet.has(slug.toLowerCase())) {
    contextFilter.weave = slug.toLowerCase()
  }

  let title = slug.charAt(0).toUpperCase() + slug.slice(1)
  let description = `Discover our curated selection of ${slug} sarees.`

  if (fabricSlugSet.has(slug.toLowerCase())) {
    title = `${title} Sarees`
    description = `Premium handwoven pure ${slug} sarees, sourced directly from weaver clusters across India.`
  } else if (weaveSlugSet.has(slug.toLowerCase())) {
    title = `${title} Weave`
    description = `Authentic, heritage ${slug} sarees featuring signature regional patterns and pure zari borders.`
  } else if (slug.toLowerCase() === 'all') {
    title = 'All Sarees'
    description = 'Browse our complete collection of handcrafted Indian sarees.'
  }

  return (
    <div className="bg-surface min-h-screen py-10">
      <div className="container-page">
        <Link
          href="/"
          className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>

        {/* Category Header renders instantly */}
        <div className="mt-8 border-b border-neutral-200 pb-10">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
            {title}
          </h1>
          <p className="font-body mt-4 max-w-3xl text-base leading-relaxed text-neutral-500">
            {description}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <Suspense
            fallback={<div className="hidden w-48 shrink-0 lg:block" />}
          >
            <ProductFilters
              variant="sidebar"
              contextFilter={contextFilter}
              key={Object.keys(sParams).length === 0 ? 'clean' : '-'}
            />
          </Suspense>

          <Suspense fallback={<CategoryProductGridSkeleton />}>
            <CategoryProductsStream
              slug={slug}
              sParams={sParams}
              sortParam={sortParam}
              weaveSlugSet={weaveSlugSet}
              fabricSlugSet={fabricSlugSet}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
