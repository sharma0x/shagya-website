# CLO-110: OOS filter toggle on category/collection/search pages

## Overview

Added "Exclude Out of Stock" checkbox to the filter sidebar. When checked, only products with quantity > 0 are shown.

## Implementation
- Filter UI: checkbox in the Discount section
- State: `excludeOOS` read/written to URL as `?excludeOOS=true`
- `buildWhere` on category, collection, and search pages: adds `trackQuantity: true + quantity > 0` when toggled
- Auto-applies like all other filters (no Apply button needed)

## Files
- `src/components/product/ProductFilters.tsx`
- `src/app/(frontend)/category/[slug]/page.tsx`
- `src/app/(frontend)/collections/[slug]/page.tsx`
