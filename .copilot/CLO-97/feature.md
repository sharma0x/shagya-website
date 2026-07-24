# CLO-97: Dot hover pauses carousel animation

## Overview

When hovering a navigation dot on the product card carousel, the auto-rotation now pauses and stays on the selected image until the cursor leaves the dot.

## Fix

Moved the `!dotHoveredRef.current` check from the effect body into the interval callback. Previously the check was in the `if` that creates the timer — when the dot was hovered, the timer was destroyed and never restarted because the effect dependencies didn't change. Now the timer always runs on card hover, but just skips advancing when a dot is hovered.

## Result

| Before | After |
|---|---|
| Dot hover → timer destroyed, never restarts | Dot hover → timer keeps running, skips advancing, shows selected image |
| Mouse leaves dot → no animation | Mouse leaves dot → resumes from current image |

## Files
- `src/components/product/ProductCard.tsx`
