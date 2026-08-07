# CLO-75: Add tracking ID and tracking URL to shipped orders

## Overview

When admin marks an order as "shipped" in Payload admin, they can enter the tracking ID and URL from the shipping provider. Customers see the tracking info on the order detail page.

## What was built

- Added `trackingId` and `trackingUrl` fields to Orders collection
- Migration: `20260712_090414` — adds tracking columns to orders table
- OrderTimeline component now shows tracking card when status is "shipped"
- Copy button copies tracking ID to clipboard
- "Track Package" button opens tracking URL in new tab
- Tracking card only shows when trackingId is set

## Files

- `src/collections/Orders.ts` — added trackingId + trackingUrl fields
- `src/migrations/20260712_090414.ts` — DB migration (auto-generated)
- `src/migrations/index.ts` — registered migration
- `src/components/order/OrderTimeline.tsx` — tracking card UI
