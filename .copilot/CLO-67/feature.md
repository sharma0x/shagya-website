# CLO-67: Email OTP Authentication — Replace Phone OTP

## Overview

Replaced phone-based SMS OTP with Better Auth's native `emailOTP` plugin for login and guest checkout. Removed password-based login and magic link plugin. Single unified flow for both guest checkout and returning user login.

## What was built

- Added `emailOTP` plugin to Better Auth (`src/lib/auth.ts`)
- Added `sendOTPEmail()` to `src/email/send.ts` — sends OTP via Resend/Mailpit
- Unified `POST /api/auth/sign-in/email-otp` for both login + guest checkout
- Removed `phoneNumber`, `magicLink` plugins from auth.ts
- Removed `phoneNumberClient` from auth-client.ts
- Login page simplified to OTP-only form + Google sign-in
- GuestCheckout uses email OTP instead of phone SMS
- Reviews auto-approved with verified purchase check + spam filter
- Auto-save shipping address to customer account from orders

## Files Changed

- `src/lib/auth.ts` — emailOTP plugin, removed phoneNumber + magicLink
- `src/lib/auth-client.ts` — removed phoneNumberClient
- `src/email/send.ts` — added sendOTPEmail()
- `src/app/(frontend)/account/login/page.tsx` — OTP-only login form
- `src/components/checkout/GuestCheckout.tsx` — email OTP flow
- `src/app/api/reviews/route.ts` — create reviews (auto-approved)
- `src/app/api/razorpay/verify/route.ts` — save address for guests
- Deleted: `verify-email-otp/route.ts`, `send-otp/route.ts`, `lib/otp.ts`
