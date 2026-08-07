# CLO-57: Add collection/theme banners

## Overview

Shayga lacks seasonal or themed collections like "Wedding Edit", "Festive Picks", "Summer Cotton Edit". These curated collections help customers discover products by intent rather than by fabric, increasing AOV.

## Acceptance Criteria

- [ ] 3-4 collection banners in a 2x2 grid
- [ ] Themes: Wedding Edit, Festive Picks, Daily Wear, Gift Guide
- [ ] Each banner: lifestyle image, overlay text, CTA link
- [ ] CMS-driven — collections managed via Payload
- [ ] Mobile: 2-col grid with smaller banners

## Technical Notes

- New file: `src/components/homepage/CollectionBanners.tsx`
- Update: `src/app/(frontend)/page.tsx` — add section
- Link to filtered category pages or CMS collection pages
