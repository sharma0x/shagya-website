# CLO-62: Add size guide and measurement chart

## Overview

No size or measurement information exists anywhere on the site. Clothing e-commerce must have size guides to reduce returns and build buyer confidence. For sarees, this means standard dimensions, blouse measurements, and fit guidance.

## Acceptance Criteria

- [ ] `/size-guide` page with measurement charts
- [ ] Saree standard dimensions (5.5m, 6m, etc.)
- [ ] Blouse measurement guide (bust, waist, shoulder)
- [ ] Visual diagram showing measurement points
- [ ] Link in footer: "Size Guide"
- [ ] Link in product detail page spec section
- [ ] CMS-driven — content managed as a Payload page

## Technical Notes

- New file: `src/app/(frontend)/size-guide/page.tsx`
- Update: `src/components/layout/Footer.tsx` — add link
- Update: `src/app/(frontend)/products/[slug]/page.tsx` — add link near specs
- Page content from Payload pages collection
