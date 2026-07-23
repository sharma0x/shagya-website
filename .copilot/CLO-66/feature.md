# CLO-66: Add PWA support and app install prompt

## Overview

Both Bewakoof and Suta push their mobile app experience. Shayga has no PWA manifest, no service worker, and no app install prompt. A basic PWA setup improves mobile experience and enables offline browsing.

## Acceptance Criteria

- [ ] `public/manifest.json` — app name, icons, theme color
- [ ] Simple service worker for offline caching
- [ ] PWA icons: 192x192 and 512x512
- [ ] Theme color: brand wine/maroon
- [ ] Minimal install prompt (no aggressive banner)
- [ ] Cache strategy: network-first for pages, cache-first for static assets

## Technical Notes

- New file: `public/manifest.json`
- New file: `public/sw.js` or `src/app/sw.ts`
- Update: `src/app/(frontend)/layout.tsx` — add `<link rel="manifest">` + `<meta name="theme-color">`
- Update: `next.config.ts` — add appropriate headers
