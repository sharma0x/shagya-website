# CLO-65: Admin — access rules + conflicting API route removal

## Overview

Fixed the coupon form relationship pickers not showing categories/products in the admin panel.

## Access rules added
6 collections were missing access blocks (Payload default = deny all):
- Categories (read: public, write: admin)
- Collections (read: public, write: admin)
- Forms (read: public, create: public, write: admin)
- Navigation (read: public, write: admin)
- Orders (read: authenticated, create: public, write: admin)
- Variants (read: public, write: admin)

## Conflicting routes removed
Custom `/api/products/route.ts` and `/api/categories/route.ts` only exported GET — blocked Payload admin POST/PATCH/DELETE requests. Payload's own catch-all now handles all methods. Zero frontend impact confirmed.

## Files
- src/collections/Categories.ts, Collections.ts, Forms.ts, Navigation.ts, Orders.ts, Variants.ts
- Deleted: src/app/api/products/route.ts, src/app/api/categories/route.ts, src/app/api/__tests__/products.test.ts
