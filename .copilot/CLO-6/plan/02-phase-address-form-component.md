# Phase 2: AddressForm Component

## Component: `src/components/address/AddressForm.tsx`

### Structure

- Container div with grid layout
- Full name + phone (row)
- Address line 1 + line 2 (row)
- City + pincode (row)
- Country select + state select/input (row)
- Default address checkbox (optional)
- Submit button (passed as children or prop)

### Country Logic

- `<select>` rendering `COUNTRY_OPTIONS`
- When value === "Other" → show text input below for custom country
- Default value: "India" (for new address)

### State Logic

- If country === "India" → `<select>` with `INDIAN_STATES`
- If country === "" (Other) → `<input>` for free-text
- State value resets when country changes

### Mode Support

- **Create mode**: Empty form, `onSubmit` calls POST /api/addresses
- **Edit mode**: Pre-filled form, `onSubmit` calls PUT /api/addresses/[id]

### Props

```typescript
interface AddressFormData {
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country: string
  isDefault?: boolean
}

interface AddressFormProps {
  address?: AddressFormData
  onSubmit: (data: AddressFormData) => Promise<void>
  isSubmitting?: boolean
  showDefaultCheckbox?: boolean
  submitLabel?: string
}
```
