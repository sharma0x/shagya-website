# CLO-47: Internationalization & Localization

## Overview

Add multi-language support (Hindi, Tamil), multi-currency (USD, GBP, AED for NRI/export), GST invoice generation, and size guide for sarees.

## Stack Constraints

- **Frontend**: Next.js 16 App Router with [locale] route groups or Next.js i18n
- **Backend**: Payload 3.x localization (built-in)
- **Design**: Noto Sans Devanagari already loaded for Hindi
- **No i18n library**: Use Next.js built-in routing + Payload localization
- **Minimal scope**: Start with Hindi + English (Tamil later)

## OOP / DRY Principles

- Multi-language: use Payload's built-in `localization` config — NO custom i18n framework
- Multi-currency: single utility converts INR → target currency via fixed rate (no live API)
- GST invoice: reuse invoice system from CLO-42
- Size guide: simple CMS page (reuses existing pages/blocks system)

## Acceptance Criteria

### 1. Multi-Language (Hindi + English)
- [ ] Payload config: enable `localization` with `locales: ['en', 'hi']`
- [ ] Localize fields on: Products, Pages, Posts, Categories, Collections, Navigation
- [ ] Next.js i18n routing: `/[lang]/products/...` (or accept-language header)
- [ ] Language switcher: dropdown in header (🇮🇳 EN / 🇮🇳 HI)
- [ ] Hindi product data: provide Hindi names, descriptions (can be AI-translated from seed data)
- [ ] Hindi UI strings: navigation, buttons, cart, checkout (hardcoded translations object)
- [ ] Fallback: show English if Hindi translation missing
- [ ] RTL not needed (Hindi uses same LTR direction)

### 2. Multi-Currency
- [ ] SiteSettings: add `supportedCurrencies` array (INR, USD, GBP, AED)
- [ ] Currency switcher: dropdown in header/footer
- [ ] `src/lib/currency.ts` — `convertPrice(amount, from, to)` using hardcoded rates
- [ ] Store selected currency in cookie + Zustand
- [ ] Display: show converted price with locale formatting (`₹1,850` / `$22` / `£17`)
- [ ] Checkout: always charge in INR, show converted amount as reference
- [ ] Product prices: show INR + converted in brackets (or switch fully)

### 3. GST Invoice Generation
- [ ] Covered in CLO-42 (Order Management) — cross-reference
- [ ] Multi-currency: invoice shows INR amount (legal requirement)
- [ ] HSN code field on Products: add `hsnCode` text field
- [ ] Invoice includes: GSTIN, HSN code, CGST+SGST breakdown
- [ ] B2B vs B2C invoice format differences

### 4. Size Guide
- [ ] CMS Page: `/size-guide` (created via Pages collection blocks)
- [ ] Content: saree measurements (length, width), blouse measurements
- [ ] Link: "Size Guide" link in footer, product detail page
- [ ] Visual: simple diagram/table showing measurements
- [ ] Product detail: "Saree length: 5.5m" already shown from product data

## Technical Notes

### Files to Create
- `src/lib/currency.ts` — currency conversion utility
- `src/lib/i18n.ts` — Hindi UI translations object
- `src/components/ui/LanguageSwitcher.tsx`
- `src/components/ui/CurrencySwitcher.tsx`

### Files to Modify
- `src/payload.config.ts` — add localization config
- Multiple collections: add `localized: true` to localizable fields
- `src/components/layout/Header.tsx` — add language + currency switchers
- `src/collections/Products.ts` — add `hsnCode` field
- `src/globals/SiteSettings.ts` — add `supportedCurrencies`
- All frontend pages: wrap content in locale-aware components
- Seed data: add Hindi translations for products, pages, navigation
