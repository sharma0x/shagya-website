# CLO-42: Order Timeline

## Overview

Replace the static order status badge with a visual 4-stage progress timeline (Placed → Confirmed → Shipped → Delivered). Add auto-set timestamps per status change for the timeline. No carrier shipment tracking — uses admin-managed status updates.

## Stack Constraints

- **Frontend**: Next.js 16 App Router, React 19
- **Backend**: Payload 3.x, existing Orders collection
- **Admin**: Payload admin panel — admin manually sets order status
- **Email**: Already implemented, no changes needed

## Acceptance Criteria

- [x] `confirmedAt`, `shippedAt`, `deliveredAt` date fields on Orders collection
- [x] `beforeChange` hook auto-sets timestamp when status changes
- [x] `<OrderTimeline />` component: visual 4-stage progress bar
- [x] Order detail page uses timeline instead of status badge
- [x] Completed stages = green (checkmark), Current = amber (pulse), Upcoming = grey
- [x] Cancelled/refunded shows red dot at Placed, hides remaining stages
- [x] Each stage shows date when it occurred
- [x] Status message below timeline: contextual text per current stage

## Technical Notes

- "Placed" stage uses `createdAt` (auto-set on order creation)
- Admin manually updates status from Payload admin panel (no automated flow)
- Production-grade approach: status change triggers email (already implemented), timestamps auto-set in hook
