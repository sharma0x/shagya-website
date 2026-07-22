# CLO-59: Add customer photos / UGC gallery

## Overview

Almost every premium fashion brand showcases real customer photos. Shayga has text-only testimonials. Real customer photos provide powerful social proof and inspire purchase confidence.

## Acceptance Criteria

- [ ] Customer photo grid on homepage (4-6 photos)
- [ ] Each photo: customer image, product name link, customer name (optional)
- [ ] Click opens lightbox or links to product
- [ ] CTA: "Share your look → #ShaygaSaree"
- [ ] CMS-driven — approved customer photo uploads
- [ ] Placeholder images if no customer photos yet

## Technical Notes

- New file: `src/components/homepage/CustomerPhotos.tsx`
- New collection: `src/collections/CustomerPhotos.ts` (image, product relation, customer name, status)
- Update: `src/app/(frontend)/page.tsx` — add section
