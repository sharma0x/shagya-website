# CLO-40: Unified Product Card + Quick Actions

## Overview

Replace 6 duplicated product card implementations with a single reusable `ProductCard` component. Make cards compact (shorter), add "Add to Cart" and "Buy Now" quick-action buttons on every card. This eliminates 200+ lines of duplicated code across the project.

## Stack Constraints

- **Frontend**: Next.js 16 App Router, React 19, Tailwind v4, OKLCH tokens
- **Cart State**: Zustand store (`src/lib/store/cart.ts`) — already handles `addItem(product, quantity, variant)`
- **Variant Strategy**: Default variant = `size: 'Free', blouseSize: 'Unstitched'` for quick-add
- **Design**: Match existing PDP ProductActions styling, keep cards compact

## OOP / DRY Principles

- **Single `ProductCard` component** in `src/components/product/` — used by ALL pages
- Props: `product`, `variant` (`'grid' | 'compact' | 'row'`), `showWishlist`, `showActions`
- Grid variant = category/collection/search (4-col grid)
- Compact variant = recommendation rows (horizontal scroll, w-40)
- Row variant = wishlist page (full-width row with move-to-cart)
- This eliminates duplicate card HTML in 6 files
- Add-to-cart uses the existing Zustand store — no new API calls
- Buy Now = addItem + router.push('/checkout')

## Acceptance Criteria

### 1. Reusable ProductCard Component
- [x] Create `src/components/product/ProductCard.tsx`
- [x] Props: `product`, `variant`, `showWishlist`, `showActions`, `className`
- [x] Three variants: `grid`, `compact`, `row`
- [x] Replace all 6 duplicate card instances with this component
- [x] Server-component compatible (client wrapper for action buttons)

### 2. Compact Card Design
- [x] Image: `aspect-[4/5]` instead of `aspect-[3/4]` (slightly shorter)
- [x] Name: `text-xs` (was `text-sm`) single line clamp
- [x] Price: `text-xs` with discount inline
- [x] Padding: `p-0` on wrapper, `mt-2` spacing
- [x] Grid gap: `gap-3` (was `gap-4/y-10`)
- [x] Cards are ~20-30% shorter vertically

### 3. Add to Cart Button on Cards
- [x] `ProductCardActions` client wrapper — wraps buttons in a `'use client'` shell
- [x] "Add to Cart" button: calls `useCart().addItem(product, 1, defaultVariant)`
- [x] Default variant: `{ size: 'Free', blouseSize: 'Unstitched' }`
- [x] Button appears on hover (desktop) or below image (mobile)
- [x] Green "Added ✓" feedback for 1.5s after click
- [x] Button disabled if product is out of stock (uses `product.quantity <= 0 && product.trackQuantity`)

### 4. Buy Now Button on Cards
- [x] "Buy Now" button: same addItem + `router.push('/checkout')`
- [x] Appears next to "Add to Cart" on hover
- [x] Distinct style (outline vs filled) to differentiate from Add to Cart

### 5. Cart Quantity Controls
- [x] **Already implemented** in CartDrawer.tsx — +/- buttons with min 1, max 10
- [x] No changes needed for this feature
- [x] Verify working: increment/decrement calls `updateQuantity()` in Zustand store

### 6. Replace All Card Instances
- [x] Category page (`category/[slug]/page.tsx`) — grid variant
- [x] Collection page (`collections/[slug]/page.tsx`) — grid variant
- [x] Homepage productGrid (`page.tsx`) — grid variant
- [x] Search page (`search/page.tsx`) — grid variant
- [x] RecommendationRow (`RecommendationRow.tsx`) — compact variant
- [x] Wishlist page (`wishlist/page.tsx`) — row variant

## Technical Notes

### Files to Create
- `src/components/product/ProductCard.tsx` — unified product card (server component)
- `src/components/product/ProductCardActions.tsx` — client wrapper with add-to-cart + buy now buttons

### Files to Modify
- `src/app/(frontend)/category/[slug]/page.tsx` — replace inline card with `<ProductCard />`
- `src/app/(frontend)/collections/[slug]/page.tsx` — replace inline card
- `src/app/(frontend)/search/page.tsx` — replace inline card
- `src/app/(frontend)/page.tsx` — replace homepage productGrid card
- `src/app/(frontend)/wishlist/page.tsx` — replace inline card
- `src/components/product/RecommendationRow.tsx` — replace inline card

### ProductCard Component API
```typescript
interface ProductCardProps {
  product: {
    id: string | number
    name: string
    slug: string
    basePrice: number
    compareAtPrice?: number | null
    weave?: string | null
    fabric?: string | null
    gallery?: any
    quantity?: number | null
    trackQuantity?: boolean | null
  }
  variant?: 'grid' | 'compact' | 'row'
  showWishlist?: boolean
  showActions?: boolean  // add-to-cart + buy now buttons
  className?: string
}
```

### How Quick-Add Handles Variants
```
User clicks "Add to Cart" on a card
  → ProductCardActions (client component)
  → const { addItem } = useCart()
  → addItem(product, 1, { size: 'Free', blouseSize: 'Unstitched' })
  → Zustand store updates cart
  → Button shows "Added ✓" for 1.5s
```

The user can always go to PDP to select specific size/blouse options. Quick-add is for impulse purchases with defaults.
