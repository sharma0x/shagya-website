# CLO-60: Add quick-wishlist button on product cards

## Overview

Both Bewakoof and Suta have hover quick-wishlist buttons on product cards. Shayga cards are plain links with no interactive elements. Adding a heart icon overlay increases wishlist engagement and provides instant feedback.

## Acceptance Criteria

- [ ] Wishlist heart icon overlay on product card hover (desktop)
- [ ] Wishlist icon always visible on mobile cards (top-right corner)
- [ ] Click toggles wishlist state (filled heart = in wishlist)
- [ ] Toast notification: "Added to wishlist" / "Removed from wishlist"
- [ ] Unauthenticated users: click redirects to login
- [ ] Works on homepage, category pages, search results
- [ ] Consistent with ProductCard component (CLO-52)

## Technical Notes

- Update: `src/components/product/ProductCard.tsx` — add wishlist button
- Reuse: existing `POST /api/wishlist` and `DELETE /api/wishlist` endpoints
- Use `useSession()` for auth state check
