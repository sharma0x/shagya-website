# CLO-90: Checkout — Apply button on coupons + send productIds

## Overview

Checkout coupon UX: one-click Apply instead of Copy+Paste, plus condition enforcement.

## Apply button
- Added `CouponApplyButton` component and `onApply` prop to `OffersSection`
- Card variant at checkout shows "Apply" instead of "Copy"
- `handleApplyCouponWithCode(code)` validates and applies in one click
- Green "Applied" feedback for 2 seconds

## productIds enforcement
- Checkout now sends `productIds` from cart items with validate request
- Before: `{ code, subtotal }` — `categoriesConditions`/`productsConditions` never enforced
- After: `{ code, subtotal, productIds }` — API properly checks product/category conditions

## Files
- `src/components/coupons/OffersSection.tsx`
- `src/app/(frontend)/checkout/page.tsx`
