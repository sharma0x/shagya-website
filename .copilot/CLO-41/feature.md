# CLO-41: Checkout Enhancements

## Overview

Add guest checkout (no account required), shipping cost estimation by pincode, free shipping threshold display, minimum order value enforcement, and order notes/special instructions.

## Stack Constraints

- **Frontend**: Next.js 16 App Router, React 19, existing checkout page (3-step: address → shipping → payment)
- **Backend**: Payload 3.x, existing Orders/Addresses/Carts collections
- **Auth**: Better Auth — currently requires auth for checkout
- **Existing Reusable**: AddressForm, PhoneInput, ZipCodeVerify

## OOP / DRY Principles

- Guest checkout creates temporary session stored in Zustand, NOT in Payload DB
- Shipping estimator reuses existing pincode verification API
- Free shipping threshold reads from SiteSettings (add `freeShippingThreshold` field)
- Min order value check in a shared validation util used by cart + checkout
- Guest order flow reuses existing order creation logic + adds optional guest path

## Acceptance Criteria

### 1. Guest Checkout
- [ ] Checkout page: add "Continue as Guest" option (no login required)
- [ ] Guest email/pincode form replaces the auth requirement
- [ ] Guest data stored temporarily in Zustand store (not persisted to DB until order creation)
- [ ] Guest order: email used as `customerEmail`, phone as `phone` on order
- [ ] Optional: offer "Create an account to track your order" after guest order placed
- [ ] Guest session clears on order success or tab close

### 2. Shipping Cost Estimation
- [ ] Checkout page: pincode input → "Estimate Shipping" button
- [ ] Calls `/api/pincode/verify` (existing) to validate pincode
- [ ] Shows estimated shipping cost + delivery days based on product's deliveryTime + shippingPrice
- [ ] Shipper dynamically calculated: local (free for certain zones) vs national (shippingPrice)
- [ ] Display: "Estimated delivery by July 5" (date math from deliveryTime value)

### 3. Free Shipping Threshold
- [ ] SiteSettings: add `freeShippingThreshold` number field (e.g., 2999)
- [ ] Cart drawer: message "Add ₹{remaining} more for FREE shipping!"
- [ ] Checkout: auto-apply free shipping when subtotal ≥ threshold
- [ ] Progress bar: visual "₹X / ₹2999 to free shipping"

### 4. Minimum Order Value
- [ ] SiteSettings: add `minOrderValue` field (default 0)
- [ ] Cart: disable "Proceed to Checkout" if cart total < minOrderValue
- [ ] Checkout: server-side validation that order meets minimum
- [ ] Error message: "Minimum order value is ₹{value}"

### 5. Order Notes
- [ ] AddressForm (or checkout step): "Delivery Instructions" textarea
- [ ] Stored as `notes` field on Orders collection
- [ ] Shown in order confirmation email, admin order detail
- [ ] Orders collection: add `notes` text field

### 6. GST Invoice Preference
- [ ] Checkout: "I need a GST invoice" checkbox (optional)
- [ ] If checked: show GSTIN input field
- [ ] Orders collection: add `gstin` and `needsInvoice` fields
- [ ] Order confirmation: mention "GST invoice will be emailed within 24h"

## Technical Notes

### Files to Create
- `src/lib/store/guest-checkout.ts` — Zustand store for guest checkout data
- `src/lib/shipping.ts` — shipping cost calculator + delivery ETA
- `src/components/checkout/ShippingEstimate.tsx` — pincode → shipping estimate widget
- `src/components/checkout/FreeShippingBar.tsx` — progress bar component

### Files to Modify
- `src/app/(frontend)/checkout/page.tsx` — add guest path, shipping estimate, order notes, progress bar
- `src/collections/Orders.ts` — add `notes`, `gstin`, `needsInvoice`, `isGuest` fields
- `src/collections/Orders.ts` — add `guestEmail` field for guest orders without customer relation
- `src/globals/SiteSettings.ts` — add `freeShippingThreshold`, `minOrderValue`
- `src/components/cart/CartDrawer.tsx` — add free shipping progress bar
- `src/lib/store/cart.ts` — add free shipping threshold check
