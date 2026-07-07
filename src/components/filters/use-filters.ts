'use client'

import { useCallback, useMemo } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import type { ActiveFilter } from './types'

const FILTER_LABELS: Record<string, string> = {
  weave: 'Weave',
  fabric: 'Fabric',
  pattern: 'Pattern',
  occasion: 'Occasion',
  color: 'Color',
  collection: 'Collection',
  priceRange_min: 'Min Price',
  priceRange_max: 'Max Price',
}

export function useFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const filterParams = useMemo(() => {
    const params = new Set<string>()
    for (const key of searchParams.keys()) {
      if (key !== 'sort' && key !== 'q') {
        params.add(key)
      }
    }
    return params
  }, [searchParams])

  const activeFilterCount = useMemo(() => {
    let count = 0
    for (const key of filterParams) {
      const value = searchParams.get(key)
      if (value) {
        if (key === 'priceRange_min' || key === 'priceRange_max') {
          count += 1
        } else {
          count += value.split(',').filter(Boolean).length
        }
      }
    }
    return count
  }, [filterParams, searchParams])

  const activeFilters: ActiveFilter[] = useMemo(() => {
    const filters: ActiveFilter[] = []
    for (const key of filterParams) {
      const value = searchParams.get(key)
      if (!value) continue
      const label = FILTER_LABELS[key] ?? key
      if (key === 'priceRange_min') {
        filters.push({
          label: 'Min',
          value: `₹${value}`,
          paramName: key,
        })
      } else if (key === 'priceRange_max') {
        filters.push({
          label: 'Max',
          value: `₹${value}`,
          paramName: key,
        })
      } else {
        const parts = value.split(',').filter(Boolean)
        for (const part of parts) {
          const capitalized = part.charAt(0).toUpperCase() + part.slice(1)
          filters.push({
            label,
            value: capitalized,
            paramName: key,
          })
        }
      }
    }
    return filters
  }, [filterParams, searchParams])

  const getParam = useCallback(
    (name: string): string | null => {
      return searchParams.get(name)
    },
    [searchParams],
  )

  const setParam = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router],
  )

  const removeParam = useCallback(
    (name: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.delete(name)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router],
  )

  const clearAll = useCallback(() => {
    const params = new URLSearchParams()
    const sort = searchParams.get('sort')
    const q = searchParams.get('q')
    if (sort) params.set('sort', sort)
    if (q) params.set('q', q)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [searchParams, pathname, router])

  return {
    getParam,
    setParam,
    removeParam,
    clearAll,
    activeFilterCount,
    activeFilters,
    filterParams,
  }
}
