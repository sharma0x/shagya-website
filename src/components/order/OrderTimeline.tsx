import { cn } from '@/lib/utils'

const STAGES = [
  { key: 'pending', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
] as const

function formatDate(iso?: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

function getTimestamp(
  order: any,
  stage: string,
): string | null {
  switch (stage) {
    case 'pending':
      return order.createdAt || null
    case 'confirmed':
      return order.confirmedAt || null
    case 'shipped':
      return order.shippedAt || null
    case 'delivered':
      return order.deliveredAt || null
    default:
      return null
  }
}

interface OrderTimelineProps {
  order: any
  className?: string
}

export function OrderTimeline({ order, className }: OrderTimelineProps) {
  const status = order.status as string
  const isCancelled = status === 'cancelled' || status === 'refunded'

  // Find current stage index
  const currentIdx = STAGES.findIndex((s) => s.key === status)
  const effectiveIdx = isCancelled
    ? STAGES.findIndex((s) => s.key === 'pending') // show only placed as done
    : currentIdx >= 0
      ? currentIdx
      : 0

  return (
    <div className={cn('', className)}>
      {/* Stages */}
      <div className="flex items-center justify-between">
        {STAGES.map((stage, idx) => {
          const ts = getTimestamp(order, stage.key)
          const isCompleted = isCancelled
            ? idx === 0 // only "Placed" is completed for cancelled
            : idx < effectiveIdx
          const isCurrent = !isCancelled && idx === effectiveIdx
          const isUpcoming = !isCancelled && idx > effectiveIdx

          // Determine if line after this dot is completed
          const isLineCompleted = isCancelled
            ? false
            : idx < effectiveIdx

          return (
            <div key={stage.key} className="flex flex-1 items-center">
              {/* Dot + Label */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'relative flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-bold transition-all',
                    isCompleted &&
                      'border-emerald-500 bg-emerald-500 text-white',
                    isCurrent &&
                      'border-brand-600 bg-brand-50 text-brand-700 animate-pulse',
                    isUpcoming && 'border-neutral-200 bg-white text-neutral-300',
                    isCancelled &&
                      idx === 0 &&
                      'border-red-400 bg-red-50 text-red-500',
                    isCancelled && idx > 0 && 'border-neutral-100 bg-neutral-50 text-neutral-200',
                  )}
                >
                  {isCompleted && !isCancelled ? (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </div>
                <span
                  className={cn(
                    'font-display mt-1.5 text-[9px] font-semibold tracking-wider',
                    isCompleted && 'text-emerald-600',
                    isCurrent && 'text-brand-700',
                    isUpcoming && 'text-neutral-300',
                    isCancelled && idx === 0 && 'text-red-500',
                    isCancelled && idx > 0 && 'text-neutral-200',
                  )}
                >
                  {stage.label}
                </span>
                <span
                  className={cn(
                    'font-body mt-0.5 text-[8px]',
                    isCompleted && 'text-emerald-500',
                    isCurrent && 'text-brand-500',
                    isUpcoming && 'text-neutral-300',
                    isCancelled && idx === 0 && 'text-red-400',
                    isCancelled && idx > 0 && 'text-neutral-200',
                  )}
                >
                  {formatDate(ts)}
                </span>
              </div>

              {/* Connector line (except after last stage) */}
              {idx < STAGES.length - 1 && (
                <div className="mx-1 flex-1">
                  <div
                    className={cn(
                      'h-0.5 rounded-full',
                      isLineCompleted && 'bg-emerald-400',
                      !isLineCompleted && !isCancelled && 'bg-neutral-200',
                      isCancelled && 'bg-neutral-100',
                    )}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Status message */}
      {isCancelled ? (
        <p className="mt-4 text-center text-xs font-medium text-red-500">
          This order was {status}
        </p>
      ) : (
        <p className="mt-4 text-center text-xs text-neutral-400">
          {currentIdx === 3
            ? 'Delivered — thank you for choosing Shayga!'
            : currentIdx === 2
              ? 'Your order is on its way'
              : currentIdx === 1
                ? 'Your order has been confirmed'
                : 'Order placed — awaiting confirmation'}
        </p>
      )}

      {/* Tracking Info — shown when shipped */}
      {status === 'shipped' && order.trackingId && (
        <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/30 p-4">
          <p className="font-display text-xs font-semibold text-neutral-900">
            Tracking details for your order
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="font-mono text-sm font-semibold text-neutral-700">
              {order.trackingId}
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(order.trackingId)
              }}
              className="font-display text-brand-600 hover:text-brand-700 rounded-lg px-2 py-1 text-[10px] font-semibold transition-colors"
            >
              Copy
            </button>
          </div>
          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display bg-brand-600 hover:bg-brand-700 mt-3 inline-flex h-9 items-center gap-1.5 rounded-lg px-4 text-xs font-semibold text-white transition-colors"
            >
              Track Package
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  )
}
