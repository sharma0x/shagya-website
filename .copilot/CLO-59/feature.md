# CLO-59: Context-aware filter facets

## Overview

All filter facets (fabric, weave, pattern, colors, cities) now show counts scoped to the current category page context. Previously only city facets were context-aware; other facets showed `0` for non-selected options due to self-filter bias.

## How it works

Each facet type is queried without its own filter, while keeping all other filters as scope:

- **Fabric counts**: queried without fabric filter → shows counts for all fabrics regardless of current category
- **Weave counts**: queried without weave filter → shows weave counts for current scope (e.g., silk products only)
- **Pattern counts**: queried without pattern filter → shows pattern counts for current scope
- **City counts**: queried without city filter → shows city counts for current scope (already existed)
- **Color counts**: already scoped via product variant sub-query

### Example

On `/category/silk` with no other filters:
- Fabric: Silk (10), Cotton (5), Linen (3) — all fabric types shown
- Weave: Banarasi (3), Kanchipuram (1) — only weaves with silk products
- City: Varanasi (2), Kanchipuram (1) — only cities with silk products

Previously on `/category/silk`:
- Fabric: Silk (10), Cotton (0), Linen (0) — useless, all non-silk showed 0

## Implementation

4 parallel queries via `Promise.all` — each returns products for one facet type minus that type's filter. Then counts are computed from each result set.

### File
`src/app/api/products/facets/route.ts` — replaced single `allProducts` query with per-facet parallel queries
