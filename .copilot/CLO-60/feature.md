# CLO-60: Product card redesign + data-driven filter rendering

## Overview

Redesigned product cards with 3D hover effects, gallery carousels, and removed action buttons. Converted all filter sections to render only options with actual products via facets API data.

## Product Card Changes

### Removed
- Add to Cart and Buy Now buttons from all variants (grid, compact, row)
- `showActions` prop and `ProductCardActions` import
- `StockBadge` unused import

### Added
- 3D hover effect: `perspective:800px`, `rotateY(-2deg) translateZ(8px)`, shadow lift
- Hover-based gallery carousel: dot indicators appear on card hover, hover a dot to preview that gallery image (no auto-play)
- All gallery images pre-rendered with opacity transition, first image gets `priority`
- Mouse leave resets to first gallery image
- Component converted to `'use client'` with `useState` for active image index

### Adjusted
- Image aspect ratio: `4/5` → `3/4` (reduced height)
- Name font: `text-[10px]` → `text-[11px]`
- Price min-height: `34px` → `28px`
- Added `bg-white` info panel with `rounded-b-lg`
- Grid gaps increased: `gap-x-2 gap-y-4` → `gap-x-3 gap-y-5` on mobile
- `rounded-md` → `rounded-lg` on image container
- Removed `[transform-style:preserve-3d]` that broke wishlist z-index

### Fixes
- WishlistButton: added `cursor-pointer`
- Hydration warning: added `suppressHydrationWarning` to body

## Filter Data-Driven Rendering

### Fabric / Weave / Pattern
Each section now filters options to only show:
- Options present in the facets API response (have actual products in current scope), OR
- Options currently selected by the user

```tsx
FABRIC_OPTIONS
  .filter(opt => fabric.includes(opt.value) || facets?.fabric?.some(f => f.value === opt.value))
  .map(...)
```

### Color
Replaced static `COLOR_PALETTE` rendering with facets-driven list. Colors are filtered to only those appearing in `facets.colors` or currently selected. Hex values still sourced from `COLOR_PALETTE`.

### Effect
On `/category/silk`, only fabrics/weaves/patterns/colors that have silk products appear. Zero-count items are never rendered.

## Files Changed

| File | Change |
|---|---|
| `src/components/product/ProductCard.tsx` | Major refactor: client component, gallery carousel, 3D hover, removed actions |
| `src/components/product/WishlistButton.tsx` | Added cursor-pointer |
| `src/components/product/ProductFilters.tsx` | Data-driven filter rendering for fabric/weave/pattern/color |
| `src/components/product/RecommendationRow.tsx` | Removed showActions prop |
| `src/app/(frontend)/category/[slug]/page.tsx` | Removed showActions, increased grid gaps |
| `src/app/(frontend)/collections/[slug]/page.tsx` | Removed showActions, increased grid gaps |
| `src/app/(frontend)/search/page.tsx` | Increased grid gaps |
| `src/app/(frontend)/layout.tsx` | Added suppressHydrationWarning |
