# CLO-53: Add login and wishlist icons to mobile header

## Overview

Login/user icon and wishlist icon are currently hidden on mobile (`hidden sm:inline-flex`). Show them on mobile between search and cart for a complete header experience.

## Acceptance Criteria

- [ ] User/login icon visible on mobile header
- [ ] Wishlist icon visible on mobile header with badge count
- [ ] All 4 action icons (search, login, wishlist, cart) fit on mobile layout
- [ ] Icon spacing adjusted for mobile — tighter but still tappable (min 44px touch target)
- [ ] Hamburger menu remains for category filter navigation (CLO-49)
- [ ] No layout overflow on small screens

## Technical Notes

- File: `src/components/layout/Header.tsx` — remove `hidden sm:inline-flex` from user + wishlist
- Adjust `gap-1` to `gap-0.5` or similar to squeeze icons on mobile
- Icon size: 5×5 (w-5 h-5) on mobile is acceptable
