# CLO-94: Cart merge on guest login

## Overview

Guest cart items now properly merge into account cart on login.

## Server-side merge
- `POST /api/cart` merges incoming items with existing by product.id + variant
- Same product+variant → keeps higher quantity
- Different product+variant → appends
- Products not in incoming list → preserved (account cart items)

## Client-side sync
- `Header.tsx`: `useEffect` watches `sessionData.user`
- On login: `syncWithServer()` pushes localStorage cart → server
- Then `loadFromServer()` hydrates Zustand with merged server state
- Prevents localStorage from overwriting server cart for returning users

## Files
- `src/app/api/cart/route.ts`
- `src/components/layout/Header.tsx`
