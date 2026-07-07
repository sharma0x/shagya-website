# CLO-10: Add filter sidebar to product listing pages — Implementation Plan

Add a full-featured filter sidebar to all product listing pages on the Shayga saree website, enabling customers to narrow products by price range, weave, fabric, pattern, occasion, color, and collection.

---

## Context

| Document                                                                                              | Purpose                                            |
| ----------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| [Linear Issue](https://linear.app/clow-work/issue/CLO-10/add-filter-sidebar-to-product-listing-pages) | Original issue description and acceptance criteria |
| [Feature Spec](../feature.md)                                                                         | Acceptance criteria and technical notes            |

---

## Architecture

| Diagram                                            | Description                                     |
| -------------------------------------------------- | ----------------------------------------------- |
| [Current Architecture](./_current-architecture.md) | What exists today                               |
| [Target Architecture](./_target-architecture.md)   | Target state with data flow and component graph |

---

## Phase Overview

Each phase builds on the previous one. Complete all checklist items before moving on.

| #   | Phase                                                                     | Milestone                                     | Description                                                                                                |
| --- | ------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | [Filter Components](./01-phase-filter-components.md)                      | Reusable filter primitives built and tested   | Build CheckboxFilter, PriceRangeFilter, ColorFilter, and FilterSection with URL state management           |
| 2   | [FilterSidebar and Mobile Drawer](./02-phase-filtersidebar-and-drawer.md) | Sidebar composed with all filters, responsive | Compose the sidebar, mobile slide-over drawer, active filter chips, clear-all, and count badge             |
| 3   | [Page Integration](./03-phase-page-integration.md)                        | All 3 listing pages use the sidebar           | Refactor category, collections, and search pages with dynamic Payload where queries and updated SortSelect |

---

## Quick Links

- [Linear Issue](https://linear.app/clow-work/issue/CLO-10/add-filter-sidebar-to-product-listing-pages)
- [Master Checklist](./_checklist.md)
- [Phase 1: Filter Components](./01-phase-filter-components.md)
- [Phase 2: FilterSidebar and Mobile Drawer](./02-phase-filtersidebar-and-drawer.md)
- [Phase 3: Page Integration](./03-phase-page-integration.md)
