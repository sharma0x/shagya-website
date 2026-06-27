# Linear Plan — Shayga Saree E-commerce MVP

> **Ready-to-import plan for Linear.** This document structures all work
> as **Initiative → Projects → Issues (with sub-issues)**, using
> Linear's standard fields: Status, Priority, Labels, Estimate, Project,
> Cycle, Parent, Assignee.
>
> **Target team**: `Prince Sharma` (key: `PRI`)
> **Estimated effort**: 12–14 weeks (7 × 2-week cycles)
> **Created from**: `docs/shayga-payloadcms.md` v1.3
>
> **How to use this file**:
> 1. Review the plan below
> 2. Approve / adjust
> 3. Either push to Linear via the MCP tools OR import manually

---

## Table of Contents
- [Initiative](#initiative)
- [Projects](#projects)
- [Cycles (2-week sprints)](#cycles-2-week-sprints)
- [Labels (to create)](#labels-to-create)
- [Issues by Project](#issues-by-project)
  - [P1: Foundation & Setup](#p1-foundation--setup)
  - [P2: Backend — Payload CMS + Better Auth](#p2-backend--payload-cms--better-auth)
  - [P3: Storefront (Frontend)](#p3-storefront-frontend)
  - [P4: Cart & Checkout](#p4-cart--checkout)
  - [P5: Customer Accounts & Auth](#p5-customer-accounts--auth)
  - [P6: Shipping & Fulfillment](#p6-shipping--fulfillment)
  - [P7: Marketing, Content & SEO](#p7-marketing-content--seo)
  - [P8: Testing, QA & Launch](#p8-testing-qa--launch)
- [Sub-issue Conventions](#sub-issue-conventions)
- [Dependencies Between Issues](#dependencies-between-issues)
- [Import Workflow](#import-workflow)

---

## Initiative

| Field | Value |
|-------|-------|
| **Name** | Shayga Saree E-commerce MVP |
| **Description** | Build and launch the new client saree e-commerce website using Payload CMS + Next.js 16 + Better Auth. India-first D2C, 30–80 SKUs at launch, mobile-first, Razorpay payments. |
| **Target date** | 14 weeks from project start |
| **Owner** | [Client] |
| **Status** | Planned |

**Initiative projects** (8):
1. Foundation & Setup
2. Backend — Payload CMS + Better Auth
3. Storefront (Frontend)
4. Cart & Checkout
5. Customer Accounts & Auth
6. Shipping & Fulfillment
7. Marketing, Content & SEO
8. Testing, QA & Launch

---

## Projects

| # | Project Name | Description | Lead | Status | Target |
|---|--------------|-------------|------|--------|--------|
| P1 | Foundation & Setup | Next.js 16 + Payload 3.x + Postgres + Tailwind v4 + CI/CD | TBD | Planned | Week 1–2 |
| P2 | Backend — Payload CMS + Better Auth | All collections, globals, auth flows, admin panel customization | TBD | Planned | Week 2–5 |
| P3 | Storefront (Frontend) | Homepage, PLP, PDP, search, static pages, navigation | TBD | Planned | Week 3–6 |
| P4 | Cart & Checkout | Cart logic, multi-step checkout, Razorpay integration, COD | TBD | Planned | Week 5–8 |
| P5 | Customer Accounts & Auth | Login/register UI, account dashboard, order history | TBD | Planned | Week 6–8 |
| P6 | Shipping & Fulfillment | Shiprocket integration, tracking, returns | TBD | Planned | Week 7–9 |
| P7 | Marketing, Content & SEO | Email templates, blog, SEO, analytics, content | TBD | Planned | Week 8–11 |
| P8 | Testing, QA & Launch | Tests, performance, accessibility, launch checklist | TBD | Planned | Week 11–14 |

---

## Cycles (2-week sprints)

| Cycle | Dates | Theme | Issues |
|-------|-------|-------|--------|
| **Cycle 1** | Week 1–2 | Foundation + Auth setup | P1 issues + start P2 |
| **Cycle 2** | Week 3–4 | Schema + Storefront start | P2 schema + P3 layout |
| **Cycle 3** | Week 5–6 | Storefront pages + Auth UI | P3 pages + P5 auth |
| **Cycle 4** | Week 7–8 | Checkout + Orders + Shipping | P4 + start P6 |
| **Cycle 5** | Week 9–10 | Customer features + Returns | P5 dashboard + P6 returns |
| **Cycle 6** | Week 11–12 | Marketing + SEO + Analytics | P7 |
| **Cycle 7** | Week 13–14 | Testing + Launch | P8 |

---

## Labels (to create)

**Existing (use these)**:
- `ready-for-agent` (green) — ready for AI agent
- `needs-triage` (orange) — needs triage
- `Improvement` (blue)
- `Feature` (purple)
- `Bug` (red)

**New area labels to create**:
| Label | Color | Description |
|-------|-------|-------------|
| `Backend` | `#5E6AD2` | Payload CMS, Better Auth, API |
| `Frontend` | `#0EA5E9` | Next.js pages, components, UI |
| `Auth` | `#F43F5E` | Better Auth, Payload auth, sessions |
| `Payment` | `#10B981` | Razorpay, COD, refunds |
| `Design` | `#EC4899` | UI/UX, components, styling |
| `Content` | `#8B5CF6` | Copy, product descriptions, blog |
| `DevOps` | `#64748B` | CI/CD, hosting, deployment |
| `Database` | `#A855F7` | Postgres, migrations, schema |
| `Security` | `#DC2626` | Auth, sessions, rate limiting |
| `Email` | `#06B6D4` | Resend, templates, transactional |
| `SMS` | `#14B8A6` | MSG91, Twilio, OTP |

**Type labels (already exist)**:
- `Feature`, `Bug`, `Improvement`

---

## Issues by Project

> Each issue has: **ID (PRI-XXX placeholder) · Title · Status · Priority · Labels · Estimate · Project · Cycle · Parent (if sub-issue) · Assignee · Description · Acceptance Criteria · Sub-issues**

### Priority Mapping (Linear values)
- **Urgent (P0)**: Launch blockers, security, payment
- **High (P1)**: Core features, must-have for MVP
- **Medium (P2)**: Important but not blocking
- **Low (P3)**: Nice-to-have, polish

### Estimate Mapping (T-shirt sizes)
- **XS**: < 2 hours
- **S**: 2–4 hours
- **M**: 4–8 hours (1 day)
- **L**: 1–3 days
- **XL**: 3–5 days

---

## P1: Foundation & Setup

> Target: Cycle 1 (Weeks 1–2)
> Goal: Working Payload admin + Next.js 16 frontend + Better Auth wired

### PRI-101: Initialize Next.js 16 + Payload 3.x project
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Backend, Frontend, DevOps
- **Estimate**: M
- **Project**: P1 Foundation & Setup
- **Cycle**: Cycle 1
- **Assignee**: TBD
- **Description**: Scaffold a new Next.js 16 + Payload 3.x project using `create-payload-app`. Pin all versions, set up TypeScript strict mode, Tailwind v4, and shadcn/ui.
- **Acceptance Criteria**:
  - [ ] Project runs with `pnpm dev` on localhost:3000
  - [ ] Payload admin accessible at `/admin` with created admin user
  - [ ] All versions pinned in `package.json` (next ^16.2, react ^19.2, payload ^3.x, typescript ^5.7, tailwindcss ^4.0)
  - [ ] `.nvmrc` set to `22` (LTS Node)
  - [ ] TypeScript strict mode enabled
  - [ ] Tailwind v4 + shadcn/ui installed and working
- **Sub-issues**:
  - PRI-102: Pin versions in package.json
  - PRI-103: Configure TypeScript strict mode + path aliases
  - PRI-104: Set up Tailwind v4 + shadcn/ui
  - PRI-105: Configure ESLint + Prettier

### PRI-102: Pin versions in package.json
- **Status**: Backlog
- **Priority**: High
- **Labels**: DevOps
- **Estimate**: S
- **Parent**: PRI-101
- **Cycle**: Cycle 1
- **Acceptance**: All required packages pinned with `^` for minor patches

### PRI-103: Configure TypeScript strict mode + path aliases
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend, Backend
- **Estimate**: S
- **Parent**: PRI-101
- **Cycle**: Cycle 1
- **Acceptance**: `tsconfig.json` has `strict: true` and path aliases for `@/components/*`, `@/lib/*`, etc.

### PRI-104: Set up Tailwind v4 + shadcn/ui
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend, Design
- **Estimate**: M
- **Parent**: PRI-101
- **Cycle**: Cycle 1
- **Acceptance**: Tailwind v4 working, shadcn/ui components installable via CLI

### PRI-105: Configure ESLint + Prettier
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: DevOps
- **Estimate**: S
- **Parent**: PRI-101
- **Cycle**: Cycle 1
- **Acceptance**: Lint + format scripts work, pre-commit hook optional

### PRI-110: Set up Postgres 18 (Neon for Tier 0/2)
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Backend, Database, DevOps
- **Estimate**: M
- **Project**: P1 Foundation & Setup
- **Cycle**: Cycle 1
- **Acceptance**:
  - [ ] Neon account created
  - [ ] Database created (Postgres 18)
  - [ ] `DATABASE_URL` in `.env.example` and `.env`
  - [ ] Connection tested locally
- **Sub-issues**:
  - PRI-111: Provision Neon Postgres database
  - PRI-112: Document DATABASE_URL format in .env.example

### PRI-111: Provision Neon Postgres database
- **Status**: Backlog
- **Priority**: High
- **Labels**: DevOps, Database
- **Estimate**: S
- **Parent**: PRI-110
- **Cycle**: Cycle 1

### PRI-112: Document DATABASE_URL format in .env.example
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Documentation
- **Estimate**: XS
- **Parent**: PRI-110
- **Cycle**: Cycle 1

### PRI-120: Set up Vercel Blob (or Cloudflare R2)
- **Status**: Backlog
- **Priority**: High
- **Labels**: Backend, DevOps
- **Estimate**: S
- **Project**: P1 Foundation & Setup
- **Cycle**: Cycle 1
- **Acceptance**:
  - [ ] Vercel Blob (or R2) bucket created
  - [ ] `@payloadcms/storage-vercel-blob` configured
  - [ ] Image upload to admin works

### PRI-130: Configure environment variables
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: DevOps, Security
- **Estimate**: S
- **Project**: P1 Foundation & Setup
- **Cycle**: Cycle 1
- **Acceptance**:
  - [ ] `.env.example` documents all required variables
  - [ ] `.env` in `.gitignore`
  - [ ] Vercel environment variables configured
  - [ ] Secrets generated (`PAYLOAD_SECRET`, `BETTER_AUTH_SECRET`)

### PRI-140: Set up payload.config.ts
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Backend
- **Estimate**: M
- **Project**: P1 Foundation & Setup
- **Cycle**: Cycle 1
- **Acceptance**:
  - [ ] DB adapter (`@payloadcms/db-postgres`) configured
  - [ ] Storage plugin (`@payloadcms/storage-vercel-blob`) configured
  - [ ] Admin panel customization (title, branding)
  - [ ] CORS configured for Next.js
  - [ ] Sharp image processing enabled

### PRI-150: Set up CI/CD pipeline
- **Status**: Backlog
- **Priority**: High
- **Labels**: DevOps
- **Estimate**: M
- **Project**: P1 Foundation & Setup
- **Cycle**: Cycle 1
- **Acceptance**:
  - [ ] GitHub repo created
  - [ ] Vercel project linked
  - [ ] Preview deployments on PR
  - [ ] Production deploys on `main`
  - [ ] Database migrations run on build

### PRI-160: Configure Cloudflare DNS + CDN
- **Status**: Backlog
- **Priority**: High
- **Labels**: DevOps, Security
- **Estimate**: S
- **Project**: P1 Foundation & Setup
- **Cycle**: Cycle 1
- **Acceptance**:
  - [ ] Domain added to Cloudflare
  - [ ] DNS records configured
  - [ ] SSL/TLS set to Full (strict)
  - [ ] Proxy enabled (orange cloud)
  - [ ] DDoS protection active

### PRI-170: Create base layout (Header + Footer placeholders)
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P1 Foundation & Setup
- **Cycle**: Cycle 1
- **Acceptance**:
  - [ ] Root layout with header + footer
  - [ ] Header has logo, nav placeholder, search, account, cart icons
  - [ ] Footer has policy links + social + payment icons
  - [ ] Mobile responsive

---

## P2: Backend — Payload CMS + Better Auth

> Target: Cycle 1–3 (Weeks 2–5)
> Goal: All collections, auth, and admin panel working

### Better Auth (Customer-Facing)

### PRI-201: Set up Better Auth core
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Backend, Auth
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 1
- **Assignee**: TBD
- **Description**: Install `better-auth`, create `src/lib/auth.ts` with core config, set up API route handler at `app/api/auth/[...all]/route.ts`, run initial DB migration to create user/session/account/verification tables.
- **Acceptance**:
  - [ ] `better-auth` installed
  - [ ] `src/lib/auth.ts` created with Postgres pool, email/password config
  - [ ] `app/api/auth/[...all]/route.ts` mounted with `toNextJsHandler`
  - [ ] `npx @better-auth/cli@latest migrate` runs successfully
  - [ ] `user`, `session`, `account`, `verification` tables exist in DB
- **Sub-issues**:
  - PRI-202: Install + configure better-auth package
  - PRI-203: Create auth.ts with Postgres + email/password
  - PRI-204: Create API route handler
  - PRI-205: Run Better Auth DB migration

### PRI-202: Install + configure better-auth package
- **Status**: Backlog
- **Priority**: High
- **Labels**: Auth, Backend
- **Estimate**: S
- **Parent**: PRI-201
- **Cycle**: Cycle 1

### PRI-203: Create auth.ts with Postgres + email/password
- **Status**: Backlog
- **Priority**: High
- **Labels**: Auth, Backend
- **Estimate**: M
- **Parent**: PRI-201
- **Cycle**: Cycle 1

### PRI-204: Create API route handler
- **Status**: Backlog
- **Priority**: High
- **Labels**: Auth, Backend
- **Estimate**: S
- **Parent**: PRI-201
- **Cycle**: Cycle 1

### PRI-205: Run Better Auth DB migration
- **Status**: Backlog
- **Priority**: High
- **Labels**: Auth, Database
- **Estimate**: S
- **Parent**: PRI-201
- **Cycle**: Cycle 1

### PRI-210: Configure Google OAuth
- **Status**: Backlog
- **Priority**: High
- **Labels**: Auth
- **Estimate**: S
- **Project**: P2 Backend
- **Cycle**: Cycle 1
- **Acceptance**:
  - [ ] Google Cloud Console OAuth client created
  - [ ] `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in env
  - [ ] Test login works (sign in with Google)

### PRI-211: Configure Facebook OAuth
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Auth
- **Estimate**: S
- **Project**: P2 Backend
- **Cycle**: Cycle 2
- **Acceptance**:
  - [ ] Facebook app created
  - [ ] `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` in env
  - [ ] Test login works

### PRI-212: Configure Apple OAuth
- **Status**: Backlog
- **Priority**: Low
- **Labels**: Auth
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] Apple Developer service ID created
  - [ ] `APPLE_CLIENT_ID` and `APPLE_CLIENT_SECRET` in env
  - [ ] Test login works

### PRI-220: Set up Phone OTP (MSG91)
- **Status**: Backlog
- **Priority**: High
- **Labels**: Auth, SMS
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 2
- **Description**: India-critical. Configure Better Auth's `phoneNumber` plugin to send OTP via MSG91. Test full phone login flow.
- **Acceptance**:
  - [ ] MSG91 account + auth key
  - [ ] `phoneNumber` plugin configured in `auth.ts`
  - [ ] `sendOTP` function uses MSG91 API
  - [ ] Test: enter phone → receive OTP → verify → logged in
- **Sub-issues**:
  - PRI-221: Set up MSG91 account + DLT template (India)
  - PRI-222: Implement sendOTP function in lib/sms.ts
  - PRI-223: Configure phoneNumber plugin in auth.ts

### PRI-221: Set up MSG91 account + DLT template (India)
- **Status**: Backlog
- **Priority**: High
- **Labels**: SMS
- **Estimate**: S
- **Parent**: PRI-220
- **Cycle**: Cycle 2
- **Acceptance**: MSG91 account active, DLT template approved for transactional SMS

### PRI-222: Implement sendOTP function in lib/sms.ts
- **Status**: Backlog
- **Priority**: High
- **Labels**: SMS, Backend
- **Estimate**: S
- **Parent**: PRI-220
- **Cycle**: Cycle 2

### PRI-223: Configure phoneNumber plugin in auth.ts
- **Status**: Backlog
- **Priority**: High
- **Labels**: Auth
- **Estimate**: S
- **Parent**: PRI-220
- **Cycle**: Cycle 2

### PRI-230: Set up Magic Link (email passwordless)
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Auth, Email
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 2
- **Acceptance**:
  - [ ] `magicLink` plugin configured
  - [ ] `sendMagicLink` uses Resend
  - [ ] Test: enter email → receive link → click → logged in

### PRI-240: Set up Resend (transactional email)
- **Status**: Backlog
- **Priority**: High
- **Labels**: Email
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 2
- **Acceptance**:
  - [ ] Resend account + API key
  - [ ] Domain verified (SPF, DKIM, DMARC)
  - [ ] From address set (e.g., `hello@shaygabrand.com`)
  - [ ] Test email send + delivery
- **Sub-issues**:
  - PRI-241: Set up Resend account + domain verification
  - PRI-242: Configure SPF, DKIM, DMARC records

### PRI-241: Set up Resend account + domain verification
- **Status**: Backlog
- **Priority**: High
- **Labels**: Email
- **Estimate**: S
- **Parent**: PRI-240
- **Cycle**: Cycle 2

### PRI-242: Configure SPF, DKIM, DMARC records
- **Status**: Backlog
- **Priority**: High
- **Labels**: Email, Security
- **Estimate**: S
- **Parent**: PRI-240
- **Cycle**: Cycle 2

### PRI-250: Set up Next.js 16 proxy.ts (auth protection)
- **Status**: Backlog
- **Priority**: High
- **Labels**: Auth, Frontend
- **Estimate**: S
- **Project**: P2 Backend
- **Cycle**: Cycle 2
- **Acceptance**:
  - [ ] `proxy.ts` (not `middleware.ts`) in root
  - [ ] Uses `getSessionCookie` from `better-auth/cookies`
  - [ ] Protects `/account/*`, `/checkout/*`, `/admin/*`
  - [ ] Redirects unauthenticated users to login

### PRI-260: Set up Better Auth sync with Payload customers
- **Status**: Backlog
- **Priority**: High
- **Labels**: Auth, Backend
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 2
- **Description**: When a customer signs up via Better Auth, create a corresponding Payload `customers` document linked via `betterAuthUserId`. Sync email/phone/name changes back to Payload.
- **Acceptance**:
  - [ ] `databaseHooks.user.create.after` creates Payload customer
  - [ ] `databaseHooks.user.update.after` syncs updates
  - [ ] Test: sign up via email → Payload customer exists with linked `betterAuthUserId`
  - [ ] Test: update name in Better Auth → Payload customer name updated

### Payload Collections

### PRI-301: Define Users collection (admin)
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Backend, Auth
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 1
- **Acceptance**:
  - [ ] `src/collections/Users.ts` created with Payload's built-in `auth: true`
  - [ ] Fields: name, email, role (superAdmin/admin/editor/fulfillment/support)
  - [ ] Access control: only admins can create users
  - [ ] Test: create admin user, log in to /admin

### PRI-302: Define Customers collection (Better Auth-linked)
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Backend, Auth
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 2
- **Acceptance**:
  - [ ] `src/collections/Customers.ts` (NO `auth: true` — Better Auth handles it)
  - [ ] Fields: `betterAuthUserId`, email, firstName, lastName, phone, addresses, wishlist, etc.
  - [ ] `betterAuthUserId` is unique, indexed
  - [ ] Access: read/update only own record

### PRI-303: Define Products collection (saree-specific)
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Backend, Database
- **Estimate**: XL
- **Project**: P2 Backend
- **Cycle**: Cycle 2
- **Acceptance**:
  - [ ] `src/collections/Products.ts` with all saree-specific fields (fabric, weave, work, occasion, blouse piece, region, certifications, etc.)
  - [ ] Saree-specific metafields documented in shayga-payloadcms.md Section 11
  - [ ] Color variants as array
  - [ ] Test: create a product with 2 colors, appears on frontend

### PRI-304: Define Categories collection
- **Status**: Backlog
- **Priority**: High
- **Labels**: Backend, Database
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 2
- **Acceptance**:
  - [ ] `src/collections/Categories.ts` with nested docs (parent)
  - [ ] Type field: fabric, occasion, work, collection, editorial
  - [ ] SEO fields via plugin
  - [ ] Test: create "Silk Sarees" + "Wedding Sarees" categories

### PRI-305: Define Orders collection
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Backend, Database, Payment
- **Estimate**: XL
- **Project**: P2 Backend
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] `src/collections/Orders.ts` with items, shipping address, payment info, fulfillment status
  - [ ] Server-side only (no public create)
  - [ ] Customer can read own orders
  - [ ] Admin can read all
  - [ ] Auto-generate order number (SHG-2026-XXXXX)

### PRI-306: Define Carts collection
- **Status**: Backlog
- **Priority**: High
- **Labels**: Backend, Database
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 2
- **Acceptance**:
  - [ ] `src/collections/Carts.ts` for logged-in users
  - [ ] Linked to customer (Better Auth userId)
  - [ ] Items array with product + variant + quantity
  - [ ] Guest carts use localStorage (handled in frontend)

### PRI-307: Define Media collection
- **Status**: Backlog
- **Priority**: High
- **Labels**: Backend
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 2
- **Acceptance**:
  - [ ] `src/collections/Media.ts` for image uploads
  - [ ] Image sizes: thumbnail, card, product, hero
  - [ ] Alt text required
  - [ ] Focal point support

### PRI-308: Define Pages collection (Layout Builder)
- **Status**: Backlog
- **Priority**: High
- **Labels**: Backend, Content
- **Estimate**: L
- **Project**: P2 Backend
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] `src/collections/Pages.ts` with layout builder
  - [ ] Blocks: Hero, Content, Media, CTA, FAQ
  - [ ] Drafts + versioning
  - [ ] SEO fields via plugin
  - [ ] Used for: About, Contact, FAQ, Size Guide, etc.

### PRI-309: Define Coupons collection
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Backend
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] `src/collections/Coupons.ts` with code, type, value, expiry, usage limits

### PRI-310: Define ShippingZones collection
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Backend
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] `src/collections/ShippingZones.ts` with state list, rate, free shipping threshold, estimated days

### PRI-311: Define FormSubmissions collection
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Backend
- **Estimate**: S
- **Project**: P2 Backend
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] Uses Payload Form Builder plugin
  - [ ] Contact form submissions saved + email sent

### PRI-312: Define Redirects collection
- **Status**: Backlog
- **Priority**: Low
- **Labels**: Backend, DevOps
- **Estimate**: S
- **Project**: P2 Backend
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] Payload Redirects plugin configured
  - [ ] 301 redirects managed in admin

### Globals

### PRI-401: Define Header global (navigation)
- **Status**: Backlog
- **Priority**: High
- **Labels**: Backend, Frontend
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 2
- **Acceptance**:
  - [ ] `src/globals/Header.ts` with nav items, mega-menu config
  - [ ] Editable in admin, reflected on frontend

### PRI-402: Define Footer global
- **Status**: Backlog
- **Priority**: High
- **Labels**: Backend
- **Estimate**: S
- **Project**: P2 Backend
- **Cycle**: Cycle 2

### PRI-403: Define Homepage global
- **Status**: Backlog
- **Priority**: High
- **Labels**: Backend, Content
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 2
- **Acceptance**:
  - [ ] `src/globals/Homepage.ts` with all sections (hero, categories, featured, new arrivals, brand story, trust strip)
  - [ ] Editable without code deploy

### PRI-404: Define Settings global
- **Status**: Backlog
- **Priority**: High
- **Labels**: Backend
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 2
- **Acceptance**:
  - [ ] `src/globals/Settings.ts` with site name, logo, contact, social links, default shipping, analytics IDs, COD toggle

### Admin Panel Customization

### PRI-501: Customize Payload admin dashboard
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Backend, Design
- **Estimate**: M
- **Project**: P2 Backend
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] Custom logo and colors
  - [ ] Dashboard widgets: today's sales, low stock count, pending orders

### PRI-502: Build order fulfillment Kanban
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Backend
- **Estimate**: L
- **Project**: P2 Backend
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] Custom admin view with Kanban: Pending → Processing → Shipped → Delivered
  - [ ] Drag to change status
  - [ ] Filters: date range, courier, customer

### PRI-503: Build low-stock alert widget
- **Status**: Backlog
- **Priority**: Low
- **Labels**: Backend
- **Estimate**: S
- **Project**: P2 Backend
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] Dashboard widget shows products with stock ≤ lowStockThreshold
  - [ ] Click to view/edit product

---

## P3: Storefront (Frontend)

> Target: Cycle 2–4 (Weeks 3–6)
> Goal: Browseable, navigable storefront

### Layout Components

### PRI-601: Build Header with mega-menu
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend, Design
- **Estimate**: L
- **Project**: P3 Storefront
- **Cycle**: Cycle 2
- **Acceptance**:
  - [ ] Logo, nav, search, account, wishlist, cart icons
  - [ ] Mega-menu on hover (Shop dropdown)
  - [ ] Mobile drawer menu
  - [ ] Sticky on scroll
  - [ ] Reads from `Header` global
- **Sub-issues**:
  - PRI-602: Header desktop layout
  - PRI-603: Header mobile drawer
  - PRI-604: Mega-menu component

### PRI-602: Header desktop layout
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Parent**: PRI-601
- **Cycle**: Cycle 2

### PRI-603: Header mobile drawer
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Parent**: PRI-601
- **Cycle**: Cycle 2

### PRI-604: Mega-menu component
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Parent**: PRI-601
- **Cycle**: Cycle 2

### PRI-610: Build Footer
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P3 Storefront
- **Cycle**: Cycle 2
- **Acceptance**:
  - [ ] Multi-column: Shop, Customer Care, About, Connect
  - [ ] Newsletter signup
  - [ ] Payment icons + social links
  - [ ] Reads from `Footer` global

### PRI-620: Build Cart Drawer
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P3 Storefront
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] Slide-out drawer from right
  - [ ] Line items, quantity, remove
  - [ ] Subtotal, checkout CTA
  - [ ] Empty state

### Homepage

### PRI-701: Build Homepage sections
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend, Content
- **Estimate**: XL
- **Project**: P3 Storefront
- **Cycle**: Cycle 2
- **Acceptance**:
  - [ ] All sections from `Homepage` global render correctly
  - [ ] Hero, categories, featured, new arrivals, best sellers, brand story, trust strip, newsletter
  - [ ] ISR with revalidation on Homepage global change
  - [ ] Mobile responsive
- **Sub-issues**:
  - PRI-702: Homepage hero + utility strip
  - PRI-703: Homepage category grid
  - PRI-704: Homepage featured collection
  - PRI-705: Homepage new arrivals section
  - PRI-706: Homepage brand story + trust strip + newsletter

### PRI-702: Homepage hero + utility strip
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Parent**: PRI-701
- **Cycle**: Cycle 2

### PRI-703: Homepage category grid
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Parent**: PRI-701
- **Cycle**: Cycle 2

### PRI-704: Homepage featured collection
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Parent**: PRI-701
- **Cycle**: Cycle 2

### PRI-705: Homepage new arrivals section
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Parent**: PRI-701
- **Cycle**: Cycle 2

### PRI-706: Homepage brand story + trust strip + newsletter
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend, Content
- **Estimate**: M
- **Parent**: PRI-701
- **Cycle**: Cycle 2

### PLP (Collection Page)

### PRI-801: Build Collection/PLP with filters
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Frontend
- **Estimate**: XL
- **Project**: P3 Storefront
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] `/collections/[slug]` page works
  - [ ] Filter sidebar: fabric, color, price range, occasion, work, blouse piece
  - [ ] Sort: featured, newest, price low-high, price high-low, best selling
  - [ ] Product grid (4 col desktop, 2 col mobile)
  - [ ] Pagination or infinite scroll
  - [ ] Empty state when no results
  - [ ] SEO meta per collection
  - [ ] Structured data (CollectionPage + BreadcrumbList)
- **Sub-issues**:
  - PRI-802: Collection page layout + grid
  - PRI-803: Filter sidebar component
  - PRI-804: Sort dropdown
  - PRI-805: Empty + loading states

### PRI-802: Collection page layout + grid
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Parent**: PRI-801
- **Cycle**: Cycle 3

### PRI-803: Filter sidebar component
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: L
- **Parent**: PRI-801
- **Cycle**: Cycle 3

### PRI-804: Sort dropdown
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend
- **Estimate**: S
- **Parent**: PRI-801
- **Cycle**: Cycle 3

### PRI-805: Empty + loading states
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend
- **Estimate**: S
- **Parent**: PRI-801
- **Cycle**: Cycle 3

### PDP (Product Detail Page)

### PRI-901: Build PDP with all sections
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Frontend
- **Estimate**: XL
- **Project**: P3 Storefront
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] Image gallery (zoom, thumbnails, lightbox)
  - [ ] Color variant selector (swatches)
  - [ ] Price block (with MRP + discount %)
  - [ ] Quantity selector
  - [ ] Add to Cart button
  - [ ] Wishlist heart
  - [ ] Tabs: Description, Fabric & Care, Shipping & Returns
  - [ ] Related products
  - [ ] Breadcrumbs
  - [ ] Structured data (Product + BreadcrumbList + Offer)
  - [ ] SEO meta
- **Sub-issues**:
  - PRI-902: PDP image gallery + zoom
  - PRI-903: PDP variant selector + add to cart
  - PRI-904: PDP info tabs (description, care, shipping)
  - PRI-905: PDP related products
  - PRI-906: PDP structured data (JSON-LD)

### PRI-902: PDP image gallery + zoom
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: L
- **Parent**: PRI-901
- **Cycle**: Cycle 3

### PRI-903: PDP variant selector + add to cart
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Parent**: PRI-901
- **Cycle**: Cycle 3

### PRI-904: PDP info tabs (description, care, shipping)
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend, Content
- **Estimate**: M
- **Parent**: PRI-901
- **Cycle**: Cycle 3

### PRI-905: PDP related products
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend
- **Estimate**: M
- **Parent**: PRI-901
- **Cycle**: Cycle 3

### PRI-906: PDP structured data (JSON-LD)
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend, Content
- **Estimate**: S
- **Parent**: PRI-901
- **Cycle**: Cycle 3

### Search

### PRI-1001: Build search bar with autocomplete
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P3 Storefront
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Search bar in header (opens modal/dropdown on click)
  - [ ] Live autocomplete (top 5 results)
  - [ ] Recent searches (localStorage)
  - [ ] Mobile-friendly

### PRI-1002: Build search results page
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P3 Storefront
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] `/search?q=` route
  - [ ] Results grid (similar to PLP)
  - [ ] Filters + sort
  - [ ] Empty state with suggestions

### Static Pages

### PRI-1101: Build About Us page
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend, Content
- **Estimate**: M
- **Project**: P3 Storefront
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] Brand story, founder's note, team photo
  - [ ] CMS-editable via Layout Builder
  - [ ] SEO meta

### PRI-1102: Build Contact Us page
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend, Content
- **Estimate**: M
- **Project**: P3 Storefront
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] Contact form (name, email, subject, message)
  - [ ] Saves to FormSubmissions + sends email
  - [ ] Phone, email, WhatsApp, address visible

### PRI-1103: Build FAQ page
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend, Content
- **Estimate**: M
- **Project**: P3 Storefront
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] Accordion format
  - [ ] 15–25 questions across 5 categories
  - [ ] CMS-editable

### PRI-1104: Build Size Guide page
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend, Content
- **Estimate**: M
- **Project**: P3 Storefront
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] Blouse measurement guide with diagram
  - [ ] Standard saree length explanation
  - [ ] How to measure (text + image)

### PRI-1105: Build Shipping Policy page
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend, Content
- **Estimate**: S
- **Project**: P3 Storefront
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Domestic shipping rates + zones
  - [ ] Free shipping threshold
  - [ ] Estimated delivery times
  - [ ] International (Phase 2)

### PRI-1106: Build Return Policy page
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend, Content
- **Estimate**: S
- **Project**: P3 Storefront
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] 14-day return window
  - [ ] Eligible/non-returnable items
  - [ ] Return process
  - [ ] Refund timeline

### PRI-1107: Build 404 page
- **Status**: Backlog
- **Priority**: Low
- **Labels**: Frontend
- **Estimate**: S
- **Project**: P3 Storefront
- **Cycle**: Cycle 7

### PRI-1108: Build Care Instructions page
- **Status**: Backlog
- **Priority**: Low
- **Labels**: Frontend, Content
- **Estimate**: S
- **Project**: P3 Storefront
- **Cycle**: Cycle 4

### Newsletter

### PRI-1201: Build newsletter signup form + popup
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend, Email
- **Estimate**: M
- **Project**: P3 Storefront
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Footer signup form
  - [ ] Exit-intent popup (10% off first order)
  - [ ] Email saved to Klaviyo or database
  - [ ] Double opt-in for compliance

---

## P4: Cart & Checkout

> Target: Cycle 3–5 (Weeks 5–8)
> Goal: End-to-end checkout with Razorpay

### Cart

### PRI-1301: Build cart logic (Zustand + Server Actions)
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Frontend
- **Estimate**: L
- **Project**: P4 Cart & Checkout
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] Zustand store for client state
  - [ ] localStorage persistence (guest)
  - [ ] Server Action for DB cart (logged-in)
  - [ ] Add, update quantity, remove
  - [ ] Cart count in header updates

### PRI-1302: Build cart page UI
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P4 Cart & Checkout
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] `/cart` route
  - [ ] Line items with image, name, variant, qty, price
  - [ ] Discount code input
  - [ ] Subtotal, shipping, total
  - [ ] Checkout CTA
  - [ ] Empty state

### Razorpay

### PRI-1401: Set up Razorpay account
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Payment
- **Estimate**: S
- **Project**: P4 Cart & Checkout
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Razorpay account created + KYC complete
  - [ ] Test API keys obtained
  - [ ] Live API keys obtained (after launch)
  - [ ] Bank account linked for payouts

### PRI-1402: Implement Razorpay order creation (server)
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Backend, Payment
- **Estimate**: M
- **Project**: P4 Cart & Checkout
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] `app/api/razorpay/create-order/route.ts` creates Razorpay order
  - [ ] Returns order_id + amount to client
  - [ ] Validates cart total server-side

### PRI-1403: Implement Razorpay signature verification (server)
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Backend, Payment, Security
- **Estimate**: M
- **Project**: P4 Cart & Checkout
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] `app/api/razorpay/verify/route.ts` verifies signature using HMAC SHA256
  - [ ] On valid signature, creates Order in Payload
  - [ ] Returns success/error

### PRI-1404: Implement Razorpay webhook handler
- **Status**: Backlog
- **Priority**: High
- **Labels**: Backend, Payment
- **Estimate**: M
- **Project**: P4 Cart & Checkout
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] `/api/webhooks/razorpay` endpoint
  - [ ] Verifies webhook signature
  - [ ] Handles: payment.captured, payment.failed, refund.processed
  - [ ] Updates order status

### PRI-1405: Implement Razorpay checkout UI (client)
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Frontend, Payment
- **Estimate**: M
- **Project**: P4 Cart & Checkout
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Load Razorpay script
  - [ ] Trigger checkout on "Place Order"
  - [ ] Handle success (redirect to confirmation)
  - [ ] Handle failure (show error, allow retry)

### Checkout Flow

### PRI-1501: Build multi-step checkout form
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Frontend
- **Estimate**: XL
- **Project**: P4 Cart & Checkout
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Steps: Contact → Shipping → Payment → Review
  - [ ] React Hook Form + Zod validation
  - [ ] Progress indicator
  - [ ] Save state in session
  - [ ] Mobile responsive
- **Sub-issues**:
  - PRI-1502: Checkout step 1 — Contact
  - PRI-1503: Checkout step 2 — Shipping address
  - PRI-1504: Checkout step 3 — Payment method
  - PRI-1505: Checkout step 4 — Review + place order

### PRI-1502: Checkout step 1 — Contact
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: S
- **Parent**: PRI-1501
- **Cycle**: Cycle 4

### PRI-1503: Checkout step 2 — Shipping address
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Parent**: PRI-1501
- **Cycle**: Cycle 4

### PRI-1504: Checkout step 3 — Payment method
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend, Payment
- **Estimate**: M
- **Parent**: PRI-1501
- **Cycle**: Cycle 4

### PRI-1505: Checkout step 4 — Review + place order
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Parent**: PRI-1501
- **Cycle**: Cycle 4

### PRI-1510: Implement COD flow
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend, Payment
- **Estimate**: M
- **Project**: P4 Cart & Checkout
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] COD as payment method option
  - [ ] Server creates order with `payment.method: 'cod'`, `payment.status: 'pending'`
  - [ ] Confirmation email mentions "Pay on delivery"

### PRI-1520: Build order confirmation page
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P4 Cart & Checkout
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Order number, summary, estimated delivery
  - [ ] "Create account?" prompt for guest checkout
  - [ ] Email confirmation sent automatically

### PRI-1530: Build shipping calculator
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P4 Cart & Checkout
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Pincode input → calculates shipping
  - [ ] Uses ShippingZones collection
  - [ ] Free above ₹999

### Coupons

### PRI-1601: Implement coupon system
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Backend, Frontend
- **Estimate**: M
- **Project**: P4 Cart & Checkout
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] Apply coupon at cart/checkout
  - [ ] Validate code, expiry, usage limits
  - [ ] Calculate discount (percentage or fixed)
  - [ ] First-order coupon auto-applied via URL param

---

## P5: Customer Accounts & Auth

> Target: Cycle 3–5 (Weeks 6–8)
> Goal: Customer can sign up, log in, manage account

### Auth UI

### PRI-1701: Build login page
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Frontend, Auth
- **Estimate**: M
- **Project**: P5 Customer Accounts
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] Email + password login
  - [ ] Google login button
  - [ ] Facebook login button
  - [ ] Apple login button
  - [ ] "Login with Phone (OTP)" link
  - [ ] Forgot password link
  - [ ] Create account link
  - [ ] Redirect param support (return to original page)

### PRI-1702: Build register page
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Frontend, Auth
- **Estimate**: M
- **Project**: P5 Customer Accounts
- **Cycle**: Cycle 3
- **Acceptance**:
  - [ ] Email + password + name + phone signup
  - [ ] Email verification sent
  - [ ] Social signup options
  - [ ] Welcome email after verification

### PRI-1703: Build phone OTP login page
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend, Auth, SMS
- **Estimate**: M
- **Project**: P5 Customer Accounts
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Enter phone → send OTP via MSG91
  - [ ] Enter 6-digit OTP → verify
  - [ ] Logged in on success

### PRI-1704: Build forgot password page
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend, Auth
- **Estimate**: S
- **Project**: P5 Customer Accounts
- **Cycle**: Cycle 3

### PRI-1705: Build reset password page
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend, Auth
- **Estimate**: S
- **Project**: P5 Customer Accounts
- **Cycle**: Cycle 3

### Account Dashboard

### PRI-1801: Build account dashboard home
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P5 Customer Accounts
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Welcome with first name
  - [ ] Quick links: orders, addresses, wishlist, profile
  - [ ] Recent order summary

### PRI-1802: Build order history page
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P5 Customer Accounts
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Table: order #, date, status, total
  - [ ] Click → order details
  - [ ] Filters: date range, status

### PRI-1803: Build order details page
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P5 Customer Accounts
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Items, address, payment, totals
  - [ ] Tracking link (when shipped)
  - [ ] Reorder button (Phase 2)

### PRI-1804: Build address book page
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P5 Customer Accounts
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] List of saved addresses
  - [ ] Add new / edit / delete
  - [ ] Set default
  - [ ] Used in checkout (Phase 2: prefill)

### PRI-1805: Build wishlist page
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P5 Customer Accounts
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Grid of wishlisted products
  - [ ] Add to cart from wishlist
  - [ ] Remove from wishlist

### PRI-1806: Build profile edit page
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend, Auth
- **Estimate**: M
- **Project**: P5 Customer Accounts
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Edit name, email, phone
  - [ ] Change password
  - [ ] Email change triggers verification
  - [ ] Marketing opt-in toggle

### Wishlist

### PRI-1901: Build wishlist toggle (heart icon on PDP + cards)
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P5 Customer Accounts
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Heart icon on product card
  - [ ] Click toggles wishlist (optimistic UI)
  - [ ] Guest: save to localStorage
  - [ ] Logged in: save to Payload customer.wishlist
  - [ ] Login prompt for guests on click

---

## P6: Shipping & Fulfillment

> Target: Cycle 5–6 (Weeks 7–9)
> Goal: End-to-end order fulfillment

### Shiprocket

### PRI-2001: Set up Shiprocket account
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Backend
- **Estimate**: S
- **Project**: P6 Shipping
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] Shiprocket account created
  - [ ] KYC + bank account linked
  - [ ] Pickup location added
  - [ ] API credentials obtained

### PRI-2002: Build Shiprocket API client
- **Status**: Backlog
- **Priority**: High
- **Labels**: Backend
- **Estimate**: M
- **Project**: P6 Shipping
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] `src/lib/shiprocket.ts` with typed API client
  - [ ] Functions: createOrder, generateAWB, trackOrder, cancelOrder
  - [ ] Auth token caching

### PRI-2003: Auto-create Shiprocket shipment on order paid
- **Status**: Backlog
- **Priority**: High
- **Labels**: Backend
- **Estimate**: M
- **Project**: P6 Shipping
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] When order `payment.status = captured`, create Shiprocket shipment
  - [ ] Store AWB + courier in order
  - [ ] Update order `fulfillment.status = processing`

### PRI-2004: Build Shiprocket webhook handler
- **Status**: Backlog
- **Priority**: High
- **Labels**: Backend
- **Estimate**: M
- **Project**: P6 Shipping
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] `/api/webhooks/shiprocket` receives tracking updates
  - [ ] Update order `fulfillment.status`, `awbCode`, `courierName`
  - [ ] Update `shippedAt`, `deliveredAt` timestamps

### PRI-2005: Build tracking page
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend
- **Estimate**: S
- **Project**: P6 Shipping
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] Customer-facing order tracking
  - [ ] Shows AWB + courier + status timeline
  - [ ] Links to Shiprocket tracking URL

### Returns

### PRI-2101: Build return request flow (customer)
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P6 Shipping
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] "Request Return" button on delivered orders
  - [ ] Select items + reason + photos
  - [ ] Save return request to order

### PRI-2102: Build returns management in admin
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Backend
- **Estimate**: M
- **Project**: P6 Shipping
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] Admin can view pending return requests
  - [ ] Approve / reject with reason
  - [ ] Mark as received

### PRI-2103: Implement Razorpay refund
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Backend, Payment
- **Estimate**: M
- **Project**: P6 Shipping
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] When return approved + received, initiate Razorpay refund
  - [ ] Update order `payment.status = refunded`
  - [ ] Refund confirmation email

---

## P7: Marketing, Content & SEO

> Target: Cycle 5–7 (Weeks 9–11)
> Goal: SEO + analytics + email automation

### Email Templates

### PRI-2201: Build order confirmation email template
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend, Email
- **Estimate**: M
- **Project**: P7 Marketing
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] React Email template (`emails/OrderConfirmation.tsx`)
  - [ ] Order #, items, total, expected delivery
  - [ ] Resend integration working

### PRI-2202: Build order shipped email template
- **Status**: Backlog
- **Priority**: High
- **Labels**: Email
- **Estimate**: S
- **Project**: P7 Marketing
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] Tracking link, courier name
  - [ ] Sent on Shiprocket webhook (shipped status)

### PRI-2203: Build order delivered email template
- **Status**: Backlog
- **Priority**: High
- **Labels**: Email
- **Estimate**: S
- **Project**: P7 Marketing
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] Thank you + review request (Phase 2)
  - [ ] Sent on delivery

### PRI-2204: Build welcome email template
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Email
- **Estimate**: S
- **Project**: P7 Marketing
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] 10% off first order code
  - [ ] Brand intro

### PRI-2205: Build abandoned cart email template
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Email
- **Estimate**: M
- **Project**: P7 Marketing
- **Cycle**: Cycle 6
- **Acceptance**:
  - [ ] Cart items, discount incentive
  - [ ] Sent 1h + 24h after cart abandoned

### Blog

### PRI-2301: Set up Posts collection
- **Status**: Backlog
- **Priority**: Low
- **Labels**: Backend, Content
- **Estimate**: M
- **Project**: P7 Marketing
- **Cycle**: Cycle 6
- **Acceptance**:
  - [ ] `src/collections/Posts.ts` with title, slug, content (Lexical), author, categories, tags
  - [ ] Drafts + scheduling

### PRI-2302: Build blog index page
- **Status**: Backlog
- **Priority**: Low
- **Labels**: Frontend, Content
- **Estimate**: M
- **Project**: P7 Marketing
- **Cycle**: Cycle 6

### PRI-2303: Build blog detail page
- **Status**: Backlog
- **Priority**: Low
- **Labels**: Frontend, Content
- **Estimate**: M
- **Project**: P7 Marketing
- **Cycle**: Cycle 6

### SEO

### PRI-2401: Implement sitemap generation
- **Status**: Backlog
- **Priority**: High
- **Labels**: Backend, Frontend
- **Estimate**: S
- **Project**: P7 Marketing
- **Cycle**: Cycle 6
- **Acceptance**:
  - [ ] `app/sitemap.ts` generates from Payload collections
  - [ ] Includes: products, collections, pages, posts
  - [ ] Submitted to Google Search Console

### PRI-2402: Implement robots.txt
- **Status**: Backlog
- **Priority**: High
- **Labels**: Backend
- **Estimate**: XS
- **Project**: P7 Marketing
- **Cycle**: Cycle 6
- **Acceptance**:
  - [ ] `app/robots.ts` with proper disallow rules
  - [ ] Sitemap reference included

### PRI-2403: Add structured data (JSON-LD) to all pages
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P7 Marketing
- **Cycle**: Cycle 6
- **Acceptance**:
  - [ ] Product schema on PDP
  - [ ] BreadcrumbList on PLP + PDP
  - [ ] Organization on homepage
  - [ ] FAQPage on FAQ page
  - [ ] LocalBusiness on contact (if applicable)
  - [ ] Validated with Google Rich Results Test

### PRI-2404: Add 301 redirect management
- **Status**: Backlog
- **Priority**: Low
- **Labels**: Backend
- **Estimate**: S
- **Project**: P7 Marketing
- **Cycle**: Cycle 7
- **Acceptance**:
  - [ ] Payload Redirects plugin working
  - [ ] `next.config.ts` rewrites legacy URLs (if any)

### Analytics

### PRI-2501: Set up Google Analytics 4
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: S
- **Project**: P7 Marketing
- **Cycle**: Cycle 6
- **Acceptance**:
  - [ ] GA4 ID in env + Settings global
  - [ ] Page views, e-commerce events tracked
  - [ ] Verified in GA4 DebugView

### PRI-2502: Set up Meta Pixel
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: S
- **Project**: P7 Marketing
- **Cycle**: Cycle 6
- **Acceptance**:
  - [ ] Pixel ID configured
  - [ ] PageView, ViewContent, AddToCart, Purchase events
  - [ ] Verified with Meta Pixel Helper

### PRI-2503: Set up PostHog (optional)
- **Status**: Backlog
- **Priority**: Low
- **Labels**: Frontend
- **Estimate**: S
- **Project**: P7 Marketing
- **Cycle**: Cycle 6
- **Acceptance**:
  - [ ] PostHog project created
  - [ ] Session recording enabled
  - [ ] Funnels set up for: signup, checkout, purchase

### PRI-2504: Set up Microsoft Clarity (optional, free)
- **Status**: Backlog
- **Priority**: Low
- **Labels**: Frontend
- **Estimate**: XS
- **Project**: P7 Marketing
- **Cycle**: Cycle 6
- **Acceptance**: Heatmaps + session recording on

### Content

### PRI-2601: Write About Us content
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Content
- **Estimate**: M
- **Project**: P7 Marketing
- **Cycle**: Cycle 4
- **Acceptance**: 300–500 words brand story, founder's note, team photo

### PRI-2602: Write FAQ content
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Content
- **Estimate**: M
- **Project**: P7 Marketing
- **Cycle**: Cycle 4
- **Acceptance**: 15–25 questions across 5 categories

### PRI-2603: Write all policy pages
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Content
- **Estimate**: M
- **Project**: P7 Marketing
- **Cycle**: Cycle 4
- **Acceptance**:
  - [ ] Privacy Policy
  - [ ] Terms of Service
  - [ ] Shipping Policy
  - [ ] Return Policy
  - [ ] Refund Policy

### PRI-2604: Write product descriptions (30–80 SKUs)
- **Status**: Backlog
- **Priority**: High
- **Labels**: Content
- **Estimate**: XL
- **Project**: P7 Marketing
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] 50–100 words each
  - [ ] Includes fabric, design, occasion, care
  - [ ] SEO-optimized

### PRI-2605: Photography (30–80 products)
- **Status**: Backlog
- **Priority**: High
- **Labels**: Content
- **Estimate**: XL
- **Project**: P7 Marketing
- **Cycle**: Cycle 5
- **Acceptance**:
  - [ ] 4–7 images per product
  - [ ] White background + model + close-up
  - [ ] Optimized (WebP, <200KB each)

---

## P8: Testing, QA & Launch

> Target: Cycle 6–7 (Weeks 11–14)
> Goal: Production-ready, launched, monitored

### Testing

### PRI-3001: Write unit tests (Vitest)
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Backend
- **Estimate**: L
- **Project**: P8 Testing
- **Cycle**: Cycle 6
- **Acceptance**:
  - [ ] Cart pricing logic
  - [ ] Coupon validation
  - [ ] Shipping calculation
  - [ ] Order total computation

### PRI-3002: Write E2E tests (Playwright)
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend
- **Estimate**: L
- **Project**: P8 Testing
- **Cycle**: Cycle 7
- **Acceptance**:
  - [ ] Browse → product → add to cart → checkout → payment
  - [ ] Sign up → verify email → login
  - [ ] Account dashboard → order history
  - [ ] Mobile viewport tests

### PRI-3003: Cross-browser testing
- **Status**: Backlog
- **Priority**: Medium
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P8 Testing
- **Cycle**: Cycle 7
- **Acceptance**: Tested in Chrome, Safari, Firefox, Edge (desktop + mobile)

### PRI-3004: Mobile testing (real devices)
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend
- **Estimate**: M
- **Project**: P8 Testing
- **Cycle**: Cycle 7
- **Acceptance**: iOS + Android on real devices (BrowserStack or physical)

### PRI-3005: Performance audit (Lighthouse)
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend, Performance
- **Estimate**: M
- **Project**: P8 Testing
- **Cycle**: Cycle 7
- **Acceptance**:
  - [ ] Lighthouse score > 90 mobile, > 95 desktop
  - [ ] LCP < 2.5s, FID < 100ms, CLS < 0.1
  - [ ] Fix any critical issues

### PRI-3006: Accessibility audit (WCAG 2.1 AA)
- **Status**: Backlog
- **Priority**: High
- **Labels**: Frontend, Security
- **Estimate**: M
- **Project**: P8 Testing
- **Cycle**: Cycle 7
- **Acceptance**:
  - [ ] axe-core / Lighthouse accessibility > 95
  - [ ] Keyboard navigation works
  - [ ] Screen reader tested
  - [ ] Color contrast meets AA

### PRI-3007: Security audit
- **Status**: Backlog
- **Priority**: High
- **Labels**: Security
- **Estimate**: M
- **Project**: P8 Testing
- **Cycle**: Cycle 7
- **Acceptance**:
  - [ ] Snyk / npm audit clean
  - [ ] No exposed secrets
  - [ ] HTTPS enforced
  - [ ] CSP headers configured

### PRI-3008: Payment testing (all methods)
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Payment
- **Estimate**: M
- **Project**: P8 Testing
- **Cycle**: Cycle 7
- **Acceptance**:
  - [ ] Test cards: success, failure, 3DS
  - [ ] UPI: success, failure
  - [ ] Net Banking: success
  - [ ] Wallets: success
  - [ ] COD: success
  - [ ] Refund flow

### Pre-Launch

### PRI-3101: Final pre-launch QA pass
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Frontend, Backend
- **Estimate**: L
- **Project**: P8 Testing
- **Cycle**: Cycle 7
- **Acceptance**:
  - [ ] All issues from audit closed
  - [ ] Final smoke test of all flows
  - [ ] All emails deliverable
  - [ ] All SMS sendable

### PRI-3102: DNS cutover to production
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: DevOps
- **Estimate**: S
- **Project**: P8 Testing
- **Cycle**: Cycle 7
- **Acceptance**: apex domain points to production, www redirects, SSL active

### PRI-3103: Switch to live Razorpay keys
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: Payment, DevOps
- **Estimate**: S
- **Project**: P8 Testing
- **Cycle**: Cycle 7

### PRI-3104: Train client team on Payload admin
- **Status**: Backlog
- **Priority**: High
- **Labels**: Documentation
- **Estimate**: M
- **Project**: P8 Testing
- **Cycle**: Cycle 7
- **Acceptance**:
  - [ ] Live training session (recorded)
  - [ ] Documentation: how to add product, process order, manage inventory
  - [ ] Q&A handled

### PRI-3105: Write admin documentation
- **Status**: Backlog
- **Priority**: High
- **Labels**: Documentation
- **Estimate**: M
- **Project**: P8 Testing
- **Cycle**: Cycle 7
- **Acceptance**:
  - [ ] `docs/admin-guide.md` with screenshots
  - [ ] Covers: products, orders, customers, content
  - [ ] Common tasks + troubleshooting

### Launch

### PRI-3201: Production deploy + 48h monitoring
- **Status**: Backlog
- **Priority**: Urgent
- **Labels**: DevOps
- **Estimate**: M
- **Project**: P8 Testing
- **Cycle**: Cycle 7
- **Acceptance**:
  - [ ] Final deploy to production
  - [ ] Sentry, Vercel, PostHog monitoring active
  - [ ] 48h intensive monitoring
  - [ ] No P0/P1 issues

### PRI-3202: Launch announcement
- **Status**: Backlog
- **Priority**: High
- **Labels**: Content
- **Estimate**: S
- **Project**: P8 Testing
- **Cycle**: Cycle 7
- **Acceptance**:
  - [ ] Social media posts (Instagram, Facebook)
  - [ ] Email to existing list (if any)
  - [ ] Press release (if applicable)

---

## Sub-issue Conventions

In Linear, complex issues should be broken into sub-issues. The parent is
the "epic" — a logical unit of work. Sub-issues are concrete tasks.

**Pattern used in this plan**:
- `PRI-101: Initialize Next.js project` (parent/epic)
  - `PRI-102: Pin versions` (sub-issue)
  - `PRI-103: Configure TypeScript` (sub-issue)
  - `PRI-104: Set up Tailwind` (sub-issue)
  - `PRI-105: Configure ESLint` (sub-issue)

**When to use sub-issues**:
- Parent estimate is L or XL (3+ days)
- Multiple discrete deliverables
- Different team members might own different parts
- Can be done in parallel

**When NOT to use sub-issues**:
- Issue fits in S or M (1 day)
- Single logical change
- One person owns it end-to-end

---

## Dependencies Between Issues

| Issue | Depends On |
|-------|------------|
| PRI-201 (Better Auth core) | PRI-101 (project init), PRI-110 (Postgres) |
| PRI-220 (Phone OTP) | PRI-201, PRI-240 (Resend) |
| PRI-260 (Better Auth sync) | PRI-201, PRI-302 (Customers collection) |
| PRI-302 (Customers collection) | PRI-201 (Better Auth) |
| PRI-305 (Orders) | PRI-303 (Products), PRI-302 (Customers) |
| PRI-601 (Header) | PRI-401 (Header global) |
| PRI-701 (Homepage) | PRI-401, PRI-402, PRI-403, PRI-404, PRI-601 |
| PRI-801 (PLP) | PRI-303, PRI-304, PRI-401 |
| PRI-901 (PDP) | PRI-303, PRI-401 |
| PRI-1301 (Cart logic) | PRI-302, PRI-303, PRI-305 |
| PRI-1402 (Razorpay create) | PRI-1302, PRI-1401, PRI-305 |
| PRI-1501 (Checkout form) | PRI-1302, PRI-1401, PRI-1530 |
| PRI-1701 (Login) | PRI-201, PRI-220 |
| PRI-1801 (Dashboard) | PRI-302, PRI-305 |
| PRI-2003 (Auto-shipment) | PRI-305, PRI-2001, PRI-2002 |
| PRI-2201 (Order confirmation email) | PRI-305, PRI-240 |
| PRI-2401 (Sitemap) | PRI-303, PRI-304, PRI-308 |
| PRI-3005 (Performance) | All P3, P4, P5 issues |
| PRI-3201 (Launch) | All P1–P7 issues + P8 testing issues |

---

## Import Workflow

### Option A: Push to Linear via MCP (recommended)

I can use Linear MCP tools to create all of this in your workspace:

1. **Create labels** (the 8 new area labels) via `Linear_create_issue_label`
2. **Create the Initiative** via `Linear_save_project` with `targetDate` etc.
3. **Create 8 Projects** under the initiative
4. **Create all issues** in batches (parent issues first, then sub-issues)
5. **Link sub-issues** to parents
6. **Set up cycles** in the Prince Sharma team

Tell me: **"Push to Linear"** and I'll do it.

### Option B: Manual import

1. Copy this file to a Google Sheet or CSV
2. Use Linear's CSV import: https://linear.app/settings/import
3. Map columns: Title → Summary, Description → Description, etc.
4. Import in batches per project

### Option C: Linear API

For programmatic import, use Linear's GraphQL API with the issue structure
defined here. Each issue maps to an `issueCreate` mutation.

---

## Summary Statistics

| Metric | Count |
|--------|-------|
| Initiatives | 1 |
| Projects | 8 |
| Issues (parents) | ~60 |
| Sub-issues | ~30 |
| **Total issues** | **~90** |
| Cycles (2-week sprints) | 7 |
| Estimated duration | 12–14 weeks |
| Team members | 1–3 (frontend, backend, fullstack) |

---

## Document Status

- **Version**: 1.0
- **Created**: June 2026
- **Target workspace**: Prince Sharma team (PRI)
- **Source plan**: `docs/shayga-payloadcms.md` v1.3 + `docs/shayga-shopify.md`
- **Owner**: Shayga project manager (you)
- **Next step**: Approve plan → push to Linear
