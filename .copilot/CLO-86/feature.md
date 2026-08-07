# CLO-86: Admin — access rules + conflicting route removal

## Overview

Fixed coupon form relationship pickers not showing categories/products in the admin panel.

## Changes
- Added access rules to 6 collections: Categories, Collections, Forms, Navigation, Orders, Variants
- Removed custom /api/products/route.ts and /api/categories/route.ts blocking Payload admin
- Zero frontend impact confirmed

## Files
- src/collections/Categories.ts, Collections.ts, Forms.ts, Navigation.ts, Orders.ts, Variants.ts
- Deleted: src/app/api/products/route.ts, categories/route.ts, __tests__/products.test.ts
