# CLO-41: Guest Checkout + Order Notes

## Overview

Add guest checkout with mandatory phone OTP verification that auto-creates a Better Auth account. Address comes first on the checkout page, then email/phone/OTP for guests below it. Receiver name/phone are optional. Order notes textarea added.

## Stack Constraints

- **Auth**: Better Auth — auto-register after phone OTP verified
- **SMS**: Existing Twilio via `sendSMS()` in `src/lib/sms.ts`
- **OTP Storage**: In-memory `Map` with 5-min TTL (keyed by phone + email)
- **Frontend**: Next.js 16 App Router, existing checkout page structure
- **Design**: Match existing checkout design (rounded-xl, brand colors, AddressForm pattern)

## OOP / DRY Principles

- OTP logic in a single utility (`src/lib/otp.ts`) — shared by guest checkout + future password reset
- GuestCheckout component handles email + phone + OTP state, not the main checkout page
- Auto-register reuses existing `auth-sync.ts` hook (fires on Better Auth user create)
- Order notes: simple text field, no new collection needed

## Acceptance Criteria

### 1. Guest Checkout Flow
- [ ] Address section always visible (AddressForm component)
- [ ] Receiver Name + Receiver Phone fields (optional, below address)
- [ ] Guest-only section: Full Name + Email + Phone + OTP (below receiver fields)
- [ ] Logged-in users see only address + receiver fields + notes
- [ ] Phone OTP: 6-digit, sent via Twilio SMS, stored in memory, 5-min expiry
- [ ] After OTP verified: Better Auth account auto-created via `/api/checkout/verify-otp`
- [ ] If phone already registered → auto-login (no re-register)
- [ ] OTP field and Send OTP button shown inline on same page

### 2. Order Notes
- [ ] "Delivery Instructions" textarea on checkout page
- [ ] `notes` field added to Orders collection

### 3. Pricing Display
- [ ] Product's `shippingPrice` shown as shipping cost
- [ ] Product's `deliveryTime` shown as ETA
- [ ] Red note below total: "`* Excluding delivery charges`"
- [ ] Delhivery integration removed from scope

## Technical Notes

### Files to Create
- `src/lib/otp.ts` — OTP generation, storage, verification utility
- `src/app/api/checkout/send-otp/route.ts` — Send OTP endpoint
- `src/app/api/checkout/verify-otp/route.ts` — Verify OTP + auto-register endpoint
- `src/components/checkout/GuestCheckout.tsx` — Guest name/email/phone/OTP form

### Files to Modify
- `src/lib/sms.ts` — Add `sendOTP()` function
- `src/app/(frontend)/checkout/page.tsx` — Add guest flow, receiver fields, order notes, red note
- `src/collections/Orders.ts` — Add `notes` text field
