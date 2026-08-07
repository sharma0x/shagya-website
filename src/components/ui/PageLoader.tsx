'use client'

export function PageLoader() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Shayga"
      className="animate-fade-in fixed inset-0 z-[9999] flex items-center justify-center bg-white/70 backdrop-blur-[2px]"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-20 w-20 items-center justify-center">
          <span
            aria-hidden="true"
            className="animate-pulse-ring bg-brand-500/10 absolute inset-0 rounded-full"
          />
          <span
            aria-hidden="true"
            className="border-brand-200/80 border-t-brand-600 absolute inset-0 animate-spin rounded-full border-2 motion-reduce:animate-none"
          />
          <img
            src="/shayga-logo.svg"
            alt=""
            aria-hidden="true"
            className="h-9 w-9 select-none"
          />
        </div>
        <span className="font-display text-brand-600 text-base font-semibold tracking-tight">
          Shayga
        </span>
      </div>
    </div>
  )
}
