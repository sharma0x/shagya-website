'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Filter, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const DELIVERY_OPTIONS = [
  { label: 'By Tomorrow', value: 'by-tomorrow' },
  { label: 'Within 2 Days', value: 'within-2-days' },
  { label: 'Within 5 Days', value: 'within-5-days' },
  { label: 'Within 7 Days', value: 'within-7-days' },
  { label: '7+ Days', value: '7-plus-days' },
]

const DISCOUNT_OPTIONS = [
  { label: '10%+ OFF', value: '10' },
  { label: '25%+ OFF', value: '25' },
  { label: '50%+ OFF', value: '50' },
]

const checkboxClass = cn(
  'accent-brand-600 h-3.5 w-3.5 rounded border-neutral-300',
  'cursor-pointer',
)

const labelClass = cn(
  'cursor-pointer select-none text-xs',
  'group-hover:text-neutral-800 transition-colors',
)

interface ProductFiltersProps {
  variant?: 'sidebar' | 'vertical'
  className?: string
  preserveParams?: string
}

export function ProductFilters({
  variant = 'sidebar',
  className,
  preserveParams = '',
}: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const getParamArray = (key: string): string[] => {
    const val = searchParams.get(key)
    return val ? val.split(',') : []
  }

  const [mobileOpen, setMobileOpen] = useState(false)

  // Local state initialized from URL
  const [fabric, setFabric] = useState<string[]>(getParamArray('fabric'))
  const [weave, setWeave] = useState<string[]>(getParamArray('weave'))
  const [pattern, setPattern] = useState<string[]>(getParamArray('pattern'))
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [onSale, setOnSale] = useState(searchParams.get('onSale') === 'true')
  const [minDiscount, setMinDiscount] = useState(
    searchParams.get('minDiscount') || '',
  )
  const [deliveryTime, setDeliveryTime] = useState(
    searchParams.get('deliveryTime') || '',
  )
  const [city, setCity] = useState(searchParams.get('city') || '')

  // Sections that can be collapsed
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    price: true,
    fabric: true,
    weave: true,
    pattern: true,
    discount: true,
    delivery: true,
    city: true,
  })

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const toggleArrayFilter = useCallback(
    (
      value: string,
      current: string[],
      setter: (v: string[]) => void,
    ) => {
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
    if (deliveryTime) params.set('deliveryTime', deliveryTime)
    if (city) params.set('city', city)
    if (preserveParams) {
      const preserve = new URLSearchParams(preserveParams)
      preserve.forEach((v, k) => {
        if (!params.has(k)) params.set(k, v)
      })
    }
    return params.toString()
  }, [
    fabric,
    weave,
    pattern,
    minPrice,
    maxPrice,
    onSale,
    minDiscount,
    deliveryTime,
    city,
    preserveParams,
  ])

  const handleApply = () => {
    const query = buildQuery()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const handleClearAll = () => {
    setFabric([])
    setWeave([])
    setPattern([])
    setMinPrice('')
    setMaxPrice('')
    setOnSale(false)
    setMinDiscount('')
    setDeliveryTime('')
    setCity('')
    router.push(preserveParams ? `${pathname}?${preserveParams}` : pathname)
  }

  const hasActiveFilters =
    fabric.length > 0 ||
    weave.length > 0 ||
    pattern.length > 0 ||
    minPrice ||
    maxPrice ||
    onSale ||
    minDiscount ||
    deliveryTime ||
    city

  const filterContent = (
    <div className="space-y-6">
      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between">
          <span className="font-body text-xs text-neutral-500">
            {[
              fabric.length && `${fabric.length} fabric`,
              weave.length && `${weave.length} weave`,
              pattern.length && `${pattern.length} pattern`,
              onSale && 'On Sale',
              minDiscount && `≥${minDiscount}% off`,
              deliveryTime && DELIVERY_OPTIONS.find((d) => d.value === deliveryTime)?.label,
              city && `"${city}"`,
            ]
              .filter(Boolean)
              .join(', ')}
          </span>
          <button
            onClick={handleClearAll}
            className="font-display text-brand-600 hover:text-brand-700 text-[10px] font-semibold tracking-wider uppercase transition-colors"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Price Range */}
      <Section
        title="Price Range"
        expanded={expandedSections.price}
        onToggle={() => toggleSection('price')}
      >
        <div className="flex items-center gap-2">
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
            <label key={opt.value} className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="minDiscount"
                checked={minDiscount === opt.value}
                onChange={() =>
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
          {FABRIC_OPTIONS.map((opt) => (
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
              <span className={labelClass}>{opt.label}</span>
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
          {WEAVE_OPTIONS.map((opt) => (
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
              <span className={labelClass}>{opt.label}</span>
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
          {PATTERN_OPTIONS.map((opt) => (
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
              <span className={labelClass}>{opt.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Delivery Time */}
      <Section
        title="Delivery Time"
        expanded={expandedSections.delivery}
        onToggle={() => toggleSection('delivery')}
      >
        <div className="space-y-2">
          {DELIVERY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex cursor-pointer items-center gap-2"
            >
              <input
                type="radio"
                name="deliveryTime"
                checked={deliveryTime === opt.value}
                onChange={() =>
                  setDeliveryTime(deliveryTime === opt.value ? '' : opt.value)
                }
                className={checkboxClass}
              />
              <span className={labelClass}>{opt.label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* City of Origin */}
      <Section
        title="City of Origin"
        expanded={expandedSections.city}
        onToggle={() => toggleSection('city')}
      >
        <input
          type="text"
          placeholder="e.g. Varanasi, Kanchipuram"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="font-body focus:border-brand-500 h-8 w-full rounded-lg border border-neutral-200 px-2 text-xs outline-none placeholder:text-neutral-300"
        />
      </Section>

      {/* Apply Button */}
      <button
        onClick={handleApply}
        className="bg-brand-600 hover:bg-brand-700 font-display flex h-10 w-full items-center justify-center rounded-xl text-xs font-semibold text-white transition-all active:scale-95"
      >
        Apply Filters
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="font-display bg-brand-600 hover:bg-brand-700 inline-flex h-10 items-center gap-2 rounded-xl px-4 text-xs font-semibold text-white transition-colors lg:hidden"
      >
        <Filter className="h-3.5 w-3.5" />
        Filters
        {hasActiveFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-neutral-900">
            {fabric.length + weave.length + pattern.length + (onSale ? 1 : 0) + (minDiscount ? 1 : 0) + (deliveryTime ? 1 : 0) + (city ? 1 : 0)}
          </span>
        )}
      </button>

      {/* Sidebar — desktop */}
      {variant === 'sidebar' && (
        <aside className={cn('hidden lg:block w-60 shrink-0', className)}>
          <div className="sticky top-24">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h3 className="font-display text-sm font-semibold tracking-tight text-neutral-900">
                Filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearAll}
                  className="font-display text-brand-600 hover:text-brand-700 text-[10px] font-semibold tracking-wider uppercase transition-colors"
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
              <h3 className="font-display text-sm font-semibold tracking-tight text-neutral-900">
                Filters
              </h3>
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
