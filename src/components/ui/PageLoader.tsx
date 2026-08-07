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
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              aria-hidden="true"
              className="bg-brand-500/15 absolute inset-0 rounded-full"
              style={{ animation: `ripple 2s ${i * 0.5}s ease-out infinite` }}
            />
          ))}
          <img
            src="/shayga-logo.svg"
            alt=""
            aria-hidden="true"
            className="relative z-10 h-9 w-9 select-none"
          />
        </div>
        <style>{`
          @keyframes ripple {
            0%   { transform: scale(0.6); opacity: 0.8; }
            100% { transform: scale(1.6); opacity: 0; }
          }
          @media (prefers-reduced-motion: reduce) {
            .ripple-dot { animation: none; opacity: 0.5; transform: scale(1); }
          }
        `}</style>
        <span className="font-display text-brand-600 text-base font-semibold tracking-tight">
          Shayga
        </span>
      </div>
    </div>
  )
}
