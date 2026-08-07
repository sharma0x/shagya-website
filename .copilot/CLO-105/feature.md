# CLO-105: Coupon customer conditions filtering + guest checkout guard

## Overview

Two fixes for coupon visibility and access control.

## Customer conditions filtering
- `/api/coupons/available` now checks the authenticated session against each coupon's `customersConditions`
- Coupons with customer conditions that don't include the current user are hidden
- Coupons with no conditions (public) remain visible to all
- Uses existing auth session lookup and customer ID matching (same pattern as validate API)

## Guest checkout guard
- The OffersSection and active coupons fetch are now guarded by `isLoggedIn`
- Guest users no longer see coupon cards on checkout (they couldn't apply them anyway — validate returns 401)
- The coupon input field remains visible — a logged-in requirement banner can be added later

## Result

| Scenario | Before | After |
|---|---|---|
| VIP coupon on non-VIP account | Shown | Hidden |
| Public coupon (no conditions) | Shown | Shown |
| Guest checkout | Sees coupon cards | No coupons shown |
| Logged-in checkout | Sees all | Sees filtered + public only |

## Files
- `src/app/api/coupons/available/route.ts`
- `src/app/(frontend)/checkout/page.tsx`
