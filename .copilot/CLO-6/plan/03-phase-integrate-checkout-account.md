# Phase 3: Integration

## Steps

### 3.1 Checkout Page

- Import `AddressForm` from `@/components/address/AddressForm`
- Replace new address form JSX with `<AddressForm />` component
- Pass `onSubmit` that calls POST `/api/addresses`
- Keep existing saved-address selection cards unchanged
- Keep address display card unchanged

### 3.2 Account Addresses Page

- Import `AddressForm` from `@/components/address/AddressForm`
- Replace add/edit address form JSX with `<AddressForm />` component
- Pass `address` prop for edit mode (pre-filled)
- Pass `showDefaultCheckbox` for "Set as default"
- Pass `submitLabel` for "Add Address" / "Save Changes"
- Keep address list cards unchanged
- Keep delete functionality unchanged
