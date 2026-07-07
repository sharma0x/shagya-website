# CLO-45: Social & Engagement Features

## Overview

Add social share buttons on product pages, recently viewed products (already planned in CLO-39), related products recommendations, save-for-later (move cart to wishlist), and product comparison.

## Stack Constraints

- **Frontend**: Next.js 16, React 19, existing product detail page, existing wishlist API
- **Backend**: Payload 3.x, existing Products/Wishlist/Carts collections
- **Design**: OKLCH tokens, consistent with existing product page styling
- **No new packages**: Build share buttons with plain HTML/JS, no social SDKs

## OOP / DRY Principles

- Recently viewed: covered in CLO-39, just reference here for completeness
- Related products: covered in CLO-39, just reference here
- Save for later: reuses existing wishlist API (no new endpoints)
- Product comparison: uses Zustand store (same pattern as cart/recently-viewed)
- Share buttons: single `<SocialShare />` component, reused on blog posts too

## Acceptance Criteria

### 1. Social Share Buttons
- [ ] Product detail page: share row below product info
- [ ] `<SocialShare />` component with: WhatsApp, Facebook, Twitter/X, Copy Link
- [ ] WhatsApp: `https://wa.me/?text={encoded product URL + name}`
- [ ] Facebook: `https://www.facebook.com/sharer/sharer.php?u={encoded URL}`
- [ ] Twitter/X: `https://x.com/intent/post?url={encoded URL}&text={encoded name}`
- [ ] Copy Link: clipboard API + toast "Link copied!"
- [ ] Visual: icon buttons in row, matching existing design
- [ ] Also add to: blog post pages, order success page

### 2. Save for Later
- [ ] Cart items: "Save for Later" button on each cart item
- [ ] Click: removes from cart → adds to wishlist
- [ ] Wishlist items: "Move to Cart" button
- [ ] Reuses existing `POST /api/wishlist` and cart store
- [ ] Toast: "Saved to wishlist" with undo option

### 3. Product Comparison
- [ ] `src/lib/store/compare.ts` — Zustand store, max 4 products
- [ ] Product cards: "Compare" checkbox/button (shown on hover)
- [ ] Compare bar: fixed bottom bar showing selected products (like flipkart/amazon)
- [ ] `/compare` page: side-by-side comparison table
- [ ] Rows: image, name, price, fabric, weave, pattern, length, blouseType, occasion, cityOfOrigin, deliveryTime
- [ ] "Remove" button on each column
- [ ] "Add more products" button → navigates to category page
- [ ] Mobile: horizontal scroll table

### 4. Product Detail Page Improvements
- [ ] "Share this saree" section (uses SocialShare above)
- [ ] "Recently Viewed" horizontal row (uses CLO-39 RecentlyViewed component)
- [ ] "You May Also Like" horizontal row (uses CLO-39 RelatedProducts component)
- [ ] "Customers Also Bought" (future — needs order data aggregation, currently placeholder)

## Technical Notes

### Files to Create
- `src/components/product/SocialShare.tsx`
- `src/lib/store/compare.ts` — Zustand store
- `src/components/product/CompareBar.tsx` — fixed bottom bar
- `src/app/(frontend)/compare/page.tsx` — comparison table page

### Files to Modify
- `src/app/(frontend)/products/[slug]/page.tsx` — add share buttons, recently viewed, related
- `src/components/cart/CartDrawer.tsx` — add save-for-later button on items
- `src/app/(frontend)/wishlist/page.tsx` — add move-to-cart button on items
