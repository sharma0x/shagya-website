# CLO-89: Colors — case-insensitive filter matching + Variants 52-option select

## Overview

Fixed color filter matching and migrated Variants color from free text to dropdown.

## Case-insensitive matching
- `color.includes()` → `color.some(sel => sel.toLowerCase() === c.value)`
- `facets.colors?.some(f => f.value === c.value)` → `f.value.toLowerCase() === c.value`
- Fixed bug where "Red" variant color never matched "red" palette value

## Variants color → select
- Changed from `type: 'text'` to `type: 'select'` with all 52 palette colors
- Admin gets dropdown instead of free text input
- Eliminates typos and ensures palette-exact matches

## Files
- `src/components/product/ProductFilters.tsx`
- `src/collections/Variants.ts`
