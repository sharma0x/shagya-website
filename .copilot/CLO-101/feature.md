# CLO-101: PDP spacing polish + centered recommendation arrows

## Overview

Refined product detail page spacing for consistent premium visual rhythm.

## Changes

### Specs section bottom padding
- Added `pb-12` to Details/Specifications container
- Previously no bottom padding created double-border effect with "You May Also Like" RecommendationRow
- Now has breathing room between sections

### Reviews section standardization
- Changed from `py-14 sm:py-16 md:py-20` (80px desktop) to `py-12` (48px, consistent)
- Added `border-t border-neutral-200` separator matching all other PDP sections
- Every section now follows the same 12px vertical rhythm

### Recommendation arrows center alignment
- Changed arrow position from `top-1/2` (full row center) to `top-[42%]` (image center)
- Arrows now visually centered on product images rather than the combined title+cards height

## Files
- `src/app/(frontend)/products/[slug]/page.tsx`
- `src/components/product/ProductReviews.tsx`
- `src/components/product/RecommendationRow.tsx`
