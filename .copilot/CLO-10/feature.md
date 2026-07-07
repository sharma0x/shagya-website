# CLO-10: Add filter sidebar to product listing pages

## Overview

Add a filter sidebar (left-aligned) to all product listing pages (`/category/[slug]`, `/collections/[slug]`, `/search`) with collapsible sections for Price Range, Weave, Fabric, Pattern, Occasion, Collection, and Color. All filter state driven by URL searchParams. Desktop: sticky sidebar (280px). Mobile: slide-over drawer. Active filter chips above the product grid with individual removal and "Clear All".

## Acceptance Criteria

- [ ] FilterSidebar client component with 7 collapsible filter sections
- [ ] All filter state managed via URL searchParams (no Zustand/Redux)
- [ ] Desktop (lg+): sticky sidebar, 280px wide, next to product grid
- [ ] Mobile/tablet: "Filters" button with active count badge opens left-sliding drawer
- [ ] Active filter chips above product grid (individually removable) + "Clear All"
- [ ] Category page uses FilterSidebar and dynamic Payload where clause
- [ ] Collections page uses FilterSidebar within collection scope
- [ ] Search page uses FilterSidebar (bypasses FTS when filters active)
- [ ] SortSelect preserves all active filter params when changing sort
- [ ] All components follow brand rules (OKLCH colors, quiet visual weight, Sora/Public Sans)

## Technical Notes

- Follow `SortSelect` pattern for URL state management
- `Filter` icon from lucide-react is already imported (unused) in category page
- No new dependencies required
- Use `@base-ui/react` for accessible primitives
