# CLO-9: City autofill pincode + Phone input with country code

## Overview

Two-part improvement to address and registration forms:

1. **City autofill for pincode**: Reverse lookup — when a user types a city name, suggest matching pincodes from India Post data. Selecting a suggestion auto-fills both pincode and state.

2. **Phone input with country code**: Replace plain text phone inputs with a country code dropdown (India +91 default) across all user-facing phone number fields (signup, delivery address, checkout).

## Acceptance Criteria

### City → Pincode Autofill
- [x] City input triggers pincode lookup on blur (min 3 chars)
- [x] Shows dropdown suggestions with city, state, and available pincodes
- [x] Clicking a suggestion auto-fills pincode and state
- [x] Works only when country is India
- [x] Helpful UX: shows "Verified — city & state auto-filled" message

### Phone Country Code
- [x] Phone input shows country code dropdown (IN +91 default) on the left
- [x] 15 country codes supported (IN, US, UK, AU, AE, SG, MY, NP, BD, LK, DE, FR, JP, CN, SA)
- [x] Phone number input on the right (numeric, cleans non-digit characters)
- [x] Value stored as `+91 9876543210` format
- [x] Used in: register page, address form, checkout
- [x] Matches existing design system (rounded-xl, neutral borders, font-display/font-body)

## Technical Notes

- City search API: `src/app/api/pincode/city-search/route.ts`
- CitySearchResult type: `src/lib/india-post.ts`
- PhoneInput component: `src/components/ui/phone-input.tsx`
- Helper functions: `parsePhoneString()`, `formatPhoneValue()`
- AddressForm: `src/components/address/AddressForm.tsx`
- Register page: `src/app/(frontend)/account/register/page.tsx`
