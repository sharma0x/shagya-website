# CLO-93: Wishlist — fix Move to Bag bypassing Zustand store

## Overview

Fixed Move to Bag removing from wishlist but not updating cart UI.

## Root cause
`handleMoveToCart` directly POSTed to `/api/cart` (DB updated) but never updated the client-side Zustand `useCart` store. CartDrawer and Header badge read from Zustand — showed empty.

## Fix
- Imported `useCart` from `@/lib/store/cart`
- Replaced manual GET/POST chain with `useCart().addItem(product, 1)`
- `addItem` updates Zustand store + localStorage + server sync in one call
- Wishlist removal API call and local state update preserved

## Files
- `src/app/(frontend)/wishlist/page.tsx`
