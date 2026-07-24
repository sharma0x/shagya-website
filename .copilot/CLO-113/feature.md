# CLO-113: Fix back-in-stock notification + wishlist brand button

## Overview

Fixed the back-in-stock email notification that never fired, and styled the Move to Bag button with brand color.

## Back-in-stock fix
- Changed hook query from `wishlist_items` (array sub-table) to `wishlist` with `items.product` filter
- Customer email now accessed via `wishlist.customer.email` (depth 1) instead of broken `item.wishlist?.customer?.email` chain
- The previous path never worked because `wishlist` is not a property on `wishlist_items` documents

## Move to Bag button
- Changed from `bg-neutral-900` to `bg-brand-600 hover:bg-brand-700` (wine theme color)
- Consistent with other brand CTAs across the site

## Files
- `src/collections/Products.ts`
- `src/app/(frontend)/wishlist/page.tsx`
