# CLO-68: Fix checkout sidebar showing empty with static Rs 150 during loading

## Problem

When clicking "Complete Order" and during page load, the order summary sidebar flashes empty with only Rs 150 shipping shown. The loading guard only checked `loading && !didLoad.current` which became false after the first effect run, before the cart API returned.

## Fix

Updated the loading condition in checkout page to also wait for cart data:

```ts
// Before
if (loading && !didLoad.current) {

// After  
const cartReady = !isLoggedIn || (effectiveCart?.items?.length ?? 0) > 0
if (isPending || (loading && !didLoad.current) || !cartReady) {
```

## Files Changed

- `src/app/(frontend)/checkout/page.tsx` — 3 lines changed
