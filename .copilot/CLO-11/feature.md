# CLO-11: Improve Website UI — Reduce Empty Space, Add Visual Interest

## Overview

The homepage feels sparse with too much uniform spacing between 12 sections. Sections blend together visually — alternating `bg-white` / `bg-brand-50/20` isn't enough differentiation. The "Shop the Collection" CTA (hero button) and product sections lack visual pull to drive clicks.

## Current State

12 sections on homepage (`src/app/(frontend)/page.tsx`):

1. Hero — full-bleed bg image, CTA, stats bar (OK)
2. Trust Features — grid of 5 cards (functional)
3. Shop by Category — grid of category cards (functional)
4. New Arrivals — product carousel
5. Shop by Occasion — circle icon buttons
6. Best Sellers — product carousel
7. Trending Colors — color swatch circles
8. Trending Now — product carousel
9. Blog Posts — 3-column card grid
10. Instagram Gallery — placeholder image grid
11. Testimonials — 3-column card grid
12. Newsletter + Promise Band

## Problems Identified

- **Uniform spacing**: Every section uses identical `py-16 sm:py-20 md:py-28` — no rhythm
- **Weak section transitions**: Alternating bg colors isn't enough visual separation
- **"Shop the Collection" lacks urgency**: Hero CTA is a flat button, no visual pull
- **Occasion buttons feel generic**: Circle icons in a row don't convey the emotion of each occasion
- **No decorative elements**: No patterns, graphics, or background flourishes
- **Product carousels are plain**: Functional but not visually exciting
- **Instagram gallery uses placeholders**: Real design intent unclear

## Goals

1. Create visual rhythm with varied section spacing and decorative transitions
2. Add subtle background patterns/graphics to fill empty space without clutter
3. Make hero CTA and product sections more compelling
4. Add visual interest to occasion browsing
5. Maintain brand identity (OKLCH warm amber/saffron, Sora/Public Sans)
6. Follow Impeccable design principles (no gradient text, no border-left accents)

## Acceptance Criteria

- Homepage feels more visually engaging without being busy
- Each section has distinct visual character
- "Shop the Collection" CTA draws attention
- Occasion section feels warmer and more inviting
- All decorative elements use brand OKLCH colors
- Responsive at all breakpoints
- Zero regressions on existing functionality

## Technical Notes

- Tailwind v4 CSS-based `@theme` tokens in `globals.css`
- OKLCH color space only
- Use existing components where possible (ProductCard, CategoryCard, etc.)
- Svg patterns as background images (inline in CSS or as separate components)
- No new external dependencies
