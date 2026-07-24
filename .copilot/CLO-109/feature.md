# CLO-109: Inventory deduction on order confirmation

## Overview

Orders now decrement product quantity when confirmed, enabling accurate stock tracking.

## Before
`purchaseCount` was incremented (analytics only) but `quantity` was never deducted. Stock tracking was purely manual.

## After
When order status changes to `confirmed`:
- `purchaseCount` increments by order quantity (unchanged)
- `quantity` decrements by order quantity (new — only if `trackQuantity === true`)
- Capped at 0 (never goes negative)
- When quantity reaches 0, the Products `afterChange` hook fires, triggering wishlist-based back-in-stock notifications

## Files
- `src/collections/Orders.ts`
