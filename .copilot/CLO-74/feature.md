# CLO-74: Customer Reviews with Photos + Write Review

## Overview

Reviews were only visible on the homepage as testimonials. Added a full review system to product detail pages with customer photos, star ratings, verified purchase badges, write review form, and spam protection.

## What was built

- `ProductReviews.tsx` — single-column Amazon-style review section
- Rating summary: big rating number, star breakdown bars (5★ through 1★)
- Review cards: avatar, name, rating, title, date, body, customer photos
- "Write a Customer Review" button with inline form (star picker, title, body, photo upload)
- Unauthenticated users redirected to login → back to product page
- `POST /api/reviews` API route

## Spam Protection (3 layers)

- **Verified Purchase:** Checks order history for the product → auto-sets verified badge
- **Content Filter:** Blocks URLs/links in title and body
- **Duplicate Detection:** One review per customer per product

## Review Approval

- **Auto-Approved** (`status: 'approved'`) — reviews appear instantly
- No admin moderation needed
- Success message: "Thank you for your review!"

## UI Evolution

1. First version: Basic sidebar + review list layout
2. Second version: Amazon-style grid with rating sidebar
3. Final version: Single column with improved spacing, empty state with embedded CTA

## Files

- `src/components/product/ProductReviews.tsx` — 354 lines, client component
- `src/app/api/reviews/route.ts` — POST endpoint with spam protection
- `src/app/(frontend)/products/[slug]/page.tsx` — reviews fetch + render
