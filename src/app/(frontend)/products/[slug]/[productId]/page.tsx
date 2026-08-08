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
import { WhatsAppOrderButton } from '@/components/product/WhatsAppOrderButton'
import {
  ProductReviews,
  type ReviewData,
} from '@/components/product/ProductReviews'
import { RecommendationRow } from '@/components/product/RecommendationRow'
import { getRelatedProducts, getProductsByIds } from '@/lib/recommendations'
import { getRecentlyViewedIds } from '@/lib/recently-viewed'
import { getApplicableCoupons } from '@/lib/coupons'
import { TrackRecentlyViewed } from '@/components/product/TrackRecentlyViewed'
import { Rating } from '@/components/ui/Rating'
import { OffersSection } from '@/components/coupons/OffersSection'
import type { SiteSetting } from '@/payload-types'

type Props = {
  params: Promise<{ slug: string; productId: string }>
  searchParams: Promise<{ preview?: string; id?: string }>
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

// Icon options must stay in sync with the `trustSignals.icon` select in the
// SiteSettings global (typechecked — adding an option there fails here until mapped).
const TRUST_ICONS: Record<TrustSignal['icon'], LucideIcon> = {
  shield: ShieldCheck,
  truck: Truck,
  refresh: RefreshCw,
  badge: BadgeCheck,
  package: Package,
  sparkles: Sparkles,
}

// Used only when Site Settings → trustSignals has never been saved. An admin
// deleting all rows intentionally hides the section (no fallback then).
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

export default async function ProductDetailPage({
  params,
  searchParams,
}: Props) {
  const { slug, productId } = await params
  const { preview, id } = await searchParams
  const isPreview = preview === 'true' && Boolean(id)
  const payload = await getPayload({ config })
  const reqHeaders = await nextHeaders()
  const { user } = await payload.auth({ headers: reqHeaders })

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
        await payload.find({
          collection: 'products',
          where: {
            and: [
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

  // The product ID is the sole identity; a stale/wrong slug in the URL must
  // redirect to the canonical slug + ID so the page URL stays correct.
  if (product.slug && product.slug !== slug) {
    permanentRedirect(`/products/${product.slug}/${product.id}`)
  }

  const settings = (await payload.findGlobal({
    slug: 'site-settings',
  })) as unknown as SiteSetting
  const contactPhone = settings.contactPhone || ''

  // Trust signals are admin-editable (Site Settings → Product Page Trust Signals)
  const trustSignals = settings.trustSignals ?? DEFAULT_TRUST

  // Fetch approved reviews for this product
  const reviewsRes = await payload.find({
    collection: 'reviews',
    where: {
      and: [
        { product: { equals: product.id } },
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

  // Fetch related products (same fabric/weave)
  const relatedProducts = await getRelatedProducts(
    product.id,
    product.fabric || '',
    product.weave || '',
    [],
    8,
  )

  // Fetch recently viewed products (exclude current)
  const recentIds = await getRecentlyViewedIds()
  const filteredRecentIds = recentIds
    .filter((id) => id !== String(product.id))
    .slice(0, 8)
  const recentlyViewedProducts =
    filteredRecentIds.length > 0
      ? await getProductsByIds(filteredRecentIds)
      : []

  // Fetch applicable coupons for this product via the Local API — no HTTP
  // round-trip to the public server URL (which SSO protection would intercept).
  let productCoupons: Awaited<ReturnType<typeof getApplicableCoupons>> = []
  try {
    productCoupons = await getApplicableCoupons(String(product.id), reqHeaders)
  } catch (error) {
    console.error('[PDP] Failed to load coupons:', error)
  }

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
      average: avgRating,
      count: reviews.length,
    },
    colorVariants: (product.colorVariants || [])
      .filter((v: any) => v.enabled !== false && v.color)
      .map((v: any) => ({
        color: {
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
    fabric: product.fabric,
    weave: product.weave,
  }

  const discountPct =
    product.compareAtPrice && product.compareAtPrice > product.basePrice
      ? Math.round(
          ((product.compareAtPrice - product.basePrice) /
            product.compareAtPrice) *
            100,
        )
      : null

  // Specs rows — only non-empty values
  const specs: { label: string; value: string }[] = [
    product.fabric && {
      label: 'Fabric',
      value: product.fabric.charAt(0).toUpperCase() + product.fabric.slice(1),
    },
    product.weave && {
      label: 'Weave',
      value: product.weave.charAt(0).toUpperCase() + product.weave.slice(1),
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
    product.occasion && { label: 'Occasion', value: product.occasion },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <>
      <TrackRecentlyViewed productId={String(product.id)} />
      <div className="bg-surface min-h-screen py-12 md:py-16">
        {isPreview && <RefreshRouteOnSave />}
        <div className="container-page">
          {/* Back link */}
          <Link
            href={`/category/${product.fabric}`}
            className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 transition-colors hover:text-neutral-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {product.fabric.charAt(0).toUpperCase() +
              product.fabric.slice(1)}{' '}
            Sarees
          </Link>

          {/* ── Main PDP Grid ── */}
          <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
            <PDPClientSection
              product={serializableProduct}
              isOutOfStock={
                product.trackQuantity === true && (product.quantity ?? 0) <= 0
              }
              belowActions={
                /* Trust signals — reassurance right below the buy actions */
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
                <span className="font-display bg-brand-50 text-brand-700 rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide">
                  {product.weave.charAt(0).toUpperCase() +
                    product.weave.slice(1)}{' '}
                  Weave
                </span>
                {product.occasion && (
                  <span className="font-body text-xs text-neutral-400">
                    {product.occasion}
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

              {/* Available Offers — Amazon style */}
              <OffersSection
                coupons={productCoupons}
                variant="banner"
                className="mt-4"
              />

              {/* Rating + Purchase count */}
              {serializableProduct.rating.count > 0 && (
                <div className="mt-3 flex items-center gap-3 text-xs text-neutral-500">
                  <Rating
                    value={Math.round(serializableProduct.rating.average)}
                    size="sm"
                  />
                  <span>{serializableProduct.rating.count} reviews</span>
                  {serializableProduct.purchaseCount > 0 && (
                    <span className="text-neutral-300">·</span>
                  )}
                  {serializableProduct.purchaseCount > 0 && (
                    <span>{serializableProduct.purchaseCount} purchases</span>
                  )}
                </div>
              )}

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

        {/* ── You May Also Like ── */}
        {relatedProducts.length > 0 && (
          <RecommendationRow
            title="You May Also Like"
            products={relatedProducts}
            className="container-page border-t border-neutral-200 pt-12 pb-8"
          />
        )}

        {/* ── Customer Reviews ── */}
        <ProductReviews
          reviews={reviews}
          averageRating={avgRating}
          totalCount={reviews.length}
          productId={product.id}
          productSlug={slug}
        />
        {/* ── Recently Viewed ── */}
        {recentlyViewedProducts.length > 0 && (
          <RecommendationRow
            title="Recently Viewed"
            products={recentlyViewedProducts}
            className="container-page border-t border-neutral-200 pt-12 pb-8"
          />
        )}
      </div>
      {contactPhone && (
        <WhatsAppOrderButton
          phone={contactPhone}
          productName={product.name}
          productSlug={product.slug || slug}
          productId={product.id}
        />
      )}
    </>
  )
}
