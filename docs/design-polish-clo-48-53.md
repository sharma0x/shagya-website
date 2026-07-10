# SHAYGA — Storefront Design Polish Plan (CLO-48 → CLO-53)

> Implementation plan for the design feedback collected on 2026-07-08.
> Covers six discrete changes, each tracked as one Linear issue. Per past
> practice each issue gets its own `.copilot/CLO-XX/feature.md` (to be created
> at branch-checkout time) — this document is the consolidated master plan.
> Source of truth: token definitions live in `src/app/(frontend)/globals.css`;
> brand context in `.impeccable.md`; AGENTS.md forbidden-font list governs
> font choices.

---

## 0. Issue-to-CLO mapping

| CLO    | Title                                                                | Branch                              | Type     |
| ----- | -------------------------------------------------------------------- | ----------------------------------- | -------- |
| CLO-48 | Swap typography to Newsreader (display) + General Sans (body)        | `refactor/clo-48-typography-swap`   | refactor |
| CLO-49 | Replace strikethrough sale price with subtle "Listed at" line        | `refactor/clo-49-price-treatment`   | refactor |
| CLO-50 | Introduce light-pink section backgrounds (logo-tinted rhythm)        | `feat/clo-50-blush-section-bg`      | feat     |
| CLO-51 | Replace desktop inline nav with catalogue hamburger drawer           | `feat/clo-51-catalogue-drawer-nav`   | feat     |
| CLO-52 | Make account + wishlist header icons always visible                  | `fix/clo-52-header-icons-visible`   | fix      |
| CLO-53 | Unify product card component + tighten New Arrivals whitespace       | `refactor/clo-53-product-card-unify` | refactor |

> Each branch is cut from `develop`, branched in the same `feat/fix/refactor/clo-XX-slug` shape as previous tickets. PRs go to `develop`.

> ⚠️ **Linear MCP not installed in this repo.** I cannot create these issues programmatically. Issue bodies are drafted verbatim in §10 below — paste them into Linear (team `Clow`, labels per change) to materialize the issues. Alternatively, install the Linear MCP server in `~/.config/opencode/opencode.jsonc` and I can create them on next session.

---

## 1. Sequencing and dependencies

```
CLO-48 (typography)          ←─── independent, ship first (lowest risk, others build on its type scale)
       │
       ├── CLO-49 (price)          (uses new body font; tiny edit, can ship anytime after CLO-48)
       ├── CLO-50 (pink bg)        (passes through any section; ship before CLO-53 so product grid inherits bg)
       ├── CLO-52 (header icons)  (independent — ship anytime)
       │
CLO-51 (catalogue drawer)    ←─── touches the same Header.tsx as CLO-52; merge CLO-52 first, then CLO-51 reAuthors Header
       │
CLO-53 (product card unify)  ←─── depends on CLO-48 (type), CLO-49 (price), CLO-50 (bg); consumes the new ProductCard component everywhere
```

**Recommended merge order:** 48 → 50 → 49 → 52 → 51 → 53.

CLO-53 closes the loop — it is the consolidation ticket that ensures every product surface uses one shared `<ProductCard>` component.

---

## 2. CLO-48 — Typography swap

### Goal
Replace the geometric display + neutral body with a softer, more boutique-appropriate pair, per `.impeccable.md` direction _"serif display, craft details, old-world quality cues."_

| Current        | New             | Why                                                                                  |
| -------------- | --------------- | ------------------------------------------------------------------------------------ |
| Sora (display) | **Newsreader**  | Literary serif — softer than Fraunces (banned), Playfair (banned). Editorial warmth. |
| Public Sans (body) | **General Sans** | Humanist sans with a softer rhythm than Public Sans's banking-app neutrality.        |

### Constraints
- **Newsreader** is on Google Fonts → loads via `next/font/google` (no source-of-truth change required).
- **General Sans** is **NOT on Google Fonts**. It's published by Fontshare / Indian Type Foundry under their free-for-commercial license. Two integration options:
  1. Download the `.woff2` files (Regular, Medium, Semibold, Bold) into `public/fonts/general-sans/` and load via `next/font/local`. **Recommended** — keeps the self-hosting + zero-CLS guarantees from `next/font`.
  2. Add Fontshare CSS `<link>` to `<head>` in `layout.tsx`. Simpler but loses `next/font`'s `display: swap` + font-fallback behaviour tuning.
- AGENTS.md forbidden list: Inter, DM Sans, Playfair Display, Fraunces — none of these are in scope.
- Devanagari font (`Noto Sans Devanagari`) stays untouched.

### Files touched
- `src/app/(frontend)/layout.tsx` — replace `Sora` / `Public_Sans` imports with `Newsreader` (google) + `General_Sans` (local). Update `variable:'--font-display'` / `--font-body` assignments. Keep `display: swap`. Map weights: Newsreader 400/500/600/700; General Sans 400/500/600/700.
- `src/app/(frontend)/globals.css` — update `--font-display` and `--font-body` token strings; lower `--font-body`'s default letter-spacing slightly (`-0.005em`). No other token changes.
- `public/fonts/general-sans/*.woff2` — add binary assets (download once at branch setup, document source URL in commit body).
- Any explicit `font-family` override in components — audit with `grep -r "font-family" src/`. Replace Sora references.

### Type-scale & weights
- Newsreader at headings: weight 500 for h2/h3, 600 for h1 (sighter because serifs feel heavier at equal weight than geometric sans).
- Body base size unchanged (1rem). Letter-spacing -0.005em on body, -0.01em on headings (unchanged).
- Italic available (Newsreader has real italics) — valuable for editorial pull-quotes; no immediate use but unlocks future weave-guide styling.

### Acceptance
- [ ] `next/font` self-hosting for both fonts; Lighthouse font-display audit passes (no `font-display: block`).
- [ ] All headings render in Newsreader; all body copy in General Sans across homepage, category, collections, blog, account.
- [ ] No Sora / Public Sans references remain in source (`ripgrep Sora`, `ripgrep Public_Sans` clean).
- [ ] `make typecheck` and `make lint` clean.
- [ ] Devanagari still renders correctly (no regression on Noto Sans Devanagari).

### Verification
1. `pnpm dev` → visit `/`, `/blog`, `/products/[slug]`, `/account/login` — visually confirm serif headlines + softer body.
2. DevTools → Network → filter "Fonts" — confirm Newsreader + General Sans served from `_next/static/media/` (self-hosted).
3. Check Hindi script in any seed content still uses Noto Sans Devanagari.

---

## 3. CLO-49 — Replace strikethrough sale price with subtle "Listed at" line

### Goal
Remove the discount-bin treatment (`<span class="line-through">` + `% OFF`) currently in 5 locations. Replace with a quiet secondary line under the price in neutral-low-contrast tone that says _"Listed at ₹X,XXX"_ — no strikethrough, no percentage.

### Current state (5 sites, all rendering¾ strikethrough):

| File                                                       | Line | Notes                                             |
| ---------------------------------------------------------- | ---- | ------------------------------------------------- |
| `src/app/(frontend)/page.tsx`                              | 453  | Homepage New Arrivals grid. No `% OFF` tag here.  |
| `src/app/(frontend)/category/[slug]/page.tsx`              | 280  | Has strikethrough + `% OFF` tag (lines 280–292).   |
| `src/app/(frontend)/collections/[slug]/page.tsx`           | 162  | Has strikethrough + `% OFF` tag (lines 162–174).   |
| `src/app/(frontend)/search/page.tsx`                       | 223  | Search results — strikethrough + tag.             |
| `src/app/(frontend)/products/[slug]/page.tsx`              | 242  | PDP — strikethrough only (no % tag there).         |

### New treatment (single, applied everywhere)
```tsx
<div className="font-display mt-2 text-sm font-semibold text-neutral-900">
  <span>₹{p.basePrice.toLocaleString('en-IN')}</span>
</div>
{p.compareAtPrice && p.compareAtPrice > p.basePrice ? (
  <p className="font-body mt-0.5 text-[11px] text-neutral-400">
    Listed at ₹{p.compareAtPrice.toLocaleString('en-IN')}
  </p>
) : null}
```
- No `line-through`, no `% OFF` colour, no green tag, no bold.
- Price stays primary; only when there IS a `compareAtPrice` higher than base do we render the tagline.
- PDP variant: same wording, slightly larger (`text-xs`).

### Acceptance
- [ ] All 5 files use the same treatment.
- [ ] No CSS `line-through` remains on product price elements.
- [ ] No `% OFF` text rendered anywhere.
- [ ] If `compareAtPrice` is null or ≤ basePrice, no secondary line appears.
- [ ] Visual pass on homepage, category, collections, search, PDP — treatment reads as premium, not discount.
- [ ] `make typecheck` clean.

### Verification
- Seed DB has products with `compareAtPrice` set — verify on `/category/silk` and `/collections/[a-collection-slug]`.
- Verify a product without `compareAtPrice` shows only the single price (no orphan "Listed at" strings).

---

## 4. CLO-50 — Light-pink section backgrounds

### Goal
Add a soft blush tint — high-lightness tint of the logo's brand hue 346 — to specific sections of the homepage and supporting pages. Warm-white stays the default; blush creates rhythm.

### Token addition (`src/app/(frontend)/globals.css`)
```css
/* Light-pink section background — brand-hue 346, very-light chroma */
--color-surface-blush: oklch(0.97 0.022 346);
--color-surface-blush-deep: oklch(0.94 0.032 346); /* for emphasis sections */
```
- `--color-surface` (warm white) unchanged — stays default body bg.
- `--color-surface-blush` used as a Tailwind class: `bg-surface-blush` (Tailwind v4 picks up via the `@theme` block).

### Sections that get blush (homepage)
Per user direction, primary emphasis is the **New Arrivals product grid** section (the CLO-53 whitespace target). Other sections on the homepage get blush at lower priority:

| Section                                            | Treatment                                          |
| -------------------------------------------------- | -------------------------------------------------- |
| New Arrivals product grid (`src/app/(frontend)/page.tsx` ~L417-468) | `bg-surface-blush` on the section wrapper. Primary target. |
| Testimonials section                               | `bg-surface-blush-deep` — slightly deeper for emotional climax. |
| Instagram gallery section                          | `bg-surface-blush` — distinct from testimonials.   |
| Newsletter / story section                         | Warm-white (untouched) — keep contrast so blush doesn't overrun. |

### Supporting pages
- Category / Collections toolbar row → `bg-surface-blush` chip background tint.
- 404 page hero → `bg-surface-blush`.
- Wishlist empty state → `bg-surface-blush`.
- Page NOT mod: PDP stays on warm white (product photos need accurate saree colour — do not wash them in pink).

### Acceptance
- [ ] `--color-surface-blush` token defined and exposed via Tailwind class `bg-surface-blush` (verifiable by Tailwind v4 picking up from `@theme`).
- [ ] New Arrivals section on homepage reads with a soft blush, not flat white.
- [ ] No product photo area blush-tinted.
- [ ] Treatment survives dark-mode (not yet in scope — leave as is).
- [ ] `make typecheck` clean.

### Verification
- Eyeball the `/` route homepage on desktop + mobile — confirm the blush appears only on the intended sections, not backgrounding every block.
- Compare OKLCH contrast ratio between `--color-surface-blush` and `--color-neutral-900` text → ensure ≥7:1 for AAA. Expected ~14:1 (very light bg, near-black text) — safe.

---

## 5. CLO-51 — Catalogue hamburger drawer (replaces inline desktop nav)

### Goal
Replace the current six-link inline desktop nav (`Silk / Cotton / Handloom / Designer / Collections / Journal`) with a single hamburger (three-line) icon that opens a full catalogue drawer on **all** breakpoints — desktop included. Inside the drawer, only three top-level entries:

1. **New Arrivals**
2. **Saree Collection** (expandable)
   - Shop by Occasion
   - Shop by Fabric
   - Shop by Color
3. **Designer Sarees**

### Current state (`src/components/layout/Header.tsx:13-20`)
```ts
navLinks = [Silk, Cotton, Handloom, Designer, Collections, Journal]
```
- Desktop renders `navLinks` inline (`hidden lg:flex`).
- Mobile renders the same `navLinks` in the existing full-screen mobile overlay.
- The hamburger (`Menu` icon at line 150) is `lg:hidden` — appears only below desktop.

### Target structure
- Remove inline desktop `<nav>` entirely (lines 82–93).
- Hamburger menu icon visible on **all** breakpoints (remove `lg:hidden` from the menu button at line 150).
- One drawer component reused on all breakpoints — remove the duplicated mobile-overlay block (lines 161–231); fold its account/wishlist list into the new drawer footer.
- Drawer uses brand-tinted surface (`--color-surface-blush` background for sub-tiles, `--color-surface-raised` for active).
- Drawer is full-height on mobile, right-aligned ~480px-wide panel on desktop (`max-w-md`).
- Sub-items under "Saree Collection" are revealed by an inline chevron toggle (no separate sub-route — accordion disclosure).
- Soft type treatment per CLO-48: top-level items Newsreader `text-2xl sm:text-3xl` weight 500, secondary items General Sans `text-base` weight 500.
- Soft motion: drawer slides in 320ms ease-out; accordion sub-list slides with `slide-up` keyframe (already in `globals.css`).

### Routes the sub-options point at
| Label                | Existing route pattern                                   |
| -------------------- | -------------------------------------------------------- |
| New Arrivals         | `/category/new-arrivals` (new category; ensure seed has it) |
| Shop by Occasion     | `/category/bridal`, `/category/festive`, `/category/daily` (occasion filter; already supported in `category/[slug]/page.tsx`) |
| Shop by Fabric       | `/category/silk`, `/category/cotton`, …  (already supported — fabric slug key) |
| Shop by Color        | `/category/red`, `/category/blue`, …  (needs new color facet — see CLO-53/Products schema; until then, link to a `_color` query key on the category page) |
| Designer Sarees      | `/category/designer` (already exists in current `navLinks`) |

> ⚠️ "Shop by Color" needs the `color` field on Products, which exists in the schema (per earlier CLO-2/3 work, `color` column was manually added). The category page's `where` builder does NOT yet filter by color. Plan CLO-51 to add a small color-filter branch in `category/[slug]/page.tsx` mirroring the fabric branch (lines 79–88). Keep the change scoped.

### Files touched
- `src/components/layout/Header.tsx` — deflagged to remove inline desktop nav; hamburger always shown; rule: drawer instead of conditional overlay.
- NEW `src/components/layout/CatalogueDrawer.tsx` — client component, single drawer reused on all breakpoints; props `{ open, onClose }`. Renders the three top-level entries with one accordion.
- `src/app/(frontend)/category/[slug]/page.tsx` — extend the fabric/weave branch to a color branch:
```ts
const colors = ['red', 'blue', 'green', 'yellow', 'pink', 'purple', ...]
if (colors.includes(slug.toLowerCase())) {
  where.color = { equals: slug.toLowerCase() }
  title = `${title} Sarees`
  description = `Sarees in ${slug} tones — handwoven, naturally dyed.`
}
```
- Optional: `scripts/seed-data.ts` — ensure a `new-arrivals` category exists (or route falls back to a `?sort=newest` query on `/category/all`).

### Acceptance
- [ ] Desktop no longer shows the inline 6-link nav.
- [ ] Hamburger icons visible on ≥1280px viewports (open dev tools, viewport 1280+, click hamburger).
- [ ] Drawer opens on all breakpoints.
- [ ] Exactly three top-level items; "Saree Collection" expands to exactly three sub-items.
- [ ] All three sub-options link to a working page with products (allow empty state where color filter has no matches yet — no 500s).
- [ ] Drawer closes on Escape, on backdrop click, on link-click.
- [ ] Keyboard accessible: drawer arrow-keys through top-level items; Enter/Space toggles accordion.
- [ ] Soft typography from CLO-48 applied; not Sora.
- [ ] No layout shift when drawer opens on desktop (use right-panel, not full-screen overlay).

### Verification
1. `pnpm dev`; view `/` at viewport widths 375, 768, 1280, 1920 — hamburger visible at each.
2. Keyboard nav through drawer — confirm focus traps within while open.
3. Ensure wishlist + account (from CLO-52) still visible and reachable.

---

## 6. CLO-52 — Header account + wishlist icons visible at all breakpoints

### Goal
Today the Account (`User`) and Wishlist (`Heart`) icons in `Header.tsx` use `hidden sm:inline-flex` — they disappear below 640px. Remove the `sm:` minimum constraint so both icons appear between Search and Cart on mobile, tablet, and desktop.

### Current state (`src/components/layout/Header.tsx`)
- Line 108–114: Account `<Link>` has `hidden ... sm:inline-flex`.
- Line 116–135: Wishlist `<Link>` has `hidden ... sm:inline-flex`.

### Change
- Replace both `hidden ... sm:inline-flex` with `inline-flex` (or simply remove the `hidden` and `sm:` modifier).
- Keep the rest of the styling exactly as is (`min-h-[44px] min-w-[44px]`, hover states, badge count for wishlist).
- Mobile-only Account + Wishlist entries inside the existing mobile overlay (lines 213–228) become redundant **only if CLO-51 merges first** (which folds the overlay into the new drawer). If CLO-51 lands later, keep the overlay's duplicate Account/Wishlist for mobile parity until then; remove in CLO-51.

### Acceptance
- [ ] Account and Wishlist icons visible at viewport 375px (mobile).
- [ ] Both icons retain ≥44px tap targets.
- [ ] Wishlist badge counter still renders above-zero on mobile.
- [ ] No horizontal overflow introduced in the header action cluster on 320px viewports (may need to compress `gap-1` to `gap-0.5` on mobile only).
- [ ] `make typecheck` clean.

### Verification
- Open `/` at 375px width in Device Toolbar (Chrome devtools) — confirm Account + Wishlist icons appeared between Search and Cart.

---

## 7. CLO-53 — Unify product card + tighten New Arrivals whitespace

### Goal
Today, every product surface reimplements the card markup inline. Five files share five slight variants, and the homepage New Arrivals grid has excessively large vertical padding (`py-16 sm:py-24 md:py-32` ≈ 256px top/bottom at md+), which the user identified as "feels unfinished."

### Inconsistencies today

| Variant            | Homepage `page.tsx:442-457` | Category `[slug]/page.tsx:269-294` | Collections `[slug]/page.tsx:151-172` | Search `search/page.tsx` |
| ------------------ | --------------------------- | ---------------------------------- | -------------------------------------- | ------------------------ |
| Product name size  | `text-base font-semibold`   | `text-sm font-semibold`            | `text-sm font-semibold`                | `text-sm font-semibold`  |
| Wishlist button    | absent                      | present                            | absent                                 | absent                   |
| Image component    | `SkeletonImage`             | `SkeletonImage`                    | plain `Image`                           | plain `Image`            |
| Image rounding     | `rounded-xl`                | `rounded="none"`                   | `rounded-xl`                            | `rounded-xl`             |
| Price treatment    | strikethrough, no % OFF     | strikethrough + % OFF              | strikethrough + % OFF                  | strikethrough + % OFF    |
| Grid                | `grid-cols-2 lg:grid-cols-4` | `grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` | same as category              | varies                   |

### Solution: shared `<ProductCard>` component
Create `src/components/product/ProductCard.tsx`:

```tsx
type ProductCardProps = {
  product: Product // from payload-types
  showWishlistButton?: boolean // default false; category pages set true
  priority?: boolean // first card in a grid may set true for eager LCP image
}
```
- One aspect ratio: `aspect-[3/4]`.
- One rounding: `rounded-xl`.
- One image component: `SkeletonImage` (handles invalid srcs gracefully).
- One WishlistButton optional via prop.
- One price treatment (the CLO-49 "Listed at" line).
- One name treatment: `text-sm font-semibold font-display` (Newsreader after CLO-48).
- Subtext (weave · fabric) standardized.

### Homepage New Arrivals section tightening (`page.tsx` ~L417-468)
- Outer section: `py-16 sm:py-24 md:py-32` → **`py-12 sm:py-16 md:py-20`** (cuts top + bottom padding roughly in half).
- Inner grid gap: `gap-4 sm:gap-6` → **`gap-6 sm:gap-8`** (slightly tighter cells, denser grid).
- Above-grid header block: leave roughly 4xl spacing between eyebrow + heading + grid — keep breathing room above the grid, remove the foot of dead space below it before the next section.
- Apply blush bg per CLO-50.

### Files touched
- NEW `src/components/product/ProductCard.tsx`.
- `src/app/(frontend)/page.tsx` — replace inline card markup (~line 429–460) with `<ProductCard product={p} />`. Reduce section padding (see above).
- `src/app/(frontend)/category/[slug]/page.tsx` — replace lines 252–294 with `<ProductCard product={p} showWishlistButton />`.
- `src/app/(frontend)/collections/[slug]/page.tsx` — replace lines 132–172 with `<ProductCard product={p} />`.
- `src/app/(frontend)/search/page.tsx` — replace inline card markup with `<ProductCard product={p} />`.
- PDP related-products section (if any) — same `<ProductCard>` for visual continuity.

### Acceptance
- [ ] Only one product card markup in the repo (`src/components/product/ProductCard.tsx`).
- [ ] All five surfaces (homepage, category, collections, search, PDP-related) consume `<ProductCard>`.
- [ ] Image consistent: same `aspect-[3/4]`, same `rounded-xl`, same `SkeletonImage`.
- [ ] Wishlist button optional via prop; existing category-page behaviour preserved.
- [ ] Price treatment already updated in CLO-49 — `<ProductCard>` simply renders that treatment and never adds strikethrough.
- [ ] New Arrivals section on homepage visibly tighter — no more "unfinished / too much whitespace" perception.
- [ ] Snapshot test for `<ProductCard>` added under `src/components/product/ProductCard.test.tsx` (vitest).
- [ ] Existing Header / Footer / Logo tests still pass (`make test`).
- [ ] `make typecheck` + `make lint` clean.

### Verification
1. Diff-side-by-side `/` (homepage), `/category/silk`, `/collections/[slug]`, `/search?q=silk` — cards should look identical across all four.
2. Mobile viewport 375px — confirm grid still collapses to 2 columns and tap targets stay ≥44px.

---

## 8. Cross-cutting risks & rollback

| Risk                                                  | Mitigation                                                                                                |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| General Sans `.woff2` files committed to repo increase bundle size | Keep only 4 weights (400/500/600/700) + latin subset. Skip italics for General Sans (rarely needed in body). |
| Hamburger-on-desktop breaks user's muscle memory     | Keep CLO-51 behind a feature flag (`NEXT_PUBLIC_CATALOGUE_DRAWER`) so a quick env flip reverts to inline nav if needed. (Optional.) |
| Removing strikethrough loses discount signal entirely | "Listed at" line still communicates comparison value; intentional quietness matches premium positioning. |
| Light-pink sections lower saree-photo contrast        | Rule: never apply blush as bg behind a product image; only behind section padding/grids. PDP remains warm-white. |
| `<ProductCard>` changes break existing snapshot tests | Add the component snapshot test first; update page-level snapshots (if any) with `pnpm test -- -u`. |

### Rollback
Each branch is independent. If any one merge causes regression, revert that single PR; the other five survive because of the planned sequencing in §1.

---

## 9. Verification checklist (post-merge of all six)

- [ ] Homepage opens with blush New Arrivals section, tighter spacing, Newsreader headings, General Sans body, brand-stripped sale price, all icons visible, hamburger drawer navigates to a working New Arrivals / Saree Collection / Designer Sarees page.
- [ ] `/category/silk` shows the unified `<ProductCard>` with optional Wishlist button; price treatment matches.
- [ ] `/collections/[slug]` shows the same `<ProductCard>`.
- [ ] `/search?q=saree` shows the same `<ProductCard>`.
- [ ] `/products/[slug]` PDP price affirmative; no strikethrough, no `% OFF`.
- [ ] Mobile 375px viewport: Account + Wishlist icons visible in header; hamburger drawer slides from right; Collections accordion expands to three sub-options.
- [ ] Desktop 1920px viewport: no inline nav links; hamburger drawer slides from right as a 480px panel; blush sections visible.
- [ ] `make typecheck && make lint && make test` green on `develop`.

---

## 10. Linear issue drafts (paste into Linear, team `Clow`)

> Each block is a complete Linear issue body. Recommended labels are noted in the title line.

### CLO-48 — Swap storefront typography to Newsreader + General Sans (labels: Design, Frontend)

```
Replace the geometric display (Sora) and neutral body (Public Sans) with a softer, boutique-appropriate pair per the .impeccable.md serif-display direction:

- Display: Newsreader (Google Fonts, via next/font/google) — weights 400/500/600/700
- Body: General Sans (Fontshare, not on Google Fonts — self-host the .woff2 files in public/fonts/general-sans/ and load via next/font/local) — weights 400/500/600/700

Touches:
- src/app/(frontend)/layout.tsx — swap font imports + variable binds
- src/app/(frontend)/globals.css — update --font-display / --font-body tokens, body letter-spacing -0.005em
- Audit any inline font-family overrides in src/

Acceptance:
- All headings render in Newsreader; all body copy in General Sans across all storefront routes
- No Sora / Public Sans references remain in source
- Devanagari (Noto Sans Devanagari) untouched
- next/font self-hosting verified (no external <link>)
- make typecheck + make lint clean

References: docs/design-polish-clo-48-53.md §2
```

### CLO-49 — Replace strikethrough sale price with quiet "Listed at" line (labels: Design, Frontend)

```
Discount-bin visual treatment (strike-through + % OFF) does not match premium positioning. Replace across all 5 sites with a single quiet secondary line under the price.

New treatment (applied uniformly):
  <div className="text-sm font-semibold font-display">₹{basePrice}</div>
  {compareAtPrice > basePrice ? (
    <p className="mt-0.5 text-[11px] text-neutral-400 font-body">
      Listed at ₹{compareAtPrice}
    </p>
  ) : null}

5 files to update:
- src/app/(frontend)/page.tsx (around L449-456)
- src/app/(frontend)/category/[slug]/page.tsx (around L276-293)
- src/app/(frontend)/collections/[slug]/page.tsx (around L158-174)
- src/app/(frontend)/search/page.tsx (around L223)
- src/app/(frontend)/products/[slug]/page.tsx (around L242)

Acceptance:
- No line-through on price elements anywhere
- No "% OFF" text anywhere
- If compareAtPrice is null or ≤ basePrice, no secondary line renders
- Treatment consistent on homepage, category, collections, search, PDP

References: docs/design-polish-clo-48-53.md §3
```

### CLO-50 — Light-pink section backgrounds on homepage (labels: Design, Frontend)

```
The all-warm-white storefront reads dull for a clothing brand. Introduce a soft blush tint (high-lightness tint of brand hue 346) on select homepage sections to create rhythm. Warm-white stays default body bg.

Tokens added to src/app/(frontend)/globals.css @theme block:
  --color-surface-blush: oklch(0.97 0.022 346);
  --color-surface-blush-deep: oklch(0.94 0.032 346);

Sections to receive blush:
- New Arrivals product grid → bg-surface-blush (PRIMARY target — pairs with CLO-53)
- Testimonials → bg-surface-blush-deep
- Instagram gallery → bg-surface-blush
- Newsletter / story sections → stay warm-white (contrast)
- PDP page → stays warm-white (product photography needs accurate saree colour)
- 404 hero, wishlist empty state, category toolbar → blush tint

Acceptance:
- bg-surface-blush Tailwind class resolves (Tailwind v4 picks up @theme tokens)
- New Arrivals homepage section visibly blushy on desktop + mobile
- No product image area gets pink bg
- WCAG AAA contrast preserved (≥7:1 between blush bg and neutral-900 text)

References: docs/design-polish-clo-48-53.md §4
```

### CLO-51 — Replace desktop inline nav with catalogue hamburger drawer (labels: Design, Frontend)

```
Today the desktop nav inline-renders six links (Silk / Cotton / Handloom / Designer / Collections / Journal). Replace with a single hamburger icon (visible at ALL breakpoints) that opens a right-side drawer containing only three top-level entries:

  1. New Arrivals
  2. Saree Collection (accordion):
     - Shop by Occasion
     - Shop by Fabric
     - Shop by Color
  3. Designer Sarees

Touches:
- src/components/layout/Header.tsx — remove inline desktop nav, hamburger always shown, drawer instead of conditional overlay
- NEW src/components/layout/CatalogueDrawer.tsx — single client drawer reused on all breakpoints; right-panel max-w-md on desktop, full-screen on mobile; accordion for Saree Collection
- src/app/(frontend)/category/[slug]/page.tsx — add color facet branch (mirroring existing fabric/weave branches at L79-102) so /category/red etc. works
- scripts/seed-data.ts — ensure 'new-arrivals' category exists

Acceptance:
- No inline desktop nav at any breakpoint
- Hamburger visible at 375, 768, 1280, 1920
- Exactly 3 top-level items expandable to exactly 3 sub-items
- All sub-options link to a working page (empty state acceptable where colour filter has no matches yet)
- Drawer closes on Escape + backdrop click + link click
- Keyboard navigable (focus trap, arrow keys, Enter/Space for accordion)
- Type treatment uses Newsreader (CLO-48) for top-level, General Sans for subs

References: docs/design-polish-clo-48-53.md §5
```

### CLO-52 — Header account + wishlist icons visible on all breakpoints (labels: Design, Frontend, fix)

```
Today the Account (User icon) and Wishlist (Heart icon) Links in src/components/layout/Header.tsx use `hidden ... sm:inline-flex` (lines 108-135), so they vanish below 640px. The user reported wanting both icons on the main page between Search and Cart. They already exist on desktop — only mobile-cloaked.

Fix:
- Remove `hidden` and the `sm:` modifier on both Links; use plain `inline-flex`
- Keep min-h/width 44px, hover states, wishlist badge counter
- Verify header action cluster doesn't overflow on 320px viewports (compress gap-1 → gap-0.5 on xs if needed)
- CLO-51 will fold the now-redundant mobile-menu Account/Wishlist rows into the new catalogue drawer; if CLO-51 hasn't merged, leave the mkdir'd entries in the mobile overlay for parity

Acceptance:
- Account + Wishlist icons visible at 375px viewport
- Tap targets ≥44px
- Wishlist badge counter renders above-zero on mobile
- No horizontal scroll introduced on 320px

References: docs/design-polish-clo-48-53.md §6
```

### CLO-53 — Unify product card component + tighten New Arrivals whitespace (labels: Design, Frontend, refactor)

```
Every product surface today (homepage, category, collections, search) reimplements the product card markup inline. Five variants exist with subtle inconsistencies in name text-size, image component, rounding, wishlist button presence, price treatment. The homepage New Arrivals section also has excessive vertical padding (py-16 sm:py-24 md:py-32 ≈ 256px) that the user described as "unfinished, too much whitespace."

Solution: extract a single <ProductCard> component and consume it everywhere.

NEW src/components/product/ProductCard.tsx:
  props: { product, showWishlistButton?: boolean, priority?: boolean }
  - aspect-[3/4] (one ratio)
  - rounded-xl (one rounding)
  - SkeletonImage (one image component)
  - WishlistButton optional via prop
  - text-sm font-semibold font-display for name (Newsreader after CLO-48)
  - Price treatment already shipped in CLO-49 (Listed at line)
  - subtext: weave · fabric, text-xs text-neutral-400

Files consuming <ProductCard>:
- src/app/(frontend)/page.tsx (replace inline L429-460)
- src/app/(frontend)/category/[slug]/page.tsx (replace L252-294, showWishlistButton)
- src/app/(frontend)/collections/[slug]/page.tsx (replace L132-172)
- src/app/(frontend)/search/page.tsx (replace inline card markup)

Homepage New Arrivals section tightening:
- Outer section: py-16 sm:py-24 md:py-32 → py-12 sm:py-16 md:py-20
- Inner grid gap: gap-4 sm:gap-6 → gap-6 sm:gap-8
- Apply bg-surface-blush per CLO-50

Acceptance:
- Only one product card markup in the repo
- All five surfaces visually consistent (same ratio, rounding, name size, price treatment, image component)
- Wishlist button optional via prop; existing category-page behaviour preserved
- New Arrivals homepage section visibly tighter
- Snapshot test added at src/components/product/ProductCard.test.tsx
- make typecheck + make lint + make test green

Depends on: CLO-48 (new type faces), CLO-49 (price), CLO-50 (blush bg) all merged first.

References: docs/design-polish-clo-48-53.md §7
```

---

## 11. Notes and open items

- **General Sans source**: Confirm Fontshare's license still permits commercial static-hosting at time of implementation. Their FAQ at the time of writing permits it for both self-hosted and Fontshare-CDN use. If license changes, fall back to **Switzer** (also Fontshare, similar vibe) or **Outfit** (Google Fonts, slightly more geometric but warm).
- **Linear MCP**: Not installed in this repo's opencode config (`~/.config/opencode/opencode.jsonc` is essentially empty). To let opencode create issues directly, install the Linear MCP server (e.g., `linear-mcp-server` via npx) and configure it in `opencode.jsonc`. Then re-run this session's `§10` step and opencode can POST each block directly.
- **Branches**: All six branches are cut from `develop`, not from `feat/clo-47-brand-rename`. The CLO-47 brand rename lands on `develop` first; then each polish branch picks it up.
- **Before each PR merges**: run `make typecheck && make lint && make test` green on the branch. The user prefers `--no-verify` commits locally due to the husky/lint-staged Git 2.30 incompatibility (documented in `.opencode/memory.md`).
- **Feature flag option for CLO-51**: If you want the catalogue drawer to ship dark behind a toggle (faster rollback), wrap Header drawer mount in `process.env.NEXT_PUBLIC_CATALOGUE_DRAWER === 'on'`. Otherwise, ship plain.