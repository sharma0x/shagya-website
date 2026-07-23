'use client'

import { useEffect, useState } from 'react'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, TicketPercent, Loader2, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

function CouponGridCard({ coupon }: { coupon: any }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(coupon.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const formatDiscount = () => {
    if (coupon.type === 'percentage') return `${coupon.value}% OFF`
    if (coupon.type === 'fixed_amount') return `₹${coupon.value} OFF`
    return 'FREE SHIP'
  }

  return (
    <div className="flex flex-col rounded-xl border border-neutral-100 bg-white p-4 shadow-xs">
      <span className="font-display text-brand-700 inline-flex h-7 items-center rounded-lg bg-brand-50 px-2 text-[10px] font-bold tracking-wide w-fit">
        {formatDiscount()}
      </span>

      <p className="font-mono mt-3 text-sm tracking-wider text-neutral-800">
        {coupon.code}
      </p>

      {coupon.description && (
        <p className="font-body mt-1 text-[11px] leading-snug text-neutral-400">
          {coupon.description}
        </p>
      )}

      <div className="font-body mt-2 text-[10px] text-neutral-400 space-x-2">
        {coupon.minCartValue > 0 && (
          <span>Min. ₹{coupon.minCartValue.toLocaleString('en-IN')}</span>
        )}
        {coupon.maxDiscount && coupon.type === 'percentage' && (
          <span>Max ₹{coupon.maxDiscount.toLocaleString('en-IN')}</span>
        )}
        {coupon.endDate && (
          <span>
            Till{' '}
            {new Date(coupon.endDate).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>

      <button
        onClick={handleCopy}
        className={cn(
          'font-display mt-auto pt-3 inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase transition-colors',
          copied ? 'text-green-600' : 'text-brand-600 hover:text-brand-700',
        )}
      >
        {copied ? (
          <>
            <Check className="h-3 w-3" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3 w-3" />
            Copy Code
          </>
        )}
      </button>
    </div>
  )
}

export default function MyOffersPage() {
  const router = useRouter()
  const { data: sessionData, isPending } = useSession()
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isPending) return
    if (!sessionData?.user) {
      router.push('/account/login')
      return
    }

    fetch('/api/coupons/available')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (d) setCoupons(d.coupons || []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [sessionData, isPending, router])

  if (isPending || loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-brand-600 h-8 w-8 animate-spin" />
        <p className="font-body text-sm text-neutral-500">Loading offers...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/account"
          className="font-display hover:text-brand-700 mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 transition-colors hover:text-neutral-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Account
        </Link>

        <div className="mb-8 flex items-center gap-3">
          <div className="bg-brand-50 text-brand-700 flex h-10 w-10 items-center justify-center rounded-xl">
            <TicketPercent className="h-5 w-5" />
          </div>
          <div>
            <span className="font-display text-xs font-semibold tracking-widest text-neutral-400 uppercase">
              Offers & Coupons
            </span>
            <h1 className="font-display text-2xl font-bold text-neutral-900">
              My Offers
            </h1>
          </div>
        </div>

        {coupons.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {coupons.map((c: any) => (
              <CouponGridCard key={c.id} coupon={c} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-100 bg-white p-12 text-center shadow-xs">
            <TicketPercent className="text-brand-600 mx-auto mb-4 h-12 w-12 opacity-30" />
            <h2 className="font-display text-lg font-semibold text-neutral-900">
              No offers yet
            </h2>
            <p className="font-body mt-2 text-sm text-neutral-500">
              Active coupons and special discounts will appear here.
              Keep an eye out for seasonal sales!
            </p>
            <Link
              href="/category/all"
              className="font-display bg-brand-600 hover:bg-brand-700 mt-6 inline-flex h-10 items-center rounded-xl px-5 text-xs font-semibold text-white transition-colors"
            >
              Browse Sarees
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
