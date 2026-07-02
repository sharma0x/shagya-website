# Current Architecture — Address Forms

## Checkout Page (`src/app/(frontend)/checkout/page.tsx`)

- New address form sends `country: string` (not shown in UI)
- State field: free-text `<input>` with placeholder "State"
- Pincode: `<input>` with HTML5 pattern validation

## Account Addresses Page (`src/app/(frontend)/account/addresses/page.tsx`)

- Add/Edit form identical to checkout — duplicated logic
- Country field hidden, state field free-text `<input>`
- Same pincode pattern validation

## Backend

- `src/collections/Addresses.ts`: country has `defaultValue: 'India'`
- `src/collections/Orders.ts`: address groups have country default `'India'`
- Address API routes: all use `country || 'India'` fallback
- No validation on state field (free-text)

## Gaps

- No dropdowns for country or state anywhere
- Duplicated address form code (checkout + account)
- No country switching possible (always India)
- Inconsistent state naming possible (free-text)
