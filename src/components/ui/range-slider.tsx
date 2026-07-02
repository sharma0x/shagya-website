'use client'

import { useCallback } from 'react'
import { cn } from '@/lib/utils'

interface RangeSliderProps {
  min: number
  max: number
  step: number
  value: [number, number]
  onChange: (value: [number, number]) => void
  formatLabel?: (value: number) => string
  className?: string
  disabled?: boolean
}

export function RangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  formatLabel = (v) => String(v),
  className,
  disabled = false,
}: RangeSliderProps) {
  const [low, high] = value

  const getPercent = useCallback(
    (v: number) => ((v - min) / (max - min)) * 100,
    [min, max],
  )

  const handleMinChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newLow = Math.min(Number(e.target.value), high - step)
      onChange([newLow, high])
    },
    [high, step, onChange],
  )

  const handleMaxChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newHigh = Math.max(Number(e.target.value), low + step)
      onChange([low, newHigh])
    },
    [low, step, onChange],
  )

  const lowPercent = getPercent(low)
  const highPercent = getPercent(high)

  return (
    <div className={cn('w-full', className)}>
      <div className="relative h-6">
        {/* Track background */}
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-neutral-200" />
        {/* Active track */}
        <div
          className="bg-brand-600 absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
          style={{
            left: `${lowPercent}%`,
            width: `${highPercent - lowPercent}%`,
          }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={handleMinChange}
          disabled={disabled}
          className={cn(
            'pointer-events-auto absolute top-0 h-6 w-full appearance-none bg-transparent',
            '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-600 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm',
            '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-600 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm',
          )}
          style={{ zIndex: 3 }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={handleMaxChange}
          disabled={disabled}
          className={cn(
            'pointer-events-none absolute top-0 h-6 w-full appearance-none bg-transparent',
            '[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-brand-600 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-sm',
            '[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-brand-600 [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-sm',
          )}
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-neutral-400">
        <span>{formatLabel(low)}</span>
        <span>{formatLabel(high)}</span>
      </div>
    </div>
  )
}
