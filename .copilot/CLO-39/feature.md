# CLO-39: Stock & Urgency Features

## Overview

Display stock status on product cards/details, implement back-in-stock notifications, recently viewed products tracking, and related products recommendations.

## Stack Constraints

- **Frontend**: Next.js 16 App Router, React 19, Tailwind v4, OKLCH tokens
- **Backend**: Payload 3.x collections, Postgres, Zustand for client state
- **Auth**: Better Auth (customer) + Payload auth (admin)
- **Reuse**: Existing ProductCard pattern, existing `trackQuantity`/`quantity`/`lowStockThreshold` fields on Products
- **No new libraries**: Use Zustand (already installed) for client state, no new npm packages

## OOP / DRY Principles

- Stock status logic in a shared utility (`src/lib/inventory.ts`)
- Recently viewed uses Zustand store (same pattern as cart)
- Related products reuse existing product query API
- Back-in-stock reuses existing newsletter subscriber collection
- Single `<StockBadge />` component used across product cards, product detail, cart

## Acceptance Criteria

### 1. Stock Status Display
- [ ] `src/lib/inventory.ts` — `getStockStatus(product)` returns `{ level: 'in-stock'|'low-stock'|'out-of-stock'|'backorder', label: string, color: string }`
- [ ] `<StockBadge />` component (green=in-stock, amber=low-stock, red=out-of-stock, blue=backorder)
- [ ] Shown on: product cards (category/collection/search), product detail page, cart items
- [ ] Product detail page: shows exact quantity if ≤ lowStockThreshold ("Only 3 left")
- [ ] Sold-out products: badge + disabled Add to Cart button

### 2. Back-in-Stock Notification
- [ ] `src/app/api/products/notify-back-in-stock/route.ts` — POST endpoint, accepts productId + email
- [ ] Product detail page: "Notify Me" button replaces Add to Cart when out of stock
- [ ] Reuses `newsletter-subscribers` collection or creates simple `back-in-stock-requests` table
- [ ] Email sent when product quantity changes from 0 to > 0
- [ ] One-time notification: auto-deleted after sending

### 3. Recently Viewed Products
- [ ] `src/lib/store/recently-viewed.ts` — Zustand store with localStorage persistence
- [ ] Max 8 products, deduplicated, most recent first
- [ ] Tracked on product detail page visit (client-side)
- [ ] `<RecentlyViewed />` component on: homepage (below products), product detail page footer
- [ ] Horizontal scrollable row using existing `<SkeletonImage />` pattern

### 4. Related Products
- [ ] Product detail page: "You May Also Like" section (below product info)
- [ ] Query: same fabric OR same weave OR same category, NOT current product, limit 4
- [ ] Server-side: `payload.find({ collection: 'products', where: { OR: [...], id: { not_equals: id } }, limit: 4 })`
- [ ] Reuses existing product card layout

### 5. Sold-in-Last-X-Hours Badge (Optional)
- [ ] Product detail page: "5 sold in last 24 hours" badge
- [ ] Data from Orders collection: count orders in last 24h containing this product
- [ ] Cached (5-min TTL) to avoid querying on every page load
- [ ] Only shown if count > 0

## Technical Notes

### Files to Create
- `src/lib/inventory.ts` — stock status utility
- `src/lib/store/recently-viewed.ts` — Zustand store
- `src/components/product/StockBadge.tsx` — stock badge component
- `src/components/product/RecentlyViewed.tsx` — recently viewed row
- `src/components/product/RelatedProducts.tsx` — related products section
- `src/app/api/products/notify-back-in-stock/route.ts`

### Files to Modify
- `src/app/(frontend)/products/[slug]/page.tsx` — add stock, related, recently viewed
- `src/app/(frontend)/category/[slug]/page.tsx` — add StockBadge to cards
- `src/app/(frontend)/collections/[slug]/page.tsx` — add StockBadge to cards
- `src/collections/Products.ts` — add afterChange hook for back-in-stock email trigger
