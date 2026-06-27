'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import {
  ArrowLeft,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Calendar,
  CreditCard,
  Truck,
  AlertCircle,
  Loader2,
} from 'lucide-react'

interface OrderItem {
  id: string
  product: {
    name: string
    slug: string
    gallery?: Array<{
      image?:
        | {
            url?: string
            sizes?: {
              thumbnail?: { url?: string }
              card?: { url?: string }
            }
          }
        | string
    }>
  }
  variant?: {
    id?: string
    title?: string
    size?: string
    blouseCustomization?: string
  } | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Address {
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country: string
}

interface Order {
  id: string
  orderNumber: string
  status: string
  subtotal: number
  shipping: number
  discount: number
  total: number
  paymentId: string
  createdAt: string
  shippingAddress: Address
  items: OrderItem[]
}

export default function OrdersPage() {
  const router = useRouter()
  const { data: sessionData, isPending } = useSession()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  useEffect(() => {
    if (isPending) return
    if (!sessionData?.user) {
      router.push('/account/login?redirect=/account/orders')
      return
    }

    async function loadOrders() {
      try {
        const res = await fetch('/api/orders')
        if (res.ok) {
          const data = await res.json()
          setOrders(data.orders || [])

          // Expand the first order by default if it exists
          if (data.orders?.length > 0) {
            setExpandedOrderId(data.orders[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load orders', err)
      } finally {
        setLoading(false)
      }
    }

    loadOrders()
  }, [sessionData, isPending, router])

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(expandedOrderId === id ? null : id)
  }

  if (isPending || loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand-600 h-8 w-8 animate-spin" />
        <p className="font-body text-sm text-neutral-500">
          Loading your purchase log...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Page Header */}
        <div className="mb-8 border-b border-neutral-200 pb-6">
          <Link
            href="/account"
            className="font-display hover:text-brand-700 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
          <h1 className="font-display mt-2 text-2xl font-bold text-neutral-900">
            Your Orders
          </h1>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-xs">
            <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-neutral-300" />
            <p className="font-body text-sm text-neutral-500">
              You haven&apos;t placed any orders yet.
            </p>
            <Link
              href="/"
              className="font-display bg-brand-600 hover:bg-brand-700 mt-4 inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-white transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const isExpanded = expandedOrderId === order.id
              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-xs transition-all duration-300"
                >
                  {/* Order Overview Header Banner */}
                  <div
                    onClick={() => toggleExpandOrder(order.id)}
                    className="flex cursor-pointer flex-col gap-4 p-5 transition-colors select-none hover:bg-neutral-50/50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-8">
                      <div>
                        <span className="font-display block text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                          Order Number
                        </span>
                        <span className="font-display mt-0.5 block text-sm font-semibold text-neutral-900">
                          {order.orderNumber}
                        </span>
                      </div>
                      <div>
                        <span className="font-display block text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                          Date Placed
                        </span>
                        <span className="font-body mt-1 block text-xs text-neutral-600">
                          {new Date(order.createdAt).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            },
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="font-display block text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                          Total Paid
                        </span>
                        <span className="font-body mt-1 block text-xs font-semibold text-neutral-900">
                          ₹{order.total.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div>
                        <span className="font-display block text-[10px] font-semibold tracking-widest text-neutral-400 uppercase">
                          Status
                        </span>
                        <span
                          className={`font-display mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            order.status === 'confirmed' ||
                            order.status === 'delivered'
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

                    <div className="text-brand-700 font-display flex items-center gap-1.5 text-xs font-semibold sm:ml-auto">
                      {isExpanded ? (
                        <>
                          Hide Details
                          <ChevronUp className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          View Details
                          <ChevronDown className="h-4 w-4" />
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail box */}
                  {isExpanded && (
                    <div className="animate-fade-in grid grid-cols-1 gap-8 border-t border-neutral-100 bg-neutral-50/20 p-6 md:grid-cols-12">
                      {/* Left: Items list */}
                      <div className="space-y-4 md:col-span-7">
                        <h4 className="font-display mb-2 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                          Ordered Masterpieces
                        </h4>
                        <div className="space-y-4">
                          {order.items?.map((item) => {
                            const firstImage = item.product?.gallery?.[0]?.image
                            const imageUrl =
                              typeof firstImage === 'object' &&
                              firstImage !== null
                                ? firstImage.url ||
                                  firstImage.sizes?.thumbnail?.url
                                : typeof firstImage === 'string'
                                  ? firstImage
                                  : undefined

                            return (
                              <Link
                                href={`/products/${item.product?.slug || '#'}`}
                                key={item.id}
                                className="group hover:border-brand-200 hover:bg-brand-50/30 flex items-center gap-4 rounded-xl border border-neutral-100 bg-white p-3 transition-colors"
                              >
                                <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-100 transition-transform group-hover:scale-[1.02]">
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={item.product?.name}
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
                                    {item.unitPrice.toLocaleString('en-IN')}
                                  </p>
                                </div>
                                <div className="font-body pr-2 text-xs font-bold text-neutral-900">
                                  ₹{item.totalPrice.toLocaleString('en-IN')}
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </div>

                      {/* Right: Shipping details and billing invoice summary */}
                      <div className="space-y-6 md:col-span-5">
                        {/* Shipping details */}
                        <div className="space-y-2">
                          <h4 className="font-display flex items-center gap-1.5 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                            <Truck className="h-3.5 w-3.5 text-neutral-400" />
                            Shipping Destination
                          </h4>
                          <div className="font-body rounded-xl border border-neutral-100 bg-white p-4 text-xs leading-relaxed text-neutral-600">
                            <p className="font-display font-semibold text-neutral-900">
                              {order.shippingAddress.fullName}
                            </p>
                            <p>{order.shippingAddress.phone}</p>
                            <p className="mt-1">
                              {order.shippingAddress.line1}
                              {order.shippingAddress.line2 &&
                                `, ${order.shippingAddress.line2}`}
                            </p>
                            <p>
                              {order.shippingAddress.city},{' '}
                              {order.shippingAddress.state} -{' '}
                              {order.shippingAddress.pincode}
                            </p>
                          </div>
                        </div>

                        {/* Invoice Summary */}
                        <div className="space-y-2">
                          <h4 className="font-display flex items-center gap-1.5 text-xs font-semibold tracking-wider text-neutral-400 uppercase">
                            <CreditCard className="h-3.5 w-3.5 text-neutral-400" />
                            Invoice Summary
                          </h4>
                          <div className="font-body space-y-2 rounded-xl border border-neutral-100 bg-white p-4 text-xs text-neutral-500">
                            <div className="flex justify-between">
                              <span>Bag Subtotal</span>
                              <span className="font-semibold text-neutral-900">
                                ₹{order.subtotal?.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shipping & Dispatch</span>
                              <span className="font-semibold text-neutral-900">
                                {order.shipping === 0
                                  ? 'FREE'
                                  : `₹${order.shipping}`}
                              </span>
                            </div>
                            {order.discount > 0 && (
                              <div className="text-success flex justify-between">
                                <span>Coupon Discount</span>
                                <span>
                                  -₹{order.discount?.toLocaleString('en-IN')}
                                </span>
                              </div>
                            )}
                            <div className="font-display flex justify-between border-t border-neutral-100 pt-2 text-sm font-semibold text-neutral-900">
                              <span>Total Paid</span>
                              <span>
                                ₹{order.total?.toLocaleString('en-IN')}
                              </span>
                            </div>
                            <div className="flex justify-between border-t border-dotted border-neutral-100 pt-1 text-[10px] text-neutral-400">
                              <span>Payment ID</span>
                              <span className="font-mono text-neutral-600">
                                {order.paymentId}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Link
                              href={`/account/orders/${order.orderNumber}`}
                              className="font-display flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-neutral-800"
                            >
                              View Full Order Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
