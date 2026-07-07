# CLO-43: Customer Account Features

## Overview

Add password reset (forgot password flow), self-service account deletion, saved cards for faster checkout, SMS order notifications, and order push notifications.

## Stack Constraints

- **Frontend**: Next.js 16 App Router, existing login/register pages
- **Auth**: Better Auth (already supports password reset natively — just need UI)
- **Backend**: Payload 3.x, existing Customers/Orders
- **SMS**: Twilio (already configured for OTP) — reuse for order notifications
- **Design**: Match existing login/register page styling (rounded-xl, neutral borders, font-display)

## OOP / DRY Principles

- Password reset: use Better Auth's built-in `forgetPassword` / `resetPassword` — only need UI pages
- Account deletion: single API endpoint, cascading anonymization of orders/reviews
- Saved cards: store card token via Razorpay (not actual card numbers)
- SMS notifications: extend existing `sendSMS()` utility — add order status template
- Push notifications: use Web Notifications API (no third-party service)

## Acceptance Criteria

### 1. Password Reset Flow
- [ ] Login page: "Forgot Password?" link → `/account/forgot-password`
- [ ] Forgot password page: email input → Better Auth `forgetPassword` → sends magic link
- [ ] Reset page: `/account/reset-password?token=...` → new password form → Better Auth `resetPassword`
- [ ] Success → redirect to login with "Password updated" message
- [ ] All pages match existing login/register design

### 2. Account Deletion
- [ ] Account settings page: "Delete Account" button in danger zone
- [ ] Confirmation dialog: "This will permanently delete..."
- [ ] `DELETE /api/account/me` — anonymizes customer data, deletes auth record
- [ ] Orders preserved (for legal compliance) but customer reference anonymized
- [ ] Reviews preserved but author set to "Former Customer"
- [ ] Wishlist, cart, addresses deleted
- [ ] Redirect to homepage with "Account deleted" toast

### 3. Saved Cards
- [ ] Checkout: "Save this card for future payments" checkbox
- [ ] Razorpay tokenization: store `card_token` + `card_last4` + `card_network` (not full card)
- [ ] `src/collections/SavedCards.ts` — customer relation, token, last4, network, expiry
- [ ] Checkout: "Use saved card" option — pre-fills payment
- [ ] Account settings: list saved cards, delete option

### 4. SMS Order Notifications
- [ ] Order status changes: send SMS in addition to email
- [ ] Customer phone field on registration (already exists via PhoneInput)
- [ ] SMS templates: "Your Shayga order ORD-12345 is confirmed. Track: {url}"
- [ ] Opt-in: checkbox "Send me SMS updates about my order" in account settings
- [ ] Extend `sendSMS()` to handle order status templates
- [ ] `src/lib/sms-templates.ts` — order status SMS templates

### 5. Browser Push Notifications
- [ ] "Enable Notifications" button in account settings
- [ ] Service Worker registration for push (if PWA)
- [ ] Notifications for: shipped, delivered, back-in-stock
- [ ] Fallback: if push not supported, show toast in-app

## Technical Notes

### Files to Create
- `src/app/(frontend)/account/forgot-password/page.tsx`
- `src/app/(frontend)/account/reset-password/page.tsx`
- `src/app/api/account/me/route.ts` — DELETE for account deletion
- `src/collections/SavedCards.ts`
- `src/app/api/account/saved-cards/route.ts`
- `src/lib/sms-templates.ts`

### Files to Modify
- `src/app/(frontend)/account/login/page.tsx` — add forgot password link
- `src/app/(frontend)/account/page.tsx` — add settings sections (saved cards, delete, notifications)
- `src/lib/sms.ts` — add order notification functions
- `src/email/send.ts` — fire SMS alongside email on order status changes
- `src/collections/Customers.ts` — add `smsNotifications` (checkbox), `pushNotifications` (checkbox)
