# CLO-51: Change website font to Tenor Sans

## Overview

Replace Sora (display) with Tenor Sans — a warm, rounded, humanist sans-serif better suited for a premium handloom clothing brand. Softer, more feminine, more fashion-appropriate.

## Acceptance Criteria

- [ ] Replace Sora with Tenor Sans via next/font/google in layout.tsx
- [ ] Update `--font-display` CSS variable to Tenor Sans
- [ ] Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)
- [ ] Adjust heading letter-spacing: tighter for Tenor Sans (-0.01em for headings)
- [ ] Keep Public Sans for body text (pairs well)
- [ ] Keep Noto Sans Devanagari for Devanagari script
- [ ] No visual regressions — verify homepage, product pages, checkout

## Technical Notes

- File: `src/app/(frontend)/layout.tsx` — switch `Sora` → `Tenor_Sans`
- File: `src/app/(frontend)/globals.css` — update font-family vars, heading styles
- Tenor Sans is available on Google Fonts: weights 400, 500, 600, 700
