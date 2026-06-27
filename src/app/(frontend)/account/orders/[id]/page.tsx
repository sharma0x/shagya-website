import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { ArrowLeft, Calendar, CreditCard, Truck, Package } from 'lucide-react'

// Page props in Next.js 15+ App Router are promises
export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const payload = await getPayload({ config: configPromise })

  // Find the order by orderNumber (or id)
  const result = await payload.find({
    collection: 'orders',
    where: {
      orderNumber: {
        equals: id,
      },
    },
    depth: 2,
    limit: 1,
  })

  let order = result.docs[0]

  // Fallback to searching by document ID if orderNumber didn't match
  if (!order) {
    try {
      const byId = await payload.findByID({
        collection: 'orders',
        id: id as any,
        depth: 2,
      })
      order = byId
    } catch (e) {
      // Not found
    }
  }

  if (!order) {
    notFound()
  }

  // Type coercions to handle Payload's generated types properly
  const items = order.items as any[]
  const shippingAddress = order.shippingAddress as any

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="mb-8 border-b border-neutral-200 pb-6">
          <Link
            href="/account/orders"
            className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to All Orders
          </Link>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-neutral-900">
                Order {order.orderNumber}
              </h1>
              <p className="font-body mt-1 text-sm text-neutral-500">
                Placed on{' '}
                {new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <span
              className={`font-display inline-block rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${
                order.status === 'confirmed' || order.status === 'delivered'
                  ? 'border border-green-100 bg-green-50 text-green-700'
                  : order.status === 'cancelled'
                    ? 'border border-red-100 bg-red-50 text-red-700'
                    : 'border border-yellow-100 bg-yellow-50 text-yellow-700'
              }`}
            >
              {order.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Left: Items list */}
          <div className="space-y-6 md:col-span-7">
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs">
              <h4 className="font-display mb-4 flex items-center gap-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                <Package className="h-4 w-4" />
                Ordered Masterpieces
              </h4>
              <div className="space-y-4">
                {items?.map((item, idx) => {
                  const firstImage = item.product?.gallery?.[0]?.image
                  const imageUrl =
                    typeof firstImage === 'object' && firstImage !== null
                      ? firstImage.url || firstImage.sizes?.thumbnail?.url
                      : typeof firstImage === 'string'
                        ? firstImage
                        : undefined

                  return (
                    <Link
                      href={`/products/${item.product?.slug || '#'}`}
                      key={item.id || idx}
                      className="group hover:border-brand-200 hover:bg-brand-50/30 flex items-center gap-4 rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 transition-colors"
                    >
                      <div className="h-24 w-20 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-white transition-transform group-hover:scale-[1.02]">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={item.product?.name || 'Product Image'}
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="font-display flex h-full w-full items-center justify-center p-1 text-center text-[10px] font-semibold text-neutral-400 uppercase">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h5 className="font-display group-hover:text-brand-700 truncate text-sm font-semibold text-neutral-900 transition-colors">
                          {item.product?.name || 'Handloom Saree'}
                        </h5>
                        {item.variant && (
                          <p className="font-body mt-0.5 text-xs text-neutral-500">
                            {item.variant.title ||
                              item.variant.size ||
                              'Custom Option'}
                          </p>
                        )}
                        <p className="font-body mt-1 text-[10px] font-medium tracking-wider text-neutral-400 uppercase">
                          Qty: {item.quantity} × ₹
                          {item.unitPrice?.toLocaleString('en-IN')}
                        </p>
                      </div>
                      <div className="font-body pr-2 text-sm font-bold text-neutral-900">
                        ₹{item.totalPrice?.toLocaleString('en-IN')}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right: Shipping details and billing invoice summary */}
          <div className="space-y-6 md:col-span-5">
            {/* Shipping details */}
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs">
              <h4 className="font-display mb-4 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                <Truck className="h-3.5 w-3.5 text-neutral-400" />
                Shipping Destination
              </h4>
              <div className="font-body text-sm leading-relaxed text-neutral-600">
                <p className="font-display font-semibold text-neutral-900">
                  {shippingAddress?.fullName}
                </p>
                <p>{shippingAddress?.phone}</p>
                <p className="mt-2">
                  {shippingAddress?.line1}
                  {shippingAddress?.line2 && `, ${shippingAddress?.line2}`}
                </p>
                <p>
                  {shippingAddress?.city}, {shippingAddress?.state} -{' '}
                  {shippingAddress?.pincode}
                </p>
              </div>
            </div>

            {/* Invoice Summary */}
            <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-xs">
              <h4 className="font-display mb-4 flex items-center gap-1.5 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                <CreditCard className="h-3.5 w-3.5 text-neutral-400" />
                Invoice Summary
              </h4>
              <div className="font-body space-y-3 text-sm text-neutral-500">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-neutral-900">
                    ₹{order.subtotal?.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Dispatch</span>
                  <span className="font-semibold text-neutral-900">
                    {order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}
                  </span>
                </div>
                {(order.discount as number) > 0 && (
                  <div className="text-success flex justify-between">
                    <span>Coupon Discount</span>
                    <span>
                      -₹{(order.discount as number)?.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="font-display flex justify-between border-t border-neutral-100 pt-4 text-base font-bold text-neutral-900">
                  <span>Total Paid</span>
                  <span>₹{order.total?.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-t border-dotted border-neutral-100 pt-3 text-xs text-neutral-400">
                  <span>Payment ID</span>
                  <span className="font-mono text-neutral-600">
                    {order.paymentId}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
