# CLO-8: Pincode autofill for city, state, country

## Overview

When a user enters a valid 6-digit Indian pincode in the address form, auto-fill the city and state fields using India Post pincode data. Force country to India when a valid pincode is entered.

## Acceptance Criteria

- [x] Pincode input field accepts only 6 digits (numeric, maxlength=6)
- [x] On 6-digit pincode blur, call `/api/pincode/verify` to validate and fetch city/state
- [x] Verified pincode shows green checkmark indicator
- [x] Auto-fills city and state from API response
- [x] Sets country to "India" when pincode is verified
- [x] Shows loading spinner during verification
- [x] Shows error message for invalid/not-found pincodes
- [x] Allows manual override after autofill
- [x] Works in checkout and account address forms (via AddressForm)

## Technical Notes

- Pincode verification API: `src/app/api/pincode/verify/route.ts`
- India Post proxy: `src/lib/india-post.ts`
- AddressForm component: `src/components/address/AddressForm.tsx`
- Uses `useCallback` for blur handlers to avoid stale closures
- Pincode input: `inputMode="numeric"`, `pattern="^[1-9][0-9]{5}$"`
