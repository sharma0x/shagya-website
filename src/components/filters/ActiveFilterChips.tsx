'use client'

import { X } from 'lucide-react'
import { useFilters } from './use-filters'

export function ActiveFilterChips() {
  const { activeFilters, removeParam, clearAll } = useFilters()

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map((filter) => (
        <span
          key={`${filter.paramName}-${filter.value}`}
          className="font-body inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600"
        >
          <span className="text-neutral-400">{filter.label}:</span>
          {filter.value}
          <button
            onClick={() => removeParam(filter.paramName)}
            className="ml-0.5 rounded-full p-0.5 text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-700"
            aria-label={`Remove ${filter.label} filter`}
          >
            <X className="h-3 w-3 stroke-[2.5]" />
          </button>
        </span>
      ))}
      <button
        onClick={clearAll}
        className="font-body text-xs text-neutral-500 underline-offset-2 hover:text-neutral-800 hover:underline"
      >
        Clear all
      </button>
    </div>
  )
}
