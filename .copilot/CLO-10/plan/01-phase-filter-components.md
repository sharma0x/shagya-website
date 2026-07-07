# Phase 1: Filter Components

**Milestone:** Reusable filter primitives built and tested — every individual filter component is a self-contained unit with URL state management.

---

## Overview

This phase establishes the atomic filter components that the sidebar will compose. Each component is a `'use client'` component that reads from and writes to URL searchParams via `useSearchParams()` and `useRouter()`, following the same pattern as the existing `SortSelect` component.

We build four components:

- **FilterSection** — a collapsible wrapper with a heading and chevron toggle
- **CheckboxFilter** — generic multi-select checkbox list for enum-type filters (weave, fabric, pattern, occasion, collection, color)
- **PriceRangeFilter** — two number inputs for min/max price in INR
- **ColorFilter** — checkbox list with color names (can be extended to swatches later)

All components live under `src/components/filters/` and use only existing dependencies (lucide-react, tailwind-merge/clsx, next/navigation, base-ui/react).

### What we'll build

```
src/components/filters/
├── FilterSection.tsx        # Collapsible wrapper
├── CheckboxFilter.tsx        # Multi-select checkbox list
├── PriceRangeFilter.tsx      # Min/max price inputs
├── ColorFilter.tsx           # Color name checkboxes
└── __tests__/                # Vitest tests (optional)
    ├── CheckboxFilter.test.tsx
    └── PriceRangeFilter.test.tsx
```

### Key decisions

| Decision          | Choice                                                    | Rationale                                                                                              |
| ----------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| State management  | URL searchParams via `useSearchParams` + `router.replace` | Follows existing SortSelect pattern; no new dependencies; filter state survives refresh/shares via URL |
| Component library | `@base-ui/react` for checkbox primitives                  | Already installed; accessible out of the box                                                           |
| Collapsible       | `useState` toggle with `ChevronDown` icon rotation        | Simple, no additional dependencies                                                                     |
| Price debounce    | 300ms `setTimeout` on input change                        | Avoids excessive URL updates while typing; doesn't need lodash                                         |
| CSS               | Tailwind v4 `@theme` tokens + OKLCH                       | Follows existing project conventions and .impeccable.md rules                                          |

---

## Checklist

> Track your progress in [`_checklist.md`](./_checklist.md#phase-1-filter-components).

---

## Key Files

| File                                          | Purpose                                                                                        |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `src/components/filters/FilterSection.tsx`    | Collapsible section with heading, chevron toggle, and content slot                             |
| `src/components/filters/CheckboxFilter.tsx`   | Generic multi-select checkbox list — accepts options[], paramName, and optional label renderer |
| `src/components/filters/PriceRangeFilter.tsx` | Two number inputs (min/max) with INR formatting and debounced URL updates                      |
| `src/components/filters/ColorFilter.tsx`      | Checkbox list of color names — passes through to CheckboxFilter with color-specific labels     |

---

## Reference

- [Existing SortSelect pattern](../../../src/components/ui/sort-select.tsx)
- `@base-ui/react` checkbox: https://base-ui.com/react/components/checkbox
- Tailwind v4 OKLCH theme tokens defined in `src/app/globals.css`

---

## Definition of Done

- [ ] FilterSection renders a heading with a chevron that rotates on click to show/hide children
- [ ] CheckboxFilter renders a list of checkboxes from an options array; checking/unchecking updates URL searchParams
- [ ] CheckboxFilter supports multi-select (comma-separated param values)
- [ ] PriceRangeFilter renders min and max inputs; inputs are debounced (300ms) before pushing to URL
- [ ] ColorFilter renders checkbox list of predefined color names; writes to `color` searchParam
- [ ] All components use `'use client'` directive
- [ ] All components compile without TypeScript errors
- [ ] No new dependencies added

---

**Navigation:** ↑ [Overview](./README.md) — **Next →** [Phase 2: FilterSidebar and Mobile Drawer](./02-phase-filtersidebar-and-drawer.md)
