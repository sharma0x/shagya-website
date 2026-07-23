'use client'

import { useState } from 'react'
import { Copy, TicketPercent, Check, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CouponData {
  id: string | number
  code: string
  description: string
  type: 'percentage' | 'fixed_amount' | 'free_shipping'
  value: number
  minCartValue: number
  maxDiscount?: number | null
  endDate?: string | null
}

interface OffersSectionProps {
  coupons: CouponData[]
  variant: 'banner' | 'card'
  className?: string
}

function formatDiscount(c: CouponData): string {
  if (c.type === 'percentage') return `${c.value}% off`
  if (c.type === 'fixed_amount') return `₹${c.value} off`
  return 'Free shipping'
}

function CouponCopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'font-display inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-semibold tracking-wider uppercase transition-all',
        copied
          ? 'bg-green-50 text-green-600'
          : 'bg-brand-50 text-brand-600 hover:bg-brand-100',
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
          Copy
        </>
      )}
    </button>
  )
}

export function OffersSection({
  coupons,
  variant,
  className,
}: OffersSectionProps) {
  if (!coupons.length) return null

  if (variant === 'banner') {
    return (
      <div className={cn('rounded-xl border border-neutral-200 bg-white p-4', className)}>
        <h4 className="font-display mb-3 text-xs font-semibold tracking-tight text-neutral-900">
          Available Offers
        </h4>
        <div className="bg-gold-400 mb-3 h-px w-10" aria-hidden="true" />
        <div className="space-y-2">
          {coupons.map((c) => (
            <div
              key={c.id}
              className="rounded-lg border border-neutral-100 bg-neutral-50/50 px-3 py-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 mt-0.5" />
                  <div className="min-w-0">
                    <p className="font-body text-xs font-medium text-neutral-900">
                      Save {c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed_amount' ? `₹${c.value}` : 'on shipping'} with coupon
                    </p>
                    <p className="font-mono mt-0.5 text-[11px] tracking-wider text-neutral-500">
                      {c.code}
                    </p>
                    {(c.minCartValue > 0 || c.maxDiscount || c.endDate) && (
                      <p className="font-body mt-0.5 text-[10px] text-neutral-400">
                        {[
                          c.minCartValue > 0 && `Min. ₹${c.minCartValue.toLocaleString('en-IN')}`,
                          c.maxDiscount && c.type === 'percentage' && `Max disc ₹${c.maxDiscount.toLocaleString('en-IN')}`,
                          c.endDate && `Till ${new Date(c.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`,
                        ].filter(Boolean).join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
                <CouponCopyButton code={c.code} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // variant === 'card'
  return (
    <div className={cn('space-y-3', className)}>
      {coupons.map((c) => (
        <div
          key={c.id}
          className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
        >
          <div className="flex items-start gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50">
              <TicketPercent className="h-5 w-5 text-brand-600" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-sm font-semibold text-neutral-900">
                  {c.code}
                </p>
                <CouponCopyButton code={c.code} />
              </div>
              <p className="font-body mt-0.5 text-xs font-medium text-neutral-700">
                {formatDiscount(c)}
                {c.description && ` — ${c.description}`}
              </p>
              <div className="font-body mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-neutral-400">
                {c.minCartValue > 0 && (
                  <span>Min. ₹{c.minCartValue.toLocaleString('en-IN')}</span>
                )}
                {c.maxDiscount && c.type === 'percentage' && (
                  <span>Max disc ₹{c.maxDiscount.toLocaleString('en-IN')}</span>
                )}
                {c.endDate && (
                  <span>
                    Valid till{' '}
                    {new Date(c.endDate).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
