# CLO-6: Add country and state dropdowns to address forms

## Overview

Replace free-text country and state inputs in checkout and account address forms with proper dropdowns. Country defaults to India. State dropdown shows India's 28 states + 8 UTs when India is selected; free-text for other countries. Extract a reusable AddressForm component.

## Acceptance Criteria

- [ ] Country dropdown with ~15 common countries, defaulting to India
- [ ] "Other" country option shows a free-text input for custom country name
- [ ] State field renders as dropdown (India states + UTs) when country is India
- [ ] State field renders as free-text input when country is not India
- [ ] Country and state fields persist correctly in address data (create/edit)
- [ ] Reusable `AddressForm` component in `src/components/`
- [ ] Checkout page uses AddressForm component
- [ ] Account addresses page uses AddressForm component
- [ ] No regression on address save/create/update API endpoints
- [ ] No regression on address display in orders/emails

## Technical Notes

- Countries data: `src/lib/countries.ts`
- India states data: `src/lib/indian-states.ts`
- AddressForm component: `src/components/address/AddressForm.tsx`
- Existing files to update:
  - `src/app/(frontend)/checkout/page.tsx`
  - `src/app/(frontend)/account/addresses/page.tsx`
- Country field on backend already has `defaultValue: 'India'` — no backend changes needed
- State field is free-text `text` on backend — stays the same, frontend validation only
