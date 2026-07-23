# CLO-65: Add stock urgency indicators on product cards

## Overview

Premium fashion sites show "Only 3 left" type indicators without discounting. For handloom products where each piece is unique, stock urgency is truthful (limited weaves, small batches) and drives legitimate purchase urgency.

## Acceptance Criteria

- [ ] "Only X left" badge on product cards when stock ≤ 5
- [ ] "Just 1 left" badge for last piece (different color)
- [ ] Data from product inventory/variant stock
- [ ] Badge: small, amber/rose colored, positioned below price or above image
- [ ] Only shows when stock is genuinely low — never fake scarcity
- [ ] Connected to actual inventory from Payload variants

## Technical Notes

- Update: `src/components/product/ProductCard.tsx` — add stock badge
- Read from `product.variants[].stock` or `product.totalStock`
- Badge style: text-xs, subtle background, no flashy animations
