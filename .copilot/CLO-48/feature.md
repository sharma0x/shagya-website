# CLO-48: Security & Compliance

## Overview

Add rate limiting on public APIs, CAPTCHA on forms (registration/checkout/contact), cookie consent banner, terms consent checkboxes, and GDPR/DPDP data export.

## Stack Constraints

- **Frontend**: Next.js 16, React 19, existing forms
- **Backend**: Payload 3.x, existing API routes
- **No external CAPTCHA service**: Use honeypot (already on forms) + simple math challenge or Turnstile (free)
- **Rate limiting**: In-memory or Postgres-based (no Redis dependency)
- **Design**: Match existing design system (rounded-xl, neutral colors, font-body)

## OOP / DRY Principles

- Rate limiting: single `rateLimit()` wrapper function applied to all API routes
- CAPTCHA: single provider module → swap implementation without changing forms
- Cookie consent: single banner component shown once per session
- Consent checkboxes: extend existing form patterns (checkbox + label)
- Data export: single endpoint that aggregates customer data from all collections

## Acceptance Criteria

### 1. Rate Limiting
- [ ] `src/lib/rate-limit.ts` — in-memory rate limiter (Map + setTimeout cleanup)
- [ ] Config: X requests per Y seconds per IP
- [ ] Apply to: login attempts (5/min), registration (3/min), newsletter (10/min), form submit (5/min), search (30/min), general API (100/min)
- [ ] Rate limit exceeded: 429 response with "Too many requests. Try again in X seconds."
- [ ] Header: `Retry-After` + `X-RateLimit-Remaining`
- [ ] Wrap in `withRateLimit(handler, options)` HOF for easy application

### 2. CAPTCHA / Bot Protection
- [ ] Registration form: math challenge ("What is 3 + 4?") or honeypot (already exists on forms)
- [ ] Login form: add after N failed attempts (not on first try)
- [ ] Contact form: already has honeypot — enhance with rate limit
- [ ] Checkout: no CAPTCHA (friction would hurt conversions), rely on rate limit
- [ ] Cloudflare Turnstile as alternative (free, privacy-friendly) — if desired
- [ ] `src/components/ui/Captcha.tsx` — math challenge component

### 3. Cookie Consent Banner
- [ ] `<CookieConsent />` component: bottom banner on first visit
- [ ] "This site uses cookies for functionality and analytics. [Accept] [Decline] [Learn More]"
- [ ] Accept: set `cookie-consent=true` cookie (1 year)
- [ ] Decline: set `cookie-consent=false`, disable GA/localStorage tracking
- [ ] Learn More → links to Privacy Policy page
- [ ] Only show if no consent cookie exists
- [ ] Minimal design: matches site style, not intrusive

### 4. Terms & Privacy Consent Checkboxes
- [ ] Registration: "I agree to the Terms of Service and Privacy Policy" checkbox (required)
- [ ] Links to `/terms` and `/privacy` pages (already exist)
- [ ] Checkout: "I agree to the Return Policy" checkbox (existing pages)
- [ ] Newsletter: "I consent to receiving marketing emails" checkbox
- [ ] All checkboxes validated server-side

### 5. Data Export (GDPR/DPDP)
- [ ] Account settings: "Download My Data" button
- [ ] `GET /api/account/me/export` — aggregates: customer profile, addresses, orders, reviews, wishlist
- [ ] Response: JSON file download
- [ ] Processing takes 1-2 seconds (synchronous, fine for small data)
- [ ] Confirmation email: "Your data export is ready"

## Technical Notes

### Files to Create
- `src/lib/rate-limit.ts`
- `src/components/ui/Captcha.tsx`
- `src/components/ui/CookieConsent.tsx`
- `src/app/api/account/me/export/route.ts`

### Files to Modify
- All API routes in `src/app/api/` — wrap with rate limiting
- `src/app/(frontend)/account/register/page.tsx` — add CAPTCHA + consent checkboxes
- `src/app/(frontend)/checkout/page.tsx` — add consent checkbox
- `src/app/(frontend)/layout.tsx` (or root layout) — add CookieConsent
- `src/components/newsletter/NewsletterForm.tsx` — add consent checkbox
