# CLO-77: Fix resend OTP button staying disabled after cooldown

## Problem

In GuestCheckout, the Send OTP button stayed permanently disabled after first OTP was sent because `disabled={sendingOTP || cooldown > 0 || otpSent}` — the `otpSent` condition was never reset after cooldown expired.

## Fix

Removed `|| otpSent` from the disabled condition. Now the button re-enables when cooldown reaches 0.

## File

`src/components/checkout/GuestCheckout.tsx` — removed `|| otpSent` from line 157
