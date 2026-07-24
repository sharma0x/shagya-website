# CLO-99: Themed arrow buttons for recommendation rows

## Overview

Added left/right navigation arrows to "You May Also Like" and "Recently Viewed" recommendation rows on the product detail page.

## Behavior
- Left arrow visible only when scrolled right (not at extreme left)
- Right arrow visible only when there's more content to the right (not at extreme right)
- Brand-themed: `bg-white/90`, `text-brand-600`, `hover:text-brand-700`, rounded-full with shadow
- Smooth scroll animation on click (220px per click)

## Implementation
- `useRef` on scroll container for scroll position tracking
- `useEffect` with scroll event listener to update arrow visibility
- Arrows positioned absolutely at `-left-3` and `-right-3` (slight overlap with content)
- Items have `px-1` padding so arrows don't overlap images

## Files
- `src/components/product/RecommendationRow.tsx`
