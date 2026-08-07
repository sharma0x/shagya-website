# CLO-83: Product filter UX overhaul

## Overview

Redesigned the product listing sidebar filters with city-of-origin dropdown, auto-apply, narrower layout, and consistent reset behavior.

## Changes

### City of Origin dropdown
- Replaced free-text `<input>` with dynamic `<select>` populating from `/api/products/facets`
- City facets computed from all filters except city itself (dropdown always shows options)
- "Unknown" option for products with no cityOfOrigin set
- Context-aware: on `/category/silk`, only silk-product cities shown (via `contextFilter` prop)
- Brand-themed custom dropdown: wine/maroon focus ring, chevron rotation, selected state highlight
- Switch from `contains` (fuzzy) to `equals` (exact) match across all query sites

### Auto-apply filters
- Removed "Apply Filters" button — all filters apply on change with 300ms debounce
- Price inputs debounced to avoid navigating mid-typing
- Discount radio: `onClick` handler for deselect on re-click (browser `onChange` doesn't fire on already-checked radio)

### Width reduction
- Sidebar: `w-60` → `w-48` in ProductFilters + Suspense fallbacks on category/collections pages

### Clear / Reset consistency
- Removed duplicate Clear All button (kept one in sidebar header)
- Added Clear All to mobile overlay
- "Clear All" does immediate `router.push(pathname)` — fully resets slider + inputs
- "Reset Filters" (empty state link) forces ProductFilters remount via `key={'clean'}` when URL has zero params
- RangeSlider forced remount on clear via `sliderResetKey` ref
- `cursor-pointer` on Clear All button

### Other
- Removed delivery time filter section entirely
- Fixed React unmounted state update warning with `isMountedRef` in `fetchFacets`
- Registered missing migration `20260719` creating `site_settings_rels` join table

## Files Changed

| File | Change |
|---|---|
| `src/components/product/ProductFilters.tsx` | Major refactor: city dropdown, auto-apply, width, reset logic |
| `src/app/api/products/facets/route.ts` | Added `cities: FacetCount[]` + `__unknown__` handling |
| `src/app/(frontend)/category/[slug]/page.tsx` | `contextFilter` prop, fabric/weave arrays → module scope, `key` for remount |
| `src/app/(frontend)/collections/[slug]/page.tsx` | `contains` → `equals` + `__unknown__`, `key` for remount, narrower fallback |
| `src/app/api/products/route.ts` | `contains` → `equals` + `__unknown__` |
| `src/migrations/index.ts` | Registered 20260719 migration |
| `scripts/seed-city-origin.ts` | Direct SQL seed script |
