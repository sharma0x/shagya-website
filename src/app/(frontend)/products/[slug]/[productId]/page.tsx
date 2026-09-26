import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound, permanentRedirect } from 'next/navigation'
import { headers as nextHeaders } from 'next/headers'
import Link from 'next/link'
import {
  ArrowLeft,
  ShieldCheck,
  Truck,
  RefreshCw,
  Sparkles,
  BadgeCheck,
  Package,
  type LucideIcon,
} from 'lucide-react'
import { PDPClientSection } from '@/components/product/PDPClientSection'
import { RefreshRouteOnSave } from '@/components/live-preview/RefreshRouteOnSave'
import { ProductShareButton } from '@/components/product/ProductShareButton'
import {
  ProductReviews,
  type ReviewData,
} from '@/components/product/ProductReviews'
import { RecommendationRow } from '@/components/product/RecommendationRow'
import { getRelatedProducts, getProductsByIds } from '@/lib/recommendations'
import { getRecentlyViewedIds } from '@/lib/recently-viewed'
import { getProductUrl } from '@/lib/product-url'
import { isProductOutOfStock } from '@/lib/product-utils'
import { cachedFindProducts } from '@/lib/product-cache'
import { weaveIdOf, weaveLabel } from '@/lib/weaves'
import { getApplicableCoupons } from '@/lib/coupons'
import { TrackRecentlyViewed } from '@/components/product/TrackRecentlyViewed'
import { TrackViewItem } from '@/components/analytics/TrackViewItem'
import { OffersSection } from '@/components/coupons/OffersSection'
import {
  OffersSkeleton,
  ReviewsSkeleton,
  ProductSectionSkeleton,
} from '@/components/ui/Skeleton'
import type { SiteSetting } from '@/payload-types'
import {
  openGraph,
  productJsonLd,
  imageUrl as resolveImageUrl,
  excerpt,
} from '@/lib/seo'

// ISR cache for 5 minutes
export const revalidate = 300

type Props = {
  params: Promise<{ slug: string; productId: string }>
  searchParams: Promise<{ preview?: string; id?: string; color?: string }>
}

function LexicalRenderer({ content }: { content: any }) {
  if (!content?.root?.children) return null

  function renderInline(node: any, idx: number): React.ReactNode {
    if (node.type !== 'text') return null
    let el: React.ReactNode = node.text
    if (node.format & 1) el = <strong key={idx}>{el}</strong>
    if (node.format & 2) el = <em key={idx}>{el}</em>
    return <span key={idx}>{el}</span>
  }

  function renderBlock(node: any, idx: number): React.ReactNode {
    switch (node.type) {
      case 'paragraph':
        if (!node.children?.some((c: any) => c.text?.trim())) return null
        return (
          <p key={idx}>
            {node.children.map((c: any, ci: number) => renderInline(c, ci))}
          </p>
        )
      case 'heading': {
        const cls: Record<string, string> = {
          h2: 'font-display mt-6 mb-2 text-base font-semibold text-neutral-800',
          h3: 'font-display mt-5 mb-1.5 text-sm font-semibold text-neutral-800',
          h4: 'font-display mt-4 mb-1 text-xs font-semibold text-neutral-700',
        }
        const Tag = (node.tag ?? 'h3') as 'h2' | 'h3' | 'h4'
        return (
          <Tag key={idx} className={cls[node.tag] ?? cls.h3}>
            {node.children?.map((c: any, ci: number) => renderInline(c, ci))}
          </Tag>
        )
      }
      case 'list': {
        const items = node.children?.map((item: any, ii: number) => (
          <li key={ii}>
            {item.children?.map((c: any, ci: number) => renderInline(c, ci))}
          </li>
        ))
        return node.listType === 'bullet' ? (
          <ul key={idx} className="list-disc space-y-1 pl-5">
            {items}
          </ul>
        ) : (
          <ol key={idx} className="list-decimal space-y-1 pl-5">
            {items}
          </ol>
        )
      }
      default:
        return null
    }
  }

  return (
    <div className="font-body space-y-4 text-sm leading-relaxed text-neutral-600">
      {content.root.children.map(renderBlock)}
    </div>
  )
}

type TrustSignal = NonNullable<SiteSetting['trustSignals']>[number]

const TRUST_ICONS: Record<TrustSignal['icon'], LucideIcon> = {
  shield: ShieldCheck,
  truck: Truck,
  refresh: RefreshCw,
  badge: BadgeCheck,
  package: Package,
  sparkles: Sparkles,
}

const DEFAULT_TRUST: TrustSignal[] = [
  {
    icon: 'shield',
    title: 'Handloom verified',
    detail: 'Sourced directly from the weaving cluster',
  },
  {
    icon: 'truck',
    title: 'Free shipping across India',
    detail: 'Delivered in 5–7 business days',
  },
  {
    icon: 'refresh',
    title: '7-day easy returns',
    detail: 'On unworn, tag-on sarees',
  },
]

// ─── Progressive Streaming Server Components for PDP ────────────────

async function ProductOffersStream({ productId }: { productId: string }) {
  const reqHeaders = await nextHeaders()
  let productCoupons: Awaited<ReturnType<typeof getApplicableCoupons>> = []
  try {
    productCoupons = await getApplicableCoupons(productId, reqHeaders)
  } catch (error) {
    console.error('[PDP] Failed to load coupons:', error)
  }
  if (productCoupons.length === 0) return null
  return (
    <OffersSection coupons={productCoupons} variant="banner" className="mt-4" />
  )
}

async function ProductReviewsStream({
  productId,
  productSlug,
}: {
  productId: number
  productSlug: string
}) {
  const payload = await getPayload({ config })
  const reviewsRes = await payload.find({
    collection: 'reviews',
    where: {
      and: [
        { product: { equals: productId } },
        { status: { equals: 'approved' } },
      ],
    },
    sort: '-createdAt',
    limit: 20,
    depth: 2,
  })
  const reviews: ReviewData[] = (reviewsRes.docs as any[]).map((r: any) => ({
    id: r.id,
    title: r.title,
    body: r.body,
    rating: r.rating,
    helpfulCount: r.helpfulCount,
    createdAt: r.createdAt,
    verifiedPurchase: r.verifiedPurchase,
    customer: {
      name: r.customer?.name || 'Customer',
      image: r.customer?.image || null,
    },
    images: r.images || [],
  }))
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

  return (
    <ProductReviews
      reviews={reviews}
      averageRating={avgRating}
      totalCount={reviews.length}
      productId={productId}
      productSlug={productSlug}
    />
  )
}

async function ProductRecommendationsStream({
  productId,
  fabricId,
  weaveId,
}: {
  productId: number
  fabricId: string | number | null
  weaveId: string | number | null
}) {
  const relatedProducts = await getRelatedProducts(
    productId,
    fabricId,
    weaveId,
    [],
    8,
  )
  if (relatedProducts.length === 0) return null
  return (
    <RecommendationRow
      title="You May Also Like"
      products={relatedProducts}
      className="container-page border-t border-neutral-200 pt-12 pb-8"
    />
  )
}

async function ProductRecentlyViewedStream({
  currentProductId,
}: {
  currentProductId: string
}) {
  const recentIds = await getRecentlyViewedIds()
  const filteredRecentIds = recentIds
    .filter((id) => id !== currentProductId)
    .slice(0, 8)
  const recentlyViewedProducts =
    filteredRecentIds.length > 0
      ? await getProductsByIds(filteredRecentIds)
      : []

  if (recentlyViewedProducts.length === 0) return null

  return (
    <RecommendationRow
      title="Recently Viewed"
      products={recentlyViewedProducts}
      className="container-page border-t border-neutral-200 pt-12 pb-8"
    />
  )
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: Props) {
  const { slug, productId } = await params
  const { preview, id, color } = await searchParams
  const isPreview = preview === 'true' && Boolean(id)
  const payload = await getPayload({ config })
  const reqHeaders = await nextHeaders()
  let user: any = null
  if (isPreview) {
    const authResult = await payload.auth({ headers: reqHeaders })
    user = authResult.user
  }

  const product: any = isPreview
    ? await payload.findByID({
        collection: 'products',
        id: id!,
        draft: true,
        overrideAccess: false,
        user: user ?? undefined,
        depth: 2,
      })
    : ((
        await cachedFindProducts({
          where: {
            and: [
              { _status: { equals: 'published' } },
              { id: { equals: productId } },
              { status: { equals: 'published' } },
            ],
          },
          limit: 1,
          depth: 2,
        })
      ).docs[0] as any)

  if (!product) {
    return notFound()
  }

  if (product.slug && product.slug !== slug) {
    permanentRedirect(getProductUrl(product.slug, product.id, color))
  }

  const settings = (await payload.findGlobal({
    slug: 'site-settings',
  })) as unknown as SiteSetting

  const trustSignals = settings.trustSignals ?? DEFAULT_TRUST

  const serializableProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug || '',
    basePrice: product.basePrice,
    compareAtPrice: product.compareAtPrice || undefined,
    brand: product.brand?.name || null,
    tags: product.tags
      ? product.tags
          .split(',')
          .map((t: string) => t.trim())
          .filter(Boolean)
      : [],
    features: (product.features || []).map((f: any) => f.label).filter(Boolean),
    discountPercentage: product.discountPercentage || 0,
    purchaseCount: product.purchaseCount || 0,
    quantity: product.quantity ?? 0,
    lowStockThreshold: product.lowStockThreshold ?? 5,
    rating: {
      average: 0,
      count: 0,
    },
    colorVariants: (product.colorVariants || [])
      .filter((v: any) => v.enabled !== false && v.color)
      .map((v: any) => ({
        color: {
          id: v.color.id,
          slug: v.color.slug,
          name: v.color.name,
          hex: v.color.hex,
        },
        gallery: (v.gallery || []).map((g: any) => ({
          image:
            typeof g.image === 'object' && g.image !== null
              ? { url: g.image.url, sizes: g.image.sizes }
              : g.image,
          alt: g.alt || product.name,
        })),
        priceOverride: v.priceOverride ?? null,
        stock: v.stock ?? 0,
        sku: v.sku ?? null,
      })),
    fabric: weaveLabel(product.fabric),
    weave: weaveLabel(product.weave),
  }

  const fabricLabelValue = weaveLabel(product.fabric)
  const fabricSlug =
    typeof product.fabric === 'object' &&
    product.fabric !== null &&
    (product.fabric as any).slug
      ? (product.fabric as any).slug
      : typeof product.fabric === 'string'
        ? product.fabric
        : 'all'

  const weaveLabelValue = weaveLabel(product.weave)

  const occasionNames = (product.occasions || [])
    .map((o: any) => (o && typeof o === 'object' ? o.name : null))
    .filter(Boolean)
    .join(', ')

  const specs: { label: string; value: string }[] = [
    fabricLabelValue && {
      label: 'Fabric',
      value:
        fabricLabelValue.charAt(0).toUpperCase() + fabricLabelValue.slice(1),
    },
    weaveLabelValue && {
      label: 'Weave',
      value: weaveLabelValue.charAt(0).toUpperCase() + weaveLabelValue.slice(1),
    },
    product.pattern && {
      label: 'Pattern',
      value: product.pattern.charAt(0).toUpperCase() + product.pattern.slice(1),
    },
    product.length && { label: 'Length', value: `${product.length} metres` },
    product.blouseType && { label: 'Blouse piece', value: product.blouseType },
    product.palluDetails && { label: 'Pallu', value: product.palluDetails },
    product.borderType && { label: 'Border', value: product.borderType },
    product.weavePattern && {
      label: 'Weave technique',
      value: product.weavePattern,
    },
    occasionNames && { label: 'Occasion', value: occasionNames },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <>
      <TrackRecentlyViewed productId={String(product.id)} />
      <TrackViewItem product={serializableProduct} />
      <div className="bg-surface min-h-screen py-12 md:py-16">
        {isPreview && <RefreshRouteOnSave />}
        <div className="container-page">
          {/* Back link */}
          <Link
            href={`/category/${fabricSlug}`}
            className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {fabricLabelValue
              ? `${fabricLabelValue.charAt(0).toUpperCase() + fabricLabelValue.slice(1)} Sarees`
              : 'All Sarees'}
          </Link>

          {/* ── Main PDP Grid ── */}
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <PDPClientSection
              product={serializableProduct}
              initialColorSlug={color ?? null}
              isOutOfStock={isProductOutOfStock(product)}
              belowActions={
                trustSignals.length > 0 ? (
                  <ul className="mt-8 space-y-4 border-t border-neutral-100 pt-7">
                    {trustSignals.map(({ icon, title, detail, id }) => {
                      const Icon = TRUST_ICONS[icon] ?? ShieldCheck
                      return (
                        <li
                          key={id ?? title}
                          className="flex items-start gap-3"
                        >
                          <Icon
                            className="text-brand-600 mt-0.5 h-4 w-4 shrink-0"
                            strokeWidth={1.75}
                          />
                          <div>
                            <p className="font-display text-[13px] font-semibold text-neutral-800">
                              {title}
                            </p>
                            <p className="font-body mt-0.5 text-xs leading-relaxed text-neutral-500">
                              {detail}
                            </p>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                ) : undefined
              }
            >
              {/* Brand + Category */}
              <div className="flex flex-wrap items-center gap-2">
                {serializableProduct.brand && (
                  <span className="font-display text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
                    {serializableProduct.brand}
                  </span>
                )}
                {weaveLabelValue && (
                  <span className="font-display bg-brand-50 text-brand-700 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide">
                    {weaveLabelValue.charAt(0).toUpperCase() +
                      weaveLabelValue.slice(1)}{' '}
                    Weave
                  </span>
                )}
                {occasionNames && (
                  <span className="font-body text-xs text-neutral-400">
                    {occasionNames}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="font-display mt-4 text-2xl font-semibold tracking-tight text-neutral-900 md:text-3xl">
                {product.name}
              </h1>

              {/* Pricing */}
              <div className="mt-5 border-b border-neutral-100 pb-5">
                <div className="flex flex-wrap items-baseline gap-3">
                  <span className="font-display text-2xl font-semibold text-neutral-900">
                    ₹{product.basePrice.toLocaleString('en-IN')}
                  </span>
                  {product.compareAtPrice &&
                    product.compareAtPrice > product.basePrice && (
                      <span className="font-display text-sm text-neutral-400 line-through">
                        ₹{product.compareAtPrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  {serializableProduct.discountPercentage > 0 && (
                    <span className="font-display rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      {serializableProduct.discountPercentage}% OFF
                    </span>
                  )}
                </div>
                <p className="font-body mt-1 text-[11px] text-neutral-400">
                  Inclusive of all taxes
                </p>
              </div>

              {/* Available Offers (Streamed) */}
              <Suspense fallback={<OffersSkeleton />}>
                <ProductOffersStream productId={String(product.id)} />
              </Suspense>

              {/* Stock urgency */}
              {serializableProduct.quantity > 0 &&
                serializableProduct.quantity <=
                  serializableProduct.lowStockThreshold && (
                  <p className="mt-2 text-xs font-medium text-amber-700">
                    {serializableProduct.quantity === 1
                      ? 'Only 1 left in stock'
                      : `Only ${serializableProduct.quantity} left in stock`}
                  </p>
                )}

              {/* Tags */}
              {serializableProduct.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {serializableProduct.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-0.5 text-[10px] text-neutral-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Features / Badges */}
              {serializableProduct.features.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {serializableProduct.features.map((feat: string) => (
                    <span
                      key={feat}
                      className="bg-brand-50 text-brand-700 inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-medium"
                    >
                      <Sparkles className="h-3 w-3" />
                      {feat}
                    </span>
                  ))}
                </div>
              )}
            </PDPClientSection>
          </div>

          {/* ── Details: Story + Specs ── */}
          <div className="mt-12 border-t border-neutral-200 pt-12 pb-12">
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
              {/* Weave Story */}
              <div className="lg:col-span-7">
                <div
                  className="bg-gold-400 mb-5 h-px w-12"
                  aria-hidden="true"
                />
                <h2 className="font-display text-xl font-semibold tracking-tight text-neutral-900">
                  The Weave Story
                </h2>
                <div className="mt-5">
                  {product.description ? (
                    <LexicalRenderer content={product.description} />
                  ) : (
                    <p className="text-sm text-neutral-400">
                      No description yet for this piece.
                    </p>
                  )}
                </div>
              </div>

              {/* Specifications */}
              <div className="lg:col-span-5">
                <div
                  className="bg-gold-400 mb-5 h-px w-12"
                  aria-hidden="true"
                />
                <h2 className="font-display text-xl font-semibold tracking-tight text-neutral-900">
                  Specifications
                </h2>
                {specs.length > 0 ? (
                  <dl className="mt-5 overflow-hidden rounded-xl border border-neutral-200 bg-white">
                    {specs.map(({ label, value }, i) => (
                      <div
                        key={label}
                        className={`flex items-baseline px-4 py-3.5 text-sm ${
                          i < specs.length - 1
                            ? 'border-b border-neutral-100'
                            : ''
                        }`}
                      >
                        <dt className="font-body w-2/5 shrink-0 text-xs text-neutral-400">
                          {label}
                        </dt>
                        <dd className="font-body font-medium text-neutral-800">
                          {value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p className="mt-5 text-sm text-neutral-400">
                    Specifications coming soon.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── You May Also Like (Streamed) ── */}
        <Suspense fallback={<ProductSectionSkeleton count={4} />}>
          <ProductRecommendationsStream
            productId={product.id}
            fabricId={weaveIdOf(product.fabric)}
            weaveId={weaveIdOf(product.weave)}
          />
        </Suspense>

        {/* ── Customer Reviews (Streamed) ── */}
        <Suspense fallback={<ReviewsSkeleton />}>
          <ProductReviewsStream productId={product.id} productSlug={slug} />
        </Suspense>

        {/* ── Recently Viewed (Streamed) ── */}
        <Suspense fallback={<ProductSectionSkeleton count={4} />}>
          <ProductRecentlyViewedStream currentProductId={String(product.id)} />
        </Suspense>
      </div>
      <ProductShareButton
        productName={product.name}
        productSlug={product.slug || slug}
        productId={product.id}
        productPrice={product.basePrice}
        productImage={
          serializableProduct.colorVariants?.[0]?.gallery?.[0]?.image?.url ||
          (typeof serializableProduct.colorVariants?.[0]?.gallery?.[0]
            ?.image === 'string'
            ? serializableProduct.colorVariants[0].gallery[0].image
            : undefined)
        }
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: productJsonLd({
            name: product.name,
            description: productMetaDescription(product),
            image: productOgImage(product),
            url: getProductUrl(product.slug || slug, product.id, color),
            sku: (product as any).productCode || String(product.id),
            price:
              typeof product.basePrice === 'number' ? product.basePrice : null,
            availability: isProductOutOfStock(product as any)
              ? 'OutOfStock'
              : 'InStock',
          }).replace(/</g, '\\u003c'),
        }}
      />
    </>
  )
}

/** Primary gallery image for a product, used for OG cards and Product JSON-LD. */
function productOgImage(product: any): string | undefined {
  const first = product?.colorVariants?.[0]
  return resolveImageUrl(first?.gallery?.[0]?.image)
}

/** Meta description: CMS description if present, else a price+weave summary. */
function productMetaDescription(product: any): string {
  const fromCms = excerpt(product.description)
  if (fromCms) return fromCms
  const weave = weaveLabel(weaveIdOf(product.weave))
  const price =
    typeof product.basePrice === 'number'
      ? `₹${product.basePrice.toLocaleString('en-IN')}`
      : null
  return [
    product.name,
    weave,
    price && `from ${price}`,
    'Free shipping across India.',
  ]
    .filter(Boolean)
    .join(' — ')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>
}): Promise<Metadata> {
  const { slug, productId } = await params
  const payload = await getPayload({ config })

  const res = await payload.find({
    collection: 'products',
    where: {
      and: [
        { _status: { equals: 'published' } },
        { id: { equals: Number(productId) } },
        { status: { equals: 'published' } },
      ],
    },
    limit: 1,
    depth: 2,
  })

  const product = res.docs[0] as any
  if (!product) return {}

  const title = product.name
  const description = productMetaDescription(product)
  const url = getProductUrl(product.slug || slug, product.id)

  return {
    title,
    description,
    alternates: { canonical: url },
    ...openGraph({
      title,
      description,
      image: productOgImage(product),
      url,
    }),
  }
}
