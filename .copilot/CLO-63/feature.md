# CLO-63: Filters — global counts + data-driven rendering

## Overview

Filter facets overhaul: all filter sections now show global product counts (not scoped to page context), and only render options that have actual products in the database.

## Data-driven rendering
- Fabric/Weave/Pattern: options are filtered to only show items present in facets API response (count > 0) OR currently selected
- Color: renders from facets.colors API instead of static 52-color palette
- City: already data-driven from facets API
- Zero-count items hidden across all filter types
- Null facets guard: show all options while API loads

## Global counts
- Facets no longer scoped to page context
- On /category/silk: fabric checkboxes show ALL fabrics with products (not just silk)
- Weave/pattern/city/color counts are still scoped to active filters
- Remove contextFilter merging from fetchFacets

## Performance
- depth:0 on all facets queries (10x faster — skip expensive LATERAL JOINs)
- Color variants seeded for 5 silk products

## Navigation signal
- Fabric/weave deselection on context pages sends empty URL param to prevent slug default re-applying

## Files
- src/components/product/ProductFilters.tsx
- src/app/api/products/facets/route.ts
- src/app/(frontend)/category/[slug]/page.tsx
