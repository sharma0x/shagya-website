# CLO-37: Product filter panel with discount, delivery time, and city of origin

## Overview

Build a comprehensive filter panel (sidebar) for the product listing pages with fabric, weave, pattern, price range, discount, delivery time, and city of origin filters. Add missing schema fields (discountPercentage auto-computed, deliveryTime, cityOfOrigin) and wire everything into the category and collection pages.

## Acceptance Criteria

- [x] Auto-computed `discountPercentage` field on Products (from compareAtPrice/basePrice ratio)
- [x] `deliveryTime` select field on Products (by-tomorrow, within-2-days, within-5-days, within-7-days, 7-plus-days)
- [x] `cityOfOrigin` text field on Products
- [x] Migration for new schema fields
- [x] Updated `/api/products` with `onSale`, `minDiscount`, `deliveryTime`, `city` query params
- [x] `ProductFilters` sidebar component with collapsible sections:
  - Price Range (min/max inputs)
  - Discount (On Sale toggle + 10%/25%/50% off radio chips)
  - Fabric (9 checkboxes, multi-select)
  - Weave (11 checkboxes, multi-select)
  - Pattern (5 checkboxes, multi-select)
  - Delivery Time (radio chips)
  - City of Origin (text search)
  - Apply Filters + Clear All buttons
  - Mobile responsive (slide-out drawer)
- [x] Category page (`/category/[slug]`) updated with sidebar layout + all filters
- [x] Collection page (`/collections/[slug]`) updated with sidebar layout + all filters
- [x] Seed data updated with cityOfOrigin and deliveryTime for all 20 products
- [x] Multi-select filters use comma-separated values in URL params

## Technical Notes

- `discountPercentage` auto-computed in `beforeChange` hook: `Math.round((compareAtPrice - basePrice) / compareAtPrice * 100)`
- Filter state stored in URL query params for server-side rendering
- `ProductFilters` is a client component using `useSearchParams` + `useRouter`
- Sidebar: 240px on desktop, slide-out drawer on mobile
- Category page `buildWhere()` helper reuses filter logic with base category filter
- Collection page `buildWhere()` helper adds collection relationship filter
- Seed `discountPercentage` values are auto-set — no explicit seed data needed
