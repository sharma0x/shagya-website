# Master Implementation Checklist

## Phase 1: Data Files

[↑ Phase Overview](./01-phase-countries-data.md)

- [ ] Create `src/lib/countries.ts` with country list + names
- [ ] Create `src/lib/indian-states.ts` with 28 states + 8 UTs
- [ ] Export proper TypeScript types and labels

## Phase 2: AddressForm Component

[↑ Phase Overview](./02-phase-address-form-component.md)

- [ ] Create `src/components/address/AddressForm.tsx`
- [ ] Add `CountrySelect` (dropdown + "Other" text input fallback)
- [ ] Add `StateSelect` (dropdown for India, text for others)
- [ ] Handle controlled state for all fields
- [ ] Support both create and edit modes
- [ ] Handle default address checkbox

## Phase 3: Integration

[↑ Phase Overview](./03-phase-integrate-checkout-account.md)

- [ ] Update checkout page to use AddressForm
- [ ] Update account/addresses page to use AddressForm
- [ ] Keep address display cards unchanged
- [ ] Verify all address API flows work

## Phase 4: Verification

[↑ Phase Overview](./04-phase-verification.md)

- [ ] Checkout: add new address with country/state dropdowns
- [ ] Checkout: select existing address
- [ ] Account: create new address
- [ ] Account: edit existing address
- [ ] Account: set default address
- [ ] Account: delete address
- [ ] Orders: verify shipping address displays correctly
- [ ] Emails: verify address formatting unchanged
- [ ] Verify typecheck passes
- [ ] Verify lint passes
