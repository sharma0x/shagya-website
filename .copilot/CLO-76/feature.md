# CLO-76: Standard and Express delivery options on checkout

## Overview

Added two selectable shipping options on Step 2 of checkout: Standard (4-6 days) and Express (1-2 days). Cost adjusts based on selection. Shipping type stored in orders.

## Files

- `src/collections/Orders.ts` — added `shippingType` field (standard/express)
- `src/migrations/20260712_131127.ts` — migration for shippingType column
- `src/app/(frontend)/checkout/page.tsx` — 2 radio-style shipping cards + cost logic
- `src/app/api/razorpay/verify/route.ts` — stores shippingType in order creation
