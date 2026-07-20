# CLO-54: Convert registration to email OTP flow (remove password)

## Overview

Login uses email OTP (no password required). Registration currently uses email+password, creating a mismatch where users who register with password cannot login via the OTP flow.

This fix replaces the password-based registration with an OTP flow matching the login page.

## Flow

1. User enters: Name, Email, Phone (optional)
2. Clicks "Create Account" → OTP sent to email
3. User enters 6-digit OTP
4. Clicks "Verify & Create Account"
5. Better Auth auto-creates user (first OTP verification = account creation)
6. databaseHooks.user.create.after syncs to Payload Customers collection
7. window.location.href = '/account'

## Changes

- Removed password + confirm password fields and state
- Added OTP send + verify logic (same pattern from login page)
- Send OTP via `POST /api/auth/email-otp/send-verification-otp` with `{ email, type: 'sign-in' }`
- Verify via `POST /api/auth/sign-in/email-otp` with `{ email, otp, name, phoneNumber }`
- Resend button with 30s cooldown (matching login page)

## Files

- `src/app/(frontend)/account/register/page.tsx`
