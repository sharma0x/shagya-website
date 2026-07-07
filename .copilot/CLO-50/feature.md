# CLO-50: Loyalty, Referrals & UGC

## Overview

Implement a loyalty/rewards program (earn points on purchases), referral program (share + earn), WhatsApp Shop integration, user-generated content gallery, and video support for products.

## Stack Constraints

- **Frontend**: Next.js 16, React 19, existing account pages
- **Backend**: Payload 3.x, existing Customers/Orders collections
- **Existing Reusable**: Cart store, checkout flow, social share, wishlist
- **WhatsApp**: WhatsApp Business API (Cloud API) or simple wa.me links
- **Video**: Payload media already supports any file type — just add video upload field
- **No new heavy packages**: Build loyalty with simple DB queries, no third-party loyalty platform

## OOP / DRY Principles

- Loyalty points: computed field on Customers (total from order totals), NOT a separate wallet
- Referral: unique code per customer, stored in Customers collection
- WhatsApp: reuse existing SocialShare pattern + wa.me deep links
- UGC gallery: simple upload form → admin approves → displayed on public gallery
- Video: extend existing gallery array on products (add video type option)

## Acceptance Criteria

### 1. Loyalty Program
- [ ] Customers: add `loyaltyPoints` number field (default 0)
- [ ] Earn: 1 point per ₹100 spent (on delivered orders)
- [ ] Redeem: 1 point = ₹1 off (100 points = ₹100 discount)
- [ ] Checkout: "Use Loyalty Points" checkbox, enter points to redeem
- [ ] Min redemption: 100 points
- [ ] Max redemption: 50% of order total
- [ ] Points displayed: account dashboard, checkout sidebar
- [ ] Points history: simple list of earned/redeemed transactions
- [ ] `src/collections/LoyaltyTransactions.ts` — customer relation, type (earned/redeemed), points, order reference

### 2. Referral Program
- [ ] Customers: add `referralCode` (auto-generated, unique, e.g., first name + 4 chars)
- [ ] Referral link: `https://shayga.in?ref={code}`
- [ ] Registration: `ref` param in URL auto-fills referral code
- [ ] Reward: both referrer and referee get ₹200 off next order
- [ ] `src/collections/ReferralRewards.ts` — referrer, referee, reward amount, status (pending/credited), order reference
- [ ] Auto-credit when referee's first order is delivered
- [ ] Account page: "Refer & Earn" section with referral link + share buttons

### 3. WhatsApp Shop Integration
- [ ] Product detail page: "Order via WhatsApp" button
- [ ] `https://wa.me/{number}?text=I want to order: {product name} - {product URL}`
- [ ] WhatsApp number from SiteSettings (add `whatsappNumber` field)
- [ ] Cart: "Share Cart via WhatsApp" — sends cart items list to a friend
- [ ] WhatsApp catalog: optional — requires WhatsApp Business API (future)

### 4. UGC Gallery (Customer Photos)
- [ ] New collection: `src/collections/CustomerPhotos.ts` — customer relation, product relation, image upload, caption, status (pending/approved), createdAt
- [ ] Upload page: `/account/upload-photo` or inline on order detail
- [ ] Admin moderation: approve/reject submitted photos
- [ ] Public gallery: `/gallery` page showing approved customer photos
- [ ] Product detail: "Customer Photos" section below main gallery
- [ ] Incentive: "Share your look, earn 50 loyalty points" on order confirmation

### 5. Video Support for Products
- [ ] Products: add `video` upload field (optional, next to gallery)
- [ ] Product detail page: if video exists, show as first gallery item (play button overlay)
- [ ] Video player: HTML5 `<video>` tag — no YouTube/Vimeo dependency
- [ ] Accept: MP4, WebM
- [ ] Auto-generated poster from first video frame OR dedicated poster image
- [ ] Mobile: inline playback (no fullscreen required)

## Technical Notes

### Files to Create
- `src/collections/LoyaltyTransactions.ts`
- `src/collections/ReferralRewards.ts`
- `src/collections/CustomerPhotos.ts`
- `src/lib/loyalty.ts` — points calculation + redemption logic
- `src/lib/referral.ts` — referral code generation + credit logic
- `src/components/product/VideoPlayer.tsx`
- `src/components/gallery/UGCGallery.tsx`
- `src/app/(frontend)/gallery/page.tsx`
- `src/app/api/loyalty/redeem/route.ts` — calculate redemption

### Files to Modify
- `src/collections/Customers.ts` — add `loyaltyPoints`, `referralCode`
- `src/collections/Products.ts` — add `video` upload field
- `src/globals/SiteSettings.ts` — add `whatsappNumber`, `loyaltyPointsPer100`, `referralReward`
- `src/app/(frontend)/account/page.tsx` — add loyalty points, referral section
- `src/app/(frontend)/account/register/page.tsx` — accept ref param
- `src/app/(frontend)/products/[slug]/page.tsx` — add WhatsApp button, video, UGC section
- `src/app/(frontend)/checkout/page.tsx` — add loyalty points redemption
- `src/lib/store/cart.ts` — add loyalty discount calculation
