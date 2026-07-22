# Linear Tickets — Shayga Session (20-21 July 2026)

Below are 13 tickets to create on Linear under the **Clow** team.

---

## Group A: Missing from Linear Plans (Features Already Implemented)

---

### CLO-6: Add country and state dropdowns to address forms

**Priority:** High | **Labels:** Frontend, Backend | **Project:** P2

**Description:**
Added country and state dropdown fields to all address forms (checkout, account addresses, shipping/billing). The address forms previously only had text fields for country and state — now they use select dropdowns with pre-populated values. Includes a comprehensive country list with Indian states mapped.

**Files changed:**
- `src/collections/Addresses.ts` — added select field types
- `src/components/checkout/` — address form components
- `src/app/(frontend)/account/addresses/` — address management pages

**AC:**
- Country dropdown with all UN countries (India default)
- State dropdown populated based on selected country
- Both dropdowns work on checkout and account address forms

---

### CLO-7: Pincode verification API with India Post proxy

**Priority:** High | **Labels:** Backend, API | **Project:** P2

**Description:**
Created Next.js API routes that proxy to the India Post pincode API for pincode verification and city search. The backend validates Indian 6-digit pincodes, returns city/state/district information, and includes in-memory caching to reduce external API calls.

**Endpoints:**
- `POST /api/pincode/verify` — validates a pincode and returns location data
- `GET /api/pincode/city-search` — searches cities by name/partial pincode

**Files:**
- `src/app/api/pincode/verify/route.ts`
- `src/app/api/pincode/city-search/route.ts`
- `src/lib/pincode.ts` — proxy + cache logic

**AC:**
- Verify endpoint accepts 6-digit pincode and returns city, state, country
- City search supports partial matching
- Responses cached for 24 hours
- Error handling for invalid pincodes and API downtime

---

### CLO-8: Pincode autofill for city, state, country

**Priority:** High | **Labels:** Frontend, Backend | **Project:** P2

**Description:**
When a customer enters a valid 6-digit Indian pincode in the address form, the form automatically fetches and fills the city, state, and country fields. Uses the CLO-7 pincode verification API. Includes debounced input to avoid excessive API calls while typing.

**Files changed:**
- `src/components/address/` — autofill logic
- `src/app/(frontend)/checkout/` — checkout form integration
- `src/app/(frontend)/account/addresses/` — account address form integration

**AC:**
- On pincode input (6 digits), auto-fetch location data
- Auto-fill city, state fields
- Show loading indicator during fetch
- Handle invalid/unknown pincodes gracefully

---

### CLO-9: Phone input with country code

**Priority:** Medium | **Labels:** Frontend | **Project:** P3

**Description:**
Replaced plain text phone inputs with a country-code-aware phone input component across all forms (registration, checkout, account). Includes country flag, country code dropdown, and input masking for phone numbers. Indian +91 default.

**Files changed:**
- `src/components/ui/PhoneInput.tsx` — new component
- Updated all address/account/checkout forms

**AC:**
- Country code dropdown with flags (India default)
- Phone number input with basic validation
- Stores full international format (+91XXXXXXXXXX)
- Available on registration, checkout, and account pages

---

### CLO-80: Recently Viewed + Related Products on PDP

**Priority:** Medium | **Labels:** Frontend | **Project:** P3

**Description:**
Added "Recently Viewed" and "Related Products" recommendation rows on the product detail page. Recently Viewed tracks the last 8 products viewed by the user via localStorage. Related Products shows items from the same category/collection. Uses the existing `RecommendationRow` component.

**Files:**
- `src/components/product/RecommendationRow.tsx`
- `src/app/(frontend)/products/[slug]/page.tsx`
- `src/lib/recently-viewed.ts` — localStorage tracking

**AC:**
- Recently Viewed shows last 8 products (from localStorage, no login required)
- Related Products shows items from same category
- Both sections render as horizontal scrollable cards
- Skeleton loading states while data fetches

---

### CLO-81: Add brand, tags, and features fields to Products

**Priority:** Medium | **Labels:** Backend, Frontend | **Project:** P3

**Description:**
Extended the Products collection with three new fields: `brand` (relationship to Brands), `tags` (comma-separated text for filtering), and `features` (array of product badges shown on PDP). Updated the product detail page to render brand name, tags as clickable pills, and feature badges.

**Files:**
- `src/collections/Products.ts` — added `brand`, `tags`, `features` fields
- `src/app/(frontend)/products/[slug]/page.tsx` — renders brand/tags/features
- `src/collections/Brands.ts` — Brands collection (already existed)
- Migration: `20260714_084351` (brand_id, tags columns)

**AC:**
- Brand field links to Brands collection
- Tags stored as comma-separated text, displayed as pills on PDP
- Features array of { label: string }, displayed as badges
- All three fields editable in admin panel

---

### CLO-82: Coupon code system

**Priority:** High | **Labels:** Backend, Frontend | **Project:** P4

**Description:**
Complete coupon/discount system for the checkout flow. Administrators create coupon codes in the admin panel with type (percentage/fixed/free-shipping), value, minimum cart value, usage limits, date range, and campaign description. Customers can apply/remove coupons on the checkout page. Includes validation API endpoint, pre-populated offers section, and auto-increment of `usedCount` on successful use.

**Files:**
- `src/collections/Coupons.ts` — full collection with all fields
- `src/globals/SiteSettings.ts` — `activeCoupons` relationship for featured offers
- `src/app/api/coupons/validate/route.ts` — server-side validation
- `src/app/api/coupons/active/route.ts` — pre-populated offers endpoint
- `src/app/(frontend)/checkout/page.tsx` — coupon input/apply/remove UI
- `src/app/api/razorpay/verify/route.ts` — auto-increment usedCount

**AC:**
- Admin can create coupons with type, value, min cart, limits, date range
- Checkout page shows coupon input with apply/remove
- Pre-populated offers section shows active coupons from SiteSettings
- Validation checks: code exists, active, within date range, usage limit, min cart
- `usedCount` increments automatically after successful payment

---

## Group B: Bug Fixes from Production Deployment (This Session)

---

### Bug-Fix-1: Order status update fails — Neon idle-in-transaction timeout

**Priority:** Urgent | **Labels:** Backend, Database, Bug | **Project:** P2

**Description:**
Changing an order's status from the admin panel resulted in an infinite submitting spinner. Investigation revealed the order status was NOT saved to the database, but confirmation emails WERE sent. Root cause: the `afterChange` hook in `src/collections/Orders.ts` ran a synchronous for-loop inside the parent database transaction. For each order item, it made 2 sequential DB calls to update `purchaseCount` on products. These DB calls kept the connection inside the transaction while Neon's 5-second idle-in-transaction timeout killed the connection. The transaction rolled back (order save reversed), but the detached promise for email sending used its own connection and succeeded.

Additionally, internal API calls (`payload.create` for event-logs, `payload.findByID`/`update` for products) were missing `overrideAccess: true`, causing access control failures when the request user context wasn't available in detached or chained execution contexts.

**Fix:**
1. Moved the entire `purchaseCount` increment loop from the synchronous `afterChange` hook into the existing `scheduleSideEffects` function (detached promise context)
2. Added `overrideAccess: true` to all three internal API call sites
3. The `scheduleSideEffects` function now accepts an optional `items` parameter for the purchaseCount loop
4. The `afterChange` hook now completes in under 500ms — the order save commits before side effects run

**Files:**
- `src/collections/Orders.ts` — restructured hook chain (lines 5-218)

**AC:**
- Changing order status immediately reflects in the database
- ConfirmedAt/ShippedAt/DeliveredAt auto-set on the correct status change
- Order confirmation emails continue to send
- Purchase count increments happen asynchronously without blocking the save
- No idle-in-transaction timeout errors in Vercel logs

---

### Bug-Fix-2: Email OTP login redirect not navigating to account page

**Priority:** High | **Labels:** Frontend, Auth, Bug | **Project:** P5

**Description:**
After entering the email OTP code and clicking Verify, the API call succeeded (OTP was consumed from the database) but the user stayed on the login page with no visible redirect. Clicking Verify again returned HTTP 400 because the OTP was already consumed. Root cause: the login page used `router.push('/account')` for navigation. Better Auth sets the session cookie via `Set-Cookie` header in the OTP verify response. With client-side `router.push`, the new page render did not pick up the freshly-set cookie, causing the `/account` page's `useSession()` auth guard to redirect back to `/account/login`. The user perceived this as "nothing happened."

**Fix:**
Changed `router.push('/account')` to `window.location.href = '/account'` in the login page. This forces a full browser navigation (hard reload) that includes the new session cookie in the request headers, allowing the server-side session check on `/account` to pass successfully.

**Files:**
- `src/app/(frontend)/account/login/page.tsx` (line 66)

**AC:**
- After OTP verification, user is redirected to account dashboard
- Session cookie is properly set and readable on the destination page
- No 400 errors on duplicate clicks (second click prevented or handled gracefully)

---

### Bug-Fix-3: Missing database schema — coupons fields + site_settings relationship tables

**Priority:** Urgent | **Labels:** Backend, Database, Bug | **Project:** P2

**Description:**
Multiple schema fields were added to the code (collections) but never formally migrated to the production Neon database. This caused runtime errors:
1. `coupons.description` and `coupons.influencer_code` — added in CLO-82 but no migration existed
2. `site_settings_rels` and `_site_settings_v_rels` — needed for the `activeCoupons` relationship on SiteSettings, but these join tables were never created
3. Migration `20260714_084351` was not idempotent — it tried to CREATE TYPE again for enums already created by earlier migrations (20260702), causing "type already exists" errors

Additionally, Payload's `push: false` setting prevents automatic schema sync, so every field addition MUST have a formal migration. Several intermediary migrations were generated by Payload's `migrate:create` but contained overlapping/deduplicated operations.

**Fix:**
1. Made migration `20260714_084351` idempotent — replaced raw CREATE TYPE/ALTER with IF NOT EXISTS / DO $$ blocks
2. Created new migration `20260719_123300_add_coupons_fields_and_rels` adding:
   - `coupons.description` (varchar)
   - `coupons.influencer_code` (varchar)
   - `site_settings_rels` table (join table for SiteSettings.activeCoupons)
   - `_site_settings_v_rels` table (version join table)
3. Created helper scripts for future setups:
   - `scripts/wipe-db.cjs` — drops all public tables for fresh start
   - `scripts/create-missing-tables.cjs` — creates Better Auth tables + site_settings rels

**Files:**
- `src/migrations/20260714_084351.ts` (idempotent fix)
- `src/migrations/20260719_123300_add_coupons_fields_and_rels.ts`
- `src/migrations/20260719_123300_add_coupons_fields_and_rels.json`
- `scripts/create-missing-tables.cjs`
- `scripts/wipe-db.cjs`

**AC:**
- All 9 migrations run successfully against a fresh Neon database
- `coupons` table has 15 columns (including description and influencer_code)
- `site_settings_rels` and `_site_settings_v_rels` tables exist with proper foreign keys
- `make db-migrate-prod` completes without errors

---

### Bug-Fix-4: Email adapter selects Mailpit (local SMTP) instead of Resend in production

**Priority:** High | **Labels:** Backend, Email, Bug | **Project:** P2

**Description:**
On Vercel production, emails failed with "connect ECONNREFUSED 127.0.0.1:1025" because the email adapter was incorrectly selecting the nodemailer/Mailpit adapter instead of Resend. Root cause: the adapter switch in `payload.config.ts` only checked `MAILPIT_SMTP_HOST` being truthy. If this dev-only environment variable was accidentally set on Vercel (e.g., from uploading the wrong .env file during initial setup), the app would use the local SMTP adapter instead of Resend for ALL emails. There was no production guard.

This affected both Payload's email adapter (used by transactional emails) and the standalone email sender in `src/lib/email.ts` (used by form submissions).

**Fix:**
1. Added `process.env.NODE_ENV === 'production'` guard to the adapter switch in both `src/payload.config.ts` and `src/lib/email.ts`
2. In production (`NODE_ENV=production` on Vercel), the app now ALWAYS uses Resend regardless of `MAILPIT_SMTP_HOST` value
3. In development, the existing Mailpit check still applies (for local testing)
4. Updated `.env.production` to explicitly exclude MAILPIT_SMTP_HOST

**Files:**
- `src/payload.config.ts` (line 203) — `!isProduction && process.env.MAILPIT_SMTP_HOST`
- `src/lib/email.ts` (line 15) — same guard

**AC:**
- Production emails use Resend adapter
- No 127.0.0.1:1025 connection errors in Vercel logs
- Dev mode still uses Mailpit for local testing
- Form submission emails use Resend in production

---

### Bug-Fix-5: Media URLs hardcoded to wrong Vercel deployment domain

**Priority:** High | **Labels:** Backend, Media, Bug | **Project:** P2

**Description:**
Product images loaded with absolute URLs pointing to an old Vercel preview deployment (`shagya-website-dq44s6wvn-kartikeyshivams-projects.vercel.app`) instead of the production domain (`shagya-website.vercel.app`). Images appeared as broken/broken links on the website even though the API correctly served them when accessed directly. Root cause: `payload.config.ts` `serverURL` configuration prioritized `VERCEL_URL` (an auto-assigned deployment-specific URL set by Vercel) over `NEXT_PUBLIC_SERVER_URL` (explicitly set to the canonical production domain). When media was uploaded during seeding, Payload stored absolute URLs with the Vercel auto-assigned domain. Every new Vercel deploy gets a different `VERCEL_URL`, making the old URLs invalid.

**Fix:**
1. Reversed `serverURL` priority in `src/payload.config.ts` — `NEXT_PUBLIC_SERVER_URL` now takes precedence over `VERCEL_URL`. Fallback chain: `NEXT_PUBLIC_SERVER_URL → VERCEL_URL → http://localhost:3000`
2. Re-seeded the database after the fix so media records now use relative URLs (`/api/media/file/saree-01.jpg`) that resolve to the correct deployment domain at query time
3. Removed trailing slash from `NEXT_PUBLIC_SERVER_URL` to prevent double-slash URL construction

**Files:**
- `src/payload.config.ts` (line 226)
- `.env.production`
- `infra/.env.production`

**AC:**
- All product images display correctly on production
- Media URLs use the canonical domain (shagya-website.vercel.app)
- Changing Vercel deployment does not break existing media URLs
- `NEXT_PUBLIC_SERVER_URL` in Vercel env controls the domain used for media

---

### Bug-Fix-6: Better Auth tables missing in production database

**Priority:** Urgent | **Labels:** Backend, Auth, Database, Bug | **Project:** P2

**Description:**
Better Auth requires 7 dedicated database tables (`user`, `session`, `account`, `verification`, `twoFactor`, `passkey`, `jwks`) that are separate from Payload's tables. These tables were never created on the production Neon database because the `@better-auth/cli migrate` command failed on Windows (access violation / esbuild crash) and there was no fallback.

Payload's `push: false` setting means only explicit migrations create tables. Since Better Auth manages its own schema through its CLI tool (not Payload migrations), there was a gap: no migration existed, the CLI failed, and the tables were missing. This caused signup and login errors on Vercel.

Additionally, the `user` table was missing the `twoFactorEnabled` boolean column required by Better Auth's twoFactor plugin (even when 2FA is not enabled by the user, the column must exist for the plugin to function).

**Fix:**
1. Created `scripts/create-missing-tables.cjs` that creates all 7 Better Auth tables with the correct column definitions matching Better Auth v1.6.x schema
2. Added `twoFactorEnabled boolean DEFAULT false` to the `user` table definition
3. Added `site_settings_rels` and `_site_settings_v_rels` table creation to the same script for completeness
4. All table creation uses `CREATE TABLE IF NOT EXISTS` for idempotency

**Files:**
- `scripts/create-missing-tables.cjs`

**AC:**
- All 7 Better Auth tables exist on production Neon
- Email OTP signup and verification work
- User sessions are properly stored
- `twoFactorEnabled` column exists on `user` table
- Script is idempotent (safe to run multiple times)
