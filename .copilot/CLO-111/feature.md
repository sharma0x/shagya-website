# CLO-111: OOS guard — wishlist Move to Bag + cart stock cap

## Overview

Two fixes preventing out-of-stock products from entering the cart through alternate paths.

## Wishlist Move to Bag guard
- Added `trackQuantity?` and `quantity?` to `WishlistItem.product`
- `handleMoveToCart` returns early if product is OOS (no cart addition)
- OOS products show amber "Out of Stock" badge instead of "Move to Bag" button
- Prevents the bypass: OOS PDP → Save to Wishlist → Move to Bag

## Cart quantity stock cap
- `CartItem.product` extended with `quantity?` and `trackQuantity?`
- CartDrawer `+` button now checks available stock
- Stock-tracked products capped at `product.quantity`
- Non-tracked products capped at 10 (unchanged)

## Result

| Scenario | Before | After |
|---|---|---|
| Wishlist OOS → Move to Bag | Adds to cart | Blocked — Out of Stock badge |
| Cart: stock=1, qty=1 | + allows 2-10 | + disabled (capped at 1) |
| Cart: stock=5, qty=3 | + allows 4-10 | + allows 4-5 |
| Cart: no stock tracking | + allows up to 10 | + allows up to 10 |

## Files
- `src/lib/store/cart.ts`
- `src/components/cart/CartDrawer.tsx`
- `src/app/(frontend)/wishlist/page.tsx`
