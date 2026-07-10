'use client'

import { useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

const COLORS = [
  { label: 'Red', value: 'red', color: 'oklch(0.55 0.2 25)' },
  { label: 'Burgundy', value: 'burgundy', color: 'oklch(0.35 0.1 20)' },
  { label: 'Gold', value: 'gold', color: 'oklch(0.7 0.18 75)' },
  { label: 'Green', value: 'green', color: 'oklch(0.55 0.15 145)' },
  { label: 'Blue', value: 'blue', color: 'oklch(0.5 0.15 260)' },
  { label: 'Ivory', value: 'ivory', color: 'oklch(0.92 0.01 80)' },
  { label: 'Pink', value: 'pink', color: 'oklch(0.65 0.12 350)' },
  { label: 'Purple', value: 'purple', color: 'oklch(0.45 0.15 295)' },
  { label: 'Orange', value: 'orange', color: 'oklch(0.65 0.16 50)' },
  { label: 'Black', value: 'black', color: 'oklch(0.15 0.01 0)' },
  { label: 'White', value: 'white', color: 'oklch(0.97 0.002 80)' },
  { label: 'Multicolor', value: 'multicolor', color: 'oklch(0.65 0.05 80)' },
]

function isLightColor(oklch: string): boolean {
  // Extract lightness value — colors with lightness > 0.85 need a border
  const match = oklch.match(/oklch\(([\d.]+)/)
  if (!match) return false
  return parseFloat(match[1]) > 0.85
}

export function ColorFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeValues =
    searchParams.get('color')?.split(',').filter(Boolean) ?? []

  const toggle = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const current = params.get('color')?.split(',').filter(Boolean) ?? []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]

      if (next.length > 0) {
        params.set('color', next.join(','))
      } else {
        params.delete('color')
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router],
  )

  if (COLORS.length === 0) return null

  return (
    <div className="space-y-1">
      {COLORS.map(({ label, value, color }) => {
        const isChecked = activeValues.includes(value)
        const light = isLightColor(color)
        return (
          <label
            key={value}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-neutral-50',
              isChecked && 'text-brand-700 bg-brand-50/50',
            )}
          >
            {/* Color swatch */}
            <span
              className={cn(
                'relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full',
                light && 'ring-1 ring-neutral-200 ring-inset',
              )}
              style={{ backgroundColor: color }}
              role="presentation"
            >
              {isChecked && (
                <Check
                  className={cn(
                    'h-3 w-3 stroke-[3]',
                    light ? 'text-neutral-600' : 'text-white',
                  )}
                />
              )}
            </span>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggle(value)}
              className="sr-only"
              aria-label={label}
            />
            <span className="font-body text-sm text-neutral-700">{label}</span>
          </label>
        )
      })}
    </div>
  )
}
