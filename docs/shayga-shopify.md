# Shagya — Saree E-Commerce Website Plan

> Detailed implementation plan for the new client saree e-commerce website.
> Audience: project owner (client) + Shagya delivery team.
> Status: Draft v1 — pending client sign-off on open questions.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Business Context & Goals](#2-business-context--goals)
3. [Target Audience & Personas](#3-target-audience--personas)
4. [Brand Positioning](#4-brand-positioning)
5. [Tech Stack Recommendation](#5-tech-stack-recommendation)
6. [Information Architecture](#6-information-architecture)
7. [Site Navigation](#7-site-navigation)
8. [Routes — Full URL Map](#8-routes--full-url-map)
9. [Product Attributes Schema](#9-product-attributes-schema)
10. [Variants & Options](#10-variants--options)
11. [Categories & Taxonomy](#11-categories--taxonomy)
12. [Page Types & Sections](#12-page-types--sections)
13. [Required Features (MVP Scope)](#13-required-features-mvp-scope)
14. [Cart & Checkout Flow](#14-cart--checkout-flow)
15. [Customer Account Features](#15-customer-account-features)
16. [Search & Discovery](#16-search--discovery)
17. [Selling Strategy](#17-selling-strategy)
18. [Payment Methods](#18-payment-methods)
19. [Shipping & Fulfillment](#19-shipping--fulfillment)
20. [Returns & Exchange](#20-returns--exchange)
21. [SEO Requirements](#21-seo-requirements)
22. [Analytics & Tracking](#22-analytics--tracking)
23. [Trust Signals & Conversion](#23-trust-signals--conversion)
24. [Content Requirements](#24-content-requirements)
25. [Recommended Shopify Apps](#25-recommended-shopify-apps)
26. [Theme Recommendation](#26-theme-recommendation)
27. [Implementation Phases](#27-implementation-phases)
28. [Launch Checklist](#28-launch-checklist)
29. [Post-MVP Roadmap](#29-post-mvp-roadmap)
30. [Open Questions for Client](#30-open-questions-for-client)

---

## 1. Project Overview

| Field             | Value                                                    |
| ----------------- | -------------------------------------------------------- |
| Project           | New online saree e-commerce website                      |
| Client            | [Client name] — first-time saree D2C founder             |
| Agency            | Shagya                                                   |
| Business Model    | D2C (Direct-to-Consumer)                                 |
| Initial Geography | India (domestic focus for MVP)                           |
| Phase 2 Geography | NRI markets — USA, UK, UAE, Singapore, Canada, Australia |
| Platform          | Shopify (recommended — see Section 5)                    |
| Catalog at Launch | 30–80 SKUs across 4–6 categories                         |
| Target Launch     | [TBD — pending client timeline]                          |

### What we are building

A modern, fast, mobile-first Shopify storefront that lets customers browse sarees by fabric/occasion/work, view detailed product pages, add to cart, check out via Indian payment methods (Card / UPI / COD), and create accounts to track orders and save wishlists.

### What we are NOT building (in MVP)

- Multi-vendor marketplace
- Bridal appointment booking
- AR/VR try-on
- 360° product viewer
- Custom blouse stitching configurator (Phase 2)
- B2B/wholesale portal
- Mobile native app (responsive web only for MVP)

---

## 2. Business Context & Goals

### Business Context

- Client is starting a new saree business — no existing e-commerce presence
- Likely an established offline brand OR a new label entering the online space
- Will work with photographers/models/imagery to launch catalog
- Will manage inventory + shipping in-house or via 3PL

### Primary Goals (MVP Launch)

1. **Launch a working storefront** within [TBD] weeks
2. **Enable direct online sales** via Shopify checkout with Indian payment methods
3. **Establish brand presence** online (SEO + social discoverability)
4. **Capture customer data** (email + phone) for retention
5. **Drive first 100 orders** within 60 days of launch

### Secondary Goals (Post-MVP, 0–6 months)

1. Build email list to 5,000+ subscribers
2. Achieve 1.5%+ site-wide conversion rate
3. Expand catalog to 200+ SKUs
4. Launch international shipping (NRI markets)
5. Achieve ₹[TBD] lakh/month revenue run rate

### Key Business Metrics (KPIs)

| Metric                    | Target (MVP)   | Target (6 months) |
| ------------------------- | -------------- | ----------------- |
| Monthly Sessions          | 5,000          | 25,000+           |
| Conversion Rate           | 1.0%           | 1.5%+             |
| AOV (Average Order Value) | ₹3,500         | ₹4,500+           |
| Email Signup Rate         | 2% of sessions | 3%+               |
| Cart Abandonment Rate     | <75%           | <70%              |
| Repeat Purchase Rate      | 5%             | 15%+              |
| Returning Customer %      | 10%            | 25%+              |

---

## 3. Target Audience & Personas

### Primary Audience

- **Women aged 25–45**, urban, India
- Mid-to-upper income (₹8L+ household income)
- Shopping for: weddings, festivals, special occasions, daily elegance
- Online savvy, mobile-first
- Values: authenticity, quality, brand story, design

### Secondary Audience

- **Brides & bridesmaids** (ages 22–35) — high AOV shoppers, 3–6 months research cycle
- **NRI women** (USA, UK, UAE, Singapore) — value Indian craftsmanship, ship-to-relative-in-India is common
- **Gift buyers** (men + women) for anniversaries, Diwali, Rakhi, birthdays

### Persona 1: "Priya — The Urban Professional"

- 28, works in IT/marketing, lives in Bangalore
- Buys 1–2 sarees/year for office Diwali, friend's wedding
- Browses on mobile during commute
- Trusts: reviews, Instagram, brand story
- Price sensitivity: Medium (₹2,000–₹6,000 range)

### Persona 2: "Meera — The Bride"

- 26, getting married in 6 months
- Researches extensively on Instagram + Pinterest + Google
- Buys 2–5 sarees for wedding events (sangeet, reception, pheras, post-wedding)
- Price sensitivity: Low (₹10,000–₹50,000+ range)
- Wants: high-quality images, drape guides, return policy reassurance

### Persona 3: "Anjali — The Diaspora Shopper"

- 35, lives in London/Dubai, originally from Mumbai
- Wants authentic Indian sarees shipped to her
- Will pay premium for international shipping + GST handling
- Browses on phone + desktop, English-speaking
- Trusts: secure payment, returns policy, brand reputation

---

## 4. Brand Positioning

### Positioning Statement (Draft)

> "[Brand Name] offers [premium / curated / handcrafted] sarees for the modern Indian woman who values [quality / tradition / design / sustainability]. Every piece is [sourced / designed / handpicked] from [region / artisan / weaver]."

### Brand Pillars

1. **Craftsmanship** — Quality of fabric, weaving, finishing
2. **Design** — Curated, modern, on-trend palette and patterns
3. **Authenticity** — Real silk, real handloom, transparent sourcing
4. **Service** — Easy returns, COD, responsive support

### Visual Identity

- **Logo** — [Client to provide or commission]
- **Color palette** — TBD (recommend: warm neutrals + 1 accent)
- **Typography** — Serif for headlines (elegance) + Sans for body (readability)
- **Photography style** — Clean white background for catalog shots + lifestyle model shots for hero

### Tone of Voice

- Warm, confident, knowledgeable
- Indian but not overly traditional
- Use of "we", "our" — build personal connection
- Avoid jargon: "pure silk" not "100% pure natural mulberry silk"

---

## 5. Tech Stack Recommendation

### Recommended: Shopify

**Why Shopify over WooCommerce / Magento / Custom:**
| Criteria | Shopify | WooCommerce | Custom |
|----------|---------|-------------|--------|
| Time to launch | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐ |
| Total cost of ownership | ⭐⭐⭐⭐ | ⭐⭐ | ⭐ |
| Indian payment gateways | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| Security & PCI compliance | Built-in | DIY | DIY |
| Mobile responsiveness | Theme-driven | DIY | DIY |
| App ecosystem | 8,000+ apps | 1,000+ plugins | None |
| Hosting included | Yes | DIY | DIY |
| Maintenance | Shopify handles | You handle | You handle |
| Scalability | High | Medium | Unlimited |

**Why this fits a saree business:**

- All 7 reference sites use Shopify (or Magento for utsavFashion)
- Indian payment gateway apps (Razorpay, Cashfree) integrate in minutes
- COD support out-of-box via Indian shipping apps
- Theme marketplace has fashion-focused templates
- Multi-currency + multi-language support (when going international)

### Alternative Considered: WooCommerce

- Lower monthly cost but higher development + maintenance
- Need to manage hosting, security, updates, PCI compliance
- Indian payment integrations require custom code
- **Verdict**: Only if client wants self-hosted for data control reasons

### Final Recommendation

**Shopify Plus** (if revenue > ₹1 Cr/year) OR **Shopify Advanced** (otherwise) — both support custom checkout scripts and advanced features when needed.

---

## 6. Information Architecture

### Top-Level Sitemap

```
/ (Homepage)
│
├── Shop
│   ├── All Products
│   ├── By Fabric
│   │   ├── Silk Sarees
│   │   ├── Cotton Sarees
│   │   ├── Georgette Sarees
│   │   ├── Organza Sarees
│   │   ├── Linen Sarees
│   │   └── Chiffon Sarees
│   ├── By Occasion
│   │   ├── Wedding Sarees
│   │   ├── Festive Sarees
│   │   ├── Party Wear Sarees
│   │   └── Daily Wear Sarees
│   ├── By Work
│   │   ├── Embroidered Sarees
│   │   ├── Printed Sarees
│   │   ├── Woven Sarees
│   │   └── Plain Sarees
│   ├── New Arrivals
│   ├── Best Sellers
│   └── Sale
│
├── Blouses
│   ├── All Blouses
│   ├── Unstitched Blouse Pieces
│   ├── Pre-stitched Blouses
│   └── Custom Blouse Stitching (Phase 2)
│
├── Collections (Editorial)
│   ├── Bridal Edit
│   ├── Festive Edit
│   ├── Summer Edit
│   └── Heritage Edit
│
├── Pages
│   ├── About Us
│   ├── Contact Us
│   ├── FAQ
│   ├── Size Guide
│   ├── Shipping Policy
│   ├── Return & Exchange Policy
│   ├── Privacy Policy
│   └── Terms of Service
│
├── Blog (Phase 2)
│
├── Account (Auth Required)
│   ├── Login
│   ├── Register
│   ├── My Orders
│   ├── Order Tracking
│   ├── Addresses
│   ├── Wishlist
│   └── Profile
│
├── Cart
├── Checkout
├── Order Confirmation
└── Search
```

### Content Hierarchy

- **Level 1**: Shop, Blouses, Collections, Pages, Blog (top nav)
- **Level 2**: Sub-categories (mega-menu dropdowns)
- **Level 3**: Filtered sub-collections (via PLP filters, not separate URLs in MVP)

---

## 7. Site Navigation

### Header (Utility Bar — Top)

Left: "Free Shipping on Orders Above ₹999 | COD Available"
Right: Track Order | Store Locator (if any) | Help

### Header (Main Bar)

- **Left**: Logo
- **Center**: Shop ▾ | Collections ▾ | New Arrivals | Sale | About
- **Right**: Search 🔍 | Account 👤 | Wishlist ♥ | Cart 🛒 (with count badge)

### Mega-Menu (Shop)

```
Shop All
├── By Fabric
│   ├── Silk
│   ├── Cotton
│   ├── Georgette
│   ├── Organza
│   └── Linen
├── By Occasion
│   ├── Wedding
│   ├── Festive
│   ├── Party
│   └── Daily Wear
├── New Arrivals
├── Best Sellers
└── Sale
```

### Footer (Multi-Column)

| Column 1: Shop       | Column 2: Customer Care | Column 3: About | Column 4: Connect      |
| -------------------- | ----------------------- | --------------- | ---------------------- |
| All Sarees           | Track Order             | Our Story       | Instagram              |
| New Arrivals         | Shipping Policy         | Our Artisans    | Facebook               |
| Best Sellers         | Return Policy           | Press           | YouTube                |
| Sale                 | Size Guide              | Sustainability  | WhatsApp               |
| Gift Cards (Phase 2) | FAQ                     | Careers         | Email Signup           |
|                      | Contact Us              |                 | App Download (Phase 2) |

### Footer (Bottom Bar)

Left: © 2024 [Brand Name]. All rights reserved.
Right: Payment icons (Card, UPI, Net Banking, COD) + SSL badge

---

## 8. Routes — Full URL Map

### Public Routes

| Route                             | Type       | Description                | SEO Priority |
| --------------------------------- | ---------- | -------------------------- | ------------ |
| `/`                               | Page       | Homepage                   | High         |
| `/collections/all`                | Collection | All products grid          | High         |
| `/collections/silk-sarees`        | Collection | Silk sarees category       | High         |
| `/collections/cotton-sarees`      | Collection | Cotton sarees              | High         |
| `/collections/georgette-sarees`   | Collection | Georgette sarees           | Medium       |
| `/collections/organza-sarees`     | Collection | Organza sarees             | Medium       |
| `/collections/linen-sarees`       | Collection | Linen sarees               | Medium       |
| `/collections/wedding-sarees`     | Collection | Wedding occasion           | High         |
| `/collections/festive-sarees`     | Collection | Festive occasion           | High         |
| `/collections/party-wear-sarees`  | Collection | Party wear                 | Medium       |
| `/collections/daily-wear-sarees`  | Collection | Daily wear                 | Medium       |
| `/collections/embroidered-sarees` | Collection | Embroidered work           | Medium       |
| `/collections/printed-sarees`     | Collection | Printed work               | Medium       |
| `/collections/woven-sarees`       | Collection | Woven work                 | Medium       |
| `/collections/new-arrivals`       | Collection | Newest products            | High         |
| `/collections/best-sellers`       | Collection | Most popular               | High         |
| `/collections/sale`               | Collection | Discounted items           | High         |
| `/collections/bridal-edit`        | Collection | Editorial bridal curation  | Medium       |
| `/collections/festive-edit`       | Collection | Editorial festive curation | Medium       |
| `/products/:handle`               | Product    | Single product PDP         | High         |
| `/search`                         | Page       | Search results             | N/A          |
| `/search?q=:query`                | Page       | Search with query          | N/A          |

### Cart & Checkout (Shopify Default)

| Route                     | Type | Description                             |
| ------------------------- | ---- | --------------------------------------- |
| `/cart`                   | Page | Shopping cart                           |
| `/checkouts/cn`           | Page | Checkout (contact + shipping + payment) |
| `/checkouts/cn/thank_you` | Page | Order confirmation                      |
| `/orders/:order_id`       | Page | Order status (guest + customer)         |

### Customer Account (Auth Required)

| Route                       | Type   | Description                     |
| --------------------------- | ------ | ------------------------------- |
| `/account/login`            | Page   | Login form                      |
| `/account/register`         | Page   | Registration form               |
| `/account`                  | Page   | Account dashboard               |
| `/account/orders`           | Page   | Order history list              |
| `/account/orders/:order_id` | Page   | Single order details + tracking |
| `/account/addresses`        | Page   | Saved shipping addresses        |
| `/account/wishlist`         | Page   | Wishlist (via app)              |
| `/account/logout`           | Action | Logout                          |

### Static Pages (`/pages/:handle`)

| Route                      | Handle              | Title                      |
| -------------------------- | ------------------- | -------------------------- |
| `/pages/about`             | `about`             | About Us / Our Story       |
| `/pages/contact`           | `contact`           | Contact Us                 |
| `/pages/faq`               | `faq`               | Frequently Asked Questions |
| `/pages/size-guide`        | `size-guide`        | Size & Measurement Guide   |
| `/pages/shipping-policy`   | `shipping-policy`   | Shipping Information       |
| `/pages/return-policy`     | `return-policy`     | Return & Exchange Policy   |
| `/pages/care-instructions` | `care-instructions` | Saree Care Guide           |

### Policy Pages (Shopify Default — `/policies/:handle`)

| Route                        | Description      |
| ---------------------------- | ---------------- |
| `/policies/privacy-policy`   | Privacy Policy   |
| `/policies/terms-of-service` | Terms of Service |
| `/policies/refund-policy`    | Refund Policy    |
| `/policies/legal-notice`     | Legal Notice     |

### Blog (Phase 2 — `/blogs/news/:handle`)

| Route                         | Type | Description      |
| ----------------------------- | ---- | ---------------- |
| `/blogs/news`                 | Page | Blog index       |
| `/blogs/news/:article_handle` | Page | Single blog post |
| `/blogs/news/tagged/:tag`     | Page | Posts by tag     |

### System Routes

| Route                    | Type           | Description                 |
| ------------------------ | -------------- | --------------------------- |
| `/sitemap.xml`           | Auto-generated | XML sitemap                 |
| `/robots.txt`            | Auto-generated | Robots file                 |
| `/404`                   | Page           | Not found error             |
| `/500`                   | Page           | Server error                |
| `/password`              | Page           | Password gate (for staging) |
| `/a/privacy-preferences` | Page           | Cookie consent preferences  |

### URL Naming Conventions

- **Collections**: lowercase, hyphenated, plural (`silk-sarees`, not `Silk Sarees`)
- **Products**: lowercase, hyphenated, full descriptive handle (`grey-digital-print-pure-mysore-silk-saree`)
- **Pages**: lowercase, hyphenated (`size-guide`, not `Size Guide`)
- **Avoid**: stop words, special characters, trailing slashes, underscores
- **Max URL length**: 75 characters where possible (for SEO)

### Redirects

- 301 redirects must be set up for any old URLs (e.g., from previous site if any)
- Set up redirect rules in Shopify Admin → Settings → Navigation → URL Redirects

---

## 9. Product Attributes Schema

### Core Product Fields (Shopify Native)

| Field          | Type          | Required | Example                                     | Notes                                   |
| -------------- | ------------- | -------- | ------------------------------------------- | --------------------------------------- |
| `id`           | String (auto) | ✅       | 1234567890                                  | Internal ID                             |
| `handle`       | String        | ✅       | `grey-digital-print-pure-mysore-silk-saree` | URL slug, unique, lowercase, hyphenated |
| `title`        | String        | ✅       | "Grey Digital Print Pure Mysore Silk Saree" | Display name                            |
| `body_html`    | HTML          | ✅       | `<p>Description...</p>`                     | Long description (fabric, drape, care)  |
| `vendor`       | String        | ✅       | "[Brand Name]"                              | Brand/Designer                          |
| `product_type` | String        | ✅       | "Saree"                                     | Category                                |
| `tags`         | Array<String> | ✅       | `["silk", "grey", "wedding", "festive"]`    | Comma-separated, used for filtering     |
| `status`       | Enum          | ✅       | `active` / `draft` / `archived`             | Visibility                              |
| `published_at` | DateTime      | ✅       | ISO timestamp                               | When published                          |
| `created_at`   | DateTime      | Auto     | ISO timestamp                               |                                         |
| `updated_at`   | DateTime      | Auto     | ISO timestamp                               |                                         |

### Pricing Fields

| Field              | Type    | Required | Example   | Notes                                  |
| ------------------ | ------- | -------- | --------- | -------------------------------------- |
| `price`            | Decimal | ✅       | `1599.00` | Selling price (INR)                    |
| `compare_at_price` | Decimal | Optional | `3999.00` | MRP — used to show discount badge      |
| `cost_per_item`    | Decimal | Admin    | `800.00`  | Internal cost (not shown to customers) |
| `taxable`          | Boolean | ✅       | `true`    | Whether to apply GST                   |
| `currency`         | String  | ✅       | `INR`     |                                        |

### Inventory Fields (Per Variant)

| Field                  | Type    | Required | Example             | Notes                                   |
| ---------------------- | ------- | -------- | ------------------- | --------------------------------------- |
| `inventory_quantity`   | Integer | ✅       | `12`                | Stock count                             |
| `inventory_policy`     | Enum    | ✅       | `deny` / `continue` | Stop selling when OOS / allow backorder |
| `inventory_management` | Enum    | ✅       | `shopify`           | Track inventory in Shopify              |
| `sku`                  | String  | ✅       | `DMS106-GRY`        | Per-variant SKU                         |
| `barcode`              | String  | Optional | `EAN13`             | For physical inventory                  |

### Media Fields

| Field                    | Type          | Required | Example                                                | Notes                                 |
| ------------------------ | ------------- | -------- | ------------------------------------------------------ | ------------------------------------- |
| `images[]`               | Array<Object> | ✅       | See below                                              | Product images                        |
| `image.alt`              | String        | ✅       | "Grey digital print pure mysore silk saree front view" | Alt text for SEO + a11y               |
| `image.position`         | Integer       | Auto     | `1`                                                    | Sort order                            |
| `image.width` / `height` | Integer       | Auto     | `1200` / `1600`                                        | For lazy loading                      |
| `image.variant_ids[]`    | Array         | Optional | `[12345]`                                              | Show this image when variant selected |

**Required Image Set (per product):**

1. Main product image — white background, full saree laid out
2. Model draped image — full-length, on model
3. Close-up work — fabric texture, embroidery detail, weave
4. Back/blouse piece — if blouse included, show separately
5. Color swatch — circular color preview
6. Folded image — neat fold showing drape texture
   (Minimum 4 images, recommended 5–7 per product)

### SEO Fields

| Field             | Type   | Required | Example                                               | Notes         |
| ----------------- | ------ | -------- | ----------------------------------------------------- | ------------- |
| `seo.title`       | String | ✅       | "Grey Digital Print Pure Mysore Silk Saree - [Brand]" | Max 60 chars  |
| `seo.description` | String | ✅       | "Shop pure Mysore silk saree..."                      | Max 160 chars |
| `seo.url`         | Auto   | ✅       | `/products/grey-digital-print-...`                    | From handle   |

### Variant Options

| Field             | Type          | Required | Example            | Notes                       |
| ----------------- | ------------- | -------- | ------------------ | --------------------------- |
| `options[]`       | Array         | ✅       | See below          | Up to 3 options per product |
| `option.name`     | String        | ✅       | `Color`            | Option label                |
| `option.values[]` | Array<String> | ✅       | `["Grey", "Blue"]` | Available values            |
| `option.position` | Integer       | ✅       | `1`                | Display order               |

### Saree-Specific Metafields (Custom)

These are custom metafields to capture saree-specific data not in Shopify default schema:

| Metafield Key                | Type             | Required    | Example                                                                 | Used For                          |
| ---------------------------- | ---------------- | ----------- | ----------------------------------------------------------------------- | --------------------------------- |
| `saree.fabric`               | Single Line Text | ✅          | `Pure Mysore Silk`                                                      | PDP detail, filtering             |
| `saree.fabric_category`      | List (Single)    | ✅          | `silk` / `cotton` / `georgette` / `organza` / `linen` / `chiffon`       | Filtering                         |
| `saree.weave_type`           | List (Single)    | ✅          | `handloom` / `powerloom` / `jamawar` / `ikat` / `block_print`           | PDP detail, filtering             |
| `saree.work_type`            | List (Multi)     | ✅          | `embroidered`, `printed`, `zari`, `stone`, `mirror`, `sequins`          | PDP detail, filtering             |
| `saree.work_intensity`       | List (Single)    | Optional    | `fully_embroidered` / `semi_embroidered` / `border_only` / `pallu_only` | PDP detail                        |
| `saree.length_meters`        | Decimal          | ✅          | `5.5`                                                                   | PDP detail (e.g., "5.5m")         |
| `saree.width_inches`         | Decimal          | Optional    | `44`                                                                    | For reference                     |
| `saree.weight_grams`         | Integer          | Optional    | `500`                                                                   | Quality indicator for silk        |
| `saree.blouse_piece`         | Boolean          | ✅          | `true`                                                                  | Is blouse included?               |
| `saree.blouse_length_meters` | Decimal          | Conditional | `0.8`                                                                   | Required if blouse_piece = true   |
| `saree.blouse_type`          | List (Single)    | Conditional | `unstitched` / `pre_stitched` / `custom_available`                      | PDP detail                        |
| `saree.blouse_fabric`        | Single Line Text | Optional    | `Matching Silk`                                                         | If blouse included                |
| `saree.petticoat_included`   | Boolean          | Optional    | `false`                                                                 | Rare but some include             |
| `saree.region_of_origin`     | List (Single)    | Optional    | `kanchipuram` / `banarasi` / `chanderi` / `pochampally` / `mysore`      | SEO + filtering                   |
| `saree.border_type`          | Single Line Text | Optional    | `Temple Border`                                                         | PDP detail                        |
| `saree.pallu_design`         | Single Line Text | Optional    | `Contrast Zari Pallu`                                                   | PDP detail                        |
| `saree.occasion[]`           | List (Multi)     | ✅          | `wedding`, `festive`, `party`, `daily`, `office`                        | Filtering, tagging                |
| `saree.season[]`             | List (Multi)     | Optional    | `summer`, `winter`, `monsoon`, `all_season`                             | Filtering                         |
| `saree.care_instructions`    | Multi-line Text  | ✅          | `Dry clean only. Store in muslin cloth.`                                | PDP care section                  |
| `saree.transparency`         | List (Single)    | Optional    | `opaque` / `semi_sheer` / `sheer`                                       | Filtering                         |
| `saree.certifications[]`     | List (Multi)     | Optional    | `silk_mark`, `handloom_mark`, `gi_tag`                                  | Trust badge                       |
| `saree.collection`           | Single Line Text | Optional    | `Bridal Edit 2024`                                                      | Homepage/Collection               |
| `saree.craft_story`          | Multi-line Text  | Optional    | Long-form story of the weaver/artisan                                   | PDP + blog                        |
| `saree.drape_difficulty`     | List (Single)    | Optional    | `beginner` / `intermediate` / `advanced`                                | Educational                       |
| `saree.combo_eligible`       | Boolean          | Optional    | `true`                                                                  | Eligible for saree+blouse bundle? |

### Trust & Marketing Metafields

| Metafield Key               | Type    | Required | Example      | Notes                               |
| --------------------------- | ------- | -------- | ------------ | ----------------------------------- |
| `marketing.best_seller`     | Boolean | Optional | `true`       | Shows "Best Seller" badge           |
| `marketing.new_arrival`     | Boolean | Optional | `true`       | Shows "New" badge                   |
| `marketing.limited_edition` | Boolean | Optional | `false`      | Shows "Limited Edition" badge       |
| `marketing.launch_date`     | Date    | Optional | `2024-11-15` | Used to show "New" badge for X days |
| `trust.silk_mark_certified` | Boolean | Optional | `true`       | Shows Silk Mark badge               |

### Availability & Fulfillment

| Field                       | Type    | Required | Example                 | Notes                    |
| --------------------------- | ------- | -------- | ----------------------- | ------------------------ |
| `availableForSale`          | Boolean | Auto     | `true`                  | Computed from variants   |
| `totalInventory`            | Integer | Auto     | `12`                    | Sum of variant inventory |
| `fulfillment.service`       | String  | ✅       | `manual` / `shiprocket` | Fulfillment method       |
| `fulfillment.dispatch_time` | Integer | Optional | `2`                     | Days to dispatch         |

### Example Product JSON (Simplified)

```json
{
  "id": "1234567890",
  "handle": "grey-digital-print-pure-mysore-silk-saree",
  "title": "Grey Digital Print Pure Mysore Silk Saree",
  "body_html": "<p>Exquisite digital print on pure Mysore silk...</p>",
  "vendor": "[Brand Name]",
  "product_type": "Saree",
  "tags": ["silk", "grey", "wedding", "festive", "bridal-edit"],
  "status": "active",
  "variants": [
    {
      "id": "11111",
      "sku": "DMS106-GRY",
      "title": "Grey",
      "price": "1599.00",
      "compare_at_price": "3999.00",
      "inventory_quantity": 12,
      "inventory_policy": "deny",
      "weight": 500,
      "requires_shipping": true,
      "taxable": true
    }
  ],
  "options": [{ "name": "Color", "values": ["Grey", "Blue"], "position": 1 }],
  "images": [
    {
      "alt": "Grey digital print pure mysore silk saree front",
      "position": 1,
      "src": "..."
    },
    {
      "alt": "Model wearing grey mysore silk saree",
      "position": 2,
      "src": "..."
    },
    {
      "alt": "Fabric close-up showing digital print",
      "position": 3,
      "src": "..."
    },
    { "alt": "Blouse piece detail", "position": 4, "src": "..." }
  ],
  "metafields": {
    "saree": {
      "fabric": "Pure Mysore Silk",
      "fabric_category": "silk",
      "weave_type": "powerloom",
      "work_type": ["printed"],
      "length_meters": 5.5,
      "weight_grams": 500,
      "blouse_piece": true,
      "blouse_length_meters": 0.8,
      "blouse_type": "unstitched",
      "blouse_fabric": "Matching Silk",
      "occasion": ["wedding", "festive", "party"],
      "season": ["all_season"],
      "care_instructions": "Dry clean only. Store in muslin cloth away from sunlight.",
      "region_of_origin": "mysore",
      "border_type": "Contrast Border",
      "pallu_design": "Digital Print Pallu",
      "certifications": ["silk_mark"]
    }
  },
  "seo": {
    "title": "Grey Digital Print Pure Mysore Silk Saree - [Brand]",
    "description": "Shop pure Mysore silk saree with digital print. Free shipping above ₹999. COD available. Easy returns."
  }
}
```

---

## 10. Variants & Options

### Standard Variant Structure

For sarees, the primary variant is **Color**. Most sarees come in one size (Free Size / 5.5m + 0.8m).

### Option 1: Color Variants (Most Common)

```
Product: "Grey Digital Print Pure Mysore Silk Saree"
Options:
  - Color: [Grey, Blue]
Variants:
  - Color=Grey, SKU=DMS106-GRY, Price=₹1599, Stock=12
  - Color=Blue, SKU=DMS106-BLU, Price=₹1599, Stock=8
```

Each color = separate variant with own SKU, price, stock, and images.

### Option 2: Color + Size (Rare, for Some Sellers)

- Size: Free Size (default), Custom Length (premium +₹500)
- Used when custom length is offered

### Option 3: Single Variant (Simplest)

- No color variants — one option only
- Just price + stock

### Image-to-Variant Mapping

- Each variant should have its own image(s)
- When customer selects "Grey", show grey images
- Shopify allows assigning images to variants via `image.variant_ids[]`

### Pricing Strategy

- Same price across colors (most common)
- Variable price across colors (rare, for limited edition)
- MRP (`compare_at_price`) set per variant for accurate discount display

### Inventory Management

- Track stock per variant
- Use `inventory_policy: deny` to stop selling when OOS (most common for sarees)
- Use `inventory_policy: continue` for made-to-order items

### Sold Out Handling

- Show "Sold Out" badge on variant
- Disable "Add to Cart" button
- Show "Notify Me" form (email capture when variant back in stock — Phase 2 with app)

---

## 11. Categories & Taxonomy

### Primary Categories (Collections)

| Collection Handle    | Title              | Description                                               | Filter Set                 |
| -------------------- | ------------------ | --------------------------------------------------------- | -------------------------- |
| `silk-sarees`        | Silk Sarees        | Premium silk sarees — Kanchipuram, Banarasi, Mysore, etc. | Color, Price, Region, Work |
| `cotton-sarees`      | Cotton Sarees      | Handloom cotton, cotton silk, daily wear                  | Color, Price, Weave, Work  |
| `georgette-sarees`   | Georgette Sarees   | Lightweight, flowy, party wear                            | Color, Price, Work         |
| `organza-sarees`     | Organza Sarees     | Modern, sheer, contemporary                               | Color, Price, Work         |
| `linen-sarees`       | Linen Sarees       | Summer-friendly, breathable                               | Color, Price, Work         |
| `chiffon-sarees`     | Chiffon Sarees     | Lightweight, everyday elegance                            | Color, Price, Work         |
| `wedding-sarees`     | Wedding Sarees     | Bridal & wedding guest collection                         | Color, Price, Fabric, Work |
| `festive-sarees`     | Festive Sarees     | Diwali, Pongal, Eid, Navratri                             | Color, Price, Fabric       |
| `party-wear-sarees`  | Party Wear Sarees  | Cocktail, evening, glam                                   | Color, Price, Work         |
| `daily-wear-sarees`  | Daily Wear Sarees  | Office, casual, easy drape                                | Color, Price, Fabric       |
| `embroidered-sarees` | Embroidered Sarees | Zari, thread, sequin, stone                               | Color, Price, Work Type    |
| `printed-sarees`     | Printed Sarees     | Digital, block, screen print                              | Color, Price, Print Type   |
| `woven-sarees`       | Woven Sarees       | Handloom, brocade, jamawar                                | Color, Price, Weave        |
| `plain-sarees`       | Plain Sarees       | Minimal, solid color                                      | Color, Price, Fabric       |
| `new-arrivals`       | New Arrivals       | Latest additions (auto-sort by date)                      | Color, Price, Fabric       |
| `best-sellers`       | Best Sellers       | Top-selling (manual or auto)                              | Color, Price, Fabric       |
| `sale`               | Sale               | Discounted items (MRP > Price)                            | Color, Price, Fabric       |

### Editorial Collections

- `bridal-edit` — Bridal Edit 2024
- `festive-edit` — Festive Edit (Diwali / Wedding Season)
- `summer-edit` — Summer Collection (cotton + linen focus)
- `heritage-edit` — Heritage handloom pieces

### Category Page Requirements

Each category page (`/collections/:handle`) must have:

- **Banner image** (category-specific, optional)
- **Title + description** (SEO text)
- **Filter sidebar** (left or top)
- **Sort dropdown** (top right)
- **Product grid** (3-4 per row desktop, 2 per row mobile)
- **Pagination or infinite scroll**
- **Empty state** ("No products match these filters")

### Cross-Linking

- Each product must be tagged with relevant categories
- A saree can appear in: `silk-sarees` + `wedding-sarees` + `festive-sarees` + `embroidered-sarees` + `new-arrivals`
- Collection assignment in Shopify uses `collections` field on product

---

## 12. Page Types & Sections

### 12.1 Homepage (`/`)

**Above the fold:**

- **Hero banner** — Full-width image with collection name + CTA
- **Utility strip** — Free shipping | COD | Easy Returns | 100% Authentic

**Section 2: Category Quick Links**
4–6 category icons in a horizontal row with image + label

- Silk Sarees
- Cotton Sarees
- Wedding Sarees
- Festive Sarees
- New Arrivals
- Sale

**Section 3: Featured Collection / Editorial**
Full-width or split banner highlighting a curated collection (e.g., "Bridal Edit 2024")

- Image
- Collection name + tagline
- "Shop Now" CTA

**Section 4: New Arrivals**
Product grid (4 columns desktop, 2 mobile) with:

- Product image
- Product name
- Price (with strike-through MRP + discount %)
- Color swatches (if multiple)
- "Add to Cart" quick button (optional)
- Wishlist heart icon (hover)

**Section 5: Best Sellers**
Same product grid layout as New Arrivals, sorted by sales

**Section 6: Category Showcase**
3-column layout showcasing 3 sub-categories (e.g., Silk / Cotton / Georgette) with image + "Explore" link

**Section 7: Brand Story Strip**
Image + short paragraph about brand

- "Handpicked sarees from master weavers"
- 2–3 sentence story
- "Read Our Story" CTA

**Section 8: Trust Strip**
4-column icon grid:

- Free Shipping
- COD Available
- Easy Returns
- 100% Authentic

**Section 9: Newsletter Signup**

- Headline: "Be the first to know"
- Subtext: "Get 10% off your first order + early access to new drops"
- Email input + Subscribe button

**Section 10: Footer**
Multi-column footer with all policies + social links + payment icons

### 12.2 Collection / Category Page (`/collections/:handle`)

**Layout:**

- Collection banner (image + title, optional)
- Collection description (2–3 lines, optional, SEO-friendly)
- Toolbar: result count | sort dropdown | view toggle (grid/list)
- **Filter sidebar** (left, collapsible on mobile):
  - Price range (slider)
  - Fabric (checkboxes)
  - Color (swatches)
  - Occasion (checkboxes)
  - Work Type (checkboxes)
  - Size (only "Free Size" likely)
  - Blouse Piece Included (yes/no)
- **Product grid** (right, main area):
  - 4 columns desktop, 3 tablet, 2 mobile
  - Each card: image, name, price (with MRP), discount %, color swatches, wishlist icon
- **Pagination** at bottom OR infinite scroll

**Empty state:** "No products match your filters. [Clear Filters]"

### 12.3 Product Detail Page (`/products/:handle`)

**Layout (Desktop — 2 column):**

**Left column: Image Gallery**

- Main large image (zoom on hover)
- Thumbnail strip (vertical, 4–7 images)
- Image counter (1/5)
- Click to expand (lightbox)

**Right column: Product Info**

- Vendor / Brand name (small, linkable)
- Product title (large)
- Price block:
  - Selling price (large, bold)
  - MRP strike-through
  - Discount % (in green/red badge)
  - Tax inclusive text
- Rating + review count (Phase 2)
- Color selector (swatches with labels)
- Size selector (usually just "Free Size" — informational)
- Quantity selector (1-10 max)
- Add to Cart button (primary, large)
- Buy Now button (secondary, optional)
- Wishlist heart button
- Shipping calculator (zip code input → estimated date)
- Trust micro-badges: "Free Shipping above ₹999" | "COD Available" | "Easy Returns"

**Below: Product Details Tabs / Accordion**

- **Description** — Long product story
- **Fabric & Care** — Fabric details, care instructions
- **Shipping & Returns** — Policy summary
- **Size Guide** — Link to full size guide
- **Craft Story** — Weaver / artisan story (optional)

**Below: Related Products Carousel**

- "You may also like" or "Complete the look"
- 4-8 products
- Same product card design

**Sticky Add-to-Cart Bar (Mobile)**

- Price + Add to Cart button, sticks to bottom on scroll

### 12.4 Cart Page (`/cart`)

- **Header:** "Your Cart (3 items)"
- **Line items:**
  - Product image
  - Product name (link to PDP)
  - Variant (Color, Size)
  - Price
  - Quantity selector (- / + buttons, max 10)
  - Remove button (trash icon)
  - Subtotal for that line
- **Discount code input** ("Enter discount code" + Apply button)
- **Order summary (right side, desktop):**
  - Subtotal
  - Shipping (free above ₹999, else ₹99)
  - Discount (if code applied)
  - Tax (if not inclusive)
  - **Total**
- **Checkout button** (primary CTA, large)
- **Continue Shopping link**
- **Trust micro-badges:** Secure checkout, Easy returns, COD available
- **Empty state:** "Your cart is empty" + Continue Shopping CTA

### 12.5 Checkout (`/checkouts/cn`)

Shopify's native checkout — we configure but don't heavily customize.

**Steps:**

1. **Contact** — Email + marketing opt-in checkbox
2. **Shipping** — Address, country (India for MVP), pincode
3. **Shipping method** — Standard (Free above ₹999 / ₹99)
4. **Payment** — Card / UPI / Net Banking / Wallets / COD
5. **Review & Place Order**

**Required configurations:**

- Enable COD
- Enable Razorpay / Cashfree for Indian payments
- Enable phone number field
- Enable marketing opt-in
- Set order notes field (optional)
- Set gift message field (optional, Phase 2)

### 12.6 Order Confirmation (`/checkouts/cn/thank_you`)

- Order number
- Order summary
- Estimated delivery
- Account creation prompt (guest checkout)
- Email confirmation sent
- SMS confirmation sent

### 12.7 Account Dashboard (`/account`)

**Welcome message + name**
**Quick links:**

- My Orders
- Addresses
- Wishlist
- Profile Settings
- Logout

### 12.8 Order History (`/account/orders`)

Table of orders:

- Order number
- Date
- Status (Processing / Shipped / Delivered)
- Total
- Items count
- View Details link

### 12.9 Order Details (`/account/orders/:id`)

- Order number + date
- Status timeline (Ordered → Shipped → Delivered)
- Tracking number (when available)
- Items list with images
- Shipping address
- Billing address
- Payment method
- Order total breakdown
- Reorder button (Phase 2)

### 12.10 Wishlist (`/account/wishlist`)

- Grid of saved products
- Add to Cart button per item
- Remove from wishlist button
- Share wishlist link (Phase 2)

### 12.11 Static Pages

**About Us (`/pages/about`)**

- Brand story (mission, vision, values)
- Founder's note
- Team photo / workshop photo
- Sustainability / sourcing story

**Contact Us (`/pages/contact`)**

- Email address
- Phone number (with hours)
- WhatsApp link
- Contact form (name, email, subject, message)
- Store address (if any)
- Social media links

**FAQ (`/pages/faq`)**

- Accordion format (10–20 questions)
- Categories: Orders, Shipping, Returns, Products, Account, Payments
- Search within FAQ (optional)

**Size Guide (`/pages/size-guide`)**

- Saree length details (standard 5.5m + 0.8m blouse)
- Blouse measurement guide with diagram:
  - Bust
  - Waist
  - Shoulder
  - Armhole
  - Sleeve length
  - Blouse length
  - Front neck depth
  - Back neck depth
- How to measure (video or image)
- Custom stitching info (Phase 2)

**Shipping Policy (`/pages/shipping-policy`)**

- Domestic shipping rates
- Free shipping threshold
- Estimated delivery times
- Order processing time
- International shipping (Phase 2)
- Tracking info

**Return Policy (`/pages/return-policy`)**

- 14-day return window
- Eligible items / non-returnable items
- Return process
- Refund timeline
- Exchange policy

**Care Instructions (`/pages/care-instructions`)**

- General saree care by fabric
- Storage tips
- Stain removal
- Dry cleaning recommendations

### 12.12 404 Page

- "Oops! Page not found"
- Search bar
- Featured categories (links)
- "Continue Shopping" CTA
- Link to homepage

---

## 13. Required Features (MVP Scope)

### Must-Have (MVP — Launch Blockers)

#### Storefront

- [x] Responsive homepage with hero, collections, featured products
- [x] Header with logo, nav, search, account, wishlist, cart
- [x] Footer with all policies + payment icons
- [x] Mobile-responsive design (all pages)
- [x] Product catalog (30–80 SKUs at launch)
- [x] Collection pages with filters and sort
- [x] Product detail pages with full schema
- [x] Search functionality

#### E-commerce Core

- [x] Shopping cart
- [x] Discount code support
- [x] Checkout (Shopify native)
- [x] Indian payment methods (Card / UPI / Net Banking / Wallets / COD)
- [x] Free shipping above threshold
- [x] Tax-inclusive pricing display
- [x] Order confirmation email
- [x] Order confirmation SMS
- [x] Inventory tracking per variant
- [x] Stock-out handling (disable add to cart)
- [x] Guest checkout
- [x] Customer registration + login

#### Customer Account

- [x] Account dashboard
- [x] Order history
- [x] Order tracking
- [x] Saved addresses
- [x] Profile settings (name, email, phone)
- [x] Password reset flow

#### Marketing & Trust

- [x] Newsletter signup (footer + popup)
- [x] First-order discount code (auto via popup)
- [x] Wishlist (via app — free tier)
- [x] Trust badges (SSL, secure checkout, authentic, etc.)
- [x] About Us page
- [x] Contact Us page with form
- [x] FAQ page
- [x] Shipping / Return / Privacy / Terms pages
- [x] Size guide page
- [x] Care instructions page

#### SEO & Analytics

- [x] Per-page meta titles + descriptions
- [x] XML sitemap (auto)
- [x] robots.txt
- [x] Structured data (Product, BreadcrumbList, Organization)
- [x] Google Analytics 4
- [x] Google Search Console verification
- [x] Meta Pixel (Facebook / Instagram)
- [x] 301 redirects for old URLs (if migrating)

### Nice-to-Have (Phase 2 — 1–3 months post-launch)

- [ ] Blog (with editorial content)
- [ ] Product reviews & ratings
- [ ] Recently viewed products
- [ ] Live chat / WhatsApp widget
- [ ] Abandoned cart recovery email
- [ ] Welcome email series
- [ ] Back-in-stock notifications
- [ ] Custom blouse stitching service
- [ ] Gift wrapping option
- [ ] Gift cards
- [ ] Combo bundles (saree + blouse)
- [ ] Loyalty / rewards program
- [ ] Referral program
- [ ] Multi-currency display
- [ ] International shipping
- [ ] Hindi language support (or other regional)
- [ ] Pinterest / Snapchat pixels
- [ ] Exit-intent popup

### Out of Scope (Future Roadmap — 6+ months)

- [ ] AR/VR saree try-on
- [ ] 360° product viewer
- [ ] Video drape guides (interactive)
- [ ] Bridal appointment booking
- [ ] Marketplace / multi-vendor
- [ ] B2B / wholesale portal
- [ ] Native mobile app (iOS + Android)
- [ ] Subscription model
- [ ] Live commerce / shoppable videos
- [ ] AI-powered recommendations
- [ ] In-store pickup
- [ ] Loyalty tier system (Silver/Gold/Platinum)
- [ ] Personalized homepage

---

## 14. Cart & Checkout Flow

### Cart Flow

```
Browse → Add to Cart → Cart Page → Apply Discount (optional) → Proceed to Checkout
```

### Add to Cart Behavior

- Click "Add to Cart" → success toast appears ("Added to your cart")
- Cart count in header updates
- Slide-out cart drawer may show (theme-dependent)
- Customer can continue shopping or view cart

### Cart Page Features

- Line item edit (quantity, remove)
- Discount code input
- Shipping calculator
- Order summary (subtotal, shipping, discount, total)
- Checkout CTA
- Continue shopping link
- Recently viewed (Phase 2)

### Discount Code Behavior

- Single code per order (Shopify default)
- Percentage or fixed amount
- Free shipping (if applicable)
- Auto-apply first-order code via URL param (e.g., `?discount=FIRST10`)

### Checkout Flow (Shopify Native)

**Step 1: Contact**

- Email (required)
- Marketing opt-in checkbox ("Email me with news and offers")
- Continue as guest OR Login

**Step 2: Shipping**

- Country (default: India)
- First name, Last name
- Address line 1, Address line 2 (optional)
- City, State, Pincode
- Phone number (required for Indian orders)
- Save address for next time (if logged in)

**Step 3: Shipping Method**

- Standard Shipping (Free above ₹999, else ₹99)
- Express Shipping (if available — Phase 2)

**Step 4: Payment**

- Card (Credit / Debit)
- UPI (GPay, PhonePe, Paytm QR)
- Net Banking
- Wallets
- COD (Cash on Delivery)

**Step 5: Review**

- Order summary
- Billing address (same as shipping / different)
- Order notes (optional)
- Place Order button

### Post-Order

- Order confirmation page
- Order confirmation email
- Order confirmation SMS
- Admin notified
- Fulfillment process begins

---

## 15. Customer Account Features

### Registration

- Email + password (minimum 8 characters)
- Or social login (Google, Facebook) — Phase 2
- Marketing opt-in checkbox
- Email verification (auto)

### Login

- Email + password
- "Forgot password" flow (email link)
- "Create account" link
- Guest checkout always available (no forced registration)

### Account Dashboard Sections

| Section       | URL                   | Features                                    |
| ------------- | --------------------- | ------------------------------------------- |
| Dashboard     | `/account`            | Welcome message, recent orders, quick links |
| Orders        | `/account/orders`     | Order history table                         |
| Order Details | `/account/orders/:id` | Full order info, tracking                   |
| Addresses     | `/account/addresses`  | Add/edit/delete saved addresses             |
| Profile       | `/account` (tab)      | Name, email, phone, password change         |
| Wishlist      | `/account/wishlist`   | Saved products (via app)                    |
| Logout        | `/account/logout`     | Action button                               |

### Account Features NOT in MVP

- Saved payment methods
- Subscription management
- Loyalty points display
- Referral program tracking
- Address validation (auto)

---

## 16. Search & Discovery

### Search Bar

- Prominent in header
- Autocomplete / suggestions (via Shopify native search or app)
- Searches: product title, vendor, tags, description
- Shows: products, collections, pages (optional)

### Search Results Page

- List of matching products
- Filter sidebar (same as PLP)
- Sort options
- "Did you mean...?" suggestions (Phase 2 with app)
- Empty state: "No results for '[query]'" + suggestions

### PLP Filters (Category Pages)

| Filter       | Type           | Values                                           |
| ------------ | -------------- | ------------------------------------------------ |
| Price        | Range slider   | ₹0 to ₹50,000                                    |
| Fabric       | Checkboxes     | Silk, Cotton, Georgette, Organza, Linen, Chiffon |
| Color        | Color swatches | Red, Green, Blue, Yellow, Pink, etc.             |
| Occasion     | Checkboxes     | Wedding, Festive, Party, Daily, Office           |
| Work Type    | Checkboxes     | Embroidered, Printed, Woven, Zari, Stone         |
| Blouse Piece | Toggle         | Included / Not Included                          |
| Size         | Radio (rare)   | Free Size                                        |
| Availability | Checkbox       | In Stock Only                                    |

### Sort Options

- Featured (default)
- Best Selling
- Price: Low to High
- Price: High to Low
- Newest
- A → Z (alphabetical)

### Collection Page Features

- Sticky filter sidebar (desktop)
- Mobile: filter opens as full-screen drawer
- Active filter chips (show selected filters, click to remove)
- "Clear all filters" link
- Product count display

---

## 17. Selling Strategy

### Pricing Model

- **Price range**: ₹1,500 — ₹25,000 (mid-premium positioning)
- **MRP vs Selling price**: Always show MRP strike-through to highlight savings
- **Discount %**: Auto-calculated, shown as badge (e.g., "30% OFF")

### Discount Types (Shopify)

| Type             | Use Case              | Example                      |
| ---------------- | --------------------- | ---------------------------- |
| Percentage off   | Collection-wide sales | 20% off silk sarees          |
| Fixed amount off | High-value orders     | ₹500 off above ₹5,000        |
| Free shipping    | Conversion booster    | Free shipping on first order |
| BOGO             | Inventory clearance   | Buy 2 get 1 free             |
| Bundle           | AOV booster           | Saree + blouse combo at ₹X   |
| First-order code | Email signup          | WELCOME10 — 10% off          |

### Recommended Discount Strategy

**Always-On:**

- Newsletter popup: 10% off first order (auto-applied via URL param or unique code)
- Free shipping above ₹999

**Seasonal (Plan Quarterly):**

- Republic Day Sale (January)
- Holi / Eid / Baisakhi (March)
- Mother's Day (May)
- Independence Day Sale (August)
- Ganesh Chaturthi (September)
- Navratri / Dussehra (October)
- Diwali Mega Sale (October-November)
- Christmas / New Year (December)
- Wedding Season (November-February)

**Always Available:**

- "Sale" collection with discounted items
- "New Arrivals" with first-week launch pricing

### Urgency Tactics (Light Use)

- Low stock indicator ("Only 3 left!")
- Limited-time offer banner ("Sale ends Sunday")
- New arrival badge (first 14 days)

### Avoid (in MVP)

- Heavy countdown timers
- Fake stock counts
- Misleading "original" prices

### Bundle Strategy (Phase 2)

- "Complete the Look" — saree + matching blouse + accessories
- "Wedding Combo" — 3 sarees for bride's trousseau at bundle price
- "Festive Bundle" — 2 sarees + blouse piece set

---

## 18. Payment Methods

### Required for MVP (India)

| Method                                    | Provider                   | Notes                          |
| ----------------------------------------- | -------------------------- | ------------------------------ |
| Credit/Debit Card (Visa, MC, RuPay, Amex) | Razorpay / Cashfree / PayU | All major cards                |
| UPI (GPay, PhonePe, Paytm, BHIM)          | Razorpay                   | Most popular Indian payment    |
| Net Banking (All major banks)             | Razorpay                   | 50+ banks supported            |
| Wallets (Paytm, Amazon Pay, Mobikwik)     | Razorpay                   | Optional but helpful           |
| EMI (on cards above ₹3,000)               | Razorpay                   | Optional, helps high AOV       |
| Cash on Delivery (COD)                    | Shopify native             | Critical for first-time buyers |

### Payment Gateway Recommendation

**Primary: Razorpay** (Best Indian gateway)

- Why: Wide payment method coverage, easy Shopify integration, competitive fees (2% per transaction)
- Supports: Cards, UPI, Net Banking, Wallets, EMI, COD reconciliation
- Setup: Install Razorpay app from Shopify App Store

**Alternative: Cashfree**

- Similar to Razorpay, slightly different pricing

### Payment Page UX

- All methods shown in a unified payment widget
- Default: Card (most universal)
- UPI option visible prominently (most popular in India)
- COD as last option in payment method list
- Trust badges: "100% Secure Payment" + Razorpay logo

### Failed Payment Recovery

- Show clear error message ("Payment failed. Please try again.")
- Suggest alternative payment methods
- Save cart for retry (Shopify default)

---

## 19. Shipping & Fulfillment

### Shipping Zones (MVP — India Only)

| Zone              | States                                                      | Estimated Delivery |
| ----------------- | ----------------------------------------------------------- | ------------------ |
| Zone 1 (Metro)    | Delhi, Mumbai, Bangalore, Chennai, Hyderabad, Kolkata, Pune | 2–4 business days  |
| Zone 2 (Tier 1)   | Other state capitals + major cities                         | 3–5 business days  |
| Zone 3 (Tier 2/3) | Rest of India                                               | 5–7 business days  |

### Shipping Rates (MVP)

| Cart Value                 | Shipping Cost                      |
| -------------------------- | ---------------------------------- |
| Below ₹999                 | ₹99 (flat)                         |
| ₹999 and above             | FREE                               |
| Prepaid orders (any value) | FREE (suta-style) — alternative    |
| COD orders                 | ₹49 COD charge extra (alternative) |

### Shipping Partners (India)

**Recommended: Shiprocket** (Aggregator)

- Why: Aggregates 15+ courier partners (Delhivery, BlueDart, Ecom Express, etc.)
- Auto-selects best courier per shipment
- Real-time tracking
- NDR (Non-Delivery Report) management
- Shopify integration: Install Shiprocket app

**Alternative: Pickrr, iThink Logistics, Nimbuspost**

### Order Fulfillment Process

1. **Order placed** → Notification to admin
2. **Order processing** (24–48 hours):
   - Pick from inventory
   - Quality check
   - Pack in branded box/bag
   - Add thank you card
3. **Shipment created** in Shiprocket → Tracking number auto-generated
4. **Customer notified** (email + SMS) with tracking link
5. **In transit** → Real-time tracking updates
6. **Delivered** → Delivery confirmation sent
7. **NDR handling** → Reattempt or refund (if customer unavailable)

### Packaging

- Branded saree box OR polybag with branded sticker
- Tissue paper / butter paper wrap
- Thank you card
- Saree care instruction card
- Return form (optional, with pickup scheduling info)

### Inventory Management

- Track stock per variant in Shopify
- Low stock alert: ≤3 items (admin notification)
- Out of stock: hide "Add to Cart", show "Notify Me" (Phase 2)
- Bulk inventory upload via CSV

---

## 20. Returns & Exchange

### Return Policy (MVP)

| Aspect          | Policy                                                            |
| --------------- | ----------------------------------------------------------------- |
| Return window   | 14 days from delivery                                             |
| Eligible items  | Unused, unwashed, with original tags, in original packaging       |
| Non-returnable  | Custom-stitched items, used/washed items, sale items (final sale) |
| Return shipping | Customer pays (₹99 deducted from refund)                          |
| Refund method   | Original payment method                                           |
| Refund timeline | 5–7 business days after we receive return                         |
| Exchange        | Allowed (same/different product, price adjusted)                  |

### Return Process

1. Customer initiates return from order page (`/account/orders/:id`)
2. Selects reason (size issue, quality issue, changed mind, etc.)
3. Receives return authorization + shipping label (Phase 2: auto via app)
4. Ships item back
5. We receive + inspect (48 hours)
6. Refund processed (5–7 business days)
7. Email notification sent

### Return Tools

- Shopify's built-in return portal (basic, free)
- OR: Returnly / Loop Returns / AfterShip Returns (Phase 2 — better UX)

### Exchange Flow

- Customer requests exchange (same product different variant OR different product)
- We approve, customer ships back original
- New product shipped once original received
- Price difference handled via refund / additional charge

---

## 21. SEO Requirements

### Per-Page SEO

| Page Type   | Title Format                                        | Description Format                                 |
| ----------- | --------------------------------------------------- | -------------------------------------------------- |
| Homepage    | [Brand Name] — Handpicked Sarees for Every Occasion | Shop authentic [silk/cotton/etc.] sarees online... |
| Collection  | [Collection Name] — [Fabric] Sarees Online          | Browse [X] [collection] sarees at [Brand]...       |
| Product     | [Product Name] - [Brand]                            | Shop [product] online. [Fabric] [Color]...         |
| Static Page | [Page Title] - [Brand]                              | Brief summary of page content                      |

**Title length:** 50–60 characters
**Description length:** 150–160 characters
**Include:** Primary keyword + brand name + value prop

### Structured Data (Schema.org)

| Type           | Where                        | Required Fields                                            |
| -------------- | ---------------------------- | ---------------------------------------------------------- |
| Product        | PDP                          | name, image, description, sku, price, availability, rating |
| BreadcrumbList | All pages                    | itemListElement with positions                             |
| Organization   | Homepage (footer)            | name, logo, url, social profiles                           |
| WebSite        | Homepage                     | name, url, potentialAction (search)                        |
| FAQPage        | FAQ page                     | mainEntity (questions + answers)                           |
| LocalBusiness  | Contact page (if applicable) | name, address, phone                                       |

### Sitemap

- Auto-generated by Shopify at `/sitemap.xml`
- Includes: products, collections, pages, blog posts
- Submitted to Google Search Console

### robots.txt

- Auto-generated by Shopify
- Allows all crawlers
- Disallows `/cart`, `/checkout`, `/account`

### Image SEO

- Descriptive file names (e.g., `grey-digital-print-pure-mysore-silk-saree.jpg` not `IMG_1234.jpg`)
- Alt text per image (descriptive, includes keyword)
- Compressed images (WebP format, <200KB per image)
- Lazy loading for below-fold images

### URL Structure

- Clean, hyphenated, lowercase URLs
- No unnecessary parameters
- Canonical tags (Shopify auto-handles)
- 301 redirects for changed URLs

### Local SEO (Phase 2)

- Google Business Profile (if physical store)
- Local schema markup
- Location-based landing pages (if multi-city)

### International SEO (Phase 2)

- Hreflang tags for language/region variants
- Country-specific domains/subdomains
- Localized content + currency

---

## 22. Analytics & Tracking

### Required Setup

| Tool                         | Purpose                        | Setup                           |
| ---------------------------- | ------------------------------ | ------------------------------- |
| Google Analytics 4 (GA4)     | Traffic, behavior, conversions | Install via Shopify integration |
| Google Search Console        | SEO performance, indexing      | Verify domain ownership         |
| Google Tag Manager (GTM)     | Tag management                 | Install + add GA4 + Pixel       |
| Meta Pixel (Facebook)        | Ad tracking, retargeting       | Install via Shopify integration |
| Microsoft Clarity (optional) | Heatmaps, session recording    | Free, install via GTM           |
| Hotjar (optional, Phase 2)   | User research                  | Free tier available             |

### Key Events to Track

| Event                 | Trigger                 | Parameters                               |
| --------------------- | ----------------------- | ---------------------------------------- |
| `page_view`           | Any page                | page_path, page_title                    |
| `view_item`           | PDP                     | item_id, item_name, price, item_category |
| `add_to_cart`         | Add to cart button      | item_id, item_name, price, quantity      |
| `view_cart`           | Cart page               | cart_id, value, items                    |
| `remove_from_cart`    | Remove button           | item_id                                  |
| `begin_checkout`      | Checkout start          | value, items                             |
| `add_payment_info`    | Payment method selected | payment_type                             |
| `purchase`            | Order placed            | transaction_id, value, items, shipping   |
| `search`              | Search submitted        | search_term, results_count               |
| `sign_up`             | Account created         | method                                   |
| `login`               | Account login           | method                                   |
| `add_to_wishlist`     | Wishlist add            | item_id                                  |
| `newsletter_signup`   | Email submitted         | source                                   |
| `contact_form_submit` | Contact form            | subject                                  |

### Custom Dimensions

- User type (new vs returning)
- Customer LTV
- Product category viewed
- Search query
- Filter combination used

### Conversion Tracking

- E-commerce conversion tracking (GA4 Enhanced Ecommerce)
- Purchase value, AOV, conversion rate
- Funnel: Product View → Add to Cart → Checkout → Purchase

### UTM Parameters

- Track campaign performance
- Standardize UTM naming convention
- utm_source, utm_medium, utm_campaign, utm_content, utm_term

### Reporting Dashboard

- Weekly: traffic, sales, top products, conversion rate
- Monthly: revenue, AOV, customer acquisition, retention

---

## 23. Trust Signals & Conversion

### On-Site Trust Signals

| Signal                | Location                | Implementation                          |
| --------------------- | ----------------------- | --------------------------------------- |
| SSL Certificate       | Site-wide               | Shopify default (HTTPS)                 |
| Secure Checkout Badge | Cart, Checkout, Footer  | Trust badge app or icon                 |
| Payment Icons         | Footer                  | Card, UPI, Net Banking, COD icons       |
| Money-back Guarantee  | Footer, PDP             | "14-day easy returns" text              |
| Authentic Guarantee   | Footer, About           | "100% authentic handloom" claim         |
| Trust Badges          | PDP, Cart               | SSL, Secure Checkout, Verified badges   |
| Customer Reviews      | PDP (Phase 2)           | Star rating + count                     |
| Press Mentions        | About / Footer (if any) | "As seen in Vogue" logos                |
| Social Proof          | Homepage                | Instagram feed                          |
| Real Photos           | PDP                     | Model + product shots, not stock images |

### Conversion Boosters (MVP)

| Tactic                    | Where                  | Implementation                             |
| ------------------------- | ---------------------- | ------------------------------------------ |
| Free Shipping Banner      | Header, Cart, Checkout | Sticky top bar                             |
| Discount Badge on Listing | PLP                    | "30% OFF" badge per product                |
| Countdown Timer           | Homepage (sale)        | For active sales (use sparingly)           |
| Low Stock Indicator       | PDP                    | "Only 3 left!" when stock ≤3               |
| Newsletter Popup          | Exit intent            | "Get 10% off your first order"             |
| Recently Viewed           | PDP, Cart (Phase 2)    | Carousel of recently viewed products       |
| Trust Micro-Badges        | PDP                    | "Free shipping" "COD" "Easy returns" icons |

### Conversion Boosters (Phase 2)

- Reviews & ratings
- Urgency timers
- Social proof notifications ("X people viewing this now")
- Free gift with purchase
- Live chat support
- Exit-intent popup with bigger offer

### Avoid (Anti-Trust)

- Fake reviews
- Misleading "original" prices
- Hidden costs at checkout
- Forced account creation
- Confusing return policy
- Slow site speed

---

## 24. Content Requirements

### Content Needed at Launch

#### Brand & Story

- [ ] Brand name (final)
- [ ] Tagline (1 line)
- [ ] About Us page (300–500 words)
- [ ] Founder's note (200 words)
- [ ] Brand story images (3–5 high-res)

#### Product Content

- [ ] Product photography for all SKUs (4–7 images each):
  - White background catalog shot
  - Model draped shot (front + back)
  - Work close-up
  - Blouse piece shot
  - Color swatch / detail
- [ ] Product descriptions (50–100 words each):
  - Fabric details
  - Design highlights
  - Occasion suggestions
  - Care instructions
  - Drape difficulty (optional)
- [ ] SEO titles + descriptions for all products

#### Category Content

- [ ] Category banner images (1 per category, optional)
- [ ] Category descriptions (50–100 words each, SEO-optimized)
- [ ] SEO titles + descriptions for all categories

#### Static Page Content

- [ ] FAQ (15–25 questions across 5 categories)
- [ ] Size Guide content (with images/diagrams)
- [ ] Shipping Policy
- [ ] Return Policy
- [ ] Privacy Policy (template + customize)
- [ ] Terms of Service (template + customize)
- [ ] Refund Policy (template + customize)
- [ ] Care Instructions page

#### Marketing Content

- [ ] Newsletter popup copy + 10% off offer
- [ ] Welcome email copy (after newsletter signup)
- [ ] Order confirmation email (Shopify default + customize)
- [ ] Shipping confirmation email
- [ ] Delivery confirmation email
- [ ] Abandoned cart email (Phase 2)

### Content Tone

- Warm, confident, knowledgeable
- Use "we" / "our" — personal connection
- Avoid jargon
- Use Indian English spelling (colour, favourite) or US English (color, favorite) — be consistent
- Avoid generic AI-sounding phrases

### Image Specifications

| Image Type        | Dimensions                 | Format    | Max Size |
| ----------------- | -------------------------- | --------- | -------- |
| Product main      | 1200 x 1500 px             | WebP/JPEG | 200KB    |
| Product model     | 1200 x 1800 px             | WebP/JPEG | 250KB    |
| Product detail    | 1200 x 1200 px             | WebP/JPEG | 200KB    |
| Collection banner | 1920 x 600 px              | WebP/JPEG | 300KB    |
| Hero banner       | 1920 x 800 px              | WebP/JPEG | 400KB    |
| Category icon     | 400 x 400 px               | WebP/PNG  | 50KB     |
| Logo              | 400 x 100 px (transparent) | SVG/PNG   | 50KB     |
| Favicon           | 32 x 32 px                 | PNG       | 5KB      |

### Copywriting Guidelines

- Headlines: 6–10 words, benefit-focused
- Body: 1–3 sentences, scannable
- CTAs: Action-oriented ("Shop Now", "Add to Cart", "Subscribe")
- Product names: Descriptive, includes fabric + color + design element

---

## 25. Recommended Shopify Apps

### Free / Low-Cost Apps for MVP

| App                                | Purpose                | Cost                      | Why                                         |
| ---------------------------------- | ---------------------- | ------------------------- | ------------------------------------------- |
| **Klaviyo: Email Marketing & SMS** | Email + SMS marketing  | Free up to 250 contacts   | Best-in-class for Shopify, automation flows |
| **Tidio Live Chat**                | Live chat + chatbots   | Free tier                 | Quick customer support                      |
| **Searchanise Smart Search**       | Search + autocomplete  | Free tier                 | Better than default Shopify search          |
| **TrustedSite Trust Badges**       | Trust badges           | Free tier                 | Builds checkout confidence                  |
| **Loox Product Reviews**           | Photo reviews          | Free up to 30 reviews     | Social proof (Phase 2)                      |
| **PageFly Landing Page Builder**   | Custom landing pages   | Free tier                 | Editorial / campaign pages                  |
| **Vitals: All‑in‑One Marketing**   | 40+ features in 1 app  | Free tier                 | Reviews, upsells, currency converter        |
| **Shopify Email**                  | Email campaigns        | Free for first 10k emails | Built-in, simple                            |
| **Smile: Loyalty Program**         | Rewards + referrals    | Free tier                 | Loyalty program (Phase 2)                   |
| **Shiprocket**                     | Shipping aggregator    | Pay per shipment          | Indian courier aggregation                  |
| **Razorpay**                       | Indian payment gateway | 2% per transaction        | UPI + cards + netbanking                    |
| **Swym Wishlist Plus**             | Wishlist functionality | Free tier                 | Save-for-later                              |
| **Returnly**                       | Returns portal         | Paid (Phase 2)            | Better return UX than default               |

### Apps to AVOID in MVP

- Heavy bundle apps (use Shopify's built-in bundles)
- Multi-currency apps (start India only)
- Complex loyalty apps (use Smile.io free tier)
- App overload — keep total apps <15

---

## 26. Theme Recommendation

### Free Theme: **Dawn** (Shopify default)

- **Pros**: Free, fast, well-supported, clean modern design, built by Shopify
- **Cons**: Limited fashion-specific layouts
- **Best for**: Minimal customization, fast launch

### Premium Themes (Recommended for Fashion)

| Theme         | Price            | Why                                                     |
| ------------- | ---------------- | ------------------------------------------------------- |
| **Prestige**  | ~$350 (one-time) | Best for fashion/luxury brands, beautiful product pages |
| **Symmetry**  | ~$340            | Clean, fashion-focused, great for editorial content     |
| **Motion**    | ~$350            | Modern, image-heavy, animation-friendly                 |
| **Broadcast** | ~$280            | Story-driven, great for branded content                 |
| **Impulse**   | ~$350            | Feature-rich, lots of customization options             |

### Recommendation

- **For MVP**: Start with **Dawn** (free) or **Prestige** (paid) if budget allows
- **Future**: Upgrade theme as brand grows and design needs evolve

### Theme Customization

- Brand colors (1 primary + 1 accent + neutrals)
- Typography (1 serif for headlines + 1 sans for body)
- Header/footer layout
- Homepage sections
- PDP layout
- Cart page design

---

## 27. Implementation Phases

### Total Estimated Timeline: 6–8 weeks

### Phase 1: Foundation & Setup (Week 1)

- [ ] Create Shopify account (choose plan: Basic / Shopify / Advanced)
- [ ] Set up custom domain (e.g., brandname.in or brandname.com)
- [ ] Install + customize theme (Dawn / Prestige)
- [ ] Configure basic settings:
  - Store name, currency (INR), timezone, units (cm, kg)
  - Tax settings (GST inclusive)
  - Shipping zones (India)
  - Payment gateways (Razorpay + COD)
- [ ] Set up brand assets:
  - Logo upload
  - Favicon
  - Brand colors
  - Typography
- [ ] Configure email domain (sender authentication: hello@brand.com)
- [ ] Set up Shopify Email sender address

**Deliverable:** Working theme on staging, basic settings configured

### Phase 2: Catalog & Products (Week 2–3)

- [ ] Set up product categories (collections) per taxonomy
- [ ] Define metafields (saree-specific schema)
- [ ] Upload initial 30–80 products:
  - Product images (4–7 per product)
  - Product name, description, pricing
  - Variants (colors)
  - Inventory levels
  - Metafields (fabric, weave, work, occasion, etc.)
  - SEO titles + descriptions
  - Tags
- [ ] Assign products to collections
- [ ] Set up filterable search (facets by fabric, price, color, occasion)
- [ ] Test product pages on desktop + mobile

**Deliverable:** All products live and browsable

### Phase 3: Pages & Content (Week 3–4)

- [ ] Create static pages:
  - About Us
  - Contact Us (with form)
  - FAQ
  - Size Guide
  - Shipping Policy
  - Return Policy
  - Privacy Policy
  - Terms of Service
  - Care Instructions
- [ ] Build out homepage sections:
  - Hero banner
  - Category grid
  - Featured collections
  - New arrivals section
  - Best sellers section
  - Brand story
  - Newsletter signup
- [ ] Set up navigation (header + footer)
- [ ] Configure mega-menu (Shop dropdown)

**Deliverable:** All content live, navigable

### Phase 4: Cart, Checkout & Payments (Week 4)

- [ ] Configure cart page (review line items, discount code, totals)
- [ ] Customize checkout (Shopify Plus required for full custom; otherwise use settings):
  - Enable marketing opt-in
  - Enable phone number
  - Set order notes
  - Add custom checkout branding
- [ ] Set up payment gateways:
  - Razorpay account creation + KYC
  - Install Razorpay app in Shopify
  - Enable COD
  - Test all payment methods
- [ ] Set up shipping:
  - Shiprocket account creation
  - Install Shiprocket app
  - Configure shipping zones + rates
  - Test shipping calculator
- [ ] Set up tax (GST) — Shopify auto-handles

**Deliverable:** Fully functional checkout

### Phase 5: Customer Features (Week 5)

- [ ] Configure customer accounts (login, register, profile)
- [ ] Set up order confirmation emails (Shopify Email)
- [ ] Set up shipping confirmation + tracking emails
- [ ] Install wishlist app (Swym Wishlist Plus)
- [ ] Set up abandoned cart email (Phase 2 — for now, basic Shopify email)
- [ ] Set up welcome email (via Klaviyo)
- [ ] Install Klaviyo + configure basic flows:
  - Welcome flow
  - Abandoned cart flow (Phase 2)
  - Post-purchase flow

**Deliverable:** Customer experience complete

### Phase 6: Trust, SEO & Analytics (Week 5–6)

- [ ] Install trust badges (TrustedSite or similar)
- [ ] Install live chat (Tidio)
- [ ] Set up SEO:
  - Verify Google Search Console
  - Submit sitemap
  - Add structured data (Shopify handles most)
  - Set up 301 redirects (if any)
- [ ] Set up analytics:
  - Install Google Analytics 4
  - Install Google Tag Manager
  - Install Meta Pixel
  - Verify event tracking
- [ ] Set up email sender authentication (SPF, DKIM)
- [ ] Configure newsletter popup (10% off)

**Deliverable:** Trust + tracking in place

### Phase 7: Testing & QA (Week 6–7)

- [ ] Test all user flows on desktop + mobile:
  - Browse → PLP → PDP → Add to Cart → Checkout → Order
  - Account registration + login
  - Wishlist add/remove
  - Search functionality
  - Newsletter signup
  - Contact form submission
- [ ] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] Test on real devices (iOS + Android)
- [ ] Test all payment methods (Card, UPI, Net Banking, COD)
- [ ] Test discount codes
- [ ] Test email deliverability (welcome, order confirmation, shipping)
- [ ] Test SMS notifications
- [ ] Performance check (PageSpeed Insights — target >80 mobile)
- [ ] Accessibility check (WCAG 2.1 AA — keyboard nav, color contrast, alt text)
- [ ] Security check (HTTPS, SSL, no exposed data)
- [ ] 404 page test
- [ ] Inventory depletion test

**Deliverable:** Tested, bug-free site

### Phase 8: Launch (Week 7–8)

- [ ] Remove password protection
- [ ] Submit sitemap to Google Search Console
- [ ] Verify domain is live + accessible
- [ ] Test live checkout end-to-end (place a real test order)
- [ ] Monitor for errors in first 24 hours
- [ ] Set up monitoring (Shopify admin alerts)
- [ ] Announce launch (social media, email, PR)
- [ ] Train client on:
  - Adding products
  - Processing orders
  - Managing inventory
  - Running promotions
  - Basic analytics review

**Deliverable:** Live, operational site

### Phase 9: Post-Launch (Week 8+)

- [ ] Monitor analytics daily for first week
- [ ] Fix any issues reported
- [ ] Optimize based on data (bounce rate, conversion rate)
- [ ] Start content marketing (blog, social)
- [ ] Plan Phase 2 features
- [ ] A/B test key pages

---

## 28. Launch Checklist

### Pre-Launch (1 week before)

- [ ] All products uploaded and browsable
- [ ] All pages live and proofread
- [ ] All images optimized (WebP, <200KB)
- [ ] All meta titles + descriptions set
- [ ] Structured data validated (Google Rich Results Test)
- [ ] Payment gateways tested (all methods)
- [ ] Shipping rates + zones verified
- [ ] Tax (GST) settings correct
- [ ] Customer accounts tested
- [ ] Wishlist tested
- [ ] Search tested
- [ ] Newsletter signup tested
- [ ] Contact form tested
- [ ] Email notifications working (order, shipping, etc.)
- [ ] SMS notifications working
- [ ] All policies linked in footer
- [ ] About Us + Contact pages complete
- [ ] Logo + favicon set
- [ ] Brand colors + typography applied
- [ ] Trust badges visible
- [ ] Social media links working
- [ ] Mobile responsive (tested on 3+ devices)
- [ ] Cross-browser tested
- [ ] Page speed >80 mobile
- [ ] SSL active
- [ ] 404 page customized
- [ ] Password page removed
- [ ] Robots.txt + sitemap live
- [ ] Google Analytics tracking verified
- [ ] Meta Pixel tracking verified
- [ ] Google Search Console verified
- [ ] Email sender authentication (SPF/DKIM) set
- [ ] Backup of all content (products, pages, settings)
- [ ] Client team trained on admin

### Launch Day

- [ ] Final test order placed successfully
- [ ] Site accessible publicly
- [ ] All payment methods working
- [ ] All emails + SMS sending correctly
- [ ] Inventory levels accurate
- [ ] Monitoring active (Shopify admin, analytics)
- [ ] Support channels ready (email, phone, WhatsApp)
- [ ] Announcement ready (social, email)

### Post-Launch (First week)

- [ ] Monitor daily analytics
- [ ] Respond to customer feedback
- [ ] Fix any reported bugs
- [ ] Monitor email deliverability
- [ ] Check order processing flow
- [ ] Verify shipping integrations

---

## 29. Post-MVP Roadmap

### Quarter 1 (Months 1–3)

- [ ] Blog launch (2 posts/month)
- [ ] Product reviews & ratings (Loox)
- [ ] Recently viewed products
- [ ] Improved search (Searchspring / Algolia)
- [ ] Live chat optimization
- [ ] Welcome email series
- [ ] Abandoned cart email flow
- [ ] Back-in-stock notifications
- [ ] A/B testing setup
- [ ] First seasonal sale campaign

### Quarter 2 (Months 3–6)

- [ ] Custom blouse stitching service
- [ ] International shipping (USA, UK, UAE)
- [ ] Multi-currency display
- [ ] Gift wrapping option
- [ ] Combo bundles (saree + blouse)
- [ ] Loyalty program (Smile.io)
- [ ] Referral program
- [ ] Pinterest + Snapchat pixels
- [ ] Hindi / regional language support (if needed)
- [ ] 200+ SKU catalog

### Quarter 3+ (Months 6–12)

- [ ] Native mobile app (iOS + Android)
- [ ] AR/VR saree try-on
- [ ] 360° product viewer
- [ ] Video drape guides
- [ ] Bridal appointment booking
- [ ] Live commerce / shoppable videos
- [ ] AI-powered recommendations
- [ ] Subscription model (monthly saree)
- [ ] Marketplace (third-party sellers)
- [ ] B2B / wholesale portal

---

## 30. Open Questions for Client

> ⚠️ These decisions block launch. Need client sign-off before implementation begins.

### Brand & Identity

- [ ] **Brand name** — Final brand name for saree business?
- [ ] **Domain** — Preferred domain (.in / .com)?
- [ ] **Logo** — Ready? Or need design?
- [ ] **Brand colors** — Preferred palette?
- [ ] **Brand story** — Founder background, inspiration, sourcing story?
- [ ] **Tagline** — Want help crafting?

### Catalog

- [ ] **Initial product count** — How many SKUs at launch?
- [ ] **Photography ready?** — White background + model shots available?
- [ ] **Product descriptions** — Will client provide or need copywriting?
- [ ] **Pricing strategy** — Confirmed price range and discount %?
- [ ] **Inventory** — Stock ready? Where is it stored?

### Operations

- [ ] **Shipping partner** — Already use one? Or set up Shiprocket?
- [ ] **Pickup location** — Where will Shiprocket pick up from?
- [ ] **Fulfillment team** — In-house or 3PL?
- [ ] **Packaging** — Branded boxes ready? Or use polybags initially?
- [ ] **Returns processing** — In-house or 3PL?
- [ ] **Customer support** — Email, phone, WhatsApp — who handles?

### Payments & Legal

- [ ] **Business entity** — Registered? GST number? (Required for Razorpay)
- [ ] **Bank account** — For Razorpay payouts
- [ ] **PAN card** — For business verification
- [ ] **COD handling** — Will you accept COD? (Returns + cash management overhead)
- [ ] **Pricing inclusive of GST?** — Confirm tax display

### Marketing

- [ ] **Launch budget** — Paid ads budget for first 3 months?
- [ ] **Social media** — Active accounts? (Instagram essential)
- [ ] **Email list** — Existing customers to migrate?
- [ ] **Influencer partnerships** — Already have relationships?
- [ ] **PR** — Press contacts? Launch announcement plan?

### Timeline & Budget

- [ ] **Launch deadline** — Specific date?
- [ ] **Theme** — Free (Dawn) or premium (Prestige)?
- [ ] **App budget** — Free tier only, or budget for paid apps?
- [ ] **Photography budget** — If not ready
- [ ] **Content budget** — If not ready (descriptions, FAQs, etc.)

### International

- [ ] **International shipping in MVP?** — Or India-only for first 3 months?
- [ ] **NRI focus** — Target countries for Phase 2?

---

## Appendix A: Tech Stack Summary

| Layer      | Technology                                    | Notes                     |
| ---------- | --------------------------------------------- | ------------------------- |
| Storefront | Shopify                                       | Hosted SaaS               |
| Theme      | Dawn (free) or Prestige (paid)                | Shopify theme             |
| Payments   | Razorpay + COD                                | Indian gateway            |
| Shipping   | Shiprocket                                    | Indian aggregator         |
| Email      | Klaviyo (free tier)                           | Marketing + automation    |
| SMS        | Klaviyo SMS (paid)                            | Order updates + marketing |
| Search     | Shopify native (MVP) / Searchspring (Phase 2) |                           |
| Reviews    | Loox (Phase 2)                                |                           |
| Wishlist   | Swym Wishlist Plus                            |                           |
| Live Chat  | Tidio (free tier)                             |                           |
| Analytics  | GA4 + GTM                                     |                           |
| Ads Pixel  | Meta Pixel                                    |                           |
| SEO        | Google Search Console                         |                           |
| Heatmaps   | Microsoft Clarity (free)                      |                           |
| Hosting    | Shopify-managed                               | Included                  |

## Appendix B: Reference Files

This plan is informed by research of 7 leading Indian saree e-commerce websites. Detailed findings are stored in `docs/research/`:

- `houseOfRaadhvi.md` — Premium designer Shopify store
- `utsavFashion.md` — Global ethnic wear, Magento (most features)
- `nalli.md` — Heritage silk since 1928, omnichannel
- `suta.md` — Modern handloom, best content marketing
- `karagiri.md` — Contemporary, combo bundles
- `mirraw.md` — Multi-designer marketplace, largest selection
- `pothys.md` — Traditional South Indian retail chain
- `sariAttributes.md` — Master attribute schema
- `sariFeatures.md` — Feature comparison across 7 sites
- `sariSellingStrategy.md` — Pricing, conversion, retention analysis

## Appendix C: Glossary

| Term              | Definition                                                               |
| ----------------- | ------------------------------------------------------------------------ |
| **D2C**           | Direct-to-Consumer — brand sells directly to end customers, no middleman |
| **PLP**           | Product Listing Page — category page with multiple products              |
| **PDP**           | Product Detail Page — single product page                                |
| **AOV**           | Average Order Value — average revenue per order                          |
| **COD**           | Cash on Delivery — pay when item is delivered                            |
| **UPI**           | Unified Payments Interface — Indian real-time payment system             |
| **GST**           | Goods and Services Tax — Indian consumption tax                          |
| **MRP**           | Maximum Retail Price — printed price, used to show discount              |
| **KYC**           | Know Your Customer — identity verification for payment gateways          |
| **3PL**           | Third-Party Logistics — outsourced fulfillment provider                  |
| **NDR**           | Non-Delivery Report — when courier can't deliver                         |
| **GI Tag**        | Geographical Indication — certification for region-specific products     |
| **Silk Mark**     | Certification for pure silk products                                     |
| **Handloom Mark** | Certification for handloom products                                      |
| **BOGO**          | Buy One Get One                                                          |
| **CRO**           | Conversion Rate Optimization                                             |
| **CTA**           | Call to Action                                                           |
| **UTM**           | Urchin Tracking Module — URL parameters for campaign tracking            |
| **WCAG**          | Web Content Accessibility Guidelines                                     |
| **PWA**           | Progressive Web App                                                      |

---

## Document Status

- **Version**: 1.0
- **Last Updated**: 2024
- **Next Review**: After client sign-off on open questions
- **Owner**: Shagya delivery team
- **Client Sign-off**: Pending
