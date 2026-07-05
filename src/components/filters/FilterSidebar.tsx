'use client'

import { useState, useEffect } from 'react'
import { Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FilterSection } from './FilterSection'
import { CheckboxFilter } from './CheckboxFilter'
import { PriceRangeFilter } from './PriceRangeFilter'
import { ColorFilter } from './ColorFilter'
import { FilterDrawer } from './FilterDrawer'
import { useFilters } from './use-filters'
import type { FilterOption } from './types'

const WEAVE_OPTIONS: FilterOption[] = [
  { label: 'Banarasi', value: 'banarasi' },
  { label: 'Kanchipuram', value: 'kanchipuram' },
  { label: 'Bandhani', value: 'bandhani' },
  { label: 'Patola', value: 'patola' },
  { label: 'Kalamkari', value: 'kalamkari' },
  { label: 'Ikat', value: 'ikkat' },
  { label: 'Paithani', value: 'paithani' },
  { label: 'Maheshwari', value: 'maheshwari' },
  { label: 'Chanderi', value: 'chanderi' },
  { label: 'Tant', value: 'tant' },
  { label: 'Baluchari', value: 'baluchari' },
]

const FABRIC_OPTIONS: FilterOption[] = [
  { label: 'Silk', value: 'silk' },
  { label: 'Cotton', value: 'cotton' },
  { label: 'Linen', value: 'linen' },
  { label: 'Georgette', value: 'georgette' },
  { label: 'Chiffon', value: 'chiffon' },
  { label: 'Crepe', value: 'crepe' },
  { label: 'Velvet', value: 'velvet' },
  { label: 'Net', value: 'net' },
  { label: 'Blend', value: 'blend' },
]

const PATTERN_OPTIONS: FilterOption[] = [
  { label: 'Solid', value: 'solid' },
  { label: 'Printed', value: 'printed' },
  { label: 'Embroidered', value: 'embroidered' },
  { label: 'Embellished', value: 'embellished' },
  { label: 'Painted', value: 'painted' },
]

const OCCASION_OPTIONS: FilterOption[] = [
  { label: 'Festive', value: 'festive' },
  { label: 'Bridal', value: 'bridal' },
  { label: 'Casual', value: 'casual' },
  { label: 'Daily Wear', value: 'daily-wear' },
]

export function FilterSidebar({ className }: { className?: string }) {
  const { activeFilterCount } = useFilters()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collections, setCollections] = useState<FilterOption[]>([])

  // Fetch collections from Payload API
  useEffect(() => {
    async function fetchCollections() {
      try {
        const res = await fetch('/api/collections?limit=100&depth=1')
        const data = await res.json()
        if (data.docs) {
          setCollections(
            data.docs.map((c: { name: string; slug: string }) => ({
              label: c.name,
              value: c.slug,
            })),
          )
        }
      } catch {
        // Silently fail — collections filter just won't show
      }
    }
    fetchCollections()
  }, [])

  const sidebarContent = (
    <>
      <FilterSection title="Price Range" defaultOpen={true}>
        <PriceRangeFilter />
      </FilterSection>

      <FilterSection title="Weave" defaultOpen={false}>
        <CheckboxFilter options={WEAVE_OPTIONS} paramName="weave" />
      </FilterSection>

      <FilterSection title="Fabric" defaultOpen={false}>
        <CheckboxFilter options={FABRIC_OPTIONS} paramName="fabric" />
      </FilterSection>

      <FilterSection title="Pattern" defaultOpen={false}>
        <CheckboxFilter options={PATTERN_OPTIONS} paramName="pattern" />
      </FilterSection>

      <FilterSection title="Occasion" defaultOpen={false}>
        <CheckboxFilter options={OCCASION_OPTIONS} paramName="occasion" />
      </FilterSection>

      <FilterSection title="Color" defaultOpen={false}>
        <ColorFilter />
      </FilterSection>

      {collections.length > 0 && (
        <FilterSection title="Collection" defaultOpen={false}>
          <CheckboxFilter options={collections} paramName="collection" />
        </FilterSection>
      )}
    </>
  )

  return (
    <>
      {/* Mobile trigger button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="hover:text-brand-700 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 lg:hidden"
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

      {/* Mobile drawer */}
      <FilterDrawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)}>
        {sidebarContent}
      </FilterDrawer>

      {/* Desktop sidebar */}
      <aside className={cn('hidden w-[280px] shrink-0 lg:block', className)}>
        <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-6">
          {sidebarContent}
        </div>
      </aside>
    </>
  )
}
