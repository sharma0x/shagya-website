'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'

const MIN_PRICE = 0
const MAX_PRICE = 100000 // ₹1,00,000
const STEP = 500

export function PriceRangeFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const initialMin = parseInt(searchParams.get('priceRange_min') ?? '0', 10)
  const initialMax = parseInt(
    searchParams.get('priceRange_max') ?? String(MAX_PRICE),
    10,
  )

  const [min, setMin] = useState(isNaN(initialMin) ? MIN_PRICE : initialMin)
  const [max, setMax] = useState(isNaN(initialMax) ? MAX_PRICE : initialMax)
  const [isDragging, setIsDragging] = useState<'min' | 'max' | null>(null)

  // Sync from URL on external changes
  useEffect(() => {
    const urlMin = parseInt(
      searchParams.get('priceRange_min') ?? String(MIN_PRICE),
      10,
    )
    const urlMax = parseInt(
      searchParams.get('priceRange_max') ?? String(MAX_PRICE),
      10,
    )
    setMin(isNaN(urlMin) ? MIN_PRICE : urlMin)
    setMax(isNaN(urlMax) ? MAX_PRICE : urlMax)
  }, [searchParams])

  const pushToUrl = useCallback(
    (nextMin: number, nextMax: number) => {
      const params = new URLSearchParams(searchParams.toString())

      if (nextMin > MIN_PRICE) {
        params.set('priceRange_min', String(nextMin))
      } else {
        params.delete('priceRange_min')
      }

      if (nextMax < MAX_PRICE) {
        params.set('priceRange_max', String(nextMax))
      } else {
        params.delete('priceRange_max')
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router],
  )

  const debouncedPush = useCallback(
    (nextMin: number, nextMax: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => pushToUrl(nextMin, nextMax), 200)
    },
    [pushToUrl],
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleMinChange = (value: number) => {
    const clamped = Math.min(value, max - STEP)
    setMin(clamped)
    debouncedPush(clamped, max)
  }

  const handleMaxChange = (value: number) => {
    const clamped = Math.max(value, min + STEP)
    setMax(clamped)
    debouncedPush(min, clamped)
  }

  const minPercent = ((min - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100
  const maxPercent = ((max - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100

  return (
    <div className="space-y-3">
      {/* Range track */}
      <div className="relative h-6 touch-none select-none">
        {/* Background track */}
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-neutral-200" />

        {/* Active range highlight */}
        <div
          ref={trackRef}
          className="bg-brand-600 absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
          style={{
            left: `${minPercent}%`,
            width: `${maxPercent - minPercent}%`,
          }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={STEP}
          value={min}
          onChange={(e) => handleMinChange(parseInt(e.target.value, 10))}
          onMouseDown={() => setIsDragging('min')}
          onMouseUp={() => setIsDragging(null)}
          onTouchStart={() => setIsDragging('min')}
          onTouchEnd={() => setIsDragging(null)}
          className="price-range-thumb pointer-events-none absolute top-1/2 left-0 z-20 h-[1.125rem] w-full -translate-y-1/2 appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto"
          aria-label="Minimum price"
        />

        {/* Max thumb */}
        <input
          type="range"
          min={MIN_PRICE}
          max={MAX_PRICE}
          step={STEP}
          value={max}
          onChange={(e) => handleMaxChange(parseInt(e.target.value, 10))}
          onMouseDown={() => setIsDragging('max')}
          onMouseUp={() => setIsDragging(null)}
          onTouchStart={() => setIsDragging('max')}
          onTouchEnd={() => setIsDragging(null)}
          className="price-range-thumb pointer-events-none absolute top-1/2 left-0 z-30 h-[1.125rem] w-full -translate-y-1/2 appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto"
          aria-label="Maximum price"
        />
      </div>

      {/* Labels */}
      <div className="font-body flex items-center justify-between text-xs text-neutral-600">
        <span className="rounded-md bg-neutral-100 px-2 py-1 tabular-nums">
          ₹{min.toLocaleString('en-IN')}
        </span>
        <span className="text-neutral-300">—</span>
        <span className="rounded-md bg-neutral-100 px-2 py-1 tabular-nums">
          ₹{max.toLocaleString('en-IN')}
        </span>
      </div>
    </div>
  )
}
