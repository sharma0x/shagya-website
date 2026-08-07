# CLO-106: Mobile nav — Sarees accordion with Fabric + Weave grid

## Overview

Replaced the plain direct-link "Sarees" in mobile nav with an expandable inline accordion showing Fabric and Weave categories.

## Behavior
- Tap "Sarees" button → expands Fabric (2-col grid) + Weave (2-col grid) + Shop All link
- ChevronDown rotates 180° to indicate open/closed
- Tapping a fabric/weave link → navigates + closes overlay
- Shop All Sarees link at bottom → navigates to /category/all

## Desktop
- Unchanged — hover mega dropdown with 3-col grid

## Files
- `src/components/layout/Header.tsx`
