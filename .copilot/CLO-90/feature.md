# CLO-90: Checkout — Apply button on coupons + productIds enforcement + smart errors

## Overview

Checkout coupon UX: one-click Apply + condition enforcement with descriptive error messages.

## Apply button
- Added `CouponApplyButton` component and `onApply` prop to `OffersSection`
- Card variant at checkout shows "Apply" instead of "Copy"
- `handleApplyCouponWithCode(code)` validates and applies in one click
- Green "Applied" feedback for 2 seconds

## productIds enforcement
- Checkout now sends `productIds` from cart items with validate request
- Before: `{ code, subtotal }` — conditions never enforced
- After: `{ code, subtotal, productIds }` — API properly checks product/category conditions

## Smart error messages
Replaced generic errors with actionable hints:

| Scenario | Old Error | New Error |
|---|---|---|
| Min cart not met | "Minimum cart value of ₹1999 required" | "Add items worth ₹950 more to apply WELCOME50" |
| Wrong products | "This coupon does not apply to items in your cart" | "Add products like 'Kanchipuram Silk Saree' or 'Banarasi Silk'" |
| Wrong category | generic | "Add silk products to your cart" |
| Customer condition | "This coupon is not available for your account" | "WELCOME50 is an exclusive offer — not available for your account" |

## Files
- `src/components/coupons/OffersSection.tsx`
- `src/app/(frontend)/checkout/page.tsx`
- `src/app/api/coupons/validate/route.ts`
