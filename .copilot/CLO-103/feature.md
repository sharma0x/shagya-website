# CLO-103: Collections page cards UI improvement

## Overview

Visual upgrade to the collection listing cards on /collections.

## Before
Sharp rectangular edges, zero padding, no background/border, bare content sitting below images with just `mt-6`.

## After
- `rounded-2xl` smooth corners
- `border border-neutral-100 bg-white shadow-xs` card appearance
- `p-5` content area padding replacing bare margin
- `hover:shadow-md hover:-translate-y-0.5` subtle lift interaction
- `transition-all duration-300` smooth animation
- Image uses `rounded-none` to sit flush with card's curving edges

## Files
- `src/app/(frontend)/collections/page.tsx`
