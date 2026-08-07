# CLO-52: Fix product card sizing consistency

## Overview

Product cards are rendered inline with slightly different dimensions across homepage, category, and search pages. The category page has a rounded-none bug. Extract a reusable ProductCard component with standardized sizing.

## Acceptance Criteria

- [ ] Extract ProductCard component to `src/components/product/ProductCard.tsx`
- [ ] Standardize 3:4 image aspect ratio across all pages
- [ ] Fix rounded corners on category page (currently rounded-none)
- [ ] Unify font sizes: title (text-sm), subtitle (text-xs), price (text-sm)
- [ ] Consistent padding/spacing between image and text content
- [ ] Homepage uses ProductCard component
- [ ] Category page uses ProductCard component
- [ ] Wishlist button overlay consistent across pages
- [ ] No visual regression

## Technical Notes

- New file: `src/components/product/ProductCard.tsx`
- Update: `src/app/(frontend)/page.tsx` — replace inline cards
- Update: `src/app/(frontend)/category/[slug]/page.tsx` — replace inline cards
- Image panel: `aspect-[3/4]`, `rounded-xl`, hover lift `-translate-y-1`
