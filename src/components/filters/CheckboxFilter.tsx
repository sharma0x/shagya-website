'use client'

import { useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FilterOption } from './types'

interface CheckboxFilterProps {
  options: FilterOption[]
  paramName: string
}

export function CheckboxFilter({ options, paramName }: CheckboxFilterProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const activeValues =
    searchParams.get(paramName)?.split(',').filter(Boolean) ?? []

  const toggle = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const current = params.get(paramName)?.split(',').filter(Boolean) ?? []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]

      if (next.length > 0) {
        params.set(paramName, next.join(','))
      } else {
        params.delete(paramName)
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, paramName, pathname, router],
  )

  if (options.length === 0) return null

  return (
    <div className="space-y-1.5">
      {options.map((option) => {
        const isChecked = activeValues.includes(option.value)
        return (
          <label
            key={option.value}
            className={cn(
              'flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-neutral-50',
              isChecked && 'text-brand-700 bg-brand-50/50',
            )}
          >
            <span
              className={cn(
                'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                isChecked
                  ? 'border-brand-600 bg-brand-600 text-white'
                  : 'border-neutral-300 bg-white',
              )}
              role="presentation"
            >
              {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
            </span>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggle(option.value)}
              className="sr-only"
              aria-label={option.label}
            />
            <span className="font-body text-sm text-neutral-700">
              {option.label}
            </span>
          </label>
        )
      })}
    </div>
  )
}
