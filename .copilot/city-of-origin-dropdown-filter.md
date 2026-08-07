# City of Origin Dropdown Filter

## Feature Overview

Converted the City of Origin filter from a free-text `<input>` to a `<select>` dropdown populated dynamically from real product data, with context-aware scoping based on the current category page.

## Files Changed

| File | Change |
|---|---|
| `src/components/product/ProductFilters.tsx` | Text input → `<select>` dropdown with city facets; added `contextFilter` prop |
| `src/app/api/products/facets/route.ts` | Added `cities: FacetCount[]` to response; city facets computed from all filters except city itself; `__unknown__` entry for products with null cityOfOrigin |
| `src/app/(frontend)/category/[slug]/page.tsx` | Passes `contextFilter={{ fabric: slug }}` or `{ weave: slug }` to ProductFilters based on slug type; `contains` → `equals` + `__unknown__` handling |
| `src/app/(frontend)/collections/[slug]/page.tsx` | `contains` → `equals` + `__unknown__` handling |
| `src/app/api/products/route.ts` | `contains` → `equals` + `__unknown__` handling |
| `src/migrations/index.ts` | Registered migration 20260719 (site_settings_rels join table) |
| `scripts/seed-city-origin.ts` | Direct SQL approach to populate cityOfOrigin on test products |

## Behavior

- **With context** (e.g. `/category/silk`): dropdown shows only cities of silk products
- **Without context** (e.g. search page): dropdown shows cities of all products
- **"Unknown" option**: products with null/empty cityOfOrigin are grouped under "Unknown"
- **Operation changed**: `contains` (fuzzy) → `equals` (exact match) across all query sites
- **City facets**: always computed without the selected city filter, so the dropdown remains usable regardless of current selection

## Testing

1. Visit `/category/silk` → City dropdown shows only silk-product cities
2. Select a city → products filter by exact match
3. Select "All Cities" → shows all products in that category
4. Select "Unknown" → shows products with no cityOfOrigin set
5. Visit `/api/products/facets?fabric=silk` → response includes `cities: [...]`

## Linear

CLO-57: City of Origin filter — replace text input with dropdown from dynamic facets
