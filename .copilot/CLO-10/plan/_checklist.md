# Master Implementation Checklist

## Phase 1: Filter Components

[↑ Phase Overview](./01-phase-filter-components.md)

### 1.1 FilterSection component

- [ ] Create `src/components/filters/FilterSection.tsx` — collapsible wrapper with heading and chevron toggle icon
- [ ] Chevron rotates 180 degrees when expanded; smooth CSS transition
- [ ] Content area slides open/closed with max-height transition or grid overflow
- [ ] Accepts `title`, `defaultOpen`, `children` props

### 1.2 CheckboxFilter component

- [ ] Create `src/components/filters/CheckboxFilter.tsx` — generic multi-select checkbox list
- [ ] Accepts `options: FilterOption[]`, `paramName: string` props
- [ ] Reads current values from URL searchParams on mount
- [ ] Checked state writes/removes values from comma-separated searchParam via `router.replace`
- [ ] Uses `@base-ui/react` Checkbox primitive for accessibility
- [ ] Supports `label` and `value` fields in FilterOption

### 1.3 PriceRangeFilter component

- [ ] Create `src/components/filters/PriceRangeFilter.tsx` — two number inputs for min/max
- [ ] Reads `priceRange_min` and `priceRange_max` from searchParams
- [ ] 300ms debounce on input change before pushing to URL
- [ ] Indian Rupee formatting hint (placeholder text)
- [ ] Clears param when input is emptied

### 1.4 ColorFilter component

- [ ] Create `src/components/filters/ColorFilter.tsx` — checkbox list of color names
- [ ] Predefined color list: Red, Burgundy, Gold, Green, Blue, Ivory, Pink, Purple, Orange, Black, White, Multicolor
- [ ] Writes to `color` searchParam as comma-separated values
- [ ] Can be backed by CheckboxFilter internally or standalone

### 1.5 Types and exports

- [ ] Create `src/components/filters/types.ts` with `FilterOption` interface (`label: string`, `value: string`)
- [ ] Create barrel export at `src/components/filters/index.ts` (optional, if preferred)

---

## Phase 2: FilterSidebar and Mobile Drawer

[↑ Phase Overview](./02-phase-filtersidebar-and-drawer.md)

### 2.1 useFilters hook

- [ ] Create `src/components/filters/use-filters.ts`
- [ ] Provides `getParam(name): string | null`, `setParam(name, value): void`, `removeParam(name): void`
- [ ] Provides `activeFilterCount: number` — counts non-default params
- [ ] Provides `activeFilters: { label: string, value: string, paramName: string }[]` for filter chips rendering
- [ ] Provides `clearAll(): void` — removes all filter searchParams
- [ ] Uses `useSearchParams()` and `useRouter()` from `next/navigation`

### 2.2 ActiveFilterChips component

- [ ] Create `src/components/filters/ActiveFilterChips.tsx`
- [ ] Renders a horizontal row of chips for each active filter
- [ ] Each chip shows param label + value, with an X button to remove that single filter value
- [ ] "Clear All" button at end of row removes all filters
- [ ] Hidden when no filters are active
- [ ] Styled quietly — small text, neutral background, no competing visual weight

### 2.3 FilterDrawer component

- [ ] Create `src/components/filters/FilterDrawer.tsx`
- [ ] Fixed overlay from left side, covers viewport on mobile/tablet
- [ ] Backdrop with click-to-dismiss
- [ ] Escape key dismisses
- [ ] Body scroll locked when open
- [ ] Accepts `open`, `onClose`, `children` props
- [ ] Follows same pattern as `CartDrawer` at `src/components/cart/CartDrawer.tsx`

### 2.4 FilterSidebar component

- [ ] Create `src/components/filters/FilterSidebar.tsx`
- [ ] Composes all filter sections: Price Range, Weave, Fabric, Pattern, Occasion, Collection, Color
- [ ] Each section wrapped in FilterSection with collapsible toggle
- [ ] Desktop (lg+): renders as sticky sidebar, 280px wide, `top-24` (below header)
- [ ] Mobile/tablet: renders inside FilterDrawer, triggered by "Filters" button
- [ ] "Filters" button shows active filter count badge
- [ ] Collection filter fetches available collections from `/api/collections` on mount
- [ ] Filter options for weave/fabric/pattern/occasion are defined inline (hardcoded lists from the product schema)

### 2.5 Filter option data

- [ ] Define static filter option arrays for: weave (11), fabric (9), pattern (5), occasion (4)
- [ ] Occasion initially hardcoded, designed for future dynamic fetching
- [ ] Collections fetched dynamically from Payload API

---

## Phase 3: Page Integration

[↑ Phase Overview](./03-phase-page-integration.md)

### 3.1 buildWhereClause utility

- [ ] Create `src/lib/filters/build-where-clause.ts`
- [ ] Pure function: `(searchParams: URLSearchParams, baseWhere?: Where) => Where`
- [ ] Maps `weave` → `weave: { in: [...] }`
- [ ] Maps `fabric` → `fabric: { in: [...] }`
- [ ] Maps `pattern` → `pattern: { in: [...] }`
- [ ] Maps `occasion` → `occasion: { in: [...] }`
- [ ] Maps `color` → `color: { in: [...] }` (placeholder for now)
- [ ] Maps `collection` → `collections: { in: [...] }` (resolves slugs to IDs if needed)
- [ ] Maps `priceRange_min` → `basePrice: { greater_than_equal: value }`
- [ ] Maps `priceRange_max` → `basePrice: { less_than_equal: value }`
- [ ] Merges with baseWhere (e.g., `status: { equals: 'published' }`)
- [ ] Only includes params that are present in the URL

### 3.2 SortSelect update

- [ ] Update `src/components/ui/sort-select.tsx` to accept a generic `preserveParams` string
- [ ] Current implementation already has `preserveParams` prop but only passes `weave=` value
- [ ] Update to pass the full query string of all active filter params
- [ ] Ensure sort change preserves all filters, not just weave

### 3.3 Category page refactor

- [ ] Remove hardcoded weave filter chips (All, Banarasi, Kanchipuram, Chanderi)
- [ ] Import and render `FilterSidebar` component
- [ ] Use `buildWhereClause` for dynamic where clause from searchParams
- [ ] Add responsive layout: sidebar + grid on desktop, filter button + grid on mobile
- [ ] Render `ActiveFilterChips` above the product grid
- [ ] Replace static `?sort=...&weave=...` links with dynamic filter-sidebar-driven state

### 3.4 Collections page refactor

- [ ] Import and render `FilterSidebar` component
- [ ] Use `buildWhereClause` with base where `collections: { contains: collection.id }`
- [ ] Add responsive layout: sidebar + grid on desktop, filter button + grid on mobile
- [ ] Render `ActiveFilterChips` above the product grid

### 3.5 Search page refactor

- [ ] Import and render `FilterSidebar` component (only when product results exist)
- [ ] When filter params are present, bypass FTS and query `payload.find({ collection: 'products', where: { ...buildWhereClause, name: { like: q } } })`
- [ ] When no filter params, keep existing FTS behavior
- [ ] Add responsive layout: sidebar + grid on desktop, filter button + grid on mobile
- [ ] Render `ActiveFilterChips` above the product grid
