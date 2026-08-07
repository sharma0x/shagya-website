# CLO-107: Coupon Apply button — validation-aware state machine

## Overview

Fixed CouponApplyButton showing "Applied" instantly before API validation completes, creating misleading UX.

## Before
Button showed "Applied" immediately on click, then red error text appeared below if the coupon was invalid. Users saw a brief green "Applied" followed by an error — confusing.

## After
Button uses a proper state machine:

| State | Display |
|---|---|
| `idle` | `Apply` (brand bg) |
| `loading` | `...` spinner (lighter brand, disabled) |
| `success` | `✓ Applied` (green, 2 sec then reset) |
| `error` | `✕ Failed` (red, 2 sec then reset) |

## Implementation
- `onApply` callback changed from `void` → `Promise<boolean>`
- `handleApplyCouponWithCode` returns `true`/`false` based on validation result
- Timer ref for auto-reset with cleanup on unmount
- Button disabled during loading state

## Files
- `src/components/coupons/OffersSection.tsx`
- `src/app/(frontend)/checkout/page.tsx`
