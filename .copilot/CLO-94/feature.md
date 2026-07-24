# CLO-94: Cart merge on guest login

## Overview

Guest cart items now properly merge into the account cart when logging in, instead of being lost or silently overwritten.

## Problem (before fix)

| Scenario | Result |
|---|---|
| Fresh user: guest adds items → logs in → goes to checkout | Works only if they touched cart AFTER login (fragile) |
| Returning user: had server cart from last session → browses as guest → logs in | **Previous server cart items WIPED** — guest localStorage completely replaced server cart |
| User switches device/browser | Old cart lost, only new guest items survive |

## Server-side merge (`POST /api/cart`)

When updating an existing cart, incoming items are merged with existing items:

- Same `product + variant` → keeps **higher quantity** (never reduces)
- Different `product + variant` → **appends** (both preserved)
- Products not in incoming → **kept** (account cart items preserved)
- Subtotal recalculated after merge

## Client-side sync on login (`Header.tsx`)

A `useEffect` detects auth state change from guest → logged in:

1. `syncWithServer()` pushes localStorage cart to server (merge happens server-side)
2. `loadFromServer()` hydrates Zustand store with the merged result
3. Only runs once (prevents re-trigger on every session check)

## Files
- `src/app/api/cart/route.ts`
- `src/components/layout/Header.tsx`
