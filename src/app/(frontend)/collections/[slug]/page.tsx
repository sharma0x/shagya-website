import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SortSelect } from '@/components/ui/sort-select'
import { ProductFilters } from '@/components/product/ProductFilters'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'

function getCommaParam(
  params: { [key: string]: string | string[] | undefined },
  key: string,
): string[] {
  const val = params[key]
  if (!val) return []
  const str = Array.isArray(val) ? val[0] : (val as string)
  return str.split(',').filter(Boolean)
}

function buildWhere(
  sParams: { [key: string]: string | string[] | undefined },
  collectionId: number,
) {
  const where: Record<string, any> = {
    collections: { contains: collectionId },
    status: { equals: 'published' },
  }

  const fabricFilter = getCommaParam(sParams, 'fabric')
  if (fabricFilter.length > 0) where.fabric = { in: fabricFilter }

  const weaveFilter = getCommaParam(sParams, 'weave')
  if (weaveFilter.length > 0) where.weave = { in: weaveFilter }

  const patternFilter = getCommaParam(sParams, 'pattern')
  if (patternFilter.length > 0) where.pattern = { in: patternFilter }

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
    where.discountPercentage = { greater_than_equal: parseInt(minDiscount, 10) }
  }

  const deliveryTime = sParams.deliveryTime as string | undefined
  if (deliveryTime) where.deliveryTime = { equals: deliveryTime }

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

function CollectionProductGridSkeleton() {
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

async function CollectionProductsStream({
  collectionId,
  sParams,
  sortParam,
}: {
  collectionId: number
  sParams: { [key: string]: string | string[] | undefined }
  sortParam: string
}) {
  const payload = await getPayload({ config })

  let sort = '-createdAt'
  if (sortParam === 'price-asc') sort = 'basePrice'
  else if (sortParam === 'price-desc') sort = '-basePrice'

  const where = buildWhere(sParams, collectionId)

  const colorParam = getCommaParam(sParams, 'color')
  const sizeParam = (sParams.size as string) || ''

  if (colorParam.length > 0 || sizeParam) {
    const variantWhere: Record<string, any> = {}
    if (colorParam.length > 0) variantWhere.color = { in: colorParam }
    if (sizeParam) variantWhere.size = { equals: sizeParam }

    const matchingVariants = await payload.find({
      collection: 'variants',
      where: variantWhere,
      limit: 500,
      pagination: false,
    })

    const productIds = [
      ...new Set(matchingVariants.docs.map((v: any) => v.product)),
    ]
    if (productIds.length > 0) {
      where.id = { in: productIds }
    } else {
      where.id = { in: [0] }
    }
  }

  const page = Math.max(1, parseInt((sParams.page as string) || '1', 10))
  const prodLimit = Math.max(
    1,
    Math.min(50, parseInt((sParams.limit as string) || '20', 10)),
  )

  const productsRes = await payload.find({
    collection: 'products',
    where,
    sort,
    page,
    limit: prodLimit,
    depth: 2,
  })
  const products = productsRes.docs
  const totalDocs = productsRes.totalDocs
  const totalPages = productsRes.totalPages

  return (
    <div className="flex-1">
      <div className="border-b border-neutral-100 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-neutral-500">
            <span>
              {totalDocs > 0
                ? `Showing ${(page - 1) * prodLimit + 1}–${Math.min(page * prodLimit, totalDocs)} of ${totalDocs} sarees`
                : '0 sarees in this collection'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Sort by:</span>
            <SortSelect defaultValue={sortParam} />
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h3 className="font-display text-lg font-semibold text-neutral-800">
            No products found
          </h3>
          <p className="font-body mt-2 text-sm text-neutral-500">
            There are currently no products available in this collection.
          </p>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
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

  const colRes = await payload.find({
    collection: 'collections',
    where: { slug: { equals: slug } },
    limit: 1,
  })

  if (colRes.docs.length === 0) return notFound()

  const collection = colRes.docs[0]

  return (
    <div className="bg-surface min-h-screen py-10">
      <div className="container-page">
        <Link
          href="/collections"
          className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Collections
        </Link>

        {/* Collection header renders immediately */}
        <div className="mt-8 border-b border-neutral-200 pb-10">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
            {collection.name}
          </h1>
          <p className="font-body mt-4 max-w-3xl text-base leading-relaxed text-neutral-500">
            {collection.description || 'Explore our curated edit.'}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <Suspense
            fallback={<div className="hidden w-48 shrink-0 lg:block" />}
          >
            <ProductFilters
              variant="sidebar"
              key={Object.keys(sParams).length === 0 ? 'clean' : '-'}
            />
          </Suspense>

          <Suspense fallback={<CollectionProductGridSkeleton />}>
            <CollectionProductsStream
              collectionId={collection.id}
              sParams={sParams}
              sortParam={sortParam}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
