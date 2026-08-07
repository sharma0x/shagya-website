# CLO-98: PDP equal section spacing

## Overview

Standardized spacing between all sections on the product detail page for a consistent, premium feel.

## Changes

| Section | Before | After |
|---|---|---|
| Page container | `py-10 md:py-14` | `py-12 md:py-16` |
| Details (Weave Story + Specs) | `mt-20 pt-16` | `mt-12 pt-12 border-t border-neutral-200` |
| Recommendation rows | `p-8 border-t` | `px-8 pt-12 pb-8 border-t border-neutral-200` |

All sections now share consistent `mt-12 pt-12 border-t` separation with `px-8` horizontal padding.

## Files
- `src/app/(frontend)/products/[slug]/page.tsx`
