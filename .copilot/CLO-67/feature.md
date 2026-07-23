# CLO-67: Coupons/Offers — product banners, account My Offers, checkout cards

## Overview

Show applicable coupons across the user journey with distinct UI styles per page.

## Product detail page (Amazon banner style)
- Dashed-border compact cards between features and ProductActions
- Shows coupons that apply to this product via productsConditions or categoriesConditions
- "Copy" button for each coupon code

## Account page (Nykaa stacked card style)
- "My Offers" dashboard card with count badge in the hub section
- Full-width detailed cards below the hub with code, discount, conditions, expiry, copy button
- Shows all available coupons for the customer (customersConditions + public)

## Checkout page (Nykaa card style)
- Replaced old chip UI with OffersSection card variant
- Switched from /api/coupons/active to /api/coupons/available

## New API: GET /api/coupons/available
- Filters by productId, product categories, active status, date range
- Returns slim coupon data (id, code, description, type, value, conditions, dates)

## Validate API enforcement
- Now accepts cart productIds in request body
- Enforces productsConditions: coupon only valid if cart contains matching products
- Enforces categoriesConditions: coupon only valid if cart products are in allowed categories

## Files
- src/app/api/coupons/available/route.ts (new)
- src/components/coupons/OffersSection.tsx (new)
- src/app/(frontend)/products/[slug]/page.tsx
- src/app/(frontend)/account/page.tsx
- src/app/(frontend)/checkout/page.tsx
- src/app/api/coupons/validate/route.ts
