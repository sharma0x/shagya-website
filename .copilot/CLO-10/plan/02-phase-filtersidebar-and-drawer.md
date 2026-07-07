# Phase 2: FilterSidebar and Mobile Drawer

**Milestone:** Filter sidebar composed with all filter sections, responsive layout (desktop sticky sidebar, mobile slide-over drawer), active filter chips, clear-all, and filter count badge.

---

## Overview

This phase composes the atomic components from Phase 1 into a complete `FilterSidebar` component. It handles:

- **Desktop layout** — a sticky sidebar (280px wide) pinned to the left of the product grid
- **Mobile/tablet layout** — a "Filters" button with count badge that opens a slide-over drawer from the left (following the `CartDrawer` pattern at `src/components/cart/CartDrawer.tsx`)
- **Active filter chips** — render above the product grid showing each active filter as a removable chip, plus a "Clear All" button
- **Filter context** — a provider/hook pattern (`useFilters`) that centralizes reading/writing searchParams so all filter components share the same URL state consistently

The sidebar includes all filter sections in a logical order: Price Range, Weave, Fabric, Pattern, Occasion, Collection, Color. Each section is collapsible via FilterSection.

### What we'll build

```
src/components/filters/
├── FilterSidebar.tsx         # Main sidebar (composes all filter sections)
├── ActiveFilterChips.tsx     # Removable chips above product grid
├── FilterDrawer.tsx          # Mobile slide-over drawer (wrapper)
├── use-filters.ts            # Hook: reads/writes searchParams, provides active filter state
└── types.ts                  # Shared types for filter config, option shapes
```

### Key decisions

| Decision            | Choice                                               | Rationale                                              |
| ------------------- | ---------------------------------------------------- | ------------------------------------------------------ |
| Drawer pattern      | Same as CartDrawer (fixed overlay, slide from left)  | Consistent UX; reuses existing CSS/animation approach  |
| Active filter chips | URL-driven, derived from searchParams                | Single source of truth; no duplicate state             |
| Filter count        | Derived from non-default searchParam entries         | Auto-calculated, no manual tracking                    |
| useFilters hook     | Custom hook wrapping `useSearchParams` + `useRouter` | Centralizes URL mutation logic; keeps components clean |
| Collection options  | Fetch from Payload REST API on mount                 | Dynamic; always reflects current CMS state             |

---

## Checklist

> Track your progress in [`_checklist.md`](./_checklist.md#phase-2-filtersidebar-and-mobile-drawer).

---

## Key Files

| File                                           | Purpose                                                                            |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| `src/components/filters/use-filters.ts`        | Custom hook for reading/writing filter searchParams, computing active filter count |
| `src/components/filters/types.ts`              | FilterOption, FilterConfig types                                                   |
| `src/components/filters/ActiveFilterChips.tsx` | Row of removable filter chips + Clear All button                                   |
| `src/components/filters/FilterDrawer.tsx`      | Mobile slide-over drawer with backdrop                                             |
| `src/components/filters/FilterSidebar.tsx`     | Main sidebar: composes all filter sections + responsive layout logic               |

---

## Reference

- CartDrawer pattern at `src/components/cart/CartDrawer.tsx`
- `useSearchParams`: https://nextjs.org/docs/app/api-reference/functions/use-search-params
- `base-ui` dialog/drawer primitives

---

## Definition of Done

- [ ] FilterSidebar renders all 7 filter sections (Price Range, Weave, Fabric, Pattern, Occasion, Collection, Color) using FilterSection and atomic filter components
- [ ] Desktop (lg+): sidebar is sticky, 280px wide, sits next to product grid
- [ ] Mobile/tablet: "Filters" button with active count badge opens a left-sliding drawer; drawer has backdrop overlay
- [ ] ActiveFilterChips renders above the product grid with individual removable chips and a "Clear All" button
- [ ] useFilters hook centralizes searchParams read/write and provides active filter count
- [ ] Collection filter fetches available collections from Payload REST API on mount
- [ ] Clear All removes all filter params and resets to base URL
- [ ] Mobile drawer dismisses on backdrop click and Escape key
- [ ] No TypeScript errors
- [ ] No new dependencies added

---

**Navigation:** [← Phase 1: Filter Components](./01-phase-filter-components.md) — ↑ [Overview](./README.md) — **Next →** [Phase 3: Page Integration](./03-phase-page-integration.md)
