# CLO-84: Filters — global counts + data-driven rendering

## Overview

Filter facets overhaul: all sections show global product counts and only render options that have actual products in the database.

## Changes
- Data-driven rendering for fabric/weave/pattern sections
- Color section uses facets API instead of static 52-color palette
- Zero-count items hidden across all filter types
- Null facets guard while API loads
- Global counts (not scoped to page context)
- depth:0 on all facets queries (10x faster)
- Fabric/weave deselection URL signal

## Files
- src/components/product/ProductFilters.tsx
- src/app/api/products/facets/route.ts
