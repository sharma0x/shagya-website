'use client'

import { Filter } from 'lucide-react'
import { useFilterDrawer } from './filter-drawer-context'
import { useFilters } from './use-filters'

export function MobileFilterBar() {
  const { setOpen } = useFilterDrawer()
  const { activeFilterCount } = useFilters()

  return (
    <button
      onClick={() => setOpen(true)}
      className="hover:text-brand-700 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50"
      aria-label="Open filters"
    >
      <Filter className="h-3.5 w-3.5" />
      Filters
      {activeFilterCount > 0 && (
        <span className="bg-brand-600 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
          {activeFilterCount}
        </span>
      )}
    </button>
  )
}
