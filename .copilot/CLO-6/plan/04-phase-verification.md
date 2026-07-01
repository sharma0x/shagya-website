# Phase 4: Verification

## Test Flows

### Checkout
- [ ] Open checkout → step 1 shows address form
- [ ] Country defaults to "India"
- [ ] State dropdown shows Indian states
- [ ] Select "Other" country → state becomes text input
- [ ] Switch back to "India" → state becomes dropdown
- [ ] Fill all fields → submit → address saves
- [ ] New address appears in saved address list
- [ ] Select saved address → proceeds to delivery step
- [ ] Address displays correctly in delivery summary

### Account Addresses
- [ ] Navigate to /account/addresses
- [ ] Click "Add Address" → form opens with default India
- [ ] Fill and submit → address appears in list
- [ ] Click "Edit" on existing address → form pre-fills correctly
- [ ] Change country → state resets
- [ ] Save edits → address updates in list
- [ ] "Set as Default" → checkbox state preserved
- [ ] Delete address → removed from list

### Non-Regression
- [ ] `make typecheck` passes
- [ ] `make lint` passes
- [ ] Address API routes still work (GET, POST, PUT, DELETE)
- [ ] Order creation still stores address correctly
- [ ] Emails still format address correctly
