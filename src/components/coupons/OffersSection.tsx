'use client'

import { useState } from 'react'
import { Copy, TicketPercent, Check } from 'lucide-react'
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
      <div className={cn('space-y-1.5', className)}>
        {coupons.map((c) => (
          <div
            key={c.id}
            className="flex items-center gap-2 rounded-lg border border-dashed border-brand-200 bg-brand-50/30 px-3 py-2"
          >
            <TicketPercent className="h-4 w-4 shrink-0 text-brand-600" />
            <div className="min-w-0 flex-1">
              <p className="font-body truncate text-[11px] font-medium text-neutral-800">
                {formatDiscount(c)} — {c.code}
              </p>
              {c.description && (
                <p className="font-body truncate text-[10px] text-neutral-400">
                  {c.description}
                </p>
              )}
            </div>
            <CouponCopyButton code={c.code} />
          </div>
        ))}
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
