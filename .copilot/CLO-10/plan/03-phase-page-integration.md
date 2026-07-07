# Phase 3: Page Integration

**Milestone:** All three product listing pages use the FilterSidebar with dynamic Payload `where` clause building, and SortSelect preserves all active filter params.

---

## Overview

This phase wires the FilterSidebar into the three product listing pages and updates the server-side query logic to build dynamic Payload `where` clauses from searchParams. It also fixes the existing `SortSelect` so changing the sort order doesn't clear active filters.

Three pages need modification:

1. **`/category/[slug]`** — replace hardcoded weave filter chips with FilterSidebar; build dynamic where from all searchParams
2. **`/collections/[slug]`** — add FilterSidebar alongside existing collection filter; build dynamic where
3. **`/search`** — add FilterSidebar; when filters are active, bypass FTS and query the products collection directly with search term + filters

A shared utility `buildWhereClause` is created to transform URL searchParams into Payload-compatible `where` objects, keeping the page components clean.

### What we'll build

```
src/
├── lib/
│   └── filters/
│       └── build-where-clause.ts    # Shared utility: searchParams → Payload where object
├── components/ui/
│   └── sort-select.tsx              # Updated: preserves all filter params, not just weave
├── app/(frontend)/
│   ├── category/[slug]/page.tsx     # Refactored: uses FilterSidebar + dynamic where
│   ├── collections/[slug]/page.tsx  # Refactored: uses FilterSidebar + dynamic where
│   └── search/page.tsx              # Refactored: uses FilterSidebar + fallback query
```

### Key decisions

| Decision                 | Choice                                                                  | Rationale                                                                                                 |
| ------------------------ | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Where clause builder     | Pure function in `src/lib/filters/`                                     | Testable, shared across all pages, keeps server components clean                                          |
| Search page filter logic | Bypass FTS when any filter param is present                             | FTS doesn't support structured where clauses; fall back to `name: { like: q }` on the products collection |
| Collections page         | Append filter where clauses to existing `collections: { contains: id }` | Preserves collection scoping while adding user filters                                                    |
| Param-to-where mapping   | Single `switch`/map in buildWhereClause                                 | Centralized and easy to extend for new filters                                                            |
| SortSelect update        | Accept a `filterParams` string that gets appended                       | Minimal change; component already supports `preserveParams` prop                                          |

---

## Checklist

> Track your progress in [`_checklist.md`](./_checklist.md#phase-3-page-integration).

---

## Key Files

| File                                             | Purpose                                                                             |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `src/lib/filters/build-where-clause.ts`          | Transforms searchParams into Payload `where` object for products collection queries |
| `src/components/ui/sort-select.tsx`              | Updated to accept and preserve all filter params (not just weave)                   |
| `src/app/(frontend)/category/[slug]/page.tsx`    | Refactored with FilterSidebar, dynamic where, removed hardcoded weave chips         |
| `src/app/(frontend)/collections/[slug]/page.tsx` | Refactored with FilterSidebar, dynamic where                                        |
| `src/app/(frontend)/search/page.tsx`             | Refactored with FilterSidebar, fallback query when filters active                   |

---

## Reference

- Payload query operators: https://payloadcms.com/docs/queries/operators
- `SearchParams` handling: https://nextjs.org/docs/app/api-reference/functions/use-search-params
- Existing `where` clause building in category page for reference

---

## Definition of Done

- [ ] buildWhereClause function correctly maps searchParams (weave, fabric, pattern, occasion, color, collection, priceRange_min, priceRange_max) to Payload where operators
- [ ] Category page removes hardcoded weave chips; uses FilterSidebar and buildWhereClause instead
- [ ] Collections page adds FilterSidebar and filters within the collection scope
- [ ] Search page shows FilterSidebar only when product results exist; bypasses FTS when filter params are present
- [ ] SortSelect preserves all active filter params when changing sort order
- [ ] All three pages compile without TypeScript errors
- [ ] Active filter chips render above the product grid on all three pages
- [ ] Filter state is fully represented in the URL — page is shareable with filters intact
- [ ] buildWhereClause unit tests pass (if tests are added)

---

**Navigation:** [← Phase 2: FilterSidebar and Mobile Drawer](./02-phase-filtersidebar-and-drawer.md) — ↑ [Overview](./README.md)
