# CLO-64: Landing page — CMS content blocks merge

## Overview

Restored textImage CMS content blocks from develop branch into the current landing page. Admin can now configure custom text+image sections via the Payload Home page layout, which appear between testimonials and the weave video.

## Changes
- Added LexicalRenderer component (inline) for rendering Payload rich text
- CMS textImage blocks render with optional image position (left/right), gold rule separator, heading, and body content
- Existing dynamic sections preserved: New Arrivals, Trending Now, Best Offers, Shop by Occasion, Instagram Gallery, Testimonials, Weave Video, Newsletter + Promise

## Files
- src/app/(frontend)/page.tsx
