# CLO-63: Redesign trust features section

## Overview

The current trust bar crams 5 features into a narrow row with tiny text and generic icons. Suta and premium brands use clean, spacious cards with clear icon + headline + description — much more trustworthy and premium.

## Acceptance Criteria

- [ ] Replace cramped trust bar with 4 prominent cards
- [ ] Each card: icon + bold headline + short description
- [ ] Layout: 4-card grid on desktop, 2x2 on mobile
- [ ] Cards: Handloom Verified, Free Shipping, Easy Returns, Secure Payment
- [ ] Use `section` with proper `aria-label` for accessibility
- [ ] Clean bounding box cards with slight shadow and rounded corners

## Technical Notes

- Update: `src/app/(frontend)/page.tsx` — replace trust bar JSX
- Icons: `lucide-react` (ShieldCheck, Truck, RotateCcw, Lock)
- Match existing card styling pattern (rounded-xl, border, shadow-xs)
