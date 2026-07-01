# Target Architecture — Address Forms

## New Data Files

```
src/lib/
├── countries.ts        # Country list + "Other" option
└── indian-states.ts    # India 28 states + 8 UTs list
```

## New Reusable Component

```
src/components/address/
└── AddressForm.tsx     # Shared address form (create + edit modes)
```

### AddressForm Props

```typescript
interface AddressFormProps {
  address?: Address        // Pre-fill for edit mode
  onSubmit: (data: AddressFormData) => Promise<void>
  isSubmitting?: boolean
  showDefaultCheckbox?: boolean
}
```

### Input Flow

- **Country**: `<select>` with 15 common countries + "Other" → text input
- **State**: `<select>` (India states) when country==="India", else `<input>`
- **City**: `<input>` (unchanged from current — future CLO issue will add autofill)
- **Pincode**: `<input>` with pattern (unchanged — future CLO issue will add verify)

## Updated Pages

- `checkout/page.tsx`: Import AddressForm, replace inline form JSX
- `account/addresses/page.tsx`: Import AddressForm, replace inline form JSX
