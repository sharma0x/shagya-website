# CLO-61: Navbar mega menu — Sarees dropdown

## Overview

Replaced 6 hardcoded nav links (Silk, Cotton, Handloom, Designer, Collections, Journal) with a clean 3-link nav: Sarees (mega dropdown), Collections, Journal. Handloom and Designer were broken links showing all products.

## Desktop
- Hover triggers dropdown with Fabric (9 items, 3-col grid) + Weave (11 items, 3-col grid)
- "Shop All Sarees" link at bottom
- Animated brand-wine underline on hover
- Clicking "Sarees" navigates to /category/all
- Dropdown flattened into navbar (no gap/card/shadow)

## Mobile
- "Sarees" is a direct link to /category/all — no dropdown needed
- Collections and Journal as regular links

## Other
- Footer: removed Handloom/Designer, added Banarasi/Kanchipuram/All Sarees
- Header test updated
- Wider dropdown (min-w-600px, px-10, gap-12)

## Files
- src/components/layout/Header.tsx
- src/components/layout/Footer.tsx
- src/components/layout/Header.test.tsx
