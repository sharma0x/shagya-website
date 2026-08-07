# CLO-100: Recommendation cards match homepage product card style

## Overview

Replaced the listing-style ProductCard in recommendation rows with a lightweight inline homepage-style card matching the landing page visual design.

## Changes
- Cards now use `SkeletonImage` (homepage pattern) instead of `Image` with gallery carousel
- Title: `text-sm font-semibold text-brand-950 hover:text-brand-700` (matches homepage)
- Price: `text-sm font-semibold text-brand-700` with strikethrough in `text-brand-700/40`
- Auto-detected badges: SALE (if discount exists), Bestseller (if purchaseCount > 5)
- Discount red pill overlay on image (bottom-left)
- WishlistButton + ProductBadge overlays (top-right/top-left)
- Hover: translateY lift + shadow

## Files
- `src/components/product/RecommendationRow.tsx`
