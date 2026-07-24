# CLO-108: OOS — wishlist-as-notification + block Add to Cart

## Overview

Replaced the orphaned NotifyMeButton system with wishlist-based back-in-stock notifications. When a product is restocked, all customers who wishlisted it get notified via email.

## What was removed
- `NotifyMeButton.tsx` — orphaned component (never rendered)
- `POST /api/products/[slug]/notify-back-in-stock` route
- `BackInStockRequests` collection from Payload config
- Related collection registration in payload.config.ts

## What changed
- Products `afterChange` hook: now queries `wishlist_items` instead of `back-in-stock-requests`. Sends back-in-stock email to each unique wishlist customer
- ProductActions: accepts `isOutOfStock` prop. When OOS, hides Add to Cart/Buy Now, shows amber "Out of Stock" badge + "Save to Wishlist" prompt with "We'll notify you when back" text
- PDP: passes `isOutOfStock` to ProductActions computed from product.trackQuantity + quantity

## PDP OOS state
```
⚠ Out of Stock
┌──────────────────────────────┐
│  ♥ Save to Wishlist         │
│  We'll notify you when back  │
└──────────────────────────────┘
```

## Files
- `src/collections/Products.ts` (hook)
- `src/components/product/ProductActions.tsx` (OOS state)
- `src/app/(frontend)/products/[slug]/page.tsx` (pass isOOS)
- `src/payload.config.ts` (remove collection)
- Deleted: NotifyMeButton, notify-back-in-stock route, BackInStockRequests collection
