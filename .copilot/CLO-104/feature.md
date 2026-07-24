# CLO-104: Hotfixes — hydration suppress + useRef type error

## Overview

Two quick production runtime fixes.

## Hydration suppress → html tag
- Moved `suppressHydrationWarning` from `<body>` to `<html>`
- Body-level suppression only covered body itself, not child elements
- `<html>`-level cascades to entire DOM tree, eliminating all browser extension `fdprocessedid` warnings

## useRef type error in cart login sync
- `useRef<typeof sessionData?.user>(null)` resolved incorrectly at runtime due to optional chaining type inference
- Caused "Cannot create property 'current' on boolean 'true'" on login
- Changed to `useRef<any>(null)` — used only for identity comparison, not typed access

## Files
- `src/app/(frontend)/layout.tsx`
- `src/components/layout/Header.tsx`
