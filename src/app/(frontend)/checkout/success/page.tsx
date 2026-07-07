'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import {
  CheckCircle2,
  ShoppingBag,
  ArrowRight,
  Calendar,
  Heart,
} from 'lucide-react'

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('orderNumber') || 'ORD-00001'

  return (
    <div className="flex min-h-[75vh] flex-col justify-center bg-neutral-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-xs">
        <div className="mb-6 flex justify-center">
          <CheckCircle2 className="text-success h-16 w-16 animate-bounce" />
        </div>

        <h2 className="font-display text-2xl font-bold tracking-tight text-neutral-900">
          Order Confirmed
        </h2>
        <p className="font-body mt-2 text-sm text-neutral-500">
          Thank you for choosing SHAYGA - The Saree Studio. Your handloom masterpiece is booked!
        </p>

        <div className="my-6 space-y-3 rounded-xl border border-neutral-100 bg-neutral-50 p-4 text-left">
          <div className="font-body flex justify-between text-xs text-neutral-500">
            <span>Order Reference</span>
            <span className="font-display font-semibold text-neutral-900">
              {orderNumber}
            </span>
          </div>
          <div className="font-body flex justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500">
            <span>Status</span>
            <span className="text-success font-display font-semibold">
              Processing
            </span>
          </div>
          <div className="font-body flex justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500">
            <span>Est. Dispatch</span>
            <span className="inline-flex items-center gap-1 font-semibold text-neutral-900">
              <Calendar className="h-3.5 w-3.5 text-neutral-400" />
              2–3 business days
            </span>
          </div>
        </div>

        <p className="font-body mb-8 text-xs leading-relaxed text-neutral-400">
          A confirmation email and SMS containing shipping details and tracing
          link has been sent to your registered address.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href={`/account/orders/${orderNumber}`}
            className="bg-brand-600 hover:bg-brand-700 font-display flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white shadow-xs transition-all active:scale-95"
          >
            Track in My Orders
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="font-display flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white text-sm font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Browsing
          </Link>
        </div>

        <div className="font-display mt-8 flex items-center justify-center gap-1.5 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
          <Heart className="text-brand-500 h-3 w-3" />
          Crafted with Heritage
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[75vh] items-center justify-center bg-neutral-50">
          <div className="text-neutral-500">Loading...</div>
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}
