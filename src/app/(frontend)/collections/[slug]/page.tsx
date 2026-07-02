import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { SortSelect } from '@/components/ui/sort-select'
import { ProductFilters } from '@/components/product/ProductFilters'
import { WishlistButton } from '@/components/product/WishlistButton'

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
  if (city) where.cityOfOrigin = { contains: city }

  return where
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

  let sort = '-createdAt'
  if (sortParam === 'price-asc') sort = 'basePrice'
  else if (sortParam === 'price-desc') sort = '-basePrice'

  const where = buildWhere(sParams, collection.id)

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
        <Link
          href="/collections"
          className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Collections
        </Link>

        <div className="mt-8 border-b border-neutral-200 pb-10">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-neutral-900 md:text-5xl">
            {collection.name}
          </h1>
          <p className="font-body mt-4 max-w-3xl text-base leading-relaxed text-neutral-500">
            {collection.description || 'Explore our curated edit.'}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <ProductFilters variant="sidebar" />

          <div className="flex-1">
            <div className="border-b border-neutral-100 pb-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-sm text-neutral-500">
                  <span>{products.length} sarees in this collection</span>
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
              <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-2 xl:grid-cols-3">
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
                          <span>
                            ₹{p.basePrice.toLocaleString('en-IN')}
                          </span>
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
