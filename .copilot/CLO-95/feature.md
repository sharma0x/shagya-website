# CLO-95: Product card — homepage-style visuals + auto-rotate carousel

## Overview

Updated product listing card to match homepage card styling with auto-rotating gallery carousel.

## Changes

### Visual styling (matches homepage card)
- Title: non-truncated, `text-sm font-semibold text-brand-950 hover:text-brand-700`
- Price: `text-sm font-semibold text-brand-700`
- Strikethrough: `text-xs text-brand-700/40`
- Discount tag: red pill overlay on image `bg-red-500/90` (bottom-left), removed from inline text
- Badge: `ProductBadge` auto-detected — SALE if discount, Bestseller if purchaseCount > 5 (top-left)

### Auto-rotate carousel
- Images auto-rotate every 1.5s when card is hovered
- Pauses when user hovers a navigation dot
- Resumes when user moves away from the dot
- Resets to first image on mouse leave

### Kept
- White bg info section
- No weave/fabric display (filters already show this)
- 3D hover effect + dot navigation

## Files
- `src/components/product/ProductCard.tsx`
