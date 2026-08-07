# CLO-102: Fix Back to store alignment on login/register pages

## Overview

The "Back to store" link and heading were horizontally offset from the form card on login and register pages.

## Root cause
Outer wrapper used `w-full` (edge-to-edge) while the inner form card used `mx-auto max-w-lg` (centered). The back link sat at the unconstrained left edge while the form appeared centered.

## Fix
Moved `max-w-lg mx-auto` from the inner form-card div to the outer wrapper div. Back link, heading, and form card now all share the same centered container.

## Files
- `src/app/(frontend)/account/login/page.tsx`
- `src/app/(frontend)/account/register/page.tsx`
