# CLO-96: Coupon value mandatory validation + null guard

## Overview

Admin validation to prevent saving coupons without a valid discount value, plus defensive null guard in the UI.

## Admin validation
- Added `validate` function to the coupon `value` field
- For `percentage` and `fixed_amount` types: value must be > 0
- Admin sees error "Discount value is required for percentage and fixed amount coupons" if they try to save without a value
- `free_shipping` type: field is hidden, validation skipped

## UI null guard
- `CouponData.value` type changed from `number` to `number | null`
- `formatDiscount`: uses `c.value || 0` instead of `c.value`
- Banner template: uses `c.value || 0` instead of `c.value`
- Prevents "Save ₹null with coupon" if old data has null values

## Files
- `src/collections/Coupons.ts`
- `src/components/coupons/OffersSection.tsx`
