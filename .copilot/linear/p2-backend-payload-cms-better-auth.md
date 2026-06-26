# P2: Backend — Payload CMS + Better Auth

**Summary:** All collections, globals, auth flows, admin panel — Cycles 1-5

## Issues

### CLO-10: Create Users collection (Payload admin auth)

**Priority:** Urgent | **Status:** Done | **Estimate:** 3 Points
**Labels:** Database, Auth, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-10/create-users-collection-payload-admin-auth

**Description:**

# <issue id="65d0c7cd-2eee-456e-8d6c-111b572cf2c0" href="https://linear.app/prince-sharma/issue/CLO-10/create-users-collection-payload-admin-auth">CLO-10</issue>: Create Users collection (Payload admin auth)

## Overview

Users collection for admin/staff auth via Payload. Roles: super-admin, admin, editor, content-manager. Email+password login. Admin UI access control by role.

## Acceptance Criteria

- Users collection with email+password auth

---

### CLO-11: Create Products collection (saree schema)

**Priority:** Urgent | **Status:** Done | **Estimate:** 8 Points
**Labels:** Database, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-11/create-products-collection-saree-schema

**Description:**

# <issue id="a8dc8b43-af1a-4cc6-87d6-9a6f1048fdf0" href="https://linear.app/prince-sharma/issue/CLO-11/create-products-collection-saree-schema">CLO-11</issue>: Create Products collection (saree schema)

## Overview

Products collection with saree-specific fields: name, slug, description, fabric, weave, length, pattern, occasion, blouse type, pallu details, border type, weave pattern. Rich text description. Status: draft/published/archived.

## A

---

### CLO-13: Create Product Variants (size, color, blouse)

**Priority:** Urgent | **Status:** Done | **Estimate:** 5 Points
**Labels:** Database, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-13/create-product-variants-size-color-blouse

**Description:**

# <issue id="22ce0726-4042-4a11-81a8-0802d45f8f5b" href="https://linear.app/prince-sharma/issue/CLO-13/create-product-variants-size-color-blouse">CLO-13</issue>: Create Product Variants (size, color, blouse)

## Overview

Variants collection: size (XS-6XL/Free), color, blouse size, stock per variant, SKU, price override. Relationship to Products collection.

## Acceptance Criteria

- Variants collection with relationship to Products
- Size selec

---

### CLO-14: Create Pricing + Inventory structure

**Priority:** Urgent | **Status:** Done | **Estimate:** 5 Points
**Labels:** Database, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-14/create-pricing-inventory-structure

**Description:**

Pricing: base_price, compare_at_price, cost_price, gst_percent (5% sarees), shipping_price. Inventory: track_quantity, quantity, low_stock_threshold (default 5), allow_backorder, sold_individually. Auto-set status=sold_out when quantity=0.

---

### CLO-16: Create Orders + Order Items collections

**Priority:** Urgent | **Status:** Done | **Estimate:** 5 Points
**Labels:** Database, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-16/create-orders-order-items-collections

**Description:**

# <issue id="4f6f67c9-b81c-4f87-8cf1-ebc230bc09fb" href="https://linear.app/prince-sharma/issue/CLO-16/create-orders-order-items-collections">CLO-16</issue>: Create Orders + Order Items collections

## Overview

Orders collection with auto-generated sequential order numbers, status workflow, financial tracking, dual addresses, and embedded order items array. Uses Payload group fields for addresses and array fields for line items.

## Acceptance

---

### CLO-27: Set up Better Auth core + providers

**Priority:** Urgent | **Status:** Done | **Estimate:** 8 Points
**Labels:** Auth, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-27/set-up-better-auth-core-providers

**Description:**

# <issue id="285c2cfb-10f3-4537-a10d-d0ae39032c1c" href="https://linear.app/prince-sharma/issue/CLO-27/set-up-better-auth-core-providers">CLO-27</issue>: Set up Better Auth core + providers

## Overview

Setup `better-auth` v1.6.20 base configuration. Install package, configure auth.ts with PostgreSQL pool adapter, generate secrets. Configure providers: credentials (email+password), OTP (phone), Google OAuth, Facebook OAuth, Apple OAuth. Export

---

### CLO-29: Better Auth ↔ Payload hybrid auth integration

**Priority:** Urgent | **Status:** Done | **Estimate:** 5 Points
**Labels:** Database, Auth, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-29/better-auth-payload-hybrid-auth-integration

**Description:**

# <issue id="7b17bd76-3c5f-4f01-a68e-468ca61511ad" href="https://linear.app/prince-sharma/issue/CLO-29/better-auth-payload-hybrid-auth-integration">CLO-29</issue>: Better Auth ↔ Payload hybrid auth integration

## Overview

Customer table shared between Better Auth and Payload. Better Auth manages credentials/sessions; Payload admin sees read-only customer data. Sync on register via database hooks. Customer collection in Payload linked via bette

---

### CLO-36: Public API routes (products, categories, search, wishlist)

**Priority:** Urgent | **Status:** Done | **Estimate:** 8 Points
**Labels:** Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-36/public-api-routes-products-categories-search-wishlist

**Description:**

# <issue id="8a57ca9c-459c-453d-8502-f6e456088a9b" href="https://linear.app/prince-sharma/issue/CLO-36/public-api-routes-products-categories-search-wishlist">CLO-36</issue>: Public API routes (products, categories, search, wishlist)

## Overview

Public API routes using Next.js App Router with Payload Local API. Product listing with dynamic filters, product detail by slug, full-text search across name and description, wishlist CRUD stubs with Be

---

### PRI-70: Define Users collection (Payload admin users)

**Priority:** Urgent | **Status:** Backlog | **Estimate:** 3 Points
**Labels:** Auth, Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-70/define-users-collection-payload-admin-users

**Description:**

Create `src/collections/Users.ts` with Payload's built-in `auth: true`. Fields: name, email, role (superAdmin/admin/editor/fulfillment/support). Access control: only admins can create users. Test by creating first admin user.

**Cycle**: 1

---

### PRI-71: Define Customers collection (Better Auth-linked)

**Priority:** Urgent | **Status:** Backlog | **Estimate:** 3 Points
**Labels:** Auth, Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-71/define-customers-collection-better-auth-linked

**Description:**

Create `src/collections/Customers.ts` — **NO** `auth: true` (Better Auth handles it). Fields: `betterAuthUserId` (FK to Better Auth [user.id](http://user.id), unique), email, firstName, lastName, phone, addresses (array), wishlist, marketingOptIn, lifetimeValue, etc. Customer can read/update only own record.

**Cycle**: 2

---

### PRI-72: Define Products collection (saree-specific schema)

**Priority:** Urgent | **Status:** Backlog | **Estimate:** 8 Points
**Labels:** Database, Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-72/define-products-collection-saree-specific-schema

**Description:**

## Description

The **largest and most important collection**. Full saree-specific schema with all 30+ custom fields (fabric, weave, work, occasion, blouse piece, region, certifications, etc.).

Reference: `docs/shagya-payloadcms.md` Section 11 (Saree-Specific Product Fields)

## Key fields

- Identity: title, slug, sku, status, tags
- Pricing: price, compareAtPrice, taxIncluded
- Inventory: trackInventory, stockQuantity, lowStockThreshold, stoc

---

### PRI-74: Define Orders collection (with payment + fulfillment)

**Priority:** Urgent | **Status:** Backlog | **Estimate:** 8 Points
**Labels:** Database, Payment, Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-74/define-orders-collection-with-payment-fulfillment

**Description:**

## Description

Server-side only collection. Fields: orderNumber (auto-generated, e.g. SHG-2026-00001), customer (relationship), email, phone, items (array with product snapshot), shippingAddress, subtotal/shippingCost/discount/tax/total, payment (Razorpay fields), fulfillment (Shiprocket fields).

## Access

- create: server-only
- read: customer or admin
- update: admin only
- delete: admin only

## Hooks

- `beforeChange`: auto-generate order

---

### CLO-12: Create Categories + Collections (manual groups)

**Priority:** High | **Status:** Done | **Estimate:** 5 Points
**Labels:** Database, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-12/create-categories-collections-manual-groups

**Description:**

Taxonomy collections: Categories (hierarchical, e.g. Silk → Banarasi → Banarasi Silk), Collections (manual curated groups like "Summer Collection", "Bridal Edit"). Each with name, slug, description, image, parent (for categories).

---

### CLO-15: Create Media collection + image processing

**Priority:** High | **Status:** Done | **Estimate:** 5 Points
**Labels:** Database, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-15/create-media-collection-image-processing

**Description:**

Media collection with Vercel Blob storage. Upload via Payload admin. Image sizes: thumbnail(400×500), card(600×750), product(1200×1500), hero(1920×800). Sharp for resize. Gallery support for products (multiple images).

---

### CLO-17: Create Addresses collection

**Priority:** High | **Status:** Done | **Estimate:** 3 Points
**Labels:** Database, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-17/create-addresses-collection

**Description:**

Addresses collection linked to customers. Fields: full_name, phone, line1, line2, city, state, pincode, country, is_default. Full CRUD via API. Validation: pincode (6 digits India).

---

### CLO-18: Create Coupons / Discounts collection

**Priority:** High | **Status:** Done | **Estimate:** 5 Points
**Labels:** Database, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-18/create-coupons-discounts-collection

**Description:**

## Overview

A Coupons collection for managing discount codes in the Shagya saree ecommerce platform. Supports percentage, fixed amount, and free shipping discount types with cart validation, usage tracking, and date-based expiry.

## Acceptance Criteria

- Coupons collection with unique code field
- Discount type select: percentage, fixed_amount, free_shipping
- Discount value (required for percentage and fixed_amount types)
- Minimum cart valu

---

### CLO-21: Create Pages collection + page builder blocks

**Priority:** High | **Status:** Done | **Estimate:** 5 Points
**Labels:** Content, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-21/create-pages-collection-page-builder-blocks

**Description:**

# <issue id="8c2af45a-cb95-4a84-be57-dab837c21130" href="https://linear.app/prince-sharma/issue/CLO-21/create-pages-collection-page-builder-blocks">CLO-21</issue>: Create Pages collection + page builder blocks

## Overview

Pages collection for static content pages (home, about, contact, FAQ, etc.) with a block-based page builder. Supports templates for common page types plus flexible block layout: hero, text-image, feature-grid, testimonials, F

---

### CLO-22: Create Reviews / Ratings collection

**Priority:** High | **Status:** Done | **Estimate:** 5 Points
**Labels:** Database, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-22/create-reviews-ratings-collection

**Description:**

# <issue id="f459db0f-8071-4c24-a719-016725e6243e" href="https://linear.app/prince-sharma/issue/CLO-22/create-reviews-ratings-collection">CLO-22</issue>: Create Reviews / Ratings collection

## Overview

Reviews collection for customer product reviews. Links to customers, products, and variants. Includes rating (1-5), written review, images, verified purchase flag, and admin moderation workflow.

## Acceptance Criteria

- Reviews collection with

---

### CLO-23: Create Tags, Brands, Fabric Types, Occasion collections

**Priority:** High | **Status:** Done | **Estimate:** 3 Points
**Labels:** Database, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-23/create-tags-brands-fabric-types-occasion-collections

**Description:**

# <issue id="2d5270d3-8151-457b-833c-586a885e5da2" href="https://linear.app/prince-sharma/issue/CLO-23/create-tags-brands-fabric-types-occasion-collections">CLO-23</issue>: Create Tags, Brands, Fabric Types, Occasion collections

## Overview

Four flat taxonomy collections with identical structure: name, slug (auto-generated), description. Used for product/blog categorization and filtering. Replaces existing text/enum fields on Products with ext

---

### CLO-24: Create Global Settings (Payload Global)

**Priority:** High | **Status:** Done | **Estimate:** 3 Points
**Labels:** Content, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-24/create-global-settings-payload-global

**Description:**

# <issue id="b822d895-edf0-4fa3-b301-c4d3dea58c4d" href="https://linear.app/prince-sharma/issue/CLO-24/create-global-settings-payload-global">CLO-24</issue>: Create Global Settings (Payload Global)

## Overview

Singleton global settings using Payload Global config (not a Collection). Centrally manage site branding, contact info, social links, policies, tax settings, and currency configuration from the admin panel.

## Fields

| Field | Type | N

---

### CLO-25: Configure Payload SEO plugin

**Priority:** High | **Status:** Done | **Estimate:** 3 Points
**Labels:** Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-25/configure-payload-seo-plugin

**Description:**

# <issue id="c8db4aac-ef42-45db-a07f-2a132a7a6151" href="https://linear.app/prince-sharma/issue/CLO-25/configure-payload-seo-plugin">CLO-25</issue>: Configure Payload SEO plugin

## Overview

Install and configure the `@payloadcms/plugin-seo` package. Add SEO meta fields (title, description, og_image, keywords) to Products and Pages collections. Auto-generate meta values from content as fallback. Enable sitemap generation.

## Acceptance Criteri

---

### CLO-28: Better Auth: 2FA, passkeys, magic links

**Priority:** High | **Status:** Done | **Estimate:** 5 Points
**Labels:** Security, Auth, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-28/better-auth-2fa-passkeys-magic-links

**Description:**

# <issue id="024586cf-ea93-4221-8abe-a11662922b92" href="https://linear.app/prince-sharma/issue/CLO-28/better-auth-2fa-passkeys-magic-links">CLO-28</issue>: Better Auth: 2FA, passkeys, magic links

## Overview

Extend the existing better-auth configuration with three plugins: TOTP-based two-factor authentication (2FA), WebAuthn passkeys, and magic link email authentication. Configure backup codes for 2FA account recovery.

## Plugins to Enable

---

### CLO-32: Database seed script (dev data)

**Priority:** High | **Status:** Done | **Estimate:** 5 Points
**Labels:** Database, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-32/database-seed-script-dev-data

**Description:**

# <issue id="972755e1-745f-45cb-9edc-9172fa49c763" href="https://linear.app/prince-sharma/issue/CLO-32/database-seed-script-dev-data">CLO-32</issue>: Database seed script (dev data)

## Overview

Create a database seed script that populates dev environment with sample data. Uses Payload Local API to create records programmatically. Run via `pnpm seed` command.

## What the seed script creates

- **Admin user**: email: [admin@shagya.com](<mailto:

---

### CLO-33: Create webhooks + event logging

**Priority:** High | **Status:** Done | **Estimate:** 3 Points
**Labels:** Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-33/create-webhooks-event-logging

**Description:**

# <issue id="1737d491-3720-4fbf-b98b-20f8c5f88446" href="https://linear.app/prince-sharma/issue/CLO-33/create-webhooks-event-logging">CLO-33</issue>: Create webhooks + event logging

## Overview

Webhook system for order status changes with event logging for audit trail. Uses Payload afterChange hooks on the Orders collection to detect status transitions and POST to configured webhook URLs. Includes a retry mechanism for failed deliveries.

## C

---

### CLO-34: Setup Resend + transactional email templates

**Priority:** High | **Status:** Done | **Estimate:** 5 Points
**Labels:** Email, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-34/setup-resend-transactional-email-templates

**Description:**

# <issue id="822183df-f843-4c8e-9c8b-e86fdeb145b3" href="https://linear.app/prince-sharma/issue/CLO-34/setup-resend-transactional-email-templates">CLO-34</issue>: Setup Resend + transactional email templates

## Overview

Install Resend email service and configure Payload's email adapter. Create reusable email sending utility and integrate with Better Auth's magic link to replace console.log stub. React Email components for consistent templates.

---

### PRI-67: Set up Resend (transactional email)

**Priority:** High | **Status:** Backlog | **Estimate:** 3 Points
**Labels:** Email
**URL:** https://linear.app/prince-sharma/issue/PRI-67/set-up-resend-transactional-email

**Description:**

## Description

Set up Resend for transactional emails (order confirmations, password resets, magic links, etc.).

## Acceptance Criteria

- [ ] Resend account + API key
- [ ] Domain verified (SPF, DKIM, DMARC)
- [ ] From address set (e.g., `hello@shagyabrand.com`)
- [ ] Test email send + delivery

**Cycle**: 2

---

### PRI-68: Set up Next.js 16 proxy.ts (auth route protection)

**Priority:** High | **Status:** Backlog | **Estimate:** 2 Points
**Labels:** Auth, Frontend
**URL:** https://linear.app/prince-sharma/issue/PRI-68/set-up-nextjs-16-proxyts-auth-route-protection

**Description:**

Create `proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts`) in project root. Use `getSessionCookie` from `better-auth/cookies` for fast cookie-based check. Protects `/account/*`, `/checkout/*`, `/admin/*`. Redirects unauthenticated users to login.

**Cycle**: 2

---

### PRI-69: Set up Better Auth ↔ Payload customer sync (hooks)

**Priority:** High | **Status:** Backlog | **Estimate:** 3 Points
**Labels:** Auth, Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-69/set-up-better-auth-payload-customer-sync-hooks

**Description:**

When a customer signs up via Better Auth, auto-create a matching Payload `customers` document linked via `betterAuthUserId`. Sync email/phone/name changes back to Payload. This is the bridge between the two auth/data systems.

Reference: `docs/shagya-payloadcms.md` Section 18.3 (databaseHooks)

**Cycle**: 2

---

### PRI-73: Define Categories collection (nested taxonomy)

**Priority:** High | **Status:** Backlog | **Estimate:** 3 Points
**Labels:** Database, Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-73/define-categories-collection-nested-taxonomy

**Description:**

Create `src/collections/Categories.ts` with nested docs (parent/child). Type field: fabric, occasion, work, collection, editorial. SEO fields via plugin. Used for product categorization + navigation.

**Cycle**: 2

---

### PRI-75: Define Carts collection (logged-in users only)

**Priority:** High | **Status:** Backlog | **Estimate:** 3 Points
**Labels:** Database, Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-75/define-carts-collection-logged-in-users-only

**Description:**

Create `src/collections/Carts.ts` for logged-in users. Linked to customer (via betterAuthUserId). Items array: product relationship, variant JSON, quantity, unitPrice. Guest carts use localStorage instead.

**Cycle**: 2

---

### PRI-76: Define Media collection (image uploads + sizes)

**Priority:** High | **Status:** Backlog | **Estimate:** 3 Points
**Labels:** Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-76/define-media-collection-image-uploads-sizes

**Description:**

Create `src/collections/Media.ts` for image uploads. Image sizes: thumbnail (400×500), card (600×750), product (1200×1500), hero (1920×800). Alt text required. Focal point support. Stored in Vercel Blob / R2.

**Cycle**: 2

---

### PRI-77: Define Pages collection (Layout Builder + drafts)

**Priority:** High | **Status:** Backlog | **Estimate:** 5 Points
**Labels:** Content, Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-77/define-pages-collection-layout-builder-drafts

**Description:**

Create `src/collections/Pages.ts` with Layout Builder (blocks: Hero, Content, Media, CTA, FAQ). Drafts + versioning enabled. SEO fields via plugin. Used for About, Contact, FAQ, Size Guide, Shipping, Return, Care pages. Non-technical staff can edit content + add new sections visually.

**Cycle**: 3

---

### PRI-82: Define Header global (navigation structure)

**Priority:** High | **Status:** Backlog | **Estimate:** 3 Points
**Labels:** Backend, Frontend
**URL:** https://linear.app/prince-sharma/issue/PRI-82/define-header-global-navigation-structure

**Description:**

Create `src/globals/Header.ts`. Fields: navItems (array with label, type, url, children for mega-menu), announcementBar (text + link). Editable in admin — change nav without code deploy.

**Cycle**: 2

---

### PRI-83: Define Footer global (multi-column structure)

**Priority:** High | **Status:** Backlog | **Estimate:** 2 Points
**Labels:** Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-83/define-footer-global-multi-column-structure

**Description:**

Create `src/globals/Footer.ts`. Fields: columns (array of column name + links), socialLinks, paymentIcons, newsletter, copyright. Editable in admin.

**Cycle**: 2

---

### PRI-84: Define Homepage global (all sections editable)

**Priority:** High | **Status:** Backlog | **Estimate:** 3 Points
**Labels:** Content, Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-84/define-homepage-global-all-sections-editable

**Description:**

Create `src/globals/Homepage.ts`. Fields: hero, categoryGrid, featuredCollection, newArrivals, bestSellers, brandStory, trustStrip, newsletter, etc. Non-technical staff can re-arrange homepage via admin.

**Cycle**: 2

---

### PRI-85: Define Settings global (site config)

**Priority:** High | **Status:** Backlog | **Estimate:** 3 Points
**Labels:** Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-85/define-settings-global-site-config

**Description:**

Create `src/globals/Settings.ts`. Fields: siteName, logo, favicon, contactEmail, contactPhone, whatsappNumber, address, socialLinks (Instagram, Facebook, YouTube, Pinterest), currency, defaultShippingRate, freeShippingThreshold, taxRate, codEnabled, analytics IDs (GA4, Meta Pixel).

**Cycle**: 2

---

### CLO-19: Create Wishlist collection

**Priority:** Medium | **Status:** Done | **Estimate:** 3 Points
**Labels:** Database, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-19/create-wishlist-collection

**Description:**

# <issue id="47f3878b-c0a9-456d-b3af-5c062d22c11e" href="https://linear.app/prince-sharma/issue/CLO-19/create-wishlist-collection">CLO-19</issue>: Create Wishlist collection

## Overview

Wishlist collection for customers to save products. One wishlist per customer with an array of items referencing products and optional variants. Add/remove operations via API.

## Schema

| Field    | Type | Required | Notes |
| -------- | ---- | -------- | ----- |
| customer | re   |

---

### CLO-20: Create Blog / Articles collection + Lexical editor

**Priority:** Medium | **Status:** Done | **Estimate:** 5 Points
**Labels:** Content, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-20/create-blog-articles-collection-lexical-editor

**Description:**

# <issue id="a7797efb-f591-4d29-8a16-c3c24a29886d" href="https://linear.app/prince-sharma/issue/CLO-20/create-blog-articles-collection-lexical-editor">CLO-20</issue>: Create Blog / Articles collection + Lexical editor

## Overview

Blog/Articles collection with Lexical rich text editor for content. Standard blog fields: title, slug, excerpt, featured image, author, categories, tags, publish date, status workflow.

## Schema

| Field | Type | Req

---

### CLO-26: Configure Payload search plugin

**Priority:** Medium | **Status:** Done | **Estimate:** 3 Points
**Labels:** Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-26/configure-payload-search-plugin

**Description:**

# <issue id="68be5d01-b68c-4f22-8cea-5419782f2beb" href="https://linear.app/prince-sharma/issue/CLO-26/configure-payload-search-plugin">CLO-26</issue>: Configure Payload search plugin

## Overview

Install and configure `@payloadcms/plugin-search` for Products, Pages, and Posts collections. Generates search index for cross-collection searching. Prioritize products over content, boost title matches, with fuzzy fallback.

## Acceptance Criteria

- ***

### CLO-30: Create Navigation / Menus collection

**Priority:** Medium | **Status:** Done | **Estimate:** 3 Points
**Labels:** Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-30/create-navigation-menus-collection

**Description:**

# <issue id="b6c4dc20-9e82-4811-9611-167de8183188" href="https://linear.app/prince-sharma/issue/CLO-30/create-navigation-menus-collection">CLO-30</issue>: Navigation / Menus collection

## Overview

Navigation collection for site menus (header, footer, sidebar). Supports N-level nesting, drag-drop reorder, and multiple item types (page link, category link, custom URL, external link).

## Schema

| Field | Type | Notes |
| ----- | ---- | ----- |
| name  |

---

### CLO-31: Set up Payload form builder + submissions

**Priority:** Medium | **Status:** Done | **Estimate:** 5 Points
**Labels:** Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-31/set-up-payload-form-builder-submissions

**Description:**

# <issue id="d59e4b7a-1eeb-4b59-944e-36d3d20aeb25" href="https://linear.app/prince-sharma/issue/CLO-31/set-up-payload-form-builder-submissions">CLO-31</issue>: Payload form builder + submissions

## Overview

Form builder in Payload admin for contact, inquiry, newsletter forms. Separate Submissions collection with afterChange hook for email notification. Honeypot spam protection field.

## Components

1. **Forms collection**: form definitions wi

---

### CLO-35: Setup SMS service (OTP + order notifications)

**Priority:** Medium | **Status:** Done | **Estimate:** 3 Points
**Labels:** SMS, Backend
**URL:** https://linear.app/prince-sharma/issue/CLO-35/setup-sms-service-otp-order-notifications

**Description:**

# <issue id="a114b769-2761-47b1-9c26-a08bc866ae54" href="https://linear.app/prince-sharma/issue/CLO-35/setup-sms-service-otp-order-notifications">CLO-35</issue>: Setup SMS service (OTP + order notifications)

## Overview

SMS utility for OTP delivery and order status notifications. In production this would use Twilio/Amazon SNS. For dev, uses email fallback. Includes India (+91) phone number validation.

## Components

1. **SMS utility** (`src/l

---

### PRI-66: Set up Magic Link (email passwordless login)

**Priority:** Medium | **Status:** Backlog | **Estimate:** 3 Points
**Labels:** Email, Auth
**URL:** https://linear.app/prince-sharma/issue/PRI-66/set-up-magic-link-email-passwordless-login

**Description:**

Configure Better Auth `magicLink` plugin. Send magic link via Resend on request. Click link in email → logged in. Expires in 10 minutes.

**Cycle**: 2

---

### PRI-78: Define Coupons collection (discount codes)

**Priority:** Medium | **Status:** Backlog | **Estimate:** 3 Points
**Labels:** Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-78/define-coupons-collection-discount-codes

**Description:**

Create `src/collections/Coupons.ts`. Fields: code (uppercase unique), type (percentage/fixed/freeShipping), value, minOrderAmount, maxUses, currentUses, maxUsesPerCustomer, startsAt, expiresAt, isActive. Apply at cart/checkout.

**Cycle**: 4

---

### PRI-79: Define ShippingZones collection (admin-editable rates)

**Priority:** Medium | **Status:** Backlog | **Estimate:** 3 Points
**Labels:** Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-79/define-shippingzones-collection-admin-editable-rates

**Description:**

Create `src/collections/ShippingZones.ts`. Fields: name, states (array of state names), rate, freeShippingThreshold, estimatedDays (min/max). Used at checkout to calculate shipping based on state. Editable in admin without code change.

**Cycle**: 4

---

### PRI-81: Define FormSubmissions collection (contact form)

**Priority:** Medium | **Status:** Backlog | **Estimate:** 2 Points
**Labels:** Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-81/define-formsubmissions-collection-contact-form

**Description:**

Use Payload Form Builder plugin to create `src/collections/FormSubmissions.ts`. Contact form submissions saved to DB + trigger email notification. Admin can view/export submissions.

**Cycle**: 3

---

### PRI-86: Customize Payload admin dashboard (widgets + branding)

**Priority:** Medium | **Status:** Backlog | **Estimate:** 3 Points
**Labels:** Design, Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-86/customize-payload-admin-dashboard-widgets-branding

**Description:**

Customize Payload admin: logo, brand colors, dashboard widgets (today's sales, low stock count, pending orders). Build a polished admin experience matching the brand.

**Cycle**: 5

---

### PRI-87: Build order fulfillment Kanban (admin custom view)

**Priority:** Medium | **Status:** Backlog | **Estimate:** 5 Points
**Labels:** Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-87/build-order-fulfillment-kanban-admin-custom-view

**Description:**

Custom admin view for orders: Kanban with columns Pending → Processing → Shipped → Delivered → Returned/Cancelled. Drag-to-change status, filters by date range and courier. Replaces default list view for order fulfillment team.

**Cycle**: 5

---

### PRI-80: Define Redirects collection (URL management)

**Priority:** Low | **Status:** Backlog | **Estimate:** 2 Points
**Labels:** DevOps, Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-80/define-redirects-collection-url-management

**Description:**

Use Payload Redirects plugin. Admin can add 301/302 redirects in UI for old URLs. Auto-handled by Next.js middleware.

**Cycle**: 3

---

### PRI-88: Build low-stock alert widget (admin dashboard)

**Priority:** Low | **Status:** Backlog | **Estimate:** 2 Points
**Labels:** Backend
**URL:** https://linear.app/prince-sharma/issue/PRI-88/build-low-stock-alert-widget-admin-dashboard

**Description:**

Dashboard widget that shows products with stock ≤ lowStockThreshold. Click to view/edit product. Email notification when stock drops to 0.

**Cycle**: 5

---
