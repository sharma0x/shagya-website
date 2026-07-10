# CLO-43: Auto-Account Creation + Phone OTP Login + Password Reset

## Overview

Three connected features:
1. **Auto-account creation during guest checkout** — when phone OTP is verified, create Better Auth user, send email verification (background), sync local cart to DB
2. **Phone OTP login** — passwordless login via phone number + OTP (already partially implemented in CLO-42)
3. **Password reset** — forgot password flow for email-based accounts

## Stack Constraints

- **Auth**: Better Auth with phoneNumber plugin (already configured)
- **Frontend**: Next.js 16 App Router, existing login + checkout pages
- **Email**: Existing email system (Resend/Nodemailer + `sendVerificationEmail`)
- **No new packages**: Use Better Auth's built-in `signUp`, `sendVerificationEmail`, `forgetPassword`, `resetPassword`

## OOP / DRY Principles

- OTP logic reuses existing `src/lib/otp.ts` (cookie-based HMAC)
- Auth sync reuses existing `src/lib/auth-sync.ts` (matches guest customer by phone)
- Email verification reuses existing `sendVerificationEmail` from `src/email/send.ts`
- Password reset uses Better Auth's built-in flow — only need UI pages
- No duplicate OTP storage or verification logic

## Acceptance Criteria

### 1. Auto-Account Creation During Guest Checkout

- [ ] After phone OTP verified in checkout, call Better Auth `sign-up/email` with:
  - email, auto-generated random password, name, phoneNumber
- [ ] Better Auth account is created
- [ ] Session is established (user becomes logged in mid-checkout)
- [ ] `auth-sync` hook links existing Payload Customer by phone
- [ ] Local Zustand cart syncs to DB cart via `/api/cart`
- [ ] Email verification link sent (fire-and-forget, non-blocking)
- [ ] User sees verified badge + "Account created" message
- [ ] If account already exists (same email): auto-login via signIn instead of signUp
- [ ] Checkout continues seamlessly as now-logged-in user

### 2. Phone OTP Login (already in CLO-42, confirmed working)

- [x] Login page has Email / Phone OTP tab switcher
- [x] Phone OTP: enter phone → sendOtp → enter code → verify → logged in
- [x] auth-sync matches existing guest customer by phone
- [x] Works for users who placed guest orders previously

### 3. Password Reset

- [ ] Login page: "Forgot Password?" link → `/account/forgot-password`
- [ ] Forgot password page: email input → Better Auth `forgetPassword` → sends email with reset link
- [ ] Reset password page: `/account/reset-password?token=...` → new password form
- [ ] Better Auth `resetPassword` called with token + new password
- [ ] Success → redirect to login with "Password updated" message
- [ ] Pages match existing login/register design system

### 4. Account Settings — Change Password (optional)

- [ ] `/account/settings` page: "Set Password" section for phone-only users
- [ ] If user has no password (phone OTP account), allow setting one
- [ ] If user has password, allow changing it

## Technical Notes

### Files to Create
- `src/app/(frontend)/account/forgot-password/page.tsx`
- `src/app/(frontend)/account/reset-password/page.tsx`

### Files to Modify
- `src/app/api/checkout/verify-otp/route.ts` — add Better Auth account creation + email verification
- `src/app/(frontend)/checkout/page.tsx` — sync local cart after phone verification
- `src/app/(frontend)/account/login/page.tsx` — add "Forgot Password?" link
- `src/components/checkout/GuestCheckout.tsx` — show "Account created" message after verification

### Auto-Account Creation Flow
```
Guest verifies phone OTP during checkout
  → verify-otp endpoint:
    1. Lookup Payload Customer by phone/email (already done)
    2. Try Better Auth signUp with email + random password + phone
    3. If signUp fails (already exists) → signIn with random password (if auto-generated)
       → If signIn also fails: return verified=true, account exists but no password set
    4. Send verification email (fire-and-forget)
    5. Return { verified: true, accountCreated: true, session: sessionCookie }
  → Client: session refresh → user is now logged in
  → Client: sync local cart to /api/cart
```

### Password Reset Flow
```
Login page → "Forgot Password?" → /account/forgot-password
  → User enters email
  → Better Auth forgetPassword({ email, redirectTo: '/account/reset-password' })
  → Email sent with magic link containing token
  → User clicks link → /account/reset-password?token=...
  → User enters new password
  → Better Auth resetPassword({ token, newPassword })
  → Redirect to /account/login with success message
```