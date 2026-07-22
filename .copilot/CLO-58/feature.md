# CLO-58: Add weaving process video content

## Overview

Shayga's core brand differentiator is "maker-traced" sarees — yet there's zero video showing the actual weaving process. Suta and similar brands showcase weavers at work, building trust and emotional connection.

## Acceptance Criteria

- [ ] Dedicated "The Weave" section on homepage
- [ ] Loopable short video (15-30s) showing a weaver at the loom
- [ ] Fallback: static image + text if no video available
- [ ] Headline: "Every saree has a maker. Meet yours."
- [ ] CTA: "Explore the craft" → links to About page
- [ ] Muted, autoplay (respects user preferences), no controls visible

## Technical Notes

- New file: `src/components/homepage/WeaveVideo.tsx`
- Update: `src/app/(frontend)/page.tsx` — add section
- Use HTML5 `<video>` element: muted, autoplay, loop, playsinline
- Video hosted on R2/S3 as media file
