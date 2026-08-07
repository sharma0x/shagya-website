# CLO-38: Product Discovery Enhancements

## Overview

Add missing product filtering UI (color, size from Variants), price range slider widget, filter result counts, and proper pagination. Extend the existing ProductFilters sidebar and API without duplicating filter logic.

## Stack Constraints

- **Frontend**: Next.js 16 App Router, React 19, Tailwind v4, OKLCH tokens, Sora/Public Sans
- **Backend**: Payload 3.x collections, Postgres via @payloadcms/db-postgres
- **State**: URL query params (no client-side state stores for filters)
- **Components**: Server components with Suspense-wrapped client islands
- **API**: REST endpoints using Payload's built-in query builder
- **Design**: OKLCH only, `font-display` (Sora) for headings, `font-body` (Public Sans) for inputs

## OOP / DRY Principles

- Extend existing `ProductFilters` component, do NOT create a parallel filter system
- Add filter params to `buildWhere()` helper — reuse across category + collection pages
- Extract shared `FilterSection` component (already exists in ProductFilters)
- All filter state flows URL → server query → Payload where clause
- No duplicate data fetching — reuse existing `products` endpoint

## Acceptance Criteria

### 1. Color Filter (from Variants)
- [ ] `GET /api/products` accepts `color` param (contains/equals)
- [ ] `buildWhere()` in category + collection pages handles `color` param
- [ ] ProductFilters sidebar has Color section with text input + suggestion chips
- [ ] Variant colors aggregated via sub-query: `payload.find({ collection: 'variants', where: { 'product.id': { in: productIds } } })` — distinct color values shown as chips
- [ ] Color chips shown AFTER initial page load (client-side fetch for distinct colors)

### 2. Size Filter (from Variants)
- [ ] `GET /api/products` accepts `size` param
- [ ] `buildWhere()` handles size by joining via variants sub-query
- [ ] ProductFilters sidebar has Size section with checkboxes (XS-6XL, Free)
- [ ] Size options hardcoded (match Variants collection enum)

### 3. Price Range Slider
- [ ] Replace min/max text inputs with a dual-thumb range slider
- [ ] Slider range: 0 to 100000 INR (step 500)
- [ ] Display selected range as "₹X — ₹Y"
- [ ] Keep existing text inputs as alternative (shown below slider)
- [ ] Slider uses native HTML `<input type="range">` with custom styling via Tailwind

### 4. Filter Counts
- [ ] Each checkbox/radio in ProductFilters shows count in brackets: "Silk (12)"
- [ ] Counts fetched via separate lightweight API call on page load
- [ ] `GET /api/products/facets?fabric=&weave=&pattern=` returns count per filter value
- [ ] Counts respect currently applied filters (dynamic)
- [ ] Only show counts if > 0

### 5. Pagination
- [ ] Add pagination UI below product grid (Prev / Page X of Y / Next)
- [ ] `GET /api/products` already supports `page` and `limit` — expose to UI
- [ ] Category + collection pages pass `page` and `limit` from URL params
- [ ] ProductFilters preserves page param on apply (reset to page 1 on new filters)
- [ ] Show "Showing 1-20 of 150 products"

## Technical Notes

### Files to Create
- `src/app/api/products/facets/route.ts` — lightweight facet counts endpoint
- `src/components/ui/range-slider.tsx` — dual-thumb price slider

### Files to Modify
- `src/components/product/ProductFilters.tsx` — add color, size, slider sections + counts
- `src/app/api/products/route.ts` — add `color`, `size`, `page`, `limit` query params
- `src/app/(frontend)/category/[slug]/page.tsx` — update `buildWhere()`, add pagination
- `src/app/(frontend)/collections/[slug]/page.tsx` — update `buildWhere()`, add pagination

### Variants Join Pattern for Color/Size
```typescript
// In API route: find matching variant product IDs,
// then filter products by those IDs
const variantWhere: any = {}
if (color) variantWhere.color = { equals: color }
if (size) variantWhere.size = { equals: size }
const matchingVariants = await payload.find({
  collection: 'variants',
  where: variantWhere,
  limit: 500,
})
const productIds = [...new Set(matchingVariants.docs.map(v => v.product))]
if (productIds.length > 0) where.id = { in: productIds }
```

### Facets Endpoint Pattern
```typescript
// GET /api/products/facets?fabric=silk&weave=banarasi
// Returns: { fabric: { silk: 15, cotton: 0, ... }, weave: {...}, ... }
// For each filter category, query products with current filters
// and count DISTINCT values using Payload's find() with limit=0
// and manual counting via aggregation or separate queries
```
