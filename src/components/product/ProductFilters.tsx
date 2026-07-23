'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Filter, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RangeSlider } from '@/components/ui/range-slider'
import { COLOR_PALETTE } from '@/lib/colors'

const INITIAL_COLOR_COUNT = 12

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FABRIC_OPTIONS = [
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

const WEAVE_OPTIONS = [
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

const PATTERN_OPTIONS = [
  { label: 'Solid', value: 'solid' },
  { label: 'Printed', value: 'printed' },
  { label: 'Embroidered', value: 'embroidered' },
  { label: 'Embellished', value: 'embellished' },
  { label: 'Painted', value: 'painted' },
]

const DISCOUNT_OPTIONS = [
  { label: '10%+ OFF', value: '10' },
  { label: '25%+ OFF', value: '25' },
  { label: '50%+ OFF', value: '50' },
]

/* Temporarily disabled — size filter
const SIZE_OPTIONS = [
  { label: 'XS', value: 'XS' },
  { label: 'S', value: 'S' },
  { label: 'M', value: 'M' },
  { label: 'L', value: 'L' },
  { label: 'XL', value: 'XL' },
  { label: '2XL', value: '2XL' },
  { label: 'Free', value: 'Free' },
]
*/

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FacetCount {
  value: string
  label: string
  count: number
}

interface FacetsData {
  fabric: FacetCount[]
  weave: FacetCount[]
  pattern: FacetCount[]
  colors: FacetCount[]
  cities: FacetCount[]
}

interface ProductFiltersProps {
  variant?: 'sidebar' | 'vertical'
  className?: string
  contextFilter?: Record<string, string>
}

// ---------------------------------------------------------------------------
// Shared UI
// ---------------------------------------------------------------------------

const checkboxClass = cn(
  'accent-brand-600 h-3.5 w-3.5 rounded border-neutral-300 cursor-pointer',
)

const labelClass = cn(
  'cursor-pointer select-none text-xs group-hover:text-neutral-800 transition-colors',
)

function Section({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-neutral-50 pb-4">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-1 text-left"
      >
        <span className="font-display text-[11px] font-semibold tracking-wider text-neutral-500 uppercase">
          {title}
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-neutral-400 transition-transform',
            expanded && 'rotate-180',
          )}
        />
      </button>
      {expanded && <div className="mt-2">{children}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function ProductFilters({
  variant = 'sidebar',
  className,
  contextFilter,
}: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const getParamArray = (key: string): string[] => {
    const val = searchParams.get(key)
    return val ? val.split(',') : []
  }

  const [mobileOpen, setMobileOpen] = useState(false)
  const [facets, setFacets] = useState<FacetsData | null>(null)

  // Section expand/collapse
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    price: true,
    fabric: true,
    weave: true,
    pattern: true,
    discount: true,
    city: true,
    color: false,
    size: false,
  })

  // Filter state from URL
  const [fabric, setFabric] = useState<string[]>(getParamArray('fabric'))
  const [weave, setWeave] = useState<string[]>(getParamArray('weave'))
  const [pattern, setPattern] = useState<string[]>(getParamArray('pattern'))
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [onSale, setOnSale] = useState(searchParams.get('onSale') === 'true')
  const [minDiscount, setMinDiscount] = useState(
    searchParams.get('minDiscount') || '',
  )
  const [city, setCity] = useState(searchParams.get('city') || '')
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false)
  const cityDropdownRef = useRef<HTMLDivElement>(null)
  const [color, setColor] = useState<string[]>(getParamArray('color'))
  /* Temporarily disabled
  const [size, setSize] = useState(searchParams.get('size') || '')
  */
  const [showAllColors, setShowAllColors] = useState(false)
  const isMountedRef = useRef(true)
  const initialRender = useRef(true)
  const navigateRef = useRef<ReturnType<typeof setTimeout>>()
  const sliderResetKey = useRef(0)

  // --- Facet fetching ---
  const fetchFacets = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      const currentParams = new URLSearchParams(searchParams.toString())
      // Remove page/limit for facets
      currentParams.delete('page')
      currentParams.delete('limit')
      // Exclude color and size from facet base query
      currentParams.delete('color')
      /* Temporarily disabled
      currentParams.delete('size')
      */

      // Apply context filters from the page (e.g. fabric=silk on /category/silk)
      if (contextFilter) {
        Object.entries(contextFilter).forEach(([key, value]) => {
          if (!currentParams.has(key)) currentParams.set(key, value)
        })
      }

      const qs = currentParams.toString()
      const res = await fetch(`/api/products/facets?${qs}`)
      if (res.ok) {
        const data = await res.json()
        if (isMountedRef.current) setFacets(data)
      }
    } catch {
      // silently fail
    }
  }, [searchParams, contextFilter])

  useEffect(() => {
    fetchFacets()
  }, [fetchFacets])

  // Prevent stale async state updates after unmount
  useEffect(() => {
    return () => { isMountedRef.current = false }
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(e.target as Node)) {
        setCityDropdownOpen(false)
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setCityDropdownOpen(false)
    }
    if (cityDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [cityDropdownOpen])

  // Auto-apply filters with debounce — navigates on any filter change
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false
      return
    }
    clearTimeout(navigateRef.current)
    navigateRef.current = setTimeout(() => {
      const query = buildQuery()
      router.push(query ? `${pathname}?${query}` : pathname)
    }, 300)
    return () => clearTimeout(navigateRef.current)
  }, [fabric, weave, pattern, onSale, minDiscount, minPrice, maxPrice, city, color])

  // --- Handlers ---
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const toggleArrayFilter = useCallback(
    (value: string, current: string[], setter: (v: string[]) => void) => {
      if (current.includes(value)) {
        setter(current.filter((v) => v !== value))
      } else {
        setter([...current, value])
      }
    },
    [],
  )

  const buildQuery = useCallback(() => {
    const params = new URLSearchParams()
    if (fabric.length) params.set('fabric', fabric.join(','))
    if (weave.length) params.set('weave', weave.join(','))
    if (pattern.length) params.set('pattern', pattern.join(','))
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (onSale) params.set('onSale', 'true')
    if (minDiscount) params.set('minDiscount', minDiscount)
    if (city) params.set('city', city)
    if (color.length) params.set('color', color.join(','))
    /* Temporarily disabled
    if (size) params.set('size', size)
    */
    // Preserve sort, reset page to 1
    const sort = searchParams.get('sort')
    if (sort) params.set('sort', sort)
    return params.toString()
  }, [
    fabric, weave, pattern, minPrice, maxPrice, onSale,
    minDiscount, city, color, /* size, */ searchParams,
  ])

  const handleClearAll = () => {
    setFabric([])
    setWeave([])
    setPattern([])
    setMinPrice('')
    setMaxPrice('')
    setOnSale(false)
    setMinDiscount('')
    setCity('')
    setColor([])
    sliderResetKey.current++
    setMobileOpen(false)
    router.push(pathname)
  }

  const hasActiveFilters =
    fabric.length > 0 ||
    weave.length > 0 ||
    pattern.length > 0 ||
    !!minPrice ||
    !!maxPrice ||
    onSale ||
    !!minDiscount ||
    !!city ||
    color.length > 0
    /* Temporarily disabled
    !!size
    */

  const activeCount =
    fabric.length +
    weave.length +
    pattern.length +
    (onSale ? 1 : 0) +
    (minDiscount ? 1 : 0) +
    (city ? 1 : 0) +
    color.length
    /* Temporarily disabled
    + (size ? 1 : 0)
    */

  const getFacetCount = (list: FacetCount[] | undefined, value: string) => {
    if (!list) return null
    const item = list.find((f) => f.value === value)
    return item ? ` (${item.count})` : ''
  }

  // --- Render ---
  const filterContent = (
    <div className="space-y-6">
      {hasActiveFilters && (
        <div className="flex items-center">
          <span className="font-body text-xs text-neutral-500">
            {activeCount} active
          </span>
        </div>
      )}

      {/* Price Range with slider */}
      <Section
        title="Price Range"
        expanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <RangeSlider
          key={sliderResetKey.current}
          min={0}
          max={100000}
          step={500}
          value={[
            minPrice ? parseInt(minPrice, 10) : 0,
            maxPrice ? parseInt(maxPrice, 10) : 100000,
          ]}
          onChange={([low, high]) => {
            setMinPrice(low > 0 ? String(low) : '')
            setMaxPrice(high < 100000 ? String(high) : '')
          }}
          formatLabel={(v) => `₹${v.toLocaleString('en-IN')}`}
        />
        <div className="mt-2 flex items-center gap-2" key={`price-${sliderResetKey.current}`}>
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="font-body focus:border-brand-500 h-8 w-full rounded-lg border border-neutral-200 px-2 text-xs outline-none placeholder:text-neutral-300"
          />
          <span className="text-xs text-neutral-300">—</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="font-body focus:border-brand-500 h-8 w-full rounded-lg border border-neutral-200 px-2 text-xs outline-none placeholder:text-neutral-300"
          />
        </div>
      </Section>

      {/* Discount */}
      <Section
        title="Discount"
        expanded={expandedSections.discount}
        onToggle={() => toggleSection('discount')}
      >
        <div className="space-y-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={onSale}
              onChange={(e) => setOnSale(e.target.checked)}
              className={checkboxClass}
            />
            <span className={labelClass}>On Sale</span>
          </label>
          {DISCOUNT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name="minDiscount"
                checked={minDiscount === opt.value}
                onChange={() =>
                  setMinDiscount(minDiscount === opt.value ? '' : opt.value)
                }
                onClick={() =>
                  setMinDiscount(minDiscount === opt.value ? '' : opt.value)
                }
                className={checkboxClass}
              />
              <span className={labelClass}>{opt.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Fabric */}
      <Section
        title="Fabric"
        expanded={expandedSections.fabric}
        onToggle={() => toggleSection('fabric')}
      >
        <div className="space-y-2">
          {FABRIC_OPTIONS
            .filter((opt) =>
              !facets ||
              fabric.includes(opt.value) ||
              facets.fabric?.some((f) => f.value === opt.value),
            )
            .map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                checked={fabric.includes(opt.value)}
                onChange={() =>
                  toggleArrayFilter(opt.value, fabric, setFabric)
                }
                className={checkboxClass}
              />
              <span className={labelClass}>
                {opt.label}
                {getFacetCount(facets?.fabric, opt.value)}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Weave */}
      <Section
        title="Weave"
        expanded={expandedSections.weave}
        onToggle={() => toggleSection('weave')}
      >
        <div className="max-h-48 space-y-2 overflow-y-auto">
          {WEAVE_OPTIONS
            .filter((opt) =>
              !facets ||
              weave.includes(opt.value) ||
              facets.weave?.some((f) => f.value === opt.value),
            )
            .map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                checked={weave.includes(opt.value)}
                onChange={() =>
                  toggleArrayFilter(opt.value, weave, setWeave)
                }
                className={checkboxClass}
              />
              <span className={labelClass}>
                {opt.label}
                {getFacetCount(facets?.weave, opt.value)}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Pattern */}
      <Section
        title="Pattern"
        expanded={expandedSections.pattern}
        onToggle={() => toggleSection('pattern')}
      >
        <div className="space-y-2">
          {PATTERN_OPTIONS
            .filter((opt) =>
              !facets ||
              pattern.includes(opt.value) ||
              facets.pattern?.some((f) => f.value === opt.value),
            )
            .map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="checkbox"
                checked={pattern.includes(opt.value)}
                onChange={() =>
                  toggleArrayFilter(opt.value, pattern, setPattern)
                }
                className={checkboxClass}
              />
              <span className={labelClass}>
                {opt.label}
                {getFacetCount(facets?.pattern, opt.value)}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Color */}
      <Section
        title="Color"
        expanded={expandedSections.color}
        onToggle={() => toggleSection('color')}
      >
        {(() => {
          const visibleColors = COLOR_PALETTE.filter(
            (c) =>
              !facets ||
              color.includes(c.value) ||
              facets.colors?.some((f) => f.value === c.value),
          )
          const showCount = visibleColors.length
          return (
            <>
              <div className="grid grid-cols-3 gap-1.5">
                {visibleColors
                  .slice(
                    0,
                    showAllColors ? showCount : INITIAL_COLOR_COUNT,
                  )
                  .map((c) => {
                    const isSelected = color.includes(c.value)
                    return (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() =>
                          toggleArrayFilter(c.value, color, setColor)
                        }
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-left transition-colors',
                          isSelected
                            ? 'bg-brand-50 ring-1 ring-brand-300'
                            : 'hover:bg-neutral-50',
                        )}
                      >
                        <span
                          className="h-3.5 w-3.5 shrink-0 rounded-sm border border-neutral-200"
                          style={{ backgroundColor: c.hex }}
                          title={c.label}
                        />
                        <span className="font-body truncate text-[10px] leading-tight text-neutral-700">
                          {c.label}
                        </span>
                      </button>
                    )
                  })}
              </div>
              {showCount > INITIAL_COLOR_COUNT && (
                <button
                  type="button"
                  onClick={() => setShowAllColors(!showAllColors)}
                  className="font-display text-brand-600 hover:text-brand-700 mt-2 text-[10px] font-semibold tracking-wider uppercase transition-colors"
                >
                  {showAllColors
                    ? 'Show Less'
                    : `Show All ${showCount} Colors`}
                </button>
              )}
            </>
          )
        })()}
      </Section>

      {/* Temporarily disabled — Size filter
      <Section title="Size" expanded={expandedSections.size} onToggle={() => toggleSection('size')}>
        <div className="space-y-2">
          {SIZE_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2">
              <input type="radio" name="size" checked={size === opt.value}
                onChange={() => setSize(size === opt.value ? '' : opt.value)} className={checkboxClass} />
              <span className={labelClass}>{opt.label}</span>
            </label>
          ))}
        </div>
      </Section>
      */}

      {/* City of Origin */}
      <Section
        title="City of Origin"
        expanded={expandedSections.city}
        onToggle={() => toggleSection('city')}
      >
        <div ref={cityDropdownRef} className="relative">
          <button
            type="button"
            onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
            className={cn(
              'font-body flex h-9 w-full items-center justify-between rounded-lg border bg-white px-3 text-xs outline-none transition-all',
              cityDropdownOpen
                ? 'border-brand-500 ring-2 ring-brand-500/20'
                : 'border-neutral-200 hover:border-neutral-300',
              city ? 'text-neutral-900 font-medium' : 'text-neutral-400',
            )}
          >
            <span className="truncate">
              {city
                ? city === '__unknown__'
                  ? 'Unknown'
                  : city
                : 'All Cities'}
            </span>
            <ChevronDown
              className={cn(
                'h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform',
                cityDropdownOpen && 'rotate-180',
              )}
            />
          </button>

          {cityDropdownOpen && (
            <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
              <div className="max-h-48 overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setCity('')
                  setCityDropdownOpen(false)
                }}
                className={cn(
                  'font-body w-full px-3 py-1.5 text-left text-xs transition-colors first:rounded-t-lg',
                  !city
                    ? 'bg-brand-50 text-brand-700 font-medium'
                    : 'text-neutral-600 hover:bg-neutral-50',
                )}
              >
                All Cities
              </button>
              {(facets?.cities || []).map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    setCity(c.value)
                    setCityDropdownOpen(false)
                  }}
                  className={cn(
                    'font-body flex w-full items-center justify-between px-3 py-1.5 text-left text-xs transition-colors',
                    city === c.value
                      ? 'bg-brand-50 text-brand-700 font-medium'
                      : 'text-neutral-600 hover:bg-neutral-50',
                  )}
                >
                  <span className="truncate">{c.label}</span>
                  {c.count > 0 && (
                    <span className="ml-2 shrink-0 tabular-nums text-[10px] text-neutral-400">
                      {c.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
            </div>
          )}
        </div>
      </Section>

    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="font-display bg-brand-600 hover:bg-brand-700 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-semibold text-white transition-colors lg:hidden"
      >
        <Filter className="h-3.5 w-3.5" />
        Filters
        {activeCount > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-neutral-900">
            {activeCount}
          </span>
        )}
      </button>

      {/* Desktop sidebar */}
      {variant === 'sidebar' && (
        <aside className={cn('hidden lg:block w-48 shrink-0', className)}>
          <div className="sticky top-24">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="font-display text-sm font-semibold tracking-tight text-neutral-900">
                Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearAll}
                  className="font-display text-brand-600 hover:text-brand-700 text-[10px] font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>
            <div className="mt-4">{filterContent}</div>
          </div>
        </aside>
      )}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-display text-sm font-semibold tracking-tight text-neutral-900">
                  Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={handleClearAll}
                    className="font-display text-brand-600 hover:text-brand-700 text-[10px] font-semibold tracking-wider uppercase transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}
    </>
  )
}
