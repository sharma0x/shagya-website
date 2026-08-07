# CLO-91: Account offers — dedicated /account/offers page

## Overview

Created dedicated offers page with responsive 4-column grid layout.

## Dedicated page
- Route: `/account/offers`
- Breadcrumb: Back to Account
- Header: Offers & Coupons with TicketPercent icon
- Responsive grid: 1-col → 2-col (sm) → 3-col (md) → 4-col (lg)
- Cards: discount badge, mono code, description, conditions, Copy Code button
- Empty state: no-offers message with Browse CTA
- Layout: max-w-5xl

## Account dashboard
- Restored 4-card hub: Orders, Addresses, Wishlist, My Offers (links to /account/offers)
- Removed collapsible bar and OffersSection from dashboard

## Files
- `src/app/(frontend)/account/offers/page.tsx`
- `src/app/(frontend)/account/page.tsx`
