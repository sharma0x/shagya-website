import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { cn } from '@/lib/utils'
import { SortSelect } from '@/components/ui/sort-select'
import { ProductFilters } from '@/components/product/ProductFilters'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'

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

const FABRICS = [
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
const WEAVES = [
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

// Products are rendered as 1 card per product with hover image flips across all color variants

function buildWhere(sParams: FilterParams, slug: string) {
  const where: Record<string, any> = {
    status: { equals: 'published' },
  }

  const hasFabricParam = sParams.fabric !== undefined
  const hasWeaveParam = sParams.weave !== undefined

  if (hasFabricParam) {
    const fabricFilter = getCommaParam(sParams, 'fabric')
    if (fabricFilter.length > 0) {
      where.fabric = { in: fabricFilter }
    }
  } else if (FABRICS.includes(slug.toLowerCase())) {
    where.fabric = { equals: slug.toLowerCase() }
  }

  if (hasWeaveParam) {
    const weaveFilter = getCommaParam(sParams, 'weave')
    if (weaveFilter.length > 0) {
      where.weave = { in: weaveFilter }
    }
  } else if (WEAVES.includes(slug.toLowerCase())) {
    where.weave = { equals: slug.toLowerCase() }
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
}: {
  slug: string
  sParams: FilterParams
  sortParam: string
}) {
  const payload = await getPayload({ config })
  const where = buildWhere(sParams, slug)

  if (slug.toLowerCase() === 'bridal') {
    where.occasion = { like: 'Bridal' }
  } else if (slug.toLowerCase() === 'festive') {
    where.occasion = { like: 'Festive' }
  } else if (
    !FABRICS.includes(slug.toLowerCase()) &&
    !WEAVES.includes(slug.toLowerCase()) &&
    slug.toLowerCase() !== 'all'
  ) {
    const catDoc = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    if (catDoc.docs.length > 0) {
      if (slug.toLowerCase() === 'bridal') {
        where.occasion = { like: 'Bridal' }
      } else if (slug.toLowerCase() === 'festive') {
        where.occasion = { like: 'Festive' }
      }
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

  const result = await payload.find({
    collection: 'products',
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

  return (
    <div className="flex-1">
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
          {['All', 'Banarasi', 'Kanchipuram', 'Chanderi', 'On Sale'].map(
            (label) => {
              const params = new URLSearchParams(
                sParams as Record<string, string>,
              )
              const isActive = (() => {
                switch (label) {
                  case 'All':
                    return !params.get('weave') && !params.get('onSale')
                  case 'Banarasi':
                  case 'Kanchipuram':
                  case 'Chanderi':
                    return params.get('weave') === label.toLowerCase()
                  case 'On Sale':
                    return params.get('onSale') === 'true'
                  default:
                    return false
                }
              })()
              if (label === 'All') {
                params.delete('weave')
                params.delete('onSale')
              } else if (label === 'On Sale') {
                params.set('onSale', isActive ? 'false' : 'true')
              } else {
                params.set('weave', isActive ? '' : label.toLowerCase())
              }
              const qs = params.toString()
              return (
                <Link
                  key={label}
                  href={qs ? `?${qs}` : '?'}
                  className={`font-body rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-600 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {label}
                </Link>
              )
            },
          )}
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
            <ProductCard key={p.id} product={p} variant="grid" showWishlist />
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

  const contextFilter: { fabric?: string; weave?: string } = {}
  if (FABRICS.includes(slug.toLowerCase())) {
    contextFilter.fabric = slug.toLowerCase()
  } else if (WEAVES.includes(slug.toLowerCase())) {
    contextFilter.weave = slug.toLowerCase()
  }

  let title = slug.charAt(0).toUpperCase() + slug.slice(1)
  let description = `Discover our curated selection of ${slug} sarees.`

  if (FABRICS.includes(slug.toLowerCase())) {
    title = `${title} Sarees`
    description = `Premium handwoven pure ${slug} sarees, sourced directly from weaver clusters across India.`
  } else if (WEAVES.includes(slug.toLowerCase())) {
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
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
