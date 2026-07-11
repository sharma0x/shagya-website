# CLO-73: Add image zoom feature on product detail page

## Overview

Customers need to inspect fabric details, zari work, and weave patterns closely. Added click-to-zoom modal with pinch-to-zoom on mobile and mouse zoom+pan on desktop.

## Features

- Click main image → full-screen zoom modal
- Mouse wheel → zoom in/out (1x-4x)
- Click+drag → pan around
- Pinch gesture → zoom on mobile
- Touch drag → pan on mobile
- Double-click → toggle 2x zoom
- Arrow keys → prev/next image
- Arrow buttons + dot indicators
- Escape / X button → close
- Prevents body scroll when open

## Files

- `src/components/product/ImageZoomModal.tsx` — new zoom modal
- `src/components/product/ProductGallery.tsx` — zoom trigger on main image
