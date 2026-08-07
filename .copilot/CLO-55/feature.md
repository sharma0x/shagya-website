# CLO-55: Fix customer sync failing when new user logs in via OTP (no name)

## Overview

When a new user logs in via email OTP from the login page (without going through registration), the customer record is never created.

Root cause: `syncCustomer()` tries to create a `customers` record with `name: null` (login page does not collect name). The customers collection has `name: { required: true }`, so Payload validation rejects the create. The error is caught and logged silently, leaving the user with a Better Auth account but no Payload customer record.

Subsequent API calls that look up the customer (addresses, wishlist) return "Customer not found" 404.

## Fix

1. Remove `required: true` from `name` field on Customers collection
2. Add fallback in `auth-sync.ts`: `name: user.name || user.email?.split('@')[0] || 'Customer'`

## Files

- `src/collections/Customers.ts`
- `src/lib/auth-sync.ts`
