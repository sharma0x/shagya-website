# Shagya — Saree E-Commerce Website Plan (Payload CMS + Next.js)

> Detailed implementation plan for the new client saree e-commerce website
> using **Payload CMS** (headless, code-first) as the backend and **Next.js
> 16 (App Router)** as the frontend. Single-repo fullstack TypeScript
> codebase deployed on **Vercel** or self-hosted.
>
> **Companion document**: [`shagya-shopify.md`](./shagya-shopify.md) covers
> the same business requirements on a Shopify stack. Read both for a
> side-by-side comparison.
>
> **Audience**: project owner (client) + Shagya delivery team.
> **Status**: Draft v1.1 — pending client sign-off on open questions.

### Latest Tech Versions (June 2026)

| Component        | Version              | Notes                                                                  |
| ---------------- | -------------------- | ---------------------------------------------------------------------- |
| **Next.js**      | **16.2**             | App Router, Turbopack default, React Compiler stable, Cache Components |
| **React**        | **19.2**             | View Transitions, `useEffectEvent`, `<Activity />`, ships with Next 16 |
| **Payload CMS**  | **3.x** (latest 3.x) | Headless, code-first, TypeScript-native                                |
| **PostgreSQL**   | **18.4**             | Latest stable (May 2026), 19 in beta                                   |
| **Node.js**      | **22 LTS**           | Required minimum: 20.9; we use 22 LTS                                  |
| **TypeScript**   | **5.7+**             | Strict mode end-to-end                                                 |
| **Tailwind CSS** | **v4**               | New engine, faster builds                                              |
| **shadcn/ui**    | **Latest**           | Component library on top of Tailwind                                   |

Verify latest patch versions on [nextjs.org](https://nextjs.org) and
[postgresql.org](https://www.postgresql.org) before pinning in
`package.json` and `Dockerfile`.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Decision: Why Payload CMS](#2-architecture-decision-why-payload-cms)
3. [Tech Stack](#3-tech-stack)
4. [Hosting & Infrastructure — 3 Cost-Optimized Tiers](#4-hosting--infrastructure--3-cost-optimized-tiers)
5. [Repository Structure](#5-repository-structure)
6. [Information Architecture](#6-information-architecture)
7. [Site Navigation](#7-site-navigation)
8. [Routes — Frontend (Next.js App Router)](#8-routes--frontend-nextjs-app-router)
9. [Routes — Backend (Payload Auto-Generated)](#9-routes--backend-payload-auto-generated)
10. [Payload Collections Schema](#10-payload-collections-schema)
11. [Saree-Specific Product Fields](#11-saree-specific-product-fields)
12. [Variants & Options](#12-variants--options)
13. [Categories & Taxonomy](#13-categories--taxonomy)
14. [Page Types & Sections](#14-page-types--sections)
15. [Payload Admin Panel Customization](#15-payload-admin-panel-customization)
16. [Frontend Architecture (Next.js)](#16-frontend-architecture-nextjs)
17. [Cart & Checkout Flow](#17-cart--checkout-flow)
18. [Customer Account & Auth](#18-customer-account--auth)
19. [Payment Integration — Razorpay + Stripe](#19-payment-integration--razorpay--stripe)
20. [Shipping & Fulfillment](#20-shipping--fulfillment)
21. [Returns & Exchange](#21-returns--exchange)
22. [Email & SMS](#22-email--sms)
23. [Search & Discovery](#23-search--discovery)
24. [SEO Requirements](#24-seo-requirements)
25. [Analytics & Tracking](#25-analytics--tracking)
26. [Trust Signals & Conversion](#26-trust-signals--conversion)
27. [Internationalization (Phase 2)](#27-internationalization-phase-2)
28. [Performance & Caching](#28-performance--caching)
29. [Security](#29-security)
30. [Content Workflow](#30-content-workflow)
31. [Implementation Phases](#31-implementation-phases)
32. [Cost Analysis: Payload (3 Tiers) vs Shopify](#32-cost-analysis-payload-3-tiers-vs-shopify)
33. [Launch Checklist](#33-launch-checklist)
34. [Post-MVP Roadmap](#34-post-mvp-roadmap)
35. [Open Questions for Client](#35-open-questions-for-client)

---

## 1. Project Overview

| Field             | Value                                                                 |
| ----------------- | --------------------------------------------------------------------- |
| Project           | New online saree e-commerce website                                   |
| Client            | [Client name] — first-time saree D2C founder                          |
| Agency            | Shagya                                                                |
| Business Model    | D2C (Direct-to-Consumer)                                              |
| Initial Geography | India (domestic focus for MVP)                                        |
| Phase 2 Geography | NRI markets — USA, UK, UAE, Singapore, Canada, Australia              |
| Platform          | **Payload CMS 3.x** + **Next.js 16 (App Router)** + **PostgreSQL 18** |
| Deployment        | Vercel (single repo, single deploy)                                   |
| Catalog at Launch | 30–80 SKUs across 4–6 categories                                      |
| Target Launch     | [TBD — pending client timeline]                                       |

### What we are building

A modern, fast, mobile-first **headless e-commerce** storefront powered by
Payload CMS. Customers browse sarees, view detailed product pages, add to
cart, and check out via **Razorpay** (cards, UPI, netbanking, wallets, COD).
A custom **Payload Admin Panel** lets the client's team manage products,
orders, customers, and content without writing code.

### What we are NOT building (in MVP)

- Multi-vendor marketplace
- Bridal appointment booking
- AR/VR try-on
- 360° product viewer
- Custom blouse stitching configurator (Phase 2)
- B2B / wholesale portal
- Native mobile app (responsive web only for MVP)

---

## 2. Architecture Decision: Why Payload CMS

### What is Payload?

**Payload** is a **code-first, self-hosted, TypeScript-native** headless
CMS and application framework. It is **now part of Figma** (acquired 2024)
and ships as a fullstack framework deeply integrated with **Next.js**.

A single Payload Config file gives you:

- **Auto-generated Admin Panel** (React UI, fully extensible)
- **Auto-generated REST, GraphQL, and Local Node.js APIs**
- **Database with migrations** (Postgres or MongoDB)
- **Authentication** (HttpOnly cookies, JWT, OAuth)
- **Access control** (per-document, per-field, per-operation)
- **File uploads** with image resizing, focal-point crop
- **Layout Builder** for flexible page composition
- **Live Preview** and **Drafts**
- **Localization** (field-level)
- **Official plugins**: Stripe, SEO, Search, Redirects, Form Builder, S3,
  Vercel Postgres, Vercel Blob, Nested Docs, Multi-tenant, Pointers,
  Cloud, Lexical (rich text)

### Why Payload for a saree e-commerce site

| Need                                                                  | Why Payload wins                                                                                |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| **Saree-specific data** (fabric, weave, work, occasion, blouse piece) | Code-first schema — define any field shape, no constraints from a platform's "product" template |
| **Indian payment methods** (UPI, COD, Net Banking)                    | Use Razorpay directly — Payload integrates with any payment gateway via custom endpoints        |
| **Full design control**                                               | Next.js App Router + custom UI — no theme lock-in like Shopify                                  |
| **Self-host or own the stack**                                        | Single repo, deploy anywhere (Vercel, Railway, Render, your own VPS)                            |
| **Custom admin**                                                      | Auto-generated React admin that matches your schema — and you can add custom views              |
| **Content + commerce in one CMS**                                     | Blog posts, About page, FAQs, banners, homepage sections — all manageable in one admin          |
| **Image-heavy product**                                               | Built-in image processing (sizes, focal point, WebP conversion, CDN-ready)                      |
| **Long-term flexibility**                                             | Not locked to a vendor's data model or pricing — own the database                               |

### Payload vs Shopify (Headless Comparison)

| Dimension             | Payload + Next.js                      | Shopify (Hydrogen)                       |
| --------------------- | -------------------------------------- | ---------------------------------------- |
| **Code ownership**    | Full — own the codebase                | Limited — theme/app boundaries           |
| **Database**          | Postgres or MongoDB (yours)            | Shopify-managed (locked)                 |
| **Admin panel**       | Auto-generated, fully customizable     | Shopify admin (good, but not yours)      |
| **Checkout**          | Custom-built (more work, full control) | Pre-built (faster, less flexible)        |
| **Indian payments**   | Razorpay, custom integration           | Native Indian gateways                   |
| **Subscription cost** | Vercel + DB + Razorpay fees            | Shopify plan + transaction fees          |
| **Time to launch**    | 8–12 weeks                             | 4–6 weeks                                |
| **Dev cost upfront**  | Higher (more code)                     | Lower (less code)                        |
| **Long-term TCO**     | Lower (no per-order fees)              | Higher (transaction fees on every order) |
| **SEO flexibility**   | Total control via Next.js Metadata     | Good (Hydrogen + metafields)             |
| **Migration risk**    | Low (open data formats)                | High (vendor lock-in)                    |

### When Payload is the right choice

- Client wants **full ownership** of the platform and data
- **Custom product schema** is needed (sarees are not a standard product)
- Long-term scale justifies upfront dev investment
- Team is comfortable with **TypeScript + React + Next.js**
- Indian-first commerce with **Razorpay** integration
- Content + commerce **in one admin**

### When Shopify is the right choice

- Faster time to market is critical (weeks vs months)
- Smaller dev team
- Want battle-tested checkout out of the box
- Don't need to customize product schema deeply

---

## 3. Tech Stack

### Core Stack

| Layer                        | Technology                                                                                 | Why                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| **CMS / Backend**            | **Payload CMS 3.x** (latest 3.x release)                                                   | Code-first, self-hosted, TypeScript-native                                 |
| **Frontend**                 | **Next.js 16** (App Router, Turbopack default, React Compiler)                             | Latest stable, native Payload pairing, RSC/ISR/Server Actions              |
| **Language**                 | **TypeScript 5.7+** (strict mode)                                                          | Type safety end-to-end                                                     |
| **Database**                 | **PostgreSQL 18** (latest stable, 18.4 as of May 2026)                                     | ACID, JSON/JSONB, vector search (pgvector), strong tooling                 |
| **DB Hosting**               | **Tiered** — Neon (free) / Neon (paid) / Self-hosted Postgres on Hetzner                   | Serverless Postgres with branching OR VPS-managed                          |
| **File Storage**             | **Tiered** — Vercel Blob (free, 1 GB) / Cloudflare R2 (free egress) / S3 (enterprise)      | CDN-backed, signed URLs, image transforms                                  |
| **Hosting**                  | **Tiered** — Vercel Hobby (free) / Vercel Pro ($20) / Self-hosted on Hetzner VPS ($5–10)   | First-class Next.js + Payload support, edge functions                      |
| **Auth (Admin)**             | **Payload's built-in**                                                                     | HttpOnly cookies, JWT, role-based — powers `/admin` panel                  |
| **Auth (Customer)**          | **Better Auth** + plugins (phone OTP, Google, Facebook, 2FA, passkey)                      | Modern, TypeScript-native, Next.js 16 ready (uses `proxy.ts`), 50+ plugins |
| **Payments (India)**         | **Razorpay**                                                                               | UPI, cards, netbanking, wallets, EMI, COD reconciliation                   |
| **Payments (International)** | **Stripe** (Phase 2)                                                                       | Cards, Apple Pay, Google Pay, multi-currency                               |
| **Email (transactional)**    | **Resend** (free up to 100/day, 3K/mo)                                                     | React Email templates, great DX                                            |
| **Email (marketing)**        | **Resend** / **Loops.so** (free tier)                                                      | Newsletter, automation flows                                               |
| **SMS (India)**              | **MSG91** (pay per SMS) or **Twilio**                                                      | OTP, order updates, alerts                                                 |
| **Forms (contact, etc.)**    | **Payload Form Builder plugin**                                                            | DB-backed, no third-party needed                                           |
| **Search**                   | **Postgres full-text search** (MVP) → **Algolia / Meilisearch** (Phase 2)                  | MVP uses built-in, scales later                                            |
| **Image optimization**       | **Next.js Image** + (Vercel CDN OR Cloudflare)                                             | Auto WebP, lazy load, responsive                                           |
| **Styling**                  | **Tailwind CSS v4** + **shadcn/ui**                                                        | Utility-first, accessible components                                       |
| **Forms (frontend)**         | **React Hook Form** + **Zod**                                                              | Type-safe form validation                                                  |
| **State management**         | **Zustand** (cart, UI state)                                                               | Lightweight, no boilerplate                                                |
| **Server state**             | **TanStack Query** (or Next.js fetch)                                                      | Cache, revalidate, mutations                                               |
| **Date handling**            | **date-fns**                                                                               | Tree-shakable                                                              |
| **Validation**               | **Zod**                                                                                    | Runtime validation, used in Payload hooks                                  |
| **Testing**                  | **Vitest** (unit) + **Playwright** (E2E)                                                   | Fast, modern                                                               |
| **Linting**                  | **ESLint** + **Prettier**                                                                  | Code quality                                                               |
| **Monitoring**               | **Tiered** — Vercel Logs (free) / Sentry (free 5K errors/mo) / PostHog (free 1M events/mo) | Error tracking, performance                                                |
| **Analytics**                | **PostHog** (free) + GA4 (free) + Meta Pixel (free)                                        | Privacy-friendly, funnels                                                  |
| **DNS + CDN**                | **Cloudflare** (free)                                                                      | DDoS protection, edge cache, DNS                                           |
| **Git / CI**                 | **GitHub** + Vercel CI (or self-hosted runner for VPS)                                     | Auto-deploy on push                                                        |

### Why Next.js (not SvelteKit / Astro / Remix)

- **Payload is a Next.js-native framework** — its maintainer (Vercel team)
  builds Payload to be tightly coupled with Next.js
- Largest ecosystem of UI libraries, integrations, and documentation
- App Router gives us **Server Components** (fast initial loads, good for
  SEO), **Server Actions** (form mutations without APIs), and **ISR**
  (cached pages that revalidate on Payload `afterChange` hooks)
- **Vercel deployment** is one-click with first-class support

### Next.js 16 — Key Features We'll Use

- **Turbopack (stable, default bundler)** — 53% faster dev startup, 94% faster
  code updates vs Webpack; ~400% faster `next dev` startup in 16.2
- **React Compiler (stable)** — automatic memoization, no more manual
  `useMemo` / `useCallback` in most cases
- **Cache Components** — new programming model using Partial Pre-Rendering
  (PPR) + `use cache` directive for instant navigation
- **React 19.2** — View Transitions, `useEffectEvent()`, `<Activity />` for
  prerendering, new `use()` hook patterns
- **Enhanced Routing & Navigation** — optimized prefetching, async params
  (breaking — `params` and `searchParams` are now Promises)
- **Improved Caching APIs** — `updateTag()`, `refresh()`, refined
  `revalidateTag()`, `'use cache'` directive
- **Build Adapters API (alpha)** — hook into the build process for custom
  deploys (useful for self-hosted Tier 1)
- **Native ESM + Node.js 22 LTS** support

> ⚠️ **Next.js 16 Breaking Changes to be aware of**:
>
> - `params` and `searchParams` in page/layout components are now Promises
>   — must `await` them
> - `<Image>` default `sizes` and `priority` behavior changed
> - `next lint` removed in favor of ESLint directly
> - `middleware` moved to Node.js runtime (Edge still available but slower)
> - Minimum Node.js: **20.9** (we'll use **22 LTS**)

### Database Choice: Postgres (not MongoDB)

- **ACID transactions** — important for inventory, orders, payments
- **Relational** — orders have line items, customers have addresses, products
  have variants → natural relational model
- **Postgres full-text search** — built-in, no extra service
- **JSONB columns** — flexible metadata for saree-specific data
- **pgvector extension** (Postgres 18) — built-in vector search, useful for
  AI-powered product recommendations in Phase 2
- **Neon free tier** — generous (0.5 GB storage, 190 compute hours/month)
- **Migrations** — proper schema versioning (Payload generates them)
- **PostgreSQL 18 highlights**:
  - Improved partitioning performance
  - Enhanced JSON/JSONB performance
  - Better logical replication
  - pgvector improvements
  - New `MERGE` / `RETURNING` enhancements

---

## 4. Hosting & Infrastructure — 3 Cost-Optimized Tiers

> For a new business, monthly cost matters as much as features. We provide
> **3 architecture tiers** so you can launch at near-zero cost, scale as
> revenue grows, and only pay for managed services when you need them.

### Tier 0 — Free / Minimal Cost ($0/month fixed)

**Best for: MVP launch, <50K visits/month, <500 orders/month, single admin user**

Use free tiers of every managed service. Zero fixed cost. Variable cost
(2% Razorpay per transaction) applies.

| Service                     | Free Tier Limit                                      | Cost           |
| --------------------------- | ---------------------------------------------------- | -------------- |
| **Vercel Hobby**            | 100 GB bandwidth, 100 GB-hr compute, 6K build min/mo | **$0**         |
| **Neon Postgres (Free)**    | 0.5 GB storage, 190 compute hrs/mo                   | **$0**         |
| **Vercel Blob (Free)**      | 1 GB storage, 100 GB bandwidth                       | **$0**         |
| **Resend (Free)**           | 100 emails/day, 3K/month                             | **$0**         |
| **Sentry (Developer Free)** | 5K errors/month                                      | **$0**         |
| **PostHog Cloud (Free)**    | 1M events/month, 1 project                           | **$0**         |
| **Cloudflare DNS + CDN**    | Unlimited                                            | **$0**         |
| **GitHub (private repo)**   | Unlimited                                            | **$0**         |
| **Razorpay**                | 2% per transaction (no monthly fee)                  | **2% per txn** |
| **Total fixed monthly**     |                                                      | **$0**         |

**Architecture diagram:**

```
Internet → Cloudflare (DNS + CDN + DDoS) → Vercel Hobby (Next.js + Payload)
                                                      ↓
                                              Neon Postgres (free)
                                              Vercel Blob (images)
                                              Resend (emails)
                                              Razorpay (payments)
```

**Pros:**

- Zero fixed cost — pay only when you make sales
- Fast to launch — no DevOps setup
- Auto-scaling via Vercel
- Great for validating the business idea

**Cons / Trade-offs:**

- Vercel Hobby has 10s serverless function timeout (rarely an issue)
- Neon DB sleeps after 5 min inactivity → ~1–2s cold start on first query
- No team features (single admin user)
- Vercel Hobby: no password protection on prod (mitigate with Cloudflare Access for `/admin`)
- 100 GB bandwidth — fine for early stage, may need upgrade at scale

**When to upgrade out of Tier 0:**

- Traffic > 50K visits/month
- Orders > 500/month and seeing slow queries
- Team > 1 admin user
- Need > 100 emails/day transactional

---

### Tier 1 — Self-Hosted on Hetzner VPS ($5–10/month fixed)

**Best for: <5K orders/month, predictable costs, more control, 1–3 team members**

Move off Vercel. Run everything on a single cheap European VPS. Same
performance for moderate traffic, fraction of the cost, full control.

| Service                           | Spec                                       | Cost                  |
| --------------------------------- | ------------------------------------------ | --------------------- |
| **Hetzner Cloud CX21**            | 4 GB RAM, 2 vCPU, 40 GB SSD, 20 TB traffic | **€5.39/mo (~$5.80)** |
| **Postgres**                      | Self-hosted on same VPS                    | $0                    |
| **Next.js + Payload**             | Self-hosted (Docker or systemd)            | $0                    |
| **Cloudflare (DNS + CDN + DDoS)** | Free                                       | $0                    |
| **Hetzner Snapshots (backups)**   | +20% of server cost                        | **~$1.16/mo**         |
| **Domain (.in)**                  | $10–15/year                                | **~$1/mo**            |
| **Resend (Free)**                 | 100 emails/day                             | $0                    |
| **Razorpay**                      | 2% per transaction                         | variable              |
| **Total fixed monthly**           |                                            | **~$8/month (~₹670)** |

**Architecture diagram:**

```
Internet → Cloudflare (DNS + CDN + DDoS + SSL)
                  ↓
              Hetzner CX21 VPS
              ├── Nginx (reverse proxy + SSL)
              ├── Next.js 16 + Payload (Node.js 22 LTS, PM2)
              ├── PostgreSQL 18
              └── Local file storage
                  ↓
              Resend (emails, off-server)
              Razorpay (payments, off-server)
```

**Pros:**

- Predictable flat cost regardless of order volume
- Full control — install any software, run any command
- No cold starts (always-on server)
- 4 GB RAM is comfortable for Next.js + Payload + Postgres
- 20 TB monthly traffic (more than enough)
- Great for SEO (dedicated IP, full server config)
- Easy to scale up (Hetzner snapshot → larger instance)

**Cons / Trade-offs:**

- Requires Linux sysadmin skills (basic: SSH, systemd, nginx)
- Need to manage security updates, backups, monitoring
- Single point of failure (no auto-scaling; add Hetzner load balancer if needed)
- 2 GB–4 GB RAM limit (need to migrate if traffic explodes)
- No built-in DDoS mitigation beyond Cloudflare

**When to upgrade out of Tier 1:**

- Single VPS CPU/RAM saturated
- Need 99.99% uptime SLA
- Want zero DevOps involvement
- Team > 5 admin users

**Hetzner Setup (quick reference):**

```bash
# On a fresh Hetzner CX21 (Ubuntu 24.04)
ssh root@your-vps-ip
apt update && apt upgrade -y
# Install Node.js 22 LTS, PostgreSQL 18, Nginx, Certbot
# Clone repo, set up systemd service for Next.js
# Configure nginx reverse proxy + Cloudflare DNS
# Daily backup to Hetzner Storage Box ($3.81/mo) or off-site
```

**Alternative VPS providers** (if Hetzner is unavailable):

- **DigitalOcean Basic Droplet**: $6/mo (1 GB) — tight, may need $12/mo (2 GB)
- **Vultr**: $5/mo (1 GB) — also tight
- **OVH VPS**: €3.50/mo (Starter) — cheap
- **Linode (Akamai)**: $5/mo (1 GB) — needs upgrade
- **Render**: $7/mo (Starter, managed) — easier than Hetzner

**Recommendation: Hetzner CX21** for best price/performance ratio in Europe.
For Asia (closer to Indian users): **Vultr Singapore** or **DigitalOcean Bangalore**.

---

### Tier 2 — Managed (Vercel Pro + Neon Launch) ($60/month fixed)

**Best for: 500+ orders/month, >50K visits/month, team >3, premium support**

When revenue justifies it, move to fully managed services for zero DevOps
and best-in-class performance.

| Service                 | Plan                                           | Cost                              |
| ----------------------- | ---------------------------------------------- | --------------------------------- |
| **Vercel Pro**          | $20/seat/mo, 1 TB bandwidth, 400 GB-hr compute | **$20/mo**                        |
| **Neon Launch**         | $19/mo, 10 GB storage, 750 compute hrs/mo      | **$19/mo**                        |
| **Vercel Blob (Pro)**   | $0.30/GB, includes more transforms             | **~$5–10/mo**                     |
| **Resend Pro**          | 50K emails/mo                                  | **$20/mo**                        |
| **Sentry Team**         | 50K errors/mo                                  | **$26/mo** (optional)             |
| **Cloudflare**          | Free                                           | $0                                |
| **Razorpay**            | 2% per transaction                             | variable                          |
| **Total fixed monthly** |                                                | **~$85–95/month (~₹7,100–7,900)** |

**Pros:**

- Zero DevOps — focus on business
- Premium support from Vercel, Neon
- 99.99% uptime SLA available
- Team collaboration features
- 10x more capacity than Tier 0/1
- Advanced features (Edge Config, A/B testing, image optimization)

**Cons / Trade-offs:**

- $85+/mo fixed cost regardless of order volume
- Vercel charges per seat ($20 each)
- Total cost grows with team size

---

### Tier Comparison Summary

|                            |      Tier 0 (Free)      |     Tier 1 (Hetzner)      |     Tier 2 (Managed)     |
| -------------------------- | :---------------------: | :-----------------------: | :----------------------: |
| **Fixed monthly cost**     |         **$0**          |          **$8**           |         **$85**          |
| **Variable cost**          |       2% per txn        |        2% per txn         |        2% per txn        |
| **DevOps required**        |          None           |        Basic Linux        |           None           |
| **Time to setup**          |         30 min          |         4–8 hours         |          30 min          |
| **Best for**               |     MVP, validation     | Growth (predictable cost) |  Scale, premium support  |
| **Order volume ceiling**   |         ~500/mo         |          ~5K/mo           |         ~50K+/mo         |
| **Team seats**             |            1            |       1–3 (manual)        |     Unlimited (paid)     |
| **Custom domain on admin** |         ✅ Free         |          ✅ Free          |         ✅ Free          |
| **Cold starts**            |    Yes (Neon sleep)     |            No             |            No            |
| **Uptime SLA**             |       Best effort       |     Best effort (DIY)     |     99.99% available     |
| **Backup**                 |       Neon daily        |  DIY (Hetzner snapshot)   |    Neon daily + PITR     |
| **DDoS protection**        |     Cloudflare free     |      Cloudflare free      | Cloudflare free + Vercel |
| **Scalability**            | Auto (within free tier) |   Vertical (resize VPS)   | Auto (Vercel serverless) |

### Tier Selection Guide

| Situation                                      | Recommended Tier          |
| ---------------------------------------------- | ------------------------- |
| Pre-launch / validating idea                   | **Tier 0**                |
| Launched, <500 orders/mo, single admin         | **Tier 0**                |
| Steady 500–2K orders/mo, want predictable cost | **Tier 1** (Hetzner)      |
| 2K+ orders/mo, team > 3, need 99.99% uptime    | **Tier 2** (Managed)      |
| Multiple brands / high traffic                 | **Tier 2** + custom infra |
| Onboarding a non-technical client              | **Tier 2** (least DevOps) |

**Migration paths:**

- **Tier 0 → Tier 1**: When free tier limits hurt. Migration is easy (Vercel
  deploys to a Node server instead).
- **Tier 0 → Tier 2**: One-click upgrades on Vercel + Neon dashboards.
- **Tier 1 → Tier 2**: When team grows and DevOps becomes a distraction.

### Database Options (any tier)

| Provider                         | Best For                         | Free Tier           | Paid Tier Start    |
| -------------------------------- | -------------------------------- | ------------------- | ------------------ |
| **Neon** (serverless)            | Tier 0, Tier 2                   | 0.5 GB / 190 hrs/mo | $19/mo Launch      |
| **Supabase** (Postgres + extras) | If you want auth/storage bundled | 0.5 GB              | $25/mo Pro         |
| **Vercel Postgres**              | If already on Vercel             | 256 MB (Hobby)      | $10/mo + usage     |
| **Self-hosted Postgres**         | Tier 1 (Hetzner)                 | Free (on your VPS)  | Free (DIY backups) |
| **Railway Postgres**             | Alternative managed              | 500 hrs/mo          | $5/mo + usage      |

**Recommendation: Neon for Tier 0 and Tier 2; self-hosted on Hetzner for Tier 1.**

### File Storage Options (any tier)

| Provider                | Best For                 | Free Tier             | Paid Tier Start |
| ----------------------- | ------------------------ | --------------------- | --------------- |
| **Vercel Blob**         | Tier 0 (Vercel-native)   | 1 GB                  | $0.30/GB Pro    |
| **Cloudflare R2**       | Tier 1 (no egress fees!) | 10 GB / 1M reads/mo   | $0.015/GB/mo    |
| **AWS S3**              | Tier 2 enterprise        | 5 GB / 15 GB transfer | $0.023/GB/mo    |
| **Hetzner Storage Box** | Tier 1 backups           | —                     | €3.81/mo (1 TB) |
| **Local disk**          | Tier 1 (Hetzner)         | Free (40 GB VPS disk) | Free            |

**Recommendation: Vercel Blob for Tier 0; Cloudflare R2 for Tier 1 (zero egress fees save a lot at scale); AWS S3 for Tier 2 enterprise.**

### Environment Strategy (works for all tiers)

| Env        | Branch                       | DB                                                            | URL                                                                                   |
| ---------- | ---------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Local      | `main` (or feature branches) | Local Postgres (Docker)                                       | `localhost:3000`                                                                      |
| Preview    | PR branches                  | Neon branch (or local)                                        | Auto-generated `.vercel.app` URL (Tier 0/2) or `staging-pr-X.yourdomain.com` (Tier 1) |
| Staging    | `staging` branch             | Neon branch (Tier 0/2) or Hetzner staging DB (Tier 1)         | `staging.shagyabrand.com`                                                             |
| Production | `main` branch                | Neon production branch (Tier 0/2) or Hetzner prod DB (Tier 1) | `shagyabrand.com`                                                                     |

### Domains (works for all tiers)

- Apex: `shagyabrand.com` (or `.in`)
- `www.` → apex redirect
- Payload Admin: `admin.shagyabrand.com` (or `/admin` on apex)
- Staging: `staging.shagyabrand.com` (password-protected)
- DNS: Cloudflare (free, includes proxy + DDoS protection)

### CI/CD (per tier)

**Tier 0 / Tier 2 (Vercel):**

- Git push to `main` → Vercel auto-deploys to production
- Pull request → Vercel creates preview deployment with Neon branch DB
- Payload migrations run as part of the Vercel build step
- Rollback via Vercel dashboard (one click)

**Tier 1 (Hetzner self-hosted):**

- Git push to `main` → GitHub Actions runs build + tests + deploy
- Deploy step: SSH to Hetzner, pull latest, `pnpm build`, `pm2 reload`
- Payload migrations run via `pnpm payload migrate` before reload
- Database backups: Hetzner snapshot daily → off-site (Storage Box)
- Rollback: Hetzner snapshot restore (5 min)

**Example GitHub Actions deploy (Tier 1):**

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - run: pnpm build
      - name: Deploy to Hetzner
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.HETZNER_HOST }}
          username: deploy
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /app
            git pull origin main
            pnpm install --frozen-lockfile
            pnpm payload migrate
            pnpm build
            pm2 reload shagya
```

### Recommended Starting Path for Shagya (New Business)

1. **Launch on Tier 0** ($0/month) — validate the business, build catalog
2. **Move to Tier 1** ($8/month) at ~500 orders/month — predictable cost
3. **Move to Tier 2** ($85/month) when team grows past 3 people or you want
   zero DevOps
4. **Custom infra** (multi-region, dedicated) at ₹50L+/month revenue

This way you **only pay for infrastructure as the business grows** — and
the lower tiers are not throwaway work. Payload + Next.js code is the same
across all tiers; only the deployment target changes.

---

## 5. Repository Structure

```
shagya-saree/
├── .env.example                      # Example env vars (committed)
├── .env                              # Real env vars (gitignored)
├── .gitignore
├── .nvmrc                            # Node version
├── package.json
├── pnpm-lock.yaml                    # Or package-lock.json
├── tsconfig.json
├── next.config.ts                    # Next.js config
├── payload.config.ts                 # PAYLOAD CONFIG — main entrypoint
├── docker-compose.yml                # Local Postgres
├── README.md
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (frontend)/               # Public storefront group
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Homepage
│   │   │   ├── products/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # PDP
│   │   │   ├── collections/
│   │   │   │   ├── page.tsx          # All collections
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx      # Collection page (PLP)
│   │   │   ├── search/
│   │   │   │   └── page.tsx
│   │   │   ├── cart/
│   │   │   │   └── page.tsx
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx
│   │   │   ├── account/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx          # Dashboard
│   │   │   │   ├── orders/
│   │   │   │   ├── addresses/
│   │   │   │   ├── wishlist/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── (content)/            # Static / CMS-managed pages
│   │   │   │   ├── [slug]/
│   │   │   │   │   └── page.tsx      # Dynamic CMS page
│   │   │   ├── about/
│   │   │   ├── contact/
│   │   │   ├── faq/
│   │   │   ├── size-guide/
│   │   │   ├── shipping-policy/
│   │   │   ├── return-policy/
│   │   │   └── care-instructions/
│   │   │
│   │   ├── (payload)/                # Payload admin & API
│   │   │   ├── admin/
│   │   │   │   ├── [[...segments]]/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── importMap.js
│   │   │   └── api/
│   │   │       └── [...slug]/
│   │   │           └── route.ts      # Auto-generated REST/GraphQL
│   │   │
│   │   ├── api/                      # Custom Next.js API routes
│   │   │   ├── razorpay/
│   │   │   │   ├── create-order/
│   │   │   │   └── verify/
│   │   │   ├── webhooks/
│   │   │   │   ├── razorpay/
│   │   │   │   └── shiprocket/
│   │   │   ├── newsletter/
│   │   │   │   └── subscribe/
│   │   │   ├── contact/
│   │   │   │   └── submit/
│   │   │   └── search/
│   │   │       └── route.ts
│   │   │
│   │   ├── globals.css
│   │   ├── not-found.tsx             # 404
│   │   └── error.tsx                 # Error boundary
│   │
│   ├── collections/                  # PAYLOAD COLLECTIONS
│   │   ├── Users.ts                  # Admin users
│   │   ├── Customers.ts              # Customer accounts (auth)
│   │   ├── Products.ts               # Sarees (saree-specific fields)
│   │   ├── Variants.ts               # Color/size variants (if separate)
│   │   ├── Categories.ts             # Collections taxonomy
│   │   ├── Orders.ts                 # Order records
│   │   ├── Carts.ts                  # Saved carts (logged-in users)
│   │   ├── Media.ts                  # Image uploads
│   │   ├── Pages.ts                  # CMS pages (with layout builder)
│   │   ├── Posts.ts                  # Blog posts
│   │   ├── Reviews.ts                # Product reviews (Phase 2)
│   │   ├── Coupons.ts                # Discount codes
│   │   ├── ShippingZones.ts          # Shipping rate config
│   │   ├── Redirects.ts              # URL redirects
│   │   └── FormSubmissions.ts        # Contact form entries
│   │
│   ├── globals/                      # PAYLOAD GLOBALS (singletons)
│   │   ├── Header.ts                 # Nav menu structure
│   │   ├── Footer.ts                 # Footer links
│   │   ├── Homepage.ts               # Homepage section config
│   │   ├── Settings.ts               # Site settings (logo, contact, social)
│   │   └── SEODefaults.ts            # Default SEO meta
│   │
│   ├── access/                       # Access control functions
│   │   ├── isAdmin.ts
│   │   ├── isAdminOrSelf.ts
│   │   └── isCustomerOrPublished.ts
│   │
│   ├── hooks/                        # Reusable Payload hooks
│   │   ├── slugify.ts
│   │   ├── revalidatePage.ts
│   │   ├── updateInventoryOnOrder.ts
│   │   └── sendOrderEmail.ts
│   │
│   ├── lib/                          # Shared utilities
│   │   ├── razorpay.ts               # Razorpay client
│   │   ├── shiprocket.ts             # Shiprocket client
│   │   ├── resend.ts                 # Resend email client
│   │   ├── sms.ts                    # MSG91 client
│   │   ├── redis.ts                  # Optional: cart session store
│   │   ├── utils.ts                  # cn(), formatters
│   │   ├── validators.ts             # Zod schemas
│   │   └── constants.ts
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # shadcn/ui primitives
│   │   ├── layout/                   # Header, Footer, Container
│   │   ├── product/                  # ProductCard, ProductGallery, etc.
│   │   ├── cart/                     # CartDrawer, CartItem
│   │   ├── checkout/                 # CheckoutForm, PaymentSelector
│   │   ├── account/                  # OrderHistory, AddressBook
│   │   ├── search/                   # SearchBar, SearchResults
│   │   ├── filters/                  # FilterSidebar, FilterChip
│   │   ├── marketing/                # Newsletter, TrustBar
│   │   └── admin/                    # Custom Payload admin components
│   │
│   ├── emails/                       # React Email templates
│   │   ├── OrderConfirmation.tsx
│   │   ├── OrderShipped.tsx
│   │   ├── OrderDelivered.tsx
│   │   ├── WelcomeEmail.tsx
│   │   ├── AbandonedCart.tsx
│   │   ├── PasswordReset.tsx
│   │   └── ContactFormAutoReply.tsx
│   │
│   ├── styles/
│   │   └── globals.css
│   │
│   └── types/                        # TypeScript types
│       ├── payload-types.ts          # Auto-generated by Payload
│       └── index.ts
│
├── tests/
│   ├── e2e/                          # Playwright
│   │   ├── checkout.spec.ts
│   │   ├── account.spec.ts
│   │   └── product-search.spec.ts
│   └── unit/                         # Vitest
│       ├── cart.test.ts
│       └── pricing.test.ts
│
└── scripts/
    ├── seed.ts                       # Seed initial data
    └── import-products.ts            # CSV → Products import
```

### Key points

- **One repo, one deploy** — `payload.config.ts` is the single source of
  truth for backend; Next.js routes consume it
- **App Router groups** — `(frontend)`, `(payload)`, `(content)` for clean
  separation
- **Collections + Globals** mirror Shopify's "Products + Pages" model but
  with full type safety and code ownership

---

## 6. Information Architecture

### Top-Level Sitemap (same business model as Shopify plan)

```
/ (Homepage)
│
├── Shop
│   ├── All Products
│   ├── By Fabric (Silk, Cotton, Georgette, Organza, Linen, Chiffon)
│   ├── By Occasion (Wedding, Festive, Party, Daily Wear)
│   ├── By Work (Embroidered, Printed, Woven, Plain)
│   ├── New Arrivals
│   ├── Best Sellers
│   └── Sale
│
├── Collections (Editorial)
│   ├── Bridal Edit
│   ├── Festive Edit
│   └── Summer Edit
│
├── Pages (CMS-managed, editable in admin)
│   ├── About Us
│   ├── Contact Us
│   ├── FAQ
│   ├── Size Guide
│   ├── Shipping Policy
│   ├── Return Policy
│   └── Care Instructions
│
├── Blog (Phase 2)
│
├── Account (Auth Required)
│   ├── Login / Register
│   ├── Dashboard
│   ├── My Orders
│   ├── Addresses
│   ├── Wishlist
│   └── Profile
│
├── Cart
├── Checkout
├── Order Confirmation
└── Search
```

### Information Architecture Advantages with Payload

- **Header nav, footer links, homepage sections** = Globals — edit
  in admin, no code change
- **Static pages (About, FAQ, etc.)** = Pages collection with Layout
  Builder — non-technical staff can edit content + add new sections
  visually
- **No code redeploy** for content changes — admin edits push to
  production via Vercel on-demand revalidation hook

---

## 7. Site Navigation

### Header (Utility Bar)

```
[Free Shipping on Orders Above ₹999 | COD Available]   [Track Order | Help]
```

### Header (Main Bar)

- **Left**: Logo
- **Center**: Shop ▾ | Collections ▾ | New Arrivals | Sale | About
- **Right**: Search 🔍 | Account 👤 | Wishlist ♥ | Cart 🛒 (count)

### Mega-Menu (Driven by `Header` Global)

```
Shop All
├── By Fabric → /collections?fabric=silk (filter chip)
├── By Occasion
├── New Arrivals → /collections/new-arrivals
├── Best Sellers
└── Sale → /collections/sale
```

### Footer

Multi-column with policies + social + payment icons + newsletter (driven by
`Footer` global).

---

## 8. Routes — Frontend (Next.js App Router)

All storefront routes are **React Server Components** (RSC) for fast initial
loads and excellent SEO.

| Route                      | File                                              | Type      | Description                                |
| -------------------------- | ------------------------------------------------- | --------- | ------------------------------------------ |
| `/`                        | `app/(frontend)/page.tsx`                         | RSC       | Homepage (sections from `Homepage` global) |
| `/products`                | `app/(frontend)/products/page.tsx`                | RSC       | All products grid                          |
| `/products/[slug]`         | `app/(frontend)/products/[slug]/page.tsx`         | RSC       | Product detail page                        |
| `/collections`             | `app/(frontend)/collections/page.tsx`             | RSC       | All collections index                      |
| `/collections/[slug]`      | `app/(frontend)/collections/[slug]/page.tsx`      | RSC       | Collection / PLP                           |
| `/search`                  | `app/(frontend)/search/page.tsx`                  | RSC       | Search results                             |
| `/cart`                    | `app/(frontend)/cart/page.tsx`                    | Client    | Cart (client-side)                         |
| `/checkout`                | `app/(frontend)/checkout/page.tsx`                | Client    | Multi-step checkout                        |
| `/checkout/success`        | `app/(frontend)/checkout/success/page.tsx`        | RSC       | Order confirmation                         |
| `/account`                 | `app/(frontend)/account/page.tsx`                 | RSC       | Dashboard (auth required)                  |
| `/account/orders`          | `app/(frontend)/account/orders/page.tsx`          | RSC       | Order history                              |
| `/account/orders/[id]`     | `app/(frontend)/account/orders/[id]/page.tsx`     | RSC       | Single order                               |
| `/account/addresses`       | `app/(frontend)/account/addresses/page.tsx`       | RSC       | Address book                               |
| `/account/wishlist`        | `app/(frontend)/account/wishlist/page.tsx`        | RSC       | Wishlist                                   |
| `/account/profile`         | `app/(frontend)/account/profile/page.tsx`         | RSC       | Profile settings                           |
| `/account/login`           | `app/(frontend)/account/login/page.tsx`           | Client    | Login form                                 |
| `/account/register`        | `app/(frontend)/account/register/page.tsx`        | Client    | Registration form                          |
| `/account/forgot-password` | `app/(frontend)/account/forgot-password/page.tsx` | Client    | Reset request                              |
| `/account/reset-password`  | `app/(frontend)/account/reset-password/page.tsx`  | Client    | Reset confirm                              |
| `/about`                   | `app/(frontend)/about/page.tsx`                   | RSC       | About Us                                   |
| `/contact`                 | `app/(frontend)/contact/page.tsx`                 | RSC       | Contact form                               |
| `/faq`                     | `app/(frontend)/faq/page.tsx`                     | RSC       | FAQ                                        |
| `/size-guide`              | `app/(frontend)/size-guide/page.tsx`              | RSC       | Size guide                                 |
| `/shipping-policy`         | `app/(frontend)/shipping-policy/page.tsx`         | RSC       | Shipping policy                            |
| `/return-policy`           | `app/(frontend)/return-policy/page.tsx`           | RSC       | Return policy                              |
| `/care-instructions`       | `app/(frontend)/care-instructions/page.tsx`       | RSC       | Care guide                                 |
| `/blog`                    | `app/(frontend)/blog/page.tsx`                    | RSC       | Blog index (Phase 2)                       |
| `/blog/[slug]`             | `app/(frontend)/blog/[slug]/page.tsx`             | RSC       | Single post (Phase 2)                      |
| `/404`                     | `app/not-found.tsx`                               | RSC       | Not found                                  |
| `/sitemap.xml`             | `app/sitemap.ts`                                  | Generated | Dynamic sitemap                            |
| `/robots.txt`              | `app/robots.ts`                                   | Generated | Robots file                                |
| `/manifest.webmanifest`    | `app/manifest.ts`                                 | Generated | PWA manifest                               |

### Custom API Routes (Next.js Route Handlers)

| Route                        | Method   | Purpose                                                 |
| ---------------------------- | -------- | ------------------------------------------------------- |
| `/api/razorpay/create-order` | POST     | Create Razorpay order before checkout                   |
| `/api/razorpay/verify`       | POST     | Verify payment signature after checkout                 |
| `/api/webhooks/razorpay`     | POST     | Receive Razorpay webhooks                               |
| `/api/webhooks/shiprocket`   | POST     | Receive shipping updates                                |
| `/api/newsletter/subscribe`  | POST     | Add email to newsletter list                            |
| `/api/contact/submit`        | POST     | Submit contact form (also saves to DB)                  |
| `/api/search`                | GET      | Full-text search via Postgres                           |
| `/api/revalidate`            | POST     | Vercel on-demand revalidation (called by Payload hooks) |
| `/api/auth/[...nextauth]`    | GET/POST | Customer auth handlers (if using NextAuth)              |

### Route-Level Caching Strategy

| Route                     | Caching                                             |
| ------------------------- | --------------------------------------------------- |
| Homepage                  | ISR — revalidate on `Homepage` global `afterChange` |
| Collection pages          | ISR — revalidate on `Products` change               |
| PDP                       | ISR + dynamic product schema                        |
| Cart / Checkout           | Dynamic (`force-dynamic`, no cache)                 |
| Account pages             | Dynamic (per-user)                                  |
| Static pages (About, FAQ) | ISR — revalidate on `Pages` change                  |
| Blog                      | ISR — revalidate on `Posts` change                  |

---

## 9. Routes — Backend (Payload Auto-Generated)

Payload **auto-generates** these from your collections. You can use REST,
GraphQL, or Local API (server-side, fastest).

### REST API

Base: `/api/<collection-slug>`

| Endpoint                         | Method             | Description                                                   |
| -------------------------------- | ------------------ | ------------------------------------------------------------- |
| `/api/products`                  | GET                | List products (with `?where=...`, `?limit=...`, `?depth=...`) |
| `/api/products/:id`              | GET                | Single product                                                |
| `/api/products`                  | POST               | Create product (admin only)                                   |
| `/api/products/:id`              | PATCH              | Update product (admin only)                                   |
| `/api/products/:id`              | DELETE             | Delete product (admin only)                                   |
| `/api/categories`                | GET                | List categories                                               |
| `/api/orders`                    | GET                | List orders (admin) / user's own orders (customer)            |
| `/api/orders/:id`                | GET                | Single order                                                  |
| `/api/orders`                    | POST               | Create order (server-side, on payment success)                |
| `/api/customers`                 | GET                | List customers (admin)                                        |
| `/api/customers/login`           | POST               | Customer login                                                |
| `/api/customers/logout`          | POST               | Customer logout                                               |
| `/api/customers/me`              | GET                | Current customer                                              |
| `/api/customers/register`        | POST               | Register new customer                                         |
| `/api/customers/forgot-password` | POST               | Request password reset                                        |
| `/api/carts`                     | GET / POST / PATCH | Cart management (per customer)                                |
| `/api/coupons`                   | GET                | List/validate coupons                                         |
| `/api/media`                     | GET / POST         | List / upload media                                           |
| `/api/pages`                     | GET                | List CMS pages                                                |
| `/api/posts`                     | GET                | List blog posts (Phase 2)                                     |
| `/api/form-submissions`          | POST               | Submit form (contact, etc.)                                   |

### GraphQL

Same data exposed via `/api/graphql` (POST) — useful for complex queries.

### Local API (Server-side, no HTTP)

```ts
import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const products = await payload.find({
  collection: 'products',
  where: { fabric: { equals: 'silk' } },
  limit: 12,
  depth: 2,
})
```

Used inside Next.js Server Components — **fastest** way to read data.

---

## 10. Payload Collections Schema

> **Payload terminology**: A **Collection** is a table in the database.
> A **Field** is a column. A **Document** is a row.
> All collections are defined in `src/collections/*.ts` and registered in
> `payload.config.ts`.

### 10.1 Users (Admin Team)

- Auth-enabled (Payload's built-in)
- Roles: `superAdmin`, `admin`, `editor`, `fulfillment`, `support`
- Used for staff login to `/admin`
- **Not** for customers

```ts
// src/collections/Users.ts
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  access: {
    create: isAdminFieldLevel,
    read: () => true,
    update: isAdminOrSelf,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      options: ['superAdmin', 'admin', 'editor', 'fulfillment', 'support'],
    },
  ],
}
```

### 10.2 Customers (Shoppers)

- Separate from `Users` — clean separation of staff vs customers
- Auth-enabled with HttpOnly cookies
- Auto-creates account on first order or explicit registration

```ts
export const Customers: CollectionConfig = {
  slug: 'customers',
  // ⚠️ No `auth: true` — auth is handled by Better Auth (see Section 18)
  // This collection is DATA ONLY, linked to Better Auth's `user` table.
  access: {
    // Created/updated via Better Auth hooks (not directly via API)
    create: () => false,
    read: isCustomerOrAdmin,
    update: isCustomerOrSelf,
    delete: isAdmin,
  },
  fields: [
    // Link to Better Auth's user table (foreign key)
    {
      name: 'betterAuthUserId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Better Auth user.id — set by Better Auth hook, do not edit',
      },
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
      admin: {
        description: 'Mirrored from Better Auth user.email for queries',
      },
    },
    { name: 'firstName', type: 'text', required: true },
    { name: 'lastName', type: 'text', required: true },
    {
      name: 'phone',
      type: 'text',
      required: true,
      index: true,
      admin: { description: 'Used for WhatsApp updates and SMS notifications' },
    },
    { name: 'avatar', type: 'upload', relationTo: 'media' },
    { name: 'marketingOptIn', type: 'checkbox', defaultValue: false },
    {
      name: 'preferredLanguage',
      type: 'select',
      options: ['en', 'hi'],
      defaultValue: 'en',
    },
    { name: 'dateOfBirth', type: 'date' },
    {
      name: 'gender',
      type: 'select',
      options: ['female', 'male', 'other', 'prefer_not_to_say'],
    },
    {
      name: 'anniversaryDate',
      type: 'date',
      admin: { description: 'For anniversary saree recommendations' },
    },
    {
      name: 'lifetimeValue',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Computed from orders, updated by hook',
      },
    },
    {
      name: 'totalOrders',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    { name: 'lastOrderAt', type: 'date', admin: { readOnly: true } },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text' }],
      admin: { description: 'e.g. "VIP", "Bridal Customer", "Influencer"' },
    },
    {
      name: 'addresses',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          admin: { description: 'e.g. "Home", "Office", "Mom\'s"' },
        },
        { name: 'line1', type: 'text', required: true },
        { name: 'line2', type: 'text' },
        { name: 'landmark', type: 'text' },
        { name: 'city', type: 'text', required: true },
        { name: 'state', type: 'text', required: true },
        { name: 'pincode', type: 'text', required: true },
        { name: 'country', type: 'text', defaultValue: 'India' },
        { name: 'phone', type: 'text' },
        { name: 'isDefault', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'wishlist',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        description: 'Admin-only notes (size preferences, past issues, etc.)',
      },
    },
  ],
  hooks: {
    // Mirror email changes from Better Auth (via custom endpoint)
    // Better Auth is the source of truth for email/phone/name
  },
}
```

### Customer Data Sync (Better Auth ↔ Payload)

Better Auth is the source of truth for **authentication state** (email,
password hash, sessions, OAuth accounts, 2FA, phone OTP). Payload's
`customers` collection is the source of truth for **profile data**
(addresses, wishlist, lifetime value, internal notes, marketing tags).

Sync is one-directional:

- **Better Auth → Payload**: When a customer signs up (email, Google,
  phone OTP), a `databaseHook` in Better Auth's config creates a
  matching Payload `Customer` document.
- **Payload → Better Auth**: Profile updates (name, marketing opt-in)
  sync back to Better Auth's `user` table via a Payload `afterChange`
  hook (optional, can also be one-way).

See [Section 18](#18-customer-account--auth--better-auth) for the full
Better Auth setup and sync implementation.

### 10.3 Products (Sarees) — see Section 11 for full schema

### 10.4 Categories

- Nested via `payload-plugin-nested-docs`
- Auto-generates breadcrumb paths

```ts
export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'name' },
  access: {
    read: () => true,
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: { beforeValidate: [formatSlug] },
    },
    { name: 'description', type: 'textarea' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'parent', type: 'relationship', relationTo: 'categories' },
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Fabric', value: 'fabric' },
        { label: 'Occasion', value: 'occasion' },
        { label: 'Work', value: 'work' },
        { label: 'Collection', value: 'collection' },
        { label: 'Editorial', value: 'editorial' },
      ],
    },
    { name: 'displayOrder', type: 'number', defaultValue: 0 },
  ],
}
```

### 10.5 Variants (Optional — keep as JSONB on Products for simplicity)

Two design choices:

- **Option A** (recommended for MVP): Variants as **JSON field** on Product
  - Pros: Simple, fewer joins, admin form is one document
  - Cons: Harder to query "all red variants across all products"
- **Option B**: Variants as **separate collection** with `hasMany` relationship
  - Pros: Normalized, queryable across products
  - Cons: More admin complexity

**Recommendation**: Use **Option A** (JSON field) for MVP. Sarees usually
have ≤3 colors. Migrate to Option B if catalog grows.

### 10.6 Orders

- Created **server-side** via `payload.create()` after Razorpay payment
  verification (never trust client)
- Status: `pending` → `paid` → `processing` → `shipped` → `delivered` → `returned` | `cancelled`

```ts
export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customer', 'total', 'status', 'createdAt'],
  },
  access: {
    create: () => false, // server-only
    read: isCustomerOrAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'orderNumber', type: 'text', required: true, unique: true }, // e.g. SHG-2024-00123
    { name: 'customer', type: 'relationship', relationTo: 'customers' },
    { name: 'email', type: 'email', required: true },
    { name: 'phone', type: 'text', required: true },
    {
      name: 'items',
      type: 'array',
      required: true,
      fields: [
        { name: 'product', type: 'relationship', relationTo: 'products' },
        { name: 'productSnapshot', type: 'json' }, // frozen at order time
        { name: 'variant', type: 'json' }, // { color, size }
        { name: 'quantity', type: 'number', required: true, min: 1 },
        { name: 'unitPrice', type: 'number', required: true },
        { name: 'lineTotal', type: 'number', required: true },
      ],
    },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: [
        { name: 'name', type: 'text' },
        { name: 'phone', type: 'text' },
        { name: 'line1', type: 'text' },
        { name: 'line2', type: 'text' },
        { name: 'city', type: 'text' },
        { name: 'state', type: 'text' },
        { name: 'pincode', type: 'text' },
        { name: 'country', type: 'text' },
      ],
    },
    { name: 'subtotal', type: 'number' },
    { name: 'shippingCost', type: 'number' },
    { name: 'discount', type: 'number', defaultValue: 0 },
    { name: 'tax', type: 'number', defaultValue: 0 },
    { name: 'total', type: 'number', required: true },
    {
      name: 'payment',
      type: 'group',
      fields: [
        { name: 'method', type: 'select', options: ['razorpay', 'cod'] },
        {
          name: 'status',
          type: 'select',
          options: ['pending', 'captured', 'failed', 'refunded'],
        },
        { name: 'razorpayOrderId', type: 'text' },
        { name: 'razorpayPaymentId', type: 'text' },
        { name: 'razorpaySignature', type: 'text' },
      ],
    },
    {
      name: 'fulfillment',
      type: 'group',
      fields: [
        {
          name: 'status',
          type: 'select',
          options: [
            'pending',
            'processing',
            'shipped',
            'delivered',
            'returned',
            'cancelled',
          ],
        },
        { name: 'shiprocketOrderId', type: 'text' },
        { name: 'awbCode', type: 'text' }, // tracking number
        { name: 'courierName', type: 'text' },
        { name: 'shippedAt', type: 'date' },
        { name: 'deliveredAt', type: 'date' },
        { name: 'trackingUrl', type: 'text' },
      ],
    },
    { name: 'coupon', type: 'relationship', relationTo: 'coupons' },
    { name: 'notes', type: 'textarea' },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req }) => {
        if (operation === 'create' && !data.orderNumber) {
          data.orderNumber = `SHG-${new Date().getFullYear()}-${String(Date.now()).slice(-5)}`
        }
        return data
      },
    ],
    afterChange: [
      sendOrderConfirmationEmail,
      updateInventory,
      notifyAdminOnNewOrder,
    ],
  },
}
```

### 10.7 Carts

- Saved for **logged-in customers** only (guest carts use localStorage +
  cookies)
- Tied to `customer` via relationship
- Items can be re-priced at checkout (handle price changes gracefully)

```ts
export const Carts: CollectionConfig = {
  slug: 'carts',
  access: {
    read: isCartOwner,
    create: () => true,
    update: isCartOwner,
    delete: isCartOwner,
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        { name: 'variant', type: 'json' },
        { name: 'quantity', type: 'number', required: true, min: 1, max: 10 },
        { name: 'unitPrice', type: 'number', required: true },
      ],
    },
    { name: 'coupon', type: 'relationship', relationTo: 'coupons' },
    { name: 'subtotal', type: 'number' },
    { name: 'lastActivity', type: 'date' },
  ],
}
```

### 10.8 Media (Image Uploads)

- Used for product images, banners, blog post images
- Auto-resize on upload (Vercel Image Optimization handles delivery)

```ts
export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 500, position: 'centre' },
      { name: 'card', width: 600, height: 750 },
      { name: 'product', width: 1200, height: 1500 },
      { name: 'hero', width: 1920, height: 800 },
    ],
    mimeTypes: ['image/*'],
  },
  access: {
    read: () => true,
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  fields: [
    { name: 'alt', type: 'text', required: true }, // accessibility + SEO
    { name: 'caption', type: 'text' },
  ],
}
```

### 10.9 Pages (CMS-managed static content)

- Uses **Layout Builder** for flexible content
- Slug-based routing via `app/(content)/[slug]/page.tsx`
- Used for: About, Contact, FAQ, Size Guide, Shipping, Returns, etc.

```ts
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: { useAsTitle: 'title' },
  versions: { drafts: true }, // Draft + Publish workflow
  access: { read: () => true, ...isAdminOrEditor },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      hooks: { beforeValidate: [formatSlug] },
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        /* SEO fields via plugin */
      ],
    },
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        HeroBlock,
        ContentBlock,
        MediaBlock,
        CTABlock,
        FAQBlock,
        TestimonialBlock,
        // + custom blocks per needs
      ],
    },
  ],
}
```

### 10.10 Posts (Blog — Phase 2)

- Standard blog pattern with Layout Builder
- Categories, tags, author relationship
- Drafts + scheduling

### 10.11 Coupons (Discount Codes)

- Used at checkout
- Types: percentage, fixed, free shipping, BOGO
- Limits: total uses, per-customer uses, expiration date, min order

```ts
export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: { useAsTitle: 'code' },
  access: { read: () => true /* validate at checkout */, ...isAdmin },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      uppercase: true,
    },
    { name: 'description', type: 'text' },
    {
      name: 'type',
      type: 'select',
      options: ['percentage', 'fixed', 'freeShipping'],
    },
    { name: 'value', type: 'number' },
    { name: 'minOrderAmount', type: 'number' },
    { name: 'maxUses', type: 'number' },
    {
      name: 'currentUses',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
    { name: 'maxUsesPerCustomer', type: 'number' },
    { name: 'startsAt', type: 'date' },
    { name: 'expiresAt', type: 'date' },
    { name: 'isActive', type: 'checkbox', defaultValue: true },
  ],
}
```

### 10.12 Shipping Zones

- Domestic India zones with rates and free-shipping thresholds
- Editable in admin (no code change)

```ts
export const ShippingZones: CollectionConfig = {
  slug: 'shipping-zones',
  admin: { useAsTitle: 'name' },
  access: { ...isAdmin },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'states',
      type: 'array',
      fields: [{ name: 'state', type: 'text' }],
    },
    { name: 'rate', type: 'number' },
    { name: 'freeShippingThreshold', type: 'number' },
    {
      name: 'estimatedDays',
      type: 'group',
      fields: [
        { name: 'min', type: 'number' },
        { name: 'max', type: 'number' },
      ],
    },
  ],
}
```

### 10.13 Form Submissions (Contact Form)

- Uses Payload's **Form Builder plugin**
- Admin can view submissions, export CSV
- Email notification on submit

### 10.14 Redirects

- Uses Payload's **Redirects plugin**
- UI in admin to add/remove redirects
- 301 (permanent) or 302 (temporary)

### 10.15 Other Plugins Installed

| Plugin                            | Purpose                                                       |
| --------------------------------- | ------------------------------------------------------------- |
| `@payloadcms/plugin-stripe`       | Stripe sync (for Phase 2 international)                       |
| `@payloadcms/plugin-seo`          | Per-page SEO meta fields                                      |
| `@payloadcms/plugin-search`       | Full-text search                                              |
| `@payloadcms/plugin-redirects`    | URL redirect management                                       |
| `@payloadcms/plugin-nested-docs`  | Nested categories                                             |
| `@payloadcms/plugin-form-builder` | Forms + submissions                                           |
| `@payloadcms/db-vercel-postgres`  | Vercel Postgres adapter (or `@payloadcms/db-postgres` + Neon) |
| `@payloadcms/storage-vercel-blob` | Vercel Blob for media (or `@payloadcms/storage-s3` for R2/S3) |
| `@payloadcms/next`                | Next.js integration utilities                                 |

### Globals (Singletons)

#### Header (`src/globals/Header.ts`)

```ts
fields: [
  {
    name: 'navItems',
    type: 'array',
    fields: [
      { name: 'label', type: 'text' },
      {
        name: 'type',
        type: 'select',
        options: ['link', 'megaMenu', 'dropdown'],
      },
      { name: 'url', type: 'text' },
      {
        name: 'children',
        type: 'array',
        fields: [
          { name: 'label', type: 'text' },
          { name: 'url', type: 'text' },
          { name: 'image', type: 'upload', relationTo: 'media' },
        ],
      },
    ],
  },
  {
    name: 'announcementBar',
    type: 'group',
    fields: [
      { name: 'enabled', type: 'checkbox' },
      { name: 'text', type: 'text' },
      { name: 'link', type: 'text' },
    ],
  },
]
```

#### Footer

Similar to Header with column-based nav.

#### Homepage

```ts
fields: [
  {
    name: 'hero',
    type: 'group',
    fields: [
      { name: 'headline', type: 'text' },
      { name: 'subheadline', type: 'textarea' },
      { name: 'image', type: 'upload', relationTo: 'media' },
      {
        name: 'cta',
        type: 'group',
        fields: [
          { name: 'label', type: 'text' },
          { name: 'url', type: 'text' },
        ],
      },
    ],
  },
  {
    name: 'categoryGrid',
    type: 'array',
    fields: [
      { name: 'label', type: 'text' },
      { name: 'image', type: 'upload', relationTo: 'media' },
      { name: 'url', type: 'text' },
    ],
  },
  {
    name: 'featuredCollection',
    type: 'relationship',
    relationTo: 'categories',
  },
  {
    name: 'newArrivalsCollection',
    type: 'relationship',
    relationTo: 'categories',
  },
  {
    name: 'bestSellersCollection',
    type: 'relationship',
    relationTo: 'categories',
  },
  {
    name: 'brandStory',
    type: 'group',
    fields: [
      { name: 'image', type: 'upload', relationTo: 'media' },
      { name: 'headline', type: 'text' },
      { name: 'body', type: 'textarea' },
      { name: 'cta', type: 'group' },
    ],
  },
  {
    name: 'trustStrip',
    type: 'array',
    fields: [
      { name: 'icon', type: 'text' },
      { name: 'title', type: 'text' },
      { name: 'subtitle', type: 'text' },
    ],
  },
]
```

#### Settings

```ts
fields: [
  { name: 'siteName', type: 'text' },
  { name: 'logo', type: 'upload', relationTo: 'media' },
  { name: 'favicon', type: 'upload', relationTo: 'media' },
  { name: 'contactEmail', type: 'email' },
  { name: 'contactPhone', type: 'text' },
  { name: 'whatsappNumber', type: 'text' },
  { name: 'address', type: 'textarea' },
  {
    name: 'socialLinks',
    type: 'group',
    fields: [
      { name: 'instagram', type: 'text' },
      { name: 'facebook', type: 'text' },
      { name: 'youtube', type: 'text' },
      { name: 'pinterest', type: 'text' },
    ],
  },
  { name: 'currency', type: 'text', defaultValue: 'INR' },
  { name: 'defaultShippingRate', type: 'number', defaultValue: 99 },
  { name: 'freeShippingThreshold', type: 'number', defaultValue: 999 },
  { name: 'taxRate', type: 'number', defaultValue: 0 }, // GST-inclusive display
  { name: 'codEnabled', type: 'checkbox', defaultValue: true },
  {
    name: 'analytics',
    type: 'group',
    fields: [
      { name: 'ga4Id', type: 'text' },
      { name: 'metaPixelId', type: 'text' },
    ],
  },
]
```

---

## 11. Saree-Specific Product Fields

> This is the section that gives Payload a **decisive advantage** over
> Shopify for a saree business. The product schema is **fully custom**,
> not constrained by Shopify's "Product / Variant / Option" template.

```ts
// src/collections/Products.ts
import { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'price', 'fabric', 'stockStatus', 'updatedAt'],
  },
  access: {
    read: () => true, // public can read published
    create: isAdminOrEditor,
    update: isAdminOrEditor,
    delete: isAdmin,
  },
  versions: { drafts: true },
  hooks: {
    beforeChange: [formatSlug, computeStockStatus, revalidateOnPublish],
  },
  fields: [
    // ============ IDENTITY ============
    { name: 'title', type: 'text', required: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      hooks: { beforeValidate: [formatSlug] },
    },
    { name: 'sku', type: 'text', required: true, unique: true, index: true },
    { name: 'vendor', type: 'text', defaultValue: 'Shagya' },
    {
      name: 'status',
      type: 'select',
      options: ['draft', 'published', 'archived'],
      defaultValue: 'draft',
    },
    { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },

    // ============ PRICING ============
    { name: 'price', type: 'number', required: true, min: 0 },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0, // MRP for discount display
      admin: { description: 'MRP. Leave empty if no discount.' },
    },
    { name: 'taxIncluded', type: 'checkbox', defaultValue: true },

    // ============ INVENTORY ============
    { name: 'trackInventory', type: 'checkbox', defaultValue: true },
    { name: 'stockQuantity', type: 'number', defaultValue: 0, min: 0 },
    { name: 'lowStockThreshold', type: 'number', defaultValue: 3 },
    { name: 'allowBackorder', type: 'checkbox', defaultValue: false },
    {
      name: 'stockStatus',
      type: 'select',
      options: [
        'in_stock',
        'low_stock',
        'out_of_stock',
        'backorder',
        'discontinued',
      ],
      admin: { readOnly: true }, // computed by hook
    },

    // ============ MEDIA ============
    {
      name: 'images',
      type: 'array',
      required: true,
      min: 1,
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'alt', type: 'text', required: true },
        { name: 'isPrimary', type: 'checkbox', defaultValue: false },
        {
          name: 'variant',
          type: 'text', // ties image to a variant (color)
          admin: {
            description: 'Color name this image belongs to (e.g. "Red")',
          },
        },
        { name: 'order', type: 'number', defaultValue: 0 },
      ],
    },
    {
      name: 'video',
      type: 'group',
      fields: [
        { name: 'url', type: 'text' },
        { name: 'type', type: 'select', options: ['youtube', 'vimeo', 'mp4'] },
      ],
    },

    // ============ SARI-SPECIFIC CORE ============
    {
      name: 'fabric',
      type: 'group',
      fields: [
        {
          name: 'primary',
          type: 'select',
          required: true,
          options: [
            { label: 'Pure Silk', value: 'pure_silk' },
            { label: 'Kanchipuram Silk', value: 'kanchipuram_silk' },
            { label: 'Banarasi Silk', value: 'banarasi_silk' },
            { label: 'Mysore Silk', value: 'mysore_silk' },
            { label: 'Tussar Silk', value: 'tussar_silk' },
            { label: 'Cotton Silk', value: 'cotton_silk' },
            { label: 'Pure Cotton', value: 'pure_cotton' },
            { label: 'Handloom Cotton', value: 'handloom_cotton' },
            { label: 'Chanderi Cotton', value: 'chanderi_cotton' },
            { label: 'Georgette', value: 'georgette' },
            { label: 'Chiffon', value: 'chiffon' },
            { label: 'Organza', value: 'organza' },
            { label: 'Linen', value: 'linen' },
            { label: 'Net', value: 'net' },
            { label: 'Velvet', value: 'velvet' },
            { label: 'Tissue', value: 'tissue' },
            { label: 'Jamawar', value: 'jamawar' },
          ],
        },
        { name: 'description', type: 'textarea' },
        { name: 'weight_grams', type: 'number' },
        {
          name: 'transparency',
          type: 'select',
          options: ['opaque', 'semi_sheer', 'sheer'],
        },
      ],
    },

    {
      name: 'weaveType',
      type: 'select',
      required: true,
      options: [
        { label: 'Handloom', value: 'handloom' },
        { label: 'Powerloom', value: 'powerloom' },
        { label: 'Jamawar', value: 'jamawar' },
        { label: 'Ikat', value: 'ikat' },
        { label: 'Block Print', value: 'block_print' },
        { label: 'Screen Print', value: 'screen_print' },
        { label: 'Digital Print', value: 'digital_print' },
        { label: 'Brocade', value: 'brocade' },
        { label: 'Tant', value: 'tant' },
      ],
    },

    {
      name: 'work',
      type: 'group',
      fields: [
        {
          name: 'types',
          type: 'select',
          hasMany: true,
          required: true,
          options: [
            { label: 'Embroidered', value: 'embroidered' },
            { label: 'Printed', value: 'printed' },
            { label: 'Woven', value: 'woven' },
            { label: 'Zari Work', value: 'zari' },
            { label: 'Stone Work', value: 'stone' },
            { label: 'Mirror Work', value: 'mirror' },
            { label: 'Sequins', value: 'sequins' },
            { label: 'Patch Work', value: 'patch' },
            { label: 'Hand-painted', value: 'hand_painted' },
            { label: 'Resham', value: 'resham' },
            { label: 'Gota Patti', value: 'gota_patti' },
            { label: 'Kundan', value: 'kundan' },
            { label: 'Beadwork', value: 'beadwork' },
            { label: 'Thread Work', value: 'thread' },
            { label: 'Plain', value: 'plain' },
          ],
        },
        {
          name: 'intensity',
          type: 'select',
          options: [
            'fully_embroidered',
            'semi_embroidered',
            'border_only',
            'pallu_only',
            'plain',
          ],
        },
        { name: 'description', type: 'textarea' },
      ],
    },

    {
      name: 'dimensions',
      type: 'group',
      fields: [
        {
          name: 'length_meters',
          type: 'number',
          required: true,
          defaultValue: 5.5,
        },
        { name: 'width_inches', type: 'number' },
      ],
    },

    {
      name: 'blousePiece',
      type: 'group',
      fields: [
        {
          name: 'included',
          type: 'checkbox',
          required: true,
          defaultValue: true,
        },
        { name: 'length_meters', type: 'number', defaultValue: 0.8 },
        {
          name: 'type',
          type: 'select',
          options: ['unstitched', 'pre_stitched', 'custom_available'],
        },
        {
          name: 'fabric',
          type: 'text',
          admin: { description: 'e.g. "Matching Silk", "Running Blouse"' },
        },
        { name: 'stitchingAvailable', type: 'checkbox', defaultValue: false },
        { name: 'stitchingPrice', type: 'number' },
      ],
    },

    {
      name: 'petticoat',
      type: 'group',
      fields: [{ name: 'included', type: 'checkbox', defaultValue: false }],
    },

    {
      name: 'border',
      type: 'group',
      fields: [
        {
          name: 'type',
          type: 'text',
          admin: { description: 'e.g. "Temple Border", "Contrast Border"' },
        },
        { name: 'description', type: 'textarea' },
      ],
    },

    {
      name: 'pallu',
      type: 'group',
      fields: [
        {
          name: 'design',
          type: 'text',
          admin: { description: 'e.g. "Contrast Zari Pallu"' },
        },
        { name: 'description', type: 'textarea' },
      ],
    },

    // ============ COLOR & VARIANTS ============
    {
      name: 'primaryColor',
      type: 'text',
      required: true, // for swatch
      admin: { description: 'Primary color name for listing/sort' },
    },
    {
      name: 'colorVariants',
      type: 'array',
      fields: [
        { name: 'colorName', type: 'text', required: true },
        {
          name: 'colorHex',
          type: 'text',
          admin: { description: 'Hex code for swatch (e.g. #c41e3a)' },
        },
        { name: 'sku', type: 'text', required: true },
        { name: 'price', type: 'number' }, // optional override
        { name: 'compareAtPrice', type: 'number' },
        { name: 'stockQuantity', type: 'number', defaultValue: 0 },
        {
          name: 'imageIndexes',
          type: 'array',
          fields: [
            { name: 'index', type: 'number' }, // ref to images array index
          ],
        },
        { name: 'isDefault', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'size',
      type: 'group',
      fields: [
        { name: 'label', type: 'text', defaultValue: 'Free Size' },
        {
          name: 'customLengthAvailable',
          type: 'checkbox',
          defaultValue: false,
        },
        { name: 'customLengthPrice', type: 'number' },
      ],
    },

    // ============ CATEGORIZATION ============
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      required: true,
      admin: {
        description: 'E.g. Silk Sarees, Wedding Sarees, Embroidered Sarees',
      },
    },
    {
      name: 'occasion',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        { label: 'Wedding', value: 'wedding' },
        { label: 'Festive', value: 'festive' },
        { label: 'Party', value: 'party' },
        { label: 'Daily Wear', value: 'daily' },
        { label: 'Office', value: 'office' },
        { label: 'Engagement', value: 'engagement' },
        { label: 'Sangeet', value: 'sangeet' },
        { label: 'Reception', value: 'reception' },
        { label: 'Religious', value: 'religious' },
      ],
    },
    {
      name: 'season',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Summer', value: 'summer' },
        { label: 'Winter', value: 'winter' },
        { label: 'Monsoon', value: 'monsoon' },
        { label: 'All Season', value: 'all_season' },
      ],
    },
    {
      name: 'regionOfOrigin',
      type: 'select',
      options: [
        { label: 'Kanchipuram', value: 'kanchipuram' },
        { label: 'Banaras/Varanasi', value: 'banaras' },
        { label: 'Mysore', value: 'mysore' },
        { label: 'Chanderi', value: 'chanderi' },
        { label: 'Pochampally', value: 'pochampally' },
        { label: 'Maheshwari', value: 'maheshwari' },
        { label: 'Lucknow', value: 'lucknow' },
        { label: 'Jaipur', value: 'jaipur' },
        { label: 'Pune', value: 'pune' },
        { label: 'Surat', value: 'surat' },
      ],
    },

    // ============ CARE ============
    {
      name: 'careInstructions',
      type: 'group',
      fields: [
        {
          name: 'instructions',
          type: 'textarea',
          required: true,
          admin: {
            description: 'e.g. "Dry clean only. Store in muslin cloth."',
          },
        },
        { name: 'washable', type: 'checkbox', defaultValue: false },
        { name: 'dryCleanRecommended', type: 'checkbox', defaultValue: true },
      ],
    },

    // ============ CERTIFICATIONS & TRUST ============
    {
      name: 'certifications',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'Silk Mark', value: 'silk_mark' },
        { label: 'Handloom Mark', value: 'handloom_mark' },
        { label: 'GI Tag', value: 'gi_tag' },
        { label: 'Fair Trade', value: 'fair_trade' },
      ],
    },
    {
      name: 'craftStory',
      type: 'richText', // Lexical editor
      admin: { description: 'Story about the weaver/artisan/craft' },
    },

    // ============ MARKETING ============
    {
      name: 'marketing',
      type: 'group',
      fields: [
        { name: 'isNewArrival', type: 'checkbox', defaultValue: false },
        { name: 'isBestSeller', type: 'checkbox', defaultValue: false },
        { name: 'isLimitedEdition', type: 'checkbox', defaultValue: false },
        { name: 'launchDate', type: 'date' },
        { name: 'comboEligible', type: 'checkbox', defaultValue: false },
        {
          name: 'badgeText',
          type: 'text',
          admin: { description: 'e.g. "Handpicked", "Staff Pick"' },
        },
      ],
    },

    // ============ SEO (via SEO plugin) ============
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text' },
        { name: 'description', type: 'textarea' },
        { name: 'keywords', type: 'text' },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },

    // ============ DESCRIPTION ============
    {
      name: 'shortDescription',
      type: 'textarea',
      admin: { description: 'One-liner for cards and previews' },
    },
    {
      name: 'description',
      type: 'richText', // Lexical
    },

    // ============ ANALYTICS ============
    {
      name: 'analytics',
      type: 'group',
      admin: { readOnly: true, position: 'sidebar' },
      fields: [
        { name: 'viewCount', type: 'number', defaultValue: 0 },
        { name: 'purchaseCount', type: 'number', defaultValue: 0 },
        { name: 'lastViewedAt', type: 'date' },
      ],
    },
  ],
}
```

### Example Product Document (simplified JSON)

```json
{
  "id": "abc123",
  "title": "Grey Digital Print Pure Mysore Silk Saree",
  "slug": "grey-digital-print-pure-mysore-silk-saree",
  "sku": "DMS106",
  "price": 1599,
  "compareAtPrice": 3999,
  "taxIncluded": true,
  "stockQuantity": 20,
  "stockStatus": "in_stock",
  "fabric": {
    "primary": "mysore_silk",
    "description": "100% pure Mysore silk, hand-finished",
    "weight_grams": 500,
    "transparency": "opaque"
  },
  "weaveType": "digital_print",
  "work": {
    "types": ["printed"],
    "intensity": "all_over"
  },
  "dimensions": { "length_meters": 5.5, "width_inches": 44 },
  "blousePiece": {
    "included": true,
    "length_meters": 0.8,
    "type": "unstitched",
    "fabric": "Matching Silk"
  },
  "colorVariants": [
    {
      "colorName": "Grey",
      "colorHex": "#808080",
      "sku": "DMS106-GRY",
      "stockQuantity": 12,
      "isDefault": true
    },
    {
      "colorName": "Blue",
      "colorHex": "#1e3a8a",
      "sku": "DMS106-BLU",
      "stockQuantity": 8
    }
  ],
  "categories": ["cat_silk_sarees", "cat_wedding_sarees", "cat_festive_sarees"],
  "occasion": ["wedding", "festive", "party"],
  "season": ["all_season"],
  "regionOfOrigin": "mysore",
  "careInstructions": {
    "instructions": "Dry clean only. Store in muslin cloth away from sunlight.",
    "dryCleanRecommended": true
  },
  "certifications": ["silk_mark"]
}
```

### Validation Hook Examples

```ts
// Compute stock status before save
const computeStockStatus: CollectionBeforeChangeHook = ({ data }) => {
  if (data.stockQuantity === 0) data.stockStatus = 'out_of_stock'
  else if (data.stockQuantity <= (data.lowStockThreshold || 3))
    data.stockStatus = 'low_stock'
  else data.stockStatus = 'in_stock'
  return data
}

// Generate slug from title
const formatSlug: CollectionBeforeChangeHook = ({ data, operation }) => {
  if (operation === 'create' || data.slug === undefined) {
    data.slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }
  return data
}
```

---

## 12. Variants & Options

### Recommended approach for sarees: nested colorVariants array

Each saree has 1–3 color variants. Stored as an array on the Product (see
Section 10.5 reasoning). The active variant is tracked in the cart as JSON.

### Cart variant representation

```ts
type CartItem = {
  product: Product
  variant: { colorName: string; colorHex: string; sku: string }
  quantity: number
  unitPrice: number // snapshot at add-to-cart time
}
```

### PDP variant selector UX

- Color swatches displayed (using `colorHex`)
- Click swatch → updates main image gallery (filter `imageIndexes`)
- Updates price if variant has price override
- Updates SKU + stock display
- Updates URL: `?color=blue` (for shareable links)

---

## 13. Categories & Taxonomy

### Category Types

Each `Categories` document has a `type` field. Different `type` values
behave differently in the storefront:

| Type         | Purpose                      | Examples                                     |
| ------------ | ---------------------------- | -------------------------------------------- |
| `fabric`     | Filterable on PLP            | Silk Sarees, Cotton Sarees, Georgette Sarees |
| `occasion`   | Filterable on PLP            | Wedding, Festive, Party, Daily               |
| `work`       | Filterable on PLP            | Embroidered, Printed, Woven, Plain           |
| `collection` | Standalone page (PLP)        | New Arrivals, Best Sellers, Sale             |
| `editorial`  | Curated marketing collection | Bridal Edit, Summer Edit                     |

### Page Routing

| Type                           | Route                                                        | Source          |
| ------------------------------ | ------------------------------------------------------------ | --------------- |
| `collection`                   | `/collections/[slug]`                                        | Single document |
| `editorial`                    | `/collections/[slug]`                                        | Single document |
| `fabric` / `occasion` / `work` | `/collections/[slug]` (but can be also a filter chip on PLP) | Single document |

### Filter Implementation

The PLP at `/collections/[slug]` uses Payload's Local API to query
products:

```ts
const products = await payload.find({
  collection: 'products',
  where: {
    and: [
      { status: { equals: 'published' } },
      { categories: { in: [categoryId] } },
      { fabric: { primary: { equals: 'silk' } } }, // from filter UI
      { price: { greater_than_equal: 1000, less_than_equal: 5000 } },
      { colorVariants: { exists: true } },
    ],
  },
  sort: '-createdAt',
  limit: 24,
  page: 1,
})
```

---

## 14. Page Types & Sections

> The page types and visual sections are **largely identical** to the
> Shopify plan. The difference is the implementation:
>
> | Aspect        | Shopify                        | Payload                                     |
> | ------------- | ------------------------------ | ------------------------------------------- |
> | Theme         | Liquid / Dawn                  | Next.js + Tailwind + shadcn/ui              |
> | Components    | Liquid templates + JSON config | React Server Components + Client Components |
> | Content       | Metafields + theme settings    | Payload fields + Layout Builder blocks      |
> | Data fetching | Liquid / AJAX                  | RSC `payload.find()` + Server Actions       |

**The page sections (Homepage, PLP, PDP, Cart, Checkout, Account, static
pages) are functionally identical to the Shopify plan.** Refer to
[`shagya-shopify.md` Section 12](./shagya-shopify.md#12-page-types--sections)
for the full page-by-page breakdown.

### Key Payload-specific differences

- **Homepage sections** are editable via the `Homepage` global in admin
- **Static pages** (About, FAQ, etc.) use the **Layout Builder** — non-technical
  staff can add/remove sections
- **Header & Footer** are editable in `Header`/`Footer` globals — change
  nav without code deploy

---

## 15. Payload Admin Panel Customization

> **The Payload Admin Panel is Payload's killer feature** — it auto-generates
> a beautiful, fully functional React UI for managing your data. It runs
> at `/admin` and requires zero frontend code.

### Default Admin Capabilities

- **Dashboard** with collection counts
- **List views** with search, filter, sort, pagination
- **Edit views** with all fields rendered appropriately (text, select,
  upload, relationship, rich text, array, group, blocks)
- **Version history** (drafts + autosave)
- **Bulk operations** (delete, update, publish)
- **Import/Export** (CSV/JSON)
- **Live Preview** — see the storefront render as you edit
- **API playground** (REST + GraphQL)
- **User & role management**

### Custom Admin Components

For saree-specific workflows, build custom React components that slot into
the admin:

| Component               | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| `OrderStatusBadge`      | Color-coded status indicator on order list               |
| `ProductImagePreview`   | Reorder product images with drag-and-drop                |
| `InventoryQuickEdit`    | Edit stock without opening full product                  |
| `CouponUsageChart`      | Show coupon usage over time                              |
| `SareeAttributePreview` | Visual preview of saree attributes (fabric swatch, etc.) |
| `LowStockAlert`         | Dashboard widget showing low-stock products              |
| `DailySalesWidget`      | Dashboard widget with revenue chart                      |

### Custom Views

- **Order Fulfillment View** — Kanban board: Pending → Processing → Shipped → Delivered
- **Inventory Dashboard** — Stock levels at a glance, reorder alerts
- **Customer 360** — Single page per customer showing orders, addresses, wishlist, notes

### Access Control Per Role

| Role          | Can Do                                       |
| ------------- | -------------------------------------------- |
| `superAdmin`  | Everything                                   |
| `admin`       | All except user management                   |
| `editor`      | Products, pages, posts (no orders/customers) |
| `fulfillment` | Orders, shipments (read-only on products)    |
| `support`     | Customers, orders (read-only)                |

---

## 16. Frontend Architecture (Next.js)

### Server Components vs Client Components

| Component                  | Type                                     | Why                                                            |
| -------------------------- | ---------------------------------------- | -------------------------------------------------------------- |
| `Header` (with cart count) | Hybrid (server shell + client cart icon) | Initial render from server, cart count via client subscription |
| `Footer`                   | Server                                   | Static content from global                                     |
| `Homepage`                 | Server                                   | Reads from Homepage global                                     |
| `Collection page`          | Server                                   | Direct DB query via `payload.find()`                           |
| `PDP`                      | Server                                   | Product data fetched server-side                               |
| `ProductGallery`           | **Client**                               | Image zoom, lightbox, swatch click                             |
| `VariantSelector`          | **Client**                               | Interactive state for selected color                           |
| `AddToCartButton`          | **Client**                               | Calls server action / cart store                               |
| `CartDrawer`               | **Client**                               | Cart state from Zustand                                        |
| `FilterSidebar`            | **Client**                               | URL search params update                                       |
| `CheckoutForm`             | **Client**                               | React Hook Form, multi-step state                              |
| `AccountDashboard`         | Server                                   | Auth-aware data fetch                                          |
| `WishlistButton`           | **Client**                               | Optimistic UI update                                           |

### State Management

| Concern                            | Tool                                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------- |
| Cart (client)                      | **Zustand** + persist to localStorage                                                        |
| Cart (server, for logged-in users) | **Payload `carts` collection**                                                               |
| UI state (modals, drawers)         | Zustand                                                                                      |
| Form state                         | **React Hook Form**                                                                          |
| Server data                        | **Next.js fetch + revalidate** (or TanStack Query)                                           |
| Auth state                         | **Better Auth cookies** (customer) + **Payload cookies** (admin) — read in Server Components |

### Cart Strategy

- **Guest users**: Cart stored in localStorage + synced to cookie for SSR
  badge
- **Logged-in users**: Cart persisted in `carts` Payload collection
  (server-side, survives across devices)
- On login: **merge** guest cart into server cart
- Add to cart: **Server Action** (writes to DB) + optimistic UI update

```ts
// src/app/(frontend)/cart/actions.ts
'use server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function addToCart(
  productId: string,
  variant: any,
  quantity: number,
) {
  const customer = await getCurrentCustomer()
  if (!customer) return { success: false, reason: 'not_logged_in' }

  const payload = await getPayload({ config })
  // ... add to carts collection
  revalidateTag('cart')
  return { success: true }
}
```

### Data Fetching Pattern (RSC)

```ts
// src/app/(frontend)/products/[slug]/page.tsx
import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'

async function getProduct(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'products',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,  // populate media, categories
    draft: draftMode().isEnabled,
  })
  return docs[0] || null
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug)
  if (!product) notFound()

  return <ProductDetail product={product} />
}

// ISR + on-demand revalidation
export const revalidate = 3600  // revalidate every hour
// Payload's afterChange hook calls revalidatePath('/products/[slug]')
```

### Live Preview

Payload supports **Live Preview** out of the box. When an admin edits a
page/post in the admin panel, they see the storefront update in real time
next to the edit form. No setup beyond the `@payloadcms/next` package.

### Draft Mode

Next.js `draftMode()` + Payload `drafts: true` lets admins preview
unpublished products/pages before they go live.

---

## 17. Cart & Checkout Flow

### Checkout Architecture

Unlike Shopify (which provides a pre-built, PCI-compliant checkout), we
build a **custom checkout** that talks to **Razorpay** for payment
processing. Razorpay handles the actual card entry + PCI compliance; we
build the surrounding UX.

### Flow

```
1. Browse → Add to Cart (Server Action)
2. View Cart (RSC + Client for interactions)
3. Click "Checkout" → /checkout
4. Step 1: Contact (email + phone) + Address
5. Step 2: Shipping Method (calculated by zone)
6. Step 3: Payment Method
   - Card / UPI / NetBanking / Wallet / EMI  →  Razorpay Checkout
   - COD                                            →  Direct
7. Submit → Create Razorpay order (Server Action)
8. Razorpay processes payment (modal/redirect)
9. Razorpay webhook → Server verifies signature → Create Order in DB
10. Cart cleared → Redirect to /checkout/success
11. Confirmation email + SMS sent
```

### Razorpay Integration

#### Step 1: Server-side order creation

```ts
// src/app/api/razorpay/create-order/route.ts
import Razorpay from 'razorpay'
import { NextResponse } from 'next/server'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  const { amount, currency = 'INR' } = await req.json()
  const order = await razorpay.orders.create({
    amount: amount * 100, // paise
    currency,
    receipt: `rcpt_${Date.now()}`,
  })
  return NextResponse.json(order)
}
```

#### Step 2: Client-side checkout trigger

```tsx
'use client'
import { useEffect } from 'react'
import { loadRazorpayScript } from '@/lib/razorpay'

export function RazorpayCheckout({ order, customer }) {
  useEffect(() => {
    loadRazorpayScript()
  }, [])

  const handlePay = async () => {
    const res = await loadRazorpayScript()
    if (!res) return alert('Razorpay SDK failed to load')

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: 'INR',
      name: 'Shagya',
      description: `Order #${order.receipt}`,
      order_id: order.id,
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },
      theme: { color: '#0a0a0a' },
      handler: async (response) => {
        // Verify on server
        await fetch('/api/razorpay/verify', {
          method: 'POST',
          body: JSON.stringify(response),
        })
        window.location.href = `/checkout/success?order=${order.receipt}`
      },
    }
    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  }

  return <button onClick={handlePay}>Pay Now</button>
}
```

#### Step 3: Server-side verification (CRITICAL)

```ts
// src/app/api/razorpay/verify/route.ts
import crypto from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: Request) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData,
  } = await req.json()

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return Response.json(
      { success: false, error: 'Invalid signature' },
      { status: 400 },
    )
  }

  // Signature valid → create Order in DB
  const payload = await getPayload({ config })
  const order = await payload.create({
    collection: 'orders',
    data: {
      ...orderData,
      payment: {
        method: 'razorpay',
        status: 'captured',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
      },
    },
  })

  // Clear cart, send confirmation email
  // ...

  return Response.json({ success: true, orderId: order.id })
}
```

#### Step 4: Webhook handler (for failed payments, refunds, etc.)

```ts
// src/app/api/webhooks/razorpay/route.ts
import crypto from 'crypto'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('x-razorpay-signature')!

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')

  if (expected !== signature) {
    return new Response('Invalid signature', { status: 400 })
  }

  const event = JSON.parse(body)
  const payload = await getPayload({ config })

  switch (event.event) {
    case 'payment.captured':
      // Update order status
      break
    case 'payment.failed':
      // Mark order as failed, notify customer
      break
    case 'refund.processed':
      // Mark order as refunded
      break
  }

  return Response.json({ received: true })
}
```

### COD Flow

1. Customer selects COD
2. Server creates Order with `payment.status: 'pending'`, `fulfillment.status: 'pending'`
3. Confirmation email sent with "Pay on delivery" message
4. Admin manually confirms order in admin panel
5. Order ships, customer pays cash on delivery
6. Admin updates order status as fulfilled

### Multi-step Checkout UI

- Use **React Hook Form** + **Zod** for validation
- Stepper UI: Contact → Shipping → Payment → Review
- Save progress in session (so refresh doesn't lose data)
- Guest checkout supported (no account required)

---

## 18. Customer Account & Auth — Better Auth

> **Auth strategy: Hybrid** — Better Auth handles all **customer-facing
> auth** (login, signup, OTP, social, 2FA, passkey). Payload's built-in
> auth stays for the **admin panel** at `/admin`. Both share the same
> Postgres database, linked via `customers.betterAuthUserId`.

### Why Better Auth (over Payload's built-in for customers)

| Feature                                | Payload Built-in Auth | Better Auth                     |
| -------------------------------------- | --------------------- | ------------------------------- |
| Email + password                       | ✅ Built-in           | ✅ Built-in                     |
| Social login (Google, Facebook, Apple) | ❌ Manual integration | ✅ **30+ built-in**             |
| Phone OTP (popular in India)           | ❌ Manual             | ✅ **Built-in plugin**          |
| 2FA / TOTP                             | ❌ Manual             | ✅ **Built-in plugin**          |
| Passkeys (WebAuthn)                    | ❌ Manual             | ✅ **Built-in plugin**          |
| Magic link (passwordless email)        | ❌ Manual             | ✅ **Built-in plugin**          |
| Multi-session per user                 | ❌ Manual             | ✅ **Built-in plugin**          |
| JWT / API keys for mobile              | ❌ Manual             | ✅ **Built-in plugin**          |
| Bot detection + rate limiting          | ❌ Manual             | ✅ **Built-in**                 |
| Anonymous → upgrade to user            | ❌ Manual             | ✅ **Built-in plugin**          |
| Roles & permissions                    | ✅ Field-level        | ✅ `organization` plugin + RBAC |
| Migration path to mobile app           | Hard                  | ✅ JWT / API keys native        |
| Maintenance burden                     | Low (Payload)         | Low (open source)               |

**Verdict**: For a customer-facing Indian saree site where phone OTP and
Google login are table stakes, Better Auth saves 4–6 weeks of custom
auth work and provides features we'd otherwise build ourselves.

### 18.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SAME POSTGRES DATABASE                     │
│                                                              │
│  ┌────────────────────┐  ┌────────────────────────────────┐  │
│  │  Payload Tables    │  │  Better Auth Tables (auto)     │  │
│  │  ─────────────     │  │  ─────────────────────────     │  │
│  │  users (admin)     │  │  user (customers)              │  │
│  │  customers ─────────── betterAuthUserId ──────────────► │  │
│  │  products          │  │  session (active logins)       │  │
│  │  orders            │  │  account (OAuth providers)     │  │
│  │  carts             │  │  verification (email/OTP)      │  │
│  │  addresses (link)  │  │  twoFactor (if enabled)        │  │
│  │  ...               │  │  passkey (if enabled)          │  │
│  └────────────────────┘  └────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘

Customer flow:
  Browser → /account/login → Better Auth API → user/session tables
  Browser → /api/orders  → Payload API → reads orders via betterAuthUserId
  Browser → /admin/*     → Payload Admin → uses Payload's own auth
```

### 18.2 Installation

```bash
pnpm add better-auth
# Optional plugins
pnpm add @better-auth/redis-storage ioredis   # only for Tier 2+ (Redis)
# For phone OTP, need an SMS provider (MSG91 or Twilio)
```

### 18.3 Better Auth Configuration

**File: `src/lib/auth.ts`**

```ts
import { betterAuth } from 'better-auth'
import { Pool } from 'pg'
import { nextCookies } from 'better-auth/next-js'
import {
  twoFactor,
  passkey,
  magicLink,
  phoneNumber,
  anonymous,
  admin as adminPlugin,
  organization,
} from 'better-auth/plugins'
import { resend } from './resend' // email sender

// Shared Postgres pool (same DB Payload uses)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!, // Neon / self-hosted / etc.
})

export const auth = betterAuth({
  database: pool,

  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  secret: process.env.BETTER_AUTH_SECRET!, // openssl rand -base64 32

  // ── Email + password (built-in) ─────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    sendResetPassword: async ({ user, url }) => {
      await resend.emails.send({
        from: 'Shagya <hello@shagyabrand.com>',
        to: user.email,
        subject: 'Reset your Shagya password',
        html: `<p>Click <a href="${url}">here</a> to reset your password.</p>`,
      })
    },
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await resend.emails.send({
        from: 'Shagya <hello@shagyabrand.com>',
        to: user.email,
        subject: 'Verify your Shagya account',
        html: `<p>Welcome! Verify your email: <a href="${url}">${url}</a></p>`,
      })
    },
    autoSignInAfterVerification: true,
  },

  // ── Social providers (built-in, India-relevant) ────
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    facebook: {
      clientId: process.env.FACEBOOK_APP_ID!,
      clientSecret: process.env.FACEBOOK_APP_SECRET!,
    },
    apple: {
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    },
  },

  // ── Account linking (link multiple providers to one user) ──
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ['google', 'facebook', 'apple'],
    },
  },

  // ── Session config ──────────────────────────────────
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh every 24 hours
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 min cache (reduces DB hits)
    },
  },

  // ── Custom user fields ─────────────────────────────
  user: {
    additionalFields: {
      // Mirror from Payload's Customer collection
      firstName: { type: 'string', required: false },
      lastName: { type: 'string', required: false },
      phone: { type: 'string', required: false },
      role: {
        type: 'string',
        defaultValue: 'customer',
        input: false, // don't let user set this
      },
    },
  },

  // ── Plugins ─────────────────────────────────────────
  plugins: [
    // Phone OTP (India-critical, requires MSG91/Twilio setup)
    phoneNumber({
      sendOTP: async ({ phoneNumber, code }) => {
        // Use MSG91 or Twilio to send OTP via SMS
        await sendSms(
          phoneNumber,
          `Your Shagya code is: ${code}. Valid for 10 minutes.`,
        )
      },
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      allowedAttempts: 5,
    }),

    // 2FA via TOTP (Google Authenticator, Authy)
    twoFactor({
      issuer: 'Shagya',
      totpOptions: {
        digits: 6,
        period: 30,
      },
    }),

    // Passkeys (WebAuthn) — passwordless, modern
    passkey({
      rpName: 'Shagya',
      rpID: process.env.NEXT_PUBLIC_APP_URL
        ? new URL(process.env.NEXT_PUBLIC_APP_URL).hostname
        : 'localhost',
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    }),

    // Magic link (passwordless email login)
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await resend.emails.send({
          from: 'Shagya <hello@shagyabrand.com>',
          to: email,
          subject: 'Your Shagya sign-in link',
          html: `<p>Click to sign in: <a href="${url}">${url}</a></p>`,
        })
      },
      expiresIn: 600, // 10 min
    }),

    // Admin plugin (manage customers from a Better Auth dashboard)
    admin({
      defaultRole: 'customer',
      adminRoles: ['admin'],
    }),

    // Anonymous sessions (let guests browse with a session, upgrade on signup)
    anonymous(),

    // IMPORTANT: must be last
    nextCookies(), // sets cookies in Server Actions
  ],

  // ── Database hooks (sync with Payload) ──────────────
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // When a customer signs up via Better Auth,
          // create a corresponding Payload Customer document
          try {
            const { getPayload } = await import('payload')
            const config = (await import('@payload-config')).default
            const payload = await getPayload({ config })

            await payload.create({
              collection: 'customers',
              data: {
                betterAuthUserId: user.id,
                email: user.email,
                firstName: user.firstName || user.name?.split(' ')[0] || '',
                lastName:
                  user.lastName ||
                  user.name?.split(' ').slice(1).join(' ') ||
                  '',
                phone: user.phone || '',
                marketingOptIn: false,
              },
            })
          } catch (err) {
            console.error('Failed to create Payload customer:', err)
          }
        },
      },
      update: {
        after: async (user) => {
          // Sync email/phone/name changes back to Payload
          try {
            const { getPayload } = await import('payload')
            const config = (await import('@payload-config')).default
            const payload = await getPayload({ config })

            const customers = await payload.find({
              collection: 'customers',
              where: { betterAuthUserId: { equals: user.id } },
              limit: 1,
            })
            if (customers.docs[0]) {
              await payload.update({
                collection: 'customers',
                id: customers.docs[0].id,
                data: {
                  email: user.email,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  phone: user.phone,
                },
              })
            }
          } catch (err) {
            console.error('Failed to sync customer update:', err)
          }
        },
      },
    },
  },
})

// Helper: get current customer from Payload
export async function getCurrentCustomer(req: any) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session) return null
  // Look up Payload customer by betterAuthUserId
  const { getPayload } = await import('payload')
  const config = (await import('@payload-config')).default
  const payload = await getPayload({ config })
  const result = await payload.find({
    collection: 'customers',
    where: { betterAuthUserId: { equals: session.user.id } },
    limit: 1,
  })
  return result.docs[0] || null
}

export type Session = typeof auth.$Infer.Session
```

### 18.4 Next.js API Route

**File: `app/api/auth/[...all]/route.ts`**

```ts
import { auth } from '@/lib/auth'
import { toNextJsHandler } from 'better-auth/next-js'

export const { GET, POST } = toNextJsHandler(auth)
```

That's it. Better Auth now exposes all endpoints at `/api/auth/*`:

- `POST /api/auth/sign-up/email` — email signup
- `POST /api/auth/sign-in/email` — email login
- `POST /api/auth/sign-in/social` — OAuth (Google, Facebook, Apple)
- `POST /api/auth/sign-in/phone-number` — phone OTP login
- `POST /api/auth/forget-password` — request password reset
- `POST /api/auth/reset-password` — submit new password
- `POST /api/auth/two-factor/enable` — enable 2FA
- `POST /api/auth/passkey/register` — register passkey
- `POST /api/auth/magic-link/verify` — verify magic link
- `GET  /api/auth/get-session` — get current session
- `POST /api/auth/sign-out` — logout
- `GET  /api/auth/phone-number/send-otp` — request OTP
- `POST /api/auth/phone-number/verify` — verify OTP
- `...` (50+ more endpoints from plugins)

### 18.5 Next.js 16 Proxy (Auth Protection)

**File: `proxy.ts` (Next.js 16 renamed `middleware.ts` to `proxy.ts`)**

```ts
import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

// Cookie-based check (fast, doesn't hit DB — for optimistic redirect)
export async function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request)

  const protectedPaths = ['/account', '/checkout', '/admin']
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p),
  )

  if (isProtected && !sessionCookie) {
    const url = request.nextUrl.clone()
    url.pathname = request.nextUrl.pathname.startsWith('/admin')
      ? '/admin-login'
      : '/account/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/account/:path*', '/checkout/:path*', '/admin/:path*'],
}
```

**For full session validation (in Server Components, not proxy):**

```ts
// src/lib/auth-server.ts
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function requireCustomer() {
  const session = await getSession()
  if (!session) redirect('/account/login')
  return session
}
```

### 18.6 Auth Client (Frontend)

**File: `src/lib/auth-client.ts`**

```ts
import { createAuthClient } from 'better-auth/react'
import {
  twoFactorClient,
  passkeyClient,
  magicLinkClient,
  phoneNumberClient,
  adminClient,
  organizationClient,
} from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  plugins: [
    twoFactorClient(),
    passkeyClient(),
    magicLinkClient(),
    phoneNumberClient(),
    adminClient(),
    organizationClient(),
  ],
})

// Export hooks for easy use
export const {
  signIn,
  signUp,
  signOut,
  useSession,
  socialSignIn, // Google, Facebook, Apple
} = authClient
```

### 18.7 Auth UI Pages (App Router)

**Login page** — `app/(frontend)/account/login/page.tsx`

```tsx
'use client'
import { useState } from 'react'
import { signIn } from '@/lib/auth-client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/account'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn.email({ email, password, callbackURL: redirect })
      router.push(redirect)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    await signIn.social({ provider: 'google', callbackURL: redirect })
  }

  async function handlePhoneLogin() {
    router.push('/account/login/phone')
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-semibold">Sign in to Shagya</h1>

      {/* Social login */}
      <div className="mb-6 space-y-2">
        <button onClick={handleGoogleLogin} className="btn-google w-full">
          Continue with Google
        </button>
        <button
          onClick={() => signIn.social({ provider: 'facebook' })}
          className="btn-fb w-full"
        >
          Continue with Facebook
        </button>
        <button onClick={handlePhoneLogin} className="btn-phone w-full">
          Continue with Phone (OTP) 🇮🇳
        </button>
      </div>

      <div className="divider my-6">OR</div>

      {/* Email login */}
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in...' : 'Sign in with Email'}
        </button>
      </form>

      <div className="mt-4 space-y-1 text-center text-sm">
        <a
          href="/account/forgot-password"
          className="text-gray-600 hover:underline"
        >
          Forgot password?
        </a>
        <p className="text-gray-600">
          New here?{' '}
          <a href="/account/register" className="font-medium text-black">
            Create account
          </a>
        </p>
      </div>
    </div>
  )
}
```

**Phone OTP login** — `app/(frontend)/account/login/phone/page.tsx`

```tsx
'use client'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

export default function PhoneLoginPage() {
  const [phone, setPhone] = useState('+91')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)

  async function sendOtp() {
    setLoading(true)
    try {
      await authClient.phoneNumber.sendOtp({ phoneNumber: phone })
      setStep('otp')
    } catch (e) {
      alert('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOtp() {
    setLoading(true)
    try {
      await authClient.phoneNumber.verifyOtp({ phoneNumber: phone, code: otp })
      window.location.href = '/account'
    } catch (e) {
      alert('Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-2xl font-semibold">Sign in with Phone</h1>
      {step === 'phone' ? (
        <>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 9876543210"
          />
          <button onClick={sendOtp} disabled={loading} className="btn-primary">
            Send OTP
          </button>
        </>
      ) : (
        <>
          <p>OTP sent to {phone}</p>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit OTP"
            maxLength={6}
          />
          <button
            onClick={verifyOtp}
            disabled={loading}
            className="btn-primary"
          >
            Verify & Sign in
          </button>
        </>
      )}
    </div>
  )
}
```

**Account dashboard (server component reading Better Auth session)** — `app/(frontend)/account/page.tsx`

```tsx
import { redirect } from 'next/navigation'
import { getCurrentCustomer } from '@/lib/auth'

export default async function AccountPage() {
  const customer = await getCurrentCustomer({ headers: undefined })
  if (!customer) redirect('/account/login')

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1>Welcome, {customer.firstName}!</h1>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <a href="/account/orders" className="card">
          My Orders ({customer.totalOrders})
        </a>
        <a href="/account/addresses" className="card">
          Addresses
        </a>
        <a href="/account/wishlist" className="card">
          Wishlist
        </a>
        <a href="/account/profile" className="card">
          Profile
        </a>
      </div>
    </div>
  )
}
```

### 18.8 Guest Checkout → Authenticated Flow

Cart works without login (localStorage). When user starts checkout, we
prompt for login/signup.

```tsx
// In checkout flow
async function handleCheckoutStart() {
  const session = await getSession()
  if (!session) {
    // Option A: Redirect to login
    router.push('/account/login?redirect=/checkout')
  } else {
    router.push('/checkout')
  }
}
```

After successful order placement (guest or logged-in), prompt to create
an account for future orders.

### 18.9 SMS Provider Setup (Phone OTP)

Better Auth's phoneNumber plugin doesn't send SMS itself — you provide
the `sendOTP` function. For India, use **MSG91** or **Twilio**.

**MSG91 setup (recommended for India):**

```ts
// src/lib/sms.ts
export async function sendSms(phone: string, message: string) {
  const response = await fetch('https://control.msg91.com/api/v5/flow/', {
    method: 'POST',
    headers: {
      authkey: process.env.MSG91_AUTH_KEY!,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: 'SHAGYA',
      route: '4', // transactional
      country: '91',
      sms: [{ message, to: phone.replace('+91', '') }],
    }),
  })
  if (!response.ok) throw new Error('SMS send failed')
}
```

**Twilio setup (alternative):**

```ts
// src/lib/sms.ts
import twilio from 'twilio'

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
)

export async function sendSms(phone: string, message: string) {
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: phone,
  })
}
```

### 18.10 OAuth Provider Setup (Quick Reference)

**Google** (most popular in India):

1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 Client ID
3. Authorized redirect URI: `https://shagyabrand.com/api/auth/callback/google`
4. Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`

**Facebook**:

1. Go to https://developers.facebook.com
2. Create app → Add Facebook Login product
3. Valid OAuth Redirect URI: `https://shagyabrand.com/api/auth/callback/facebook`
4. Add `FACEBOOK_APP_ID` and `FACEBOOK_APP_SECRET` to `.env`

**Apple** (required for iOS App Store, recommended for premium feel):

1. https://developer.apple.com → Certificates, Identifiers & Profiles
2. Create Service ID for "Sign in with Apple"
3. Generate private key, create JWT client secret
4. Add `APPLE_CLIENT_ID` and `APPLE_CLIENT_SECRET` to `.env`

### 18.11 Better Auth Database Migrations

Better Auth manages its own tables (user, session, account, verification,
plus plugin tables like twoFactor, passkey). To create/migrate them:

```bash
# Auto-migrate (recommended for dev)
npx @better-auth/cli@latest migrate

# Generate schema file (for review before running)
npx @better-auth/cli@latest generate

# Programmatic migration (Cloudflare Workers, etc.)
npx @better-auth/cli@latest generate --output ./schema.sql
```

Tables created in the same Postgres DB:

- `user` — customers
- `session` — active sessions
- `account` — OAuth provider accounts
- `verification` — email/OTP verification
- `twoFactor` — 2FA secrets
- `passkey` — WebAuthn credentials
- Plus custom fields we add via `additionalFields`

### 18.12 Access Control for Customer Routes

```ts
// src/lib/auth-guard.ts
import { auth } from './auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function requireCustomer() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect('/account/login')
  return session
}

// In any protected Server Component:
export default async function AccountPage() {
  const session = await requireCustomer()
  // ... render page
}
```

### 18.13 Account Features (Customer-Facing)

| Feature                 | Implementation                               | Status     |
| ----------------------- | -------------------------------------------- | ---------- |
| Email + password login  | Better Auth built-in                         | ✅ MVP     |
| Google login            | Better Auth socialProviders                  | ✅ MVP     |
| Facebook login          | Better Auth socialProviders                  | ✅ MVP     |
| Apple login             | Better Auth socialProviders                  | ✅ MVP     |
| Phone OTP login         | Better Auth `phoneNumber` plugin             | ✅ MVP     |
| Magic link (email)      | Better Auth `magicLink` plugin               | ✅ MVP     |
| Passkey (WebAuthn)      | Better Auth `passkey` plugin                 | ⭐ Phase 2 |
| 2FA (TOTP)              | Better Auth `twoFactor` plugin               | ⭐ Phase 2 |
| Email verification      | Better Auth built-in                         | ✅ MVP     |
| Password reset          | Better Auth built-in                         | ✅ MVP     |
| Dashboard               | Server Component reads Payload customer      | ✅ MVP     |
| Order history           | Reads Payload orders via `betterAuthUserId`  | ✅ MVP     |
| Address book            | Stored in Payload `customers.addresses`      | ✅ MVP     |
| Wishlist                | Stored in Payload `customers.wishlist`       | ✅ MVP     |
| Profile edit            | Syncs back to Better Auth via hook           | ✅ MVP     |
| Marketing opt-in        | Stored in Payload `customers.marketingOptIn` | ✅ MVP     |
| Multi-device sessions   | Better Auth `multiSession` plugin            | ⭐ Phase 2 |
| Account deletion (GDPR) | Soft delete + scheduled hard delete          | ⭐ Phase 2 |

### 18.14 Better Auth Admin Plugin (Optional)

Better Auth has its own `admin` plugin that gives you a separate admin
dashboard for managing customers (not products — that's still Payload).
Useful for support team to:

- View customer list
- Impersonate customers (for debugging)
- Ban/unban accounts
- View sessions
- Delete accounts

```ts
// Already added in plugins above
admin({
  defaultRole: 'customer',
  adminRoles: ['admin'],
})
```

Access at `/admin-auth` (separate from Payload's `/admin`):

- `/admin-auth/users` — list of all customers
- `/admin-auth/users/:id` — view/edit customer
- `/admin-auth/sessions` — active sessions

**Note**: This is a _complement_ to Payload's admin, not a replacement.
Use Payload for products/orders/content; use Better Auth admin for
customer management (sessions, bans, impersonation).

### 18.15 Migration Path to Mobile App (Future)

Better Auth provides **native JWT and API key support** out of the box,
so when you build a React Native mobile app later, you don't have to
rebuild auth:

```ts
// In mobile app, exchange Better Auth session for JWT
const { token } = await auth.api.getToken({
  headers: { cookie: sessionCookie },
})
// Mobile app uses token in Authorization: Bearer <token>
```

Or use API keys for server-to-server:

```ts
const apiKey = await auth.api.createApiKey({ name: 'Mobile App', userId })
```

### 18.16 Security Best Practices

- ✅ HttpOnly cookies (Better Auth default)
- ✅ SameSite=Lax cookies (CSRF protection)
- ✅ Secure cookies in production (HTTPS only)
- ✅ Rate limiting (Better Auth built-in)
- ✅ Brute force protection (Better Auth built-in)
- ✅ Password hashing (scrypt, Better Auth default)
- ✅ Email verification required
- ✅ 2FA available for all customers (opt-in)
- ✅ Phone OTP expires in 10 minutes
- ✅ Magic link expires in 10 minutes
- ✅ Session expires in 7 days
- ✅ Session refresh on activity
- ✅ Bcrypt for passwords (no plaintext)
- ✅ GDPR: data export + account deletion flows
- ⚠️ Custom: add Cloudflare Turnstile on signup/login to block bots

### 18.17 Cost & Hosting Impact

Better Auth is **open source and free**. No licensing fees, no per-user
costs. Adds 4 small tables to your existing Postgres DB. SMS costs
(MSG91/Twilio) for OTP are per-message (₹0.10–0.20 per OTP in India).

**No change to tier costs** (Tier 0/1/2 stay the same). Better Auth
runs in the same Next.js process as Payload — no extra infrastructure.

### 18.18 Admin Auth (UNCHANGED)

To be crystal clear: **Payload's admin panel auth is unchanged**.

- Admin users (your team) log in at `/admin` using Payload's built-in auth
- This is intentional — Payload's admin is built around its own auth
- Customers never see or interact with Payload's auth
- Two separate auth systems, one shared database, linked via `betterAuthUserId`

---

## 19. Payment Integration — Razorpay + Stripe

### Why Razorpay (not Stripe) for India

- **Stripe doesn't fully support India** for domestic payments (only
  international cards)
- **Razorpay** is purpose-built for India: UPI, NetBanking, all major
  wallets, EMI, and now even RuPay
- **Razorpay supports international** for cross-border too

### Razorpay Setup

1. Create Razorpay account: https://razorpay.com
2. KYC verification (PAN, GST, bank account)
3. Get API keys (test + live)
4. Add to `.env`:
   ```
   RAZORPAY_KEY_ID=rzp_test_xxx
   RAZORPAY_KEY_SECRET=xxx
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
   RAZORPAY_WEBHOOK_SECRET=xxx
   ```
5. Configure webhook in Razorpay dashboard
6. Test with test cards

### Payment Methods (Razorpay)

- **Cards**: Visa, MC, Amex, RuPay, Maestro
- **UPI**: GPay, PhonePe, Paytm, BHIM (most popular in India)
- **Net Banking**: 50+ banks
- **Wallets**: Paytm, Mobikwik, Amazon Pay, Ola Money
- **EMI**: Cardless EMI + Card EMI (above ₹3,000)
- **COD**: Handled separately (not via Razorpay)
- **Pay Later**: LazyPay, Simpl, ICICI (Phase 2)

### Stripe (Phase 2 — International)

- Use Payload's **official Stripe plugin** for international
- Same Products sync both ways
- Stripe handles all payment processing, Payload handles all data
- Activate Stripe when launching international shipping

### COD Implementation

- Toggle in `Settings` global (`codEnabled`)
- COD surcharge: `₹49` (optional, configurable)
- Customer enters address, selects COD
- Server creates Order with `payment.method: 'cod'`, `payment.status: 'pending'`
- Admin processes order in admin panel
- Shipping team collects cash on delivery
- Reconciliation: Mark as captured in admin when cash received

---

## 20. Shipping & Fulfillment

### Shipping Zones

- Configured in `ShippingZones` collection
- Editable in admin (no code change)
- India: Zone 1 (Metro), Zone 2 (Tier 1), Zone 3 (Tier 2/3)
- Phase 2: International zones (USA, UK, etc.)

### Rate Calculation

```ts
function calculateShipping(state: string, cartSubtotal: number) {
  const zones = await payload.find({ collection: 'shipping-zones' })
  const zone = zones.docs.find((z) => z.states.includes(state))
  if (!zone) return { rate: 99, estimatedDays: { min: 5, max: 7 } }
  if (cartSubtotal >= zone.freeShippingThreshold) {
    return { rate: 0, estimatedDays: zone.estimatedDays }
  }
  return { rate: zone.rate, estimatedDays: zone.estimatedDays }
}
```

### Shiprocket Integration

- **API client** in `src/lib/shiprocket.ts`
- **Auto-create shipment** in Shiprocket when order is marked "processing"
- **Webhook** from Shiprocket updates `fulfillment.status` and `awbCode`
- **Tracking page** links to Shiprocket's tracking URL

```ts
// src/lib/shiprocket.ts
const shiprocket = {
  async createOrder(order) {
    // POST to Shiprocket API
  },
  async generateAWB(shipmentId) {
    // POST to Shiprocket API
  },
  async trackOrder(awb) {
    // GET from Shiprocket API
  },
  async cancelOrder(orderId) {
    // POST to Shiprocket API
  },
}
```

### Fulfillment Workflow

1. Order created (`status: pending`, `fulfillment.status: pending`)
2. Payment confirmed (`payment.status: captured`)
3. Admin reviews in admin panel
4. Admin clicks "Mark as Processing" → triggers Shiprocket shipment
5. Shiprocket assigns AWB + courier → webhook updates DB
6. Customer receives shipping email with tracking link
7. Shiprocket delivers → webhook updates `fulfillment.status: delivered`
8. Customer receives delivery email
9. Admin marks order complete

---

## 21. Returns & Exchange

### Custom Returns Portal

- Customer initiates return from order detail page
- Returns stored in `Returns` collection (Phase 2) or in Order's
  `returnRequest` group (MVP)
- Admin reviews and approves/rejects in admin
- Refund issued via Razorpay (auto if approved)

### Return Flow

1. Customer goes to `/account/orders/[id]`
2. Clicks "Request Return"
3. Selects items + reason + photos
4. Submit → returns request saved to Order
5. Admin reviews in admin panel
6. If approved: Customer gets return shipping label
7. Customer ships back
8. Admin marks as received
9. Refund processed (auto via Razorpay or manual)

### Refund via Razorpay

```ts
const refund = await razorpay.payments.refund(paymentId, {
  amount: refundAmount * 100, // paise
})
```

### Return Policy (encoded in admin)

- 14-day return window
- Unused, unwashed, with tags
- Customer pays return shipping (₹99 deducted from refund)
- Refund in 5–7 business days
- Sale items: final sale (no returns)

---

## 22. Email & SMS

### Email (Resend)

- **Transactional**: Order confirmations, shipping, delivery, password reset
  - React Email templates
  - Sent via Resend API
  - 100/day free, then $20/month
- **Marketing**: Newsletter, promotions, abandoned cart
  - Resend Audiences or Resend + Loops.so
  - Segments, automation flows
  - Double opt-in for compliance

### Email Templates (React Email)

- `OrderConfirmation.tsx` — Order details, items, total, expected delivery
- `OrderShipped.tsx` — Tracking link, courier
- `OrderDelivered.tsx` — Thank you, review request
- `WelcomeEmail.tsx` — 10% off code, brand intro
- `AbandonedCart.tsx` — Cart items, discount incentive
- `PasswordReset.tsx` — Reset link
- `ContactFormAutoReply.tsx` — We received your message
- `Newsletter.tsx` — Marketing email template

### SMS (MSG91 or Twilio)

- **Transactional**:
  - Order placed
  - Order shipped (with tracking link)
  - Out for delivery
  - OTP for passwordless auth
- **Marketing** (use sparingly):
  - Sale announcements
  - New collection launch

### Email Deliverability Setup

- SPF, DKIM, DMARC records configured
- Verified sending domain (e.g., `email.shagyabrand.com`)
- Dedicated IP (Phase 2)
- Bounce/complaint handling

---

## 23. Search & Discovery

### MVP: Postgres Full-Text Search

- Built into Postgres — no extra service
- Search across: `title`, `description`, `fabric.primary`, `tags`
- Use Payload's **Search Plugin** to set up search indexes
- Simple search box with results page

### Phase 2: Algolia or Meilisearch

- When catalog exceeds ~200 products
- Typo tolerance, instant search, faceting
- Algolia: $0.50 per 1000 records + $0.50 per 1000 search requests
- Meilisearch: Self-host or Meilisearch Cloud (free tier)

### PLP Filters (collection page)

- **Price range** (slider, ₹0–₹50,000)
- **Fabric** (checkboxes from categories of type `fabric`)
- **Color** (color swatches from primaryColor field)
- **Occasion** (checkboxes)
- **Work** (checkboxes)
- **Blouse Piece Included** (toggle)
- **In Stock Only** (checkbox)

URL state preserved via `useSearchParams`:
`/collections/silk-sarees?fabric=silk&price=1000-5000&color=red`

### Sort Options

- Featured (default)
- Newest
- Price: Low → High
- Price: High → Low
- Best Selling
- A → Z

---

## 24. SEO Requirements

### Next.js Metadata API

Per-page metadata via `generateMetadata`:

```ts
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug)
  return {
    title: product.seo?.title || `${product.title} | Shagya`,
    description: product.seo?.description || product.shortDescription,
    openGraph: {
      title: product.title,
      description: product.shortDescription,
      images: [product.images[0]?.image.url],
      type: 'website',
    },
    alternates: { canonical: `/products/${product.slug}` },
  }
}
```

### Sitemap (`app/sitemap.ts`)

- Auto-generated from Payload collections
- Includes: homepage, all products, all collections, all pages, blog posts
- Submitted to Google Search Console

### Robots.txt (`app/robots.ts`)

- Allow all crawlers
- Disallow `/admin`, `/api`, `/account`, `/cart`, `/checkout`

### Structured Data (JSON-LD)

- **Product** schema on PDP (name, image, price, availability, rating)
- **BreadcrumbList** on PLP and PDP
- **Organization** on homepage
- **WebSite** with SearchAction on homepage
- **FAQPage** on FAQ page
- **LocalBusiness** on contact page (if applicable)

### Performance for SEO

- **RSC + ISR** → near-instant TTFB
- **next/image** → auto WebP, responsive, lazy load
- **next/font** → optimized font loading
- **Vercel CDN** → edge cache static pages
- Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1

### 301 Redirects

- Managed in `Redirects` collection (admin UI)
- Applied via Next.js middleware

---

## 25. Analytics & Tracking

### PostHog (Recommended over GA4 for indie)

- Privacy-friendly, GDPR-compliant by default
- Funnels, retention, feature flags, session recording
- Free up to 1M events/month
- Self-host option available

### GA4 + Meta Pixel (Standard)

- Standard e-commerce events
- Conversion tracking for ads
- Required for most ad platforms

### Key Events to Track

| Event               | Tool                 | Trigger                        |
| ------------------- | -------------------- | ------------------------------ |
| `page_view`         | PostHog + GA4 + Meta | Any page                       |
| `view_product`      | All                  | PDP                            |
| `add_to_cart`       | All                  | Add to cart                    |
| `view_cart`         | All                  | Cart page                      |
| `begin_checkout`    | All                  | Checkout start                 |
| `add_payment_info`  | All                  | Payment method selected        |
| `purchase`          | All                  | Order placed (with order data) |
| `search`            | All                  | Search submitted               |
| `sign_up`           | All                  | Customer registered            |
| `add_to_wishlist`   | All                  | Wishlist add                   |
| `newsletter_signup` | All                  | Email submitted                |
| `contact_submit`    | All                  | Form submitted                 |

### Server-Side Tracking

- Use PostHog/GA4 Measurement Protocol for server events
- More reliable (ad-blocker proof)
- Better for attribution

---

## 26. Trust Signals & Conversion

Same as Shopify plan, but with **full control** over implementation.

### Built-in Trust (Payload Advantages)

- **Custom domain** (not `.myshopify.com`)
- **SSL** (Vercel automatic)
- **Privacy-first** (PostHog, no third-party cookies required)
- **Open data** (no vendor lock-in)
- **Transparent pricing** (no per-order fees to vendor)

### Implementation

- **Trust badges** in Footer + PDP (Razorpay Secure, SSL, 100% Authentic)
- **Money-back guarantee** prominently displayed
- **Customer reviews** (Phase 2 — Reviews collection)
- **Press mentions** (if any, in Footer or About)
- **Social proof** — Instagram feed (Phase 2)
- **Real product photos** — not stock images

---

## 27. Internationalization (Phase 2)

### Multi-Language

- Payload's built-in **Localization** (field-level)
- Add `localized: true` to any field
- Languages: English (default), Hindi, Marathi, Tamil, etc.
- Locale prefix in URLs: `/en/products/...`, `/hi/products/...`

### Multi-Currency

- Display in user's preferred currency (IP geolocation)
- Razorpay + Stripe handle conversion
- Internal storage in INR, display layer converts

### International Shipping

- Add international zones to `ShippingZones`
- Use Shiprocket International or DHL/FedEx
- Customs documentation automated
- Landed cost calculator (product + shipping + duties)

---

## 28. Performance & Caching

### RSC + ISR

- All public pages are React Server Components
- Static generation with revalidation
- ISR triggers via Payload `afterChange` hook

```ts
// src/hooks/revalidatePage.ts
import { revalidatePath, revalidateTag } from 'next/cache'

export const revalidatePage: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  operation,
}) => {
  if (operation === 'update' && doc._status === 'published') {
    revalidatePath(`/products/${doc.slug}`)
    revalidatePath('/') // might affect homepage if featured
    revalidateTag('products')
  }
}
```

### Edge Caching

- Vercel CDN caches static pages at the edge
- Custom Cache-Control headers per route

### Image Optimization

- Vercel Image Optimization (built-in)
- WebP/AVIF auto-format
- Responsive `srcset`
- Lazy loading by default
- `priority` for above-the-fold images

### Database Query Optimization

- Indexes on frequently queried fields (slug, sku, status)
- Use `select` to fetch only needed fields
- Use `depth: 0` when not populating relationships
- Pagination (default 10, max 100)

### Caching Layers

| Layer              | Cached                        | TTL                |
| ------------------ | ----------------------------- | ------------------ |
| Vercel CDN         | Static pages, images, JS, CSS | Long               |
| Next.js Data Cache | `payload.find()` results      | 60s (configurable) |
| Browser            | Static assets                 | 1 year             |
| localStorage       | Guest cart                    | Persistent         |
| Payload `carts`    | Logged-in cart                | Persistent         |

---

## 29. Security

### Payload Built-in Security

- **CSRF protection** (built into Payload)
- **XSS protection** (React auto-escapes)
- **SQL injection** (Payload uses Drizzle ORM with parameterized queries)
- **HttpOnly cookies** for auth
- **Rate limiting** (configurable per route)
- **Access control** at field, document, and operation level

### Application Security

- **Environment variables** in Vercel (never in code)
- **API route authentication** check for sensitive endpoints
- **Webhook signature verification** (Razorpay, Shiprocket)
- **Input validation** with Zod
- **CAPTCHA** on forms (Cloudflare Turnstile — privacy-friendly)
- **Content Security Policy** headers (configurable in `next.config.ts`)
- **HTTPS only** (Vercel default)
- **Dependency scanning** (GitHub Dependabot, Snyk)

### Data Security

- **Database encryption at rest** (Neon/Vercel Postgres)
- **Backups** (daily, automated by Neon)
- **PII handling** (GDPR compliance for EU customers)
- **Right to be forgotten** (delete customer data on request)
- **Cookie consent banner** (Cookiebot or custom)

---

## 30. Content Workflow

### Editorial Workflow (Built into Payload)

- **Drafts**: Create unpublished drafts
- **Autosave**: Auto-save every few seconds
- **Versioning**: View and restore previous versions
- **Preview**: See draft in storefront before publishing
- **Scheduled Publish**: Schedule a future publish date/time
- **Publish/Unpublish**: One-click
- **Live Preview**: See real-time changes in storefront

### Roles

| Role        | Can Publish | Can Edit Drafts | Can Create       |
| ----------- | ----------- | --------------- | ---------------- |
| Editor      | ✅          | ✅              | ✅               |
| Fulfillment | ❌          | ❌              | ❌ (orders only) |
| Support     | ❌          | ❌              | ❌ (read only)   |

### Approval Workflow (Phase 2 — Payload Enterprise)

- Multi-step approval for high-value content
- "Editor drafts → Manager approves → Publishes"

### Marketing Workflow

1. Marketing team drafts homepage banner in admin
2. Saves as draft, previews live
3. Sets scheduled publish date
4. Goes live automatically at scheduled time
5. Triggers ISR revalidation → live on storefront

---

## 31. Implementation Phases

> Total estimated timeline: **10–14 weeks** (vs 6–8 weeks for Shopify)
> The extra time is for the custom checkout, admin customization, and
> data migration setup.

### Phase 1: Foundation & Setup (Week 1–2)

- [ ] Initialize Next.js 16 + Payload 3.x project (`pnpx create-payload-app`)
- [ ] Pin versions in `package.json`:
  - `next: ^16.2.0`
  - `react: ^19.2.0`, `react-dom: ^19.2.0`
  - `payload: ^3.x`, `@payloadcms/next: ^3.x`
  - `better-auth: ^1.x` + `better-auth/next-js` + `better-auth/react`
  - `typescript: ^5.7`
  - `tailwindcss: ^4.0`
  - `resend: ^x` (email)
  - Optional: `@better-auth/redis-storage ioredis` (Tier 2)
- [ ] Set `.nvmrc` to `22` (LTS) — enforce via `engines` in package.json
- [ ] Set up TypeScript config (strict mode, paths alias)
- [ ] Set up Tailwind CSS v4 + shadcn/ui
- [ ] Set up Postgres 18 (Neon for Tier 0/2, self-hosted for Tier 1) + Vercel Blob
- [ ] Configure environment variables (use `.env.example` for all keys)
  - `DATABASE_URL`, `PAYLOAD_SECRET`, `BETTER_AUTH_SECRET`
  - `GOOGLE_CLIENT_ID/SECRET`, `FACEBOOK_APP_ID/SECRET`, `APPLE_CLIENT_ID/SECRET`
  - `RESEND_API_KEY`, `MSG91_AUTH_KEY` (or `TWILIO_*`)
- [ ] Set up `payload.config.ts`:
  - DB adapter (`@payloadcms/db-postgres` or `@payloadcms/db-vercel-postgres`)
  - Storage plugin (`@payloadcms/storage-vercel-blob` or S3/R2)
  - Admin panel config
- [ ] Set up `src/lib/auth.ts` (Better Auth config — see Section 18.3)
- [ ] Set up `app/api/auth/[...all]/route.ts` (Better Auth API handler)
- [ ] Run Better Auth migration: `npx @better-auth/cli@latest migrate` (creates user/session/account/verification tables in same Postgres)
- [ ] Create base layout: Header, Footer (read from globals)
- [ ] Create auth UI pages: `/account/login`, `/account/register`, `/account/forgot-password`, `/account/login/phone`
- [ ] Set up Next.js 16 `proxy.ts` for auth protection
- [ ] Set up design system: colors, typography, components
- [ ] Git repo + CI/CD (Vercel auto-deploy for Tier 0/2, GitHub Actions for Tier 1)

**Deliverable**: Working Payload admin + Next.js 16 frontend + Better Auth (customers) wired up

### Phase 2: Schema Design (Week 2–3)

- [ ] Define all collections: Users, Customers, Products, Categories, Orders, Carts, Media, Pages, Coupons, ShippingZones, FormSubmissions, Redirects
- [ ] Define all globals: Header, Footer, Homepage, Settings, SEODefaults
- [ ] Install plugins: SEO, Search, Redirects, Form Builder, Nested Docs
- [ ] Define access control functions
- [ ] Define hooks (slug, stock status, revalidation)
- [ ] Run initial migration: `pnpm payload migrate:create`
- [ ] Seed initial data: admin user, sample categories, sample products

**Deliverable**: Full database schema, working admin

### Phase 3: Frontend — Storefront (Week 3–5)

- [ ] Build homepage (read from Homepage global)
- [ ] Build collection/PLP with filters + sort
- [ ] Build PDP with image gallery + variant selector
- [ ] Build cart drawer + cart page
- [ ] Build search page
- [ ] Build account pages (dashboard, orders, addresses, wishlist, profile)
- [ ] Build static pages (About, FAQ, Size Guide, etc.)
- [ ] Build header + footer (read from globals)
- [ ] Implement 404 + error pages
- [ ] Set up ISR + revalidation hooks
- [ ] Mobile responsive testing

**Deliverable**: Browsable, navigable storefront

### Phase 4: Checkout & Payments (Week 5–7)

- [ ] Razorpay account setup + KYC
- [ ] Razorpay SDK integration
- [ ] Build checkout flow (multi-step form)
- [ ] Build order creation server action
- [ ] Implement Razorpay signature verification
- [ ] Implement Razorpay webhook handler
- [ ] Implement COD flow
- [ ] Build order confirmation page
- [ ] Build order detail page in account
- [ ] Email templates (React Email)
- [ ] Send order confirmation email
- [ ] Send order shipped email
- [ ] Send order delivered email

**Deliverable**: Working end-to-end checkout

### Phase 5: Shipping & Operations (Week 7–8)

- [ ] Shiprocket account setup
- [ ] Shiprocket API integration
- [ ] Auto-create shipment on order processing
- [ ] Shiprocket webhook handler (tracking updates)
- [ ] Build admin fulfillment view (Kanban)
- [ ] Inventory management in admin
- [ ] Low-stock alerts
- [ ] Coupon system (admin + checkout)
- [ ] Build return/refund flow

**Deliverable**: Fulfillment workflow operational

### Phase 6: Auth & Customer Features (Week 8–9)

- [ ] Customer registration
- [ ] Customer login
- [ ] Password reset
- [ ] Address book
- [ ] Wishlist
- [ ] Order history
- [ ] Guest cart → logged-in cart merge
- [ ] Email preferences

**Deliverable**: Complete customer experience

### Phase 7: Content & Marketing (Week 9–10)

- [ ] Build About, Contact, FAQ, Size Guide pages (Layout Builder)
- [ ] Contact form (Form Builder plugin)
- [ ] Newsletter popup + Resend integration
- [ ] Welcome email series (Resend)
- [ ] Abandoned cart email (Phase 2)
- [ ] Social links + Instagram embed (Phase 2)
- [ ] Press mentions (if any)

**Deliverable**: Marketing-ready

### Phase 8: SEO, Analytics & Trust (Week 10–11)

- [ ] Sitemap (`app/sitemap.ts`)
- [ ] Robots.txt (`app/robots.ts`)
- [ ] Structured data (JSON-LD)
- [ ] GA4 + Meta Pixel + PostHog
- [ ] Server-side tracking (Measurement Protocol)
- [ ] Trust badges
- [ ] Cookie consent banner
- [ ] 301 redirects setup
- [ ] Email deliverability (SPF, DKIM, DMARC)

**Deliverable**: Trust + tracking in place

### Phase 9: Testing & QA (Week 11–12)

- [ ] E2E tests (Playwright) for critical flows
- [ ] Unit tests (Vitest) for pricing/cart logic
- [ ] Cross-browser testing
- [ ] Mobile testing (real devices)
- [ ] Load testing (k6 or Artillery)
- [ ] Security audit
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance audit (Lighthouse, Vercel Analytics)
- [ ] Payment testing (all methods, success + failure)
- [ ] Email testing (deliverability, all templates)

**Deliverable**: Production-ready

### Phase 10: Launch (Week 12–14)

- [ ] DNS configured
- [ ] SSL verified
- [ ] Final test order
- [ ] Monitoring active (Sentry, PostHog, Vercel)
- [ ] Team training on admin
- [ ] Launch announcement
- [ ] Monitor for 48 hours

**Deliverable**: Live, operational site

---

## 32. Cost Analysis: Payload (3 Tiers) vs Shopify

> This is the section that matters most for a new business. We show
> 3 cost-optimized Payload tiers vs Shopify, with exact numbers for
> common revenue scenarios.

### TL;DR — Quick Comparison

| Scenario                                 | Shopify Basic    | Payload Tier 0   | Payload Tier 1   | Payload Tier 2   |
| ---------------------------------------- | ---------------- | ---------------- | ---------------- | ---------------- |
| **0 orders (just launched)**             | **₹1,994/mo**    | **₹0/mo** ✨     | **₹670/mo**      | **₹7,100/mo**    |
| **100 orders × ₹4,000 (₹4L revenue)**    | **₹9,994/mo**    | **₹8,000/mo**    | **₹8,670/mo**    | **₹15,100/mo**   |
| **500 orders × ₹4,000 (₹20L revenue)**   | **₹41,994/mo**   | **₹40,000/mo**   | **₹40,670/mo**   | **₹47,100/mo**   |
| **2,000 orders × ₹4,000 (₹80L revenue)** | **₹1,61,994/mo** | **₹1,60,000/mo** | **₹1,60,670/mo** | **₹1,67,100/mo** |

**Key insight:** Payload Tier 0 (free) saves **₹1,994/month** from day one
even at zero revenue — that's the entire Shopify subscription recovered.
At any revenue level, the variable cost (2% Razorpay) is the same on both
platforms; the savings come from the **fixed cost component**.

### Monthly Cost Breakdown — Payload (3 Tiers)

#### Tier 0 — Free Tier ($0/month)

| Service               | Free Tier Limit                     | Cost     |
| --------------------- | ----------------------------------- | -------- |
| Vercel Hobby          | 100 GB bandwidth, 100 GB-hr compute | $0       |
| Neon Postgres Free    | 0.5 GB, 190 compute hrs/mo          | $0       |
| Vercel Blob Free      | 1 GB storage, 100 GB bandwidth      | $0       |
| Resend Free           | 100 emails/day, 3K/mo               | $0       |
| Sentry Developer Free | 5K errors/mo                        | $0       |
| PostHog Cloud Free    | 1M events/mo                        | $0       |
| Cloudflare DNS + CDN  | Unlimited                           | $0       |
| GitHub private repo   | Unlimited                           | $0       |
| Razorpay              | 2% per transaction                  | variable |
| **Total fixed**       |                                     | **$0**   |

**When to use:** MVP launch, <500 orders/mo, single admin user, willing
to accept 1–2s cold start on Neon free tier.

#### Tier 1 — Self-Hosted on Hetzner ($8/month)

| Service                     | Spec                               | Cost               |
| --------------------------- | ---------------------------------- | ------------------ |
| Hetzner Cloud CX21          | 4 GB RAM, 2 vCPU, 40 GB SSD        | €5.39/mo           |
| Postgres                    | Self-hosted on same VPS            | $0                 |
| Next.js + Payload           | Self-hosted (Node.js 22 LTS + PM2) | $0                 |
| Cloudflare DNS + CDN        | Free                               | $0                 |
| Hetzner Snapshots (backups) | +20% of server                     | ~$1.16/mo          |
| Domain (.in)                | Annual                             | ~$1/mo             |
| Resend Free                 | 100 emails/day                     | $0                 |
| Razorpay                    | 2% per transaction                 | variable           |
| **Total fixed**             |                                    | **~$8/mo (~₹670)** |

**When to use:** 500–5,000 orders/mo, want predictable flat cost, willing
to do basic Linux sysadmin, 1–3 team members.

#### Tier 2 — Managed (Vercel Pro + Neon Launch) ($85/month)

| Service                | Plan               | Cost                           |
| ---------------------- | ------------------ | ------------------------------ |
| Vercel Pro             | $20/seat/mo        | $20/mo                         |
| Neon Launch            | $19/mo, 10 GB      | $19/mo                         |
| Vercel Blob Pro        | $0.30/GB           | ~$5–10/mo                      |
| Resend Pro             | 50K emails/mo      | $20/mo                         |
| Sentry Team (optional) | 50K errors/mo      | $26/mo                         |
| Cloudflare             | Free               | $0                             |
| Razorpay               | 2% per transaction | variable                       |
| **Total fixed**        |                    | **~$85–95/mo (~₹7,100–7,900)** |

**When to use:** 500+ orders/mo AND team > 3, or premium support needed,
or want zero DevOps.

### Monthly Cost Breakdown — Shopify

| Plan                 | India Pricing | Notes                                                 |
| -------------------- | ------------- | ----------------------------------------------------- |
| **Shopify Starter**  | ₹399/month    | Limited, for solopreneurs                             |
| **Shopify Basic**    | ₹1,994/month  | Standard plan, 2% online transaction fee (additional) |
| **Shopify**          | ₹6,494/month  | 1% online transaction fee (additional)                |
| **Shopify Advanced** | ₹19,499/month | 0.5% online transaction fee (additional)              |

> **Note on Shopify transaction fees:** Shopify charges an "online
> transaction fee" on top of the payment gateway fee. If you use Shopify
> Payments (in India: Razorpay via Shopify), the fee is 2%/1%/0.5%
> depending on plan. If you use a third-party gateway, it's 2% extra.

### Detailed Comparison: 100 orders/month, AOV ₹4,000 (₹4L revenue)

| Cost Component                | Shopify Basic           | Payload Tier 0          | Payload Tier 1 | Payload Tier 2         |
| ----------------------------- | ----------------------- | ----------------------- | -------------- | ---------------------- |
| Platform/hosting              | ₹1,994                  | **₹0**                  | ₹670           | ₹7,900                 |
| Transaction fees              | 2% × ₹4,00,000 = ₹8,000 | 2% × ₹4,00,000 = ₹8,000 | ₹8,000         | ₹8,000                 |
| Email (transactional)         | Included                | ₹0                      | ₹0             | Included in $20 Resend |
| Email (marketing)             | Klaviyo: ₹1,500/mo      | Free tier               | Free tier      | Free tier              |
| Reviews app                   | Judge.me: ₹800/mo       | Free (Phase 2)          | Free (Phase 2) | Free (Phase 2)         |
| SMS                           | Shopify SMS: ₹500       | Pay per use (MSG91)     | Pay per use    | Pay per use            |
| Apps (avg)                    | ₹2,000–5,000            | ₹0                      | ₹0             | ₹0                     |
| **Total monthly**             | **~₹14,800**            | **~₹8,000**             | **~₹8,670**    | **~₹15,900**           |
| **Annual**                    | **~₹1,77,600**          | **~₹96,000**            | **~₹1,04,040** | **~₹1,90,800**         |
| **Annual savings vs Shopify** | —                       | **₹81,600**             | **₹73,560**    | -₹13,200               |

### Detailed Comparison: 500 orders/month, AOV ₹4,000 (₹20L revenue)

| Cost Component                | Shopify Basic             | Payload Tier 0                | Payload Tier 1 | Payload Tier 2 |
| ----------------------------- | ------------------------- | ----------------------------- | -------------- | -------------- |
| Platform/hosting              | ₹1,994                    | **₹0**                        | ₹670           | ₹7,900         |
| Transaction fees              | 2% × ₹20,00,000 = ₹40,000 | 2% × ₹20,00,000 = ₹40,000     | ₹40,000        | ₹40,000        |
| Email (transactional)         | Included                  | **₹0 (within 100/day limit)** | ₹0             | Included       |
| Email (marketing)             | Klaviyo: ₹1,500/mo        | Free tier                     | Free tier      | Free tier      |
| Reviews app                   | Judge.me: ₹800/mo         | Free (Phase 2)                | Free (Phase 2) | Free (Phase 2) |
| SMS                           | ~₹1,500                   | Pay per use                   | Pay per use    | Pay per use    |
| Apps (avg)                    | ₹3,000                    | ₹0                            | ₹0             | ₹0             |
| **Total monthly**             | **~₹48,800**              | **~₹40,000**                  | **~₹40,670**   | **~₹47,900**   |
| **Annual**                    | **~₹5,85,600**            | **~₹4,80,000**                | **~₹4,88,040** | **~₹5,74,800** |
| **Annual savings vs Shopify** | —                         | **₹1,05,600**                 | **₹97,560**    | **₹10,800**    |

> **⚠️ At 500 orders/month, Tier 0's free email tier (100/day) might be
> tight. Razorpay may send more transactional emails than 100/day during
> sale spikes. Plan to upgrade to Resend Pro or move to Tier 1/2.**

### Cost Trajectory — New Business 12-Month Forecast

**Assumed growth:** Month 1 = 20 orders, growing to 200 orders by month 12.
AOV: ₹4,000. Team: 1 founder initially, 2 by month 9.

| Month | Orders | Shopify Basic (₹/mo) | Payload Tier 0 (₹/mo) | Payload Tier 1 (₹/mo) | Payload Tier 2 (₹/mo) | Tier 0 Savings |
| ----- | ------ | -------------------- | --------------------- | --------------------- | --------------------- | -------------- |
| 1     | 20     | ₹3,594               | **₹1,600**            | ₹2,270                | ₹8,700                | **₹1,994**     |
| 3     | 60     | ₹5,394               | **₹4,800**            | ₹5,470                | ₹11,900               | **₹594**       |
| 6     | 100    | ₹7,994               | **₹8,000**            | ₹8,670                | ₹15,100               | **−₹6** ⚠️     |
| 9     | 150    | ₹11,994              | ₹12,000               | ₹12,670               | ₹19,100               | **−₹6** ⚠️     |
| 12    | 200    | ₹15,994              | ₹16,000               | ₹16,670               | ₹23,100               | **−₹6** ⚠️     |

**Observation:** At low order volumes, **Tier 0 saves you the Shopify
subscription** (₹1,994/mo) every month regardless of orders. As order
volume grows, the variable 2% transaction fee becomes the dominant cost
on both platforms — the savings shrink. At 200+ orders/month, the
fixed cost difference becomes negligible.

**At this point, the savings come from NOT paying Shopify's transaction
fees on top of Razorpay.** If you're on Shopify Basic, Shopify's 2% online
transaction fee is **on top of** the Razorpay 2% — so effective rate is
**4%** per transaction vs Payload's flat **2%**.

| Revenue | Shopify Effective Rate | Payload Rate        | Effective Saving |
| ------- | ---------------------- | ------------------- | ---------------- |
| ₹4L/mo  | 4% = ₹16,000 fees      | 2% = ₹8,000 fees    | **₹8,000/mo**    |
| ₹20L/mo | 4% = ₹80,000 fees      | 2% = ₹40,000 fees   | **₹40,000/mo**   |
| ₹80L/mo | 4% = ₹3,20,000 fees    | 2% = ₹1,60,000 fees | **₹1,60,000/mo** |

This is the **real** Payload cost advantage at scale.

### Break-Even Analysis

| Item                                            | Shopify   | Payload Tier 0    |
| ----------------------------------------------- | --------- | ----------------- |
| Monthly platform fee                            | ₹1,994    | ₹0                |
| Effective transaction rate (incl. Shopify fees) | 4%        | 2%                |
| **Annual fixed cost saving**                    | —         | **₹23,928/year**  |
| Custom dev cost (one-time)                      | ₹50K–1.5L | ₹3L–6L            |
| **Dev cost premium for Payload**                | —         | **+₹2L–4L**       |
| **Break-even point**                            | —         | **~12–24 months** |

The upfront dev cost premium is recovered within **1–2 years** of
operations. After that, Payload is significantly cheaper.

### When Each Option Wins

| Scenario                                      | Best Choice                  | Why                                     |
| --------------------------------------------- | ---------------------------- | --------------------------------------- |
| **New business, 0 orders, validating idea**   | **Payload Tier 0**           | ₹0/mo vs Shopify's ₹1,994/mo            |
| **Launch fast (< 4 weeks)**                   | **Shopify Basic**            | Pre-built checkout, less dev work       |
| **< 100 orders/month, custom product schema** | **Payload Tier 0 or 1**      | Saree-specific fields, no template lock |
| **100–500 orders/month, single admin**        | **Payload Tier 0 or 1**      | Cheaper than Shopify, scales            |
| **500–2000 orders/month, growing team**       | **Payload Tier 1 (Hetzner)** | Predictable cost, full control          |
| **2000+ orders/month, team > 5**              | **Payload Tier 2**           | Premium support, zero DevOps            |
| **International launch (NRI)**                | **Payload + Stripe**         | Multi-currency, lower fees than Shopify |
| **Strict < 2-week deadline**                  | **Shopify Basic**            | Faster to launch                        |
| **Non-technical client, no dev team**         | **Shopify Basic**            | Less ongoing maintenance                |

### Migration Costs

If you start on Shopify and want to move to Payload later:

- **Data export**: Shopify exports products, customers, orders as CSV — easy to import to Payload
- **URL redirects**: Map old `/products/slug` to new `/products/slug` via Payload Redirects plugin
- **Domain**: Point DNS to new server
- **Code rebuild**: Theme → custom Next.js components (1–2 weeks work)
- **Estimated migration cost**: ₹1,50,000–3,00,000 one-time

If you start on Payload and want to move to Shopify later:

- **Data export**: Postgres → CSV → Shopify import (straightforward)
- **URL redirects**: 301 redirects in Shopify admin
- **Checkout**: Replace custom Razorpay with Shopify Payments
- **Theme**: Build or buy Shopify theme (2–4 weeks)
- **Estimated migration cost**: ₹1,00,000–2,50,000 one-time

**Key takeaway:** Data is portable in both directions. The switching cost
is in rebuilding the UI, not the data.

### Final Recommendation for Shagya (New Business)

**Start on Payload Tier 0.** Here's why:

1. **Zero fixed cost** — every rupee saved is a rupee you can spend on
   marketing, photography, or inventory
2. **Validated business idea first** — don't commit to a platform before
   you know if customers will buy
3. **Saree-specific schema is critical** — Shopify's "Product" template is
   limiting for sarees (fabric, weave, work, occasion, blouse piece, etc.)
4. **Full ownership** — your data, your code, no vendor lock-in
5. **Migration paths exist** — you can move to Shopify later if you outgrow
   Payload, or scale within Payload tiers

**Path:**

- **Months 1–6**: Tier 0 ($0/mo) — launch, validate, build catalog
- **Months 6–12**: Tier 1 ($8/mo) — predictable cost, more control
- **Year 2+**: Tier 2 ($85/mo) — when team grows and revenue justifies it

By the time you reach Tier 2, the business should be generating enough
revenue that $85/month is a rounding error. Until then, every rupee
matters.

---

## 33. Launch Checklist

### Pre-Launch (1 week before)

- [ ] All collections + globals defined
- [ ] All products uploaded (with images, variants, categories, saree fields)
- [ ] All static pages live (About, FAQ, Size Guide, etc.)
- [ ] All meta titles + descriptions set (via SEO plugin)
- [ ] Structured data validated (Schema.org validator)
- [ ] Razorpay live keys configured
- [ ] Shiprocket account verified, API tested
- [ ] Resend domain verified, email templates tested
- [ ] SMS provider (MSG91/Twilio) configured
- [ ] Customer accounts tested
- [ ] Wishlist tested
- [ ] Search tested
- [ ] Newsletter signup tested
- [ ] Contact form tested (saves to DB + sends email)
- [ ] All email templates tested (deliverability + content)
- [ ] SMS notifications tested
- [ ] All policies linked in footer
- [ ] About Us + Contact pages complete
- [ ] Logo + favicon set
- [ ] Brand colors + typography applied
- [ ] Trust badges visible
- [ ] Social media links working
- [ ] Mobile responsive (tested on 3+ devices)
- [ ] Cross-browser tested
- [ ] Performance: Lighthouse >90 mobile, >95 desktop
- [ ] Accessibility: WCAG 2.1 AA
- [ ] SSL active
- [ ] 404 + error pages tested
- [ ] Sitemap + robots.txt live
- [ ] Google Search Console verified
- [ ] GA4 + Meta Pixel + PostHog verified
- [ ] Email sender authentication (SPF/DKIM) set
- [ ] Database backup configured
- [ ] Admin team trained
- [ ] Documentation written (how to add product, process order, etc.)

### Launch Day

- [ ] Final test order placed (all payment methods)
- [ ] Site accessible publicly
- [ ] All emails + SMS sending correctly
- [ ] Inventory levels accurate
- [ ] Monitoring active (Sentry, Vercel, PostHog)
- [ ] Support channels ready (email, WhatsApp)
- [ ] Announcement ready (social, email)

### Post-Launch (First week)

- [ ] Monitor daily analytics
- [ ] Respond to customer feedback
- [ ] Fix any reported bugs
- [ ] Monitor email deliverability
- [ ] Check order processing flow
- [ ] Verify shipping integrations

---

## 34. Post-MVP Roadmap

### Month 1–3

- [ ] Blog launch (Payload Posts collection)
- [ ] Product reviews & ratings
- [ ] Recently viewed products
- [ ] Live chat (Crisp or Tawk.to)
- [ ] Welcome email series
- [ ] Abandoned cart email flow
- [ ] Back-in-stock notifications
- [ ] A/B testing (Vercel Edge Config or PostHog)

### Month 3–6

- [ ] Custom blouse stitching service (with measurements form)
- [ ] International shipping (Stripe integration)
- [ ] Multi-currency display
- [ ] Gift wrapping option
- [ ] Combo bundles (saree + blouse)
- [ ] Loyalty program (custom collection + points logic)
- [ ] Referral program
- [ ] Hindi language support
- [ ] Algolia/Meilisearch upgrade
- [ ] 200+ SKU catalog

### Month 6–12

- [ ] Native mobile app (React Native + Payload API)
- [ ] AR/VR saree try-on
- [ ] 360° product viewer
- [ ] Video drape guides
- [ ] Bridal appointment booking
- [ ] Live commerce (Shopify-style shoppable videos)
- [ ] AI-powered recommendations (PostHog + ML)
- [ ] Subscription model (monthly saree)
- [ ] Marketplace (third-party sellers via multi-tenant)

---

## 35. Open Questions for Client

> ⚠️ These decisions block launch. Need client sign-off before implementation begins.

### Brand & Identity

- [ ] **Brand name** — Final brand name?
- [ ] **Domain** — `.in` or `.com`? (Both?)
- [ ] **Logo** — Ready? Need design?
- [ ] **Brand colors** — Preferred palette?
- [ ] **Brand story** — Founder background, inspiration, sourcing?
- [ ] **Tagline** — Need help crafting?

### Catalog

- [ ] **Initial product count** — How many SKUs at launch?
- [ ] **Photography ready?** — White background + model shots?
- [ ] **Product descriptions** — Client provides or need copywriting?
- [ ] **Pricing strategy** — Confirmed price range + discount %?
- [ ] **Inventory** — Stock ready? Where stored?

### Operations

- [ ] **Shipping partner** — Shiprocket or different?
- [ ] **Pickup location** — Where does Shiprocket pick up?
- [ ] **Fulfillment team** — In-house or 3PL?
- [ ] **Packaging** — Branded boxes ready?
- [ ] **Returns processing** — In-house?
- [ ] **Customer support** — Who handles? Hours?

### Payments & Legal

- [ ] **Business entity** — Registered? GST? (Required for Razorpay)
- [ ] **Bank account** — For Razorpay payouts
- [ ] **PAN card** — For Razorpay KYC
- [ ] **COD** — Accept COD? (Returns + cash management overhead)
- [ ] **Pricing inclusive of GST?** — Confirm tax display
- [ ] **TDS handling** — Confirm for designer payouts (if marketplace)

### Technical — Hosting Tier (CRITICAL DECISION)

> ⚠️ This decision affects monthly cost from day one. **Default
> recommendation: Tier 0 (free).** Confirm with client.

- [ ] **Starting tier** — Tier 0 ($0/mo, free tiers) / Tier 1 ($8/mo, Hetzner VPS) / Tier 2 ($85/mo, Vercel Pro + Neon Launch)?
- [ ] **If Tier 0**: Acceptable to have 1–2s cold start on Neon free tier? (Yes is recommended for MVP)
- [ ] **If Tier 1**: Does team have basic Linux sysadmin skills? (PM2, nginx, systemd)
- [ ] **If Tier 2**: Budget for $85+/mo fixed from day one? (Only if premium support is critical)
- [ ] **Database choice (per tier)** —
  - Tier 0: Neon free
  - Tier 1: Self-hosted Postgres on Hetzner
  - Tier 2: Neon Launch
- [ ] **File storage (per tier)** —
  - Tier 0: Vercel Blob (1 GB free)
  - Tier 1: Cloudflare R2 (free egress, scales with you) or local disk
  - Tier 2: Vercel Blob Pro or Cloudflare R2
- [ ] **Custom admin components** — Which are priority?
- [ ] **Bundle: shopify or custom in admin?** — Custom is more flexible
- [ ] **Migration plan** — What's the trigger to move between tiers? (e.g., >500 orders/mo → Tier 1)

### Technical — Better Auth Setup (CRITICAL DECISION)

> ⚠️ Better Auth is now part of the customer auth flow. Confirm
> the following before implementation.

- [ ] **Social providers for MVP** — Google only / Google + Facebook / Google + Facebook + Apple?
- [ ] **Phone OTP enabled in MVP?** — Requires MSG91 or Twilio account setup (recommended for India)
- [ ] **Magic link enabled in MVP?** — Passwordless email (recommended)
- [ ] **2FA enabled for customers in MVP?** — TOTP via Google Authenticator (can be opt-in)
- [ ] **Passkeys enabled in MVP?** — WebAuthn (recommend Phase 2, requires HTTPS)
- [ ] **Email provider for transactional** — Resend (recommended) / SendGrid / AWS SES?
- [ ] **SMS provider** — MSG91 (India-optimized) / Twilio (international)?
- [ ] **Email verification required at signup?** — Yes (recommended for fraud prevention)
- [ ] **Session duration** — 7 days (default) / 30 days / Custom?
- [ ] **Multi-session per user?** — Allow same user to be logged in on multiple devices (Phase 2)?
- [ ] **Better Auth admin plugin enabled?** — Separate dashboard for support team to manage customers?
- [ ] **Better Auth email templates** — Use defaults or design custom React Email templates?

### Marketing

- [ ] **Launch budget** — Paid ads for first 3 months?
- [ ] **Social media** — Active Instagram account?
- [ ] **Email list** — Existing customers to migrate?
- [ ] **Influencer partnerships** — Existing relationships?
- [ ] **PR** — Press contacts? Launch announcement?

### Timeline & Budget

- [ ] **Launch deadline** — Specific date?
- [ ] **Dev budget** — Comfortable with custom dev cost (~₹3-6L upfront)?
- [ ] **Ongoing dev** — Will need dev support post-launch (Payload + Next.js
      updates, security patches, new features) — budget ₹15–30k/month retainer
- [ ] **Photography budget** — If not ready
- [ ] **Content budget** — If not ready (descriptions, FAQs, etc.)

### International

- [ ] **International shipping in MVP?** — Or India-only for first 3 months?
- [ ] **NRI focus** — Target countries for Phase 2?
- [ ] **Multi-language?** — Hindi, Tamil, etc.?

---

## Appendix A: Tech Stack Summary (3 Tiers)

> Each layer has tier-appropriate choices. See Section 4 for the full
> tier comparison and Section 32 for cost analysis.

| Layer                        | Tier 0 (Free)                      | Tier 1 (Hetzner $8/mo)                    | Tier 2 (Managed $85/mo)                |
| ---------------------------- | ---------------------------------- | ----------------------------------------- | -------------------------------------- |
| **CMS**                      | Payload CMS 3.x                    | Payload CMS 3.x                           | Payload CMS 3.x                        |
| **Frontend**                 | Next.js 16 (App Router, Turbopack) | Next.js 16 (App Router, Turbopack)        | Next.js 16 (App Router, Turbopack)     |
| **Language**                 | TypeScript 5.7+ (strict)           | TypeScript 5.7+ (strict)                  | TypeScript 5.7+ (strict)               |
| **Hosting**                  | Vercel Hobby                       | Hetzner CX21 VPS                          | Vercel Pro                             |
| **Database**                 | Neon (free)                        | Self-hosted Postgres on Hetzner           | Neon Launch                            |
| **File Storage**             | Vercel Blob (1 GB free)            | Cloudflare R2 (free egress) or local disk | Vercel Blob Pro / R2                   |
| **Auth (Admin)**             | Payload built-in                   | Payload built-in                          | Payload built-in                       |
| **Auth (Customer)**          | Better Auth + plugins              | Better Auth + plugins                     | Better Auth + plugins                  |
| **CDN + DNS**                | Cloudflare (free)                  | Cloudflare (free)                         | Cloudflare (free)                      |
| **SSL**                      | Vercel (auto)                      | Let's Encrypt via Certbot                 | Vercel (auto)                          |
| **Payments (India)**         | Razorpay (2% per txn)              | Razorpay (2% per txn)                     | Razorpay (2% per txn)                  |
| **Payments (International)** | Stripe (Phase 2)                   | Stripe (Phase 2)                          | Stripe (Phase 2)                       |
| **Email (transactional)**    | Resend Free (100/day)              | Resend Free (100/day)                     | Resend Pro (50K/mo)                    |
| **Email (marketing)**        | Resend / Loops.so (free tier)      | Resend / Loops.so (free tier)             | Resend / Loops.so (free tier)          |
| **SMS**                      | MSG91 / Twilio (pay per use)       | MSG91 / Twilio (pay per use)              | MSG91 / Twilio (pay per use)           |
| **Search**                   | Postgres FTS                       | Postgres FTS                              | Postgres FTS (MVP) → Algolia (Phase 2) |
| **Forms**                    | Payload Form Builder plugin        | Payload Form Builder plugin               | Payload Form Builder plugin            |
| **SEO**                      | Payload SEO plugin                 | Payload SEO plugin                        | Payload SEO plugin                     |
| **Redirects**                | Payload Redirects plugin           | Payload Redirects plugin                  | Payload Redirects plugin               |
| **Image**                    | Vercel Image Optimization          | Next.js Image + Cloudflare                | Vercel Image Optimization              |
| **Styling**                  | Tailwind CSS v4 + shadcn/ui        | Tailwind CSS v4 + shadcn/ui               | Tailwind CSS v4 + shadcn/ui            |
| **Forms (frontend)**         | React Hook Form + Zod              | React Hook Form + Zod                     | React Hook Form + Zod                  |
| **State**                    | Zustand                            | Zustand                                   | Zustand                                |
| **Validation**               | Zod                                | Zod                                       | Zod                                    |
| **Testing**                  | Vitest + Playwright                | Vitest + Playwright                       | Vitest + Playwright                    |
| **Monitoring**               | Vercel Logs (free) / Sentry Free   | UptimeRobot + Hetzner logs                | Sentry Team                            |
| **Analytics**                | PostHog Free + GA4 + Meta Pixel    | PostHog Free + GA4 + Meta Pixel           | PostHog Free + GA4 + Meta Pixel        |
| **Shipping**                 | Shiprocket                         | Shiprocket                                | Shiprocket                             |
| **Linting**                  | ESLint + Prettier                  | ESLint + Prettier                         | ESLint + Prettier                      |
| **CI/CD**                    | Vercel auto-deploy                 | GitHub Actions + SSH                      | Vercel auto-deploy                     |
| **Backup**                   | Neon daily (7 days)                | Hetzner snapshot daily                    | Neon daily + PITR                      |

**Code is identical across all tiers.** Only deployment target and
infrastructure choices differ. Migration between tiers requires no code
changes.

## Appendix B: Reference Files

This plan is informed by research of 7 leading Indian saree e-commerce websites
plus Payload CMS best practices. Detailed findings are in `docs/research/`:

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

**Companion plan (alternative architecture)**:

- `shagya-shopify.md` — Same business requirements on Shopify stack

## Appendix C: Glossary

| Term                 | Definition                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------- |
| **D2C**              | Direct-to-Consumer — brand sells directly to end customers                                   |
| **Headless**         | Decoupled frontend/backend — backend exposes APIs, frontend is separate                      |
| **RSC**              | React Server Components — Next.js feature for server-rendered React                          |
| **ISR**              | Incremental Static Regeneration — static pages that revalidate on data change                |
| **PLP**              | Product Listing Page — category page with multiple products                                  |
| **PDP**              | Product Detail Page — single product page                                                    |
| **AOV**              | Average Order Value — average revenue per order                                              |
| **COD**              | Cash on Delivery — pay when item is delivered                                                |
| **UPI**              | Unified Payments Interface — Indian real-time payment system                                 |
| **GST**              | Goods and Services Tax — Indian consumption tax                                              |
| **MRP**              | Maximum Retail Price — printed price, used to show discount                                  |
| **KYC**              | Know Your Customer — identity verification for payment gateways                              |
| **3PL**              | Third-Party Logistics — outsourced fulfillment provider                                      |
| **NDR**              | Non-Delivery Report — when courier can't deliver                                             |
| **BOGO**             | Buy One Get One                                                                              |
| **CTA**              | Call to Action                                                                               |
| **UTM**              | Urchin Tracking Module — URL parameters for campaign tracking                                |
| **WCAG**             | Web Content Accessibility Guidelines                                                         |
| **PWA**              | Progressive Web App                                                                          |
| **Payload**          | Code-first headless CMS / Next.js fullstack framework                                        |
| **Collection**       | Payload's term for a database table                                                          |
| **Global**           | Payload's term for a singleton document (one instance, not many)                             |
| **Hook**             | Payload's middleware (beforeChange, afterChange, etc.)                                       |
| **Access Control**   | Payload's permission system (per field, document, operation)                                 |
| **Lexical**          | Payload's built-in rich text editor (by Meta)                                                |
| **Better Auth**      | TypeScript-first auth framework (50+ plugins) — handles customer auth                        |
| **OTP**              | One-Time Password — used in phone/email verification (Better Auth built-in)                  |
| **Passkey**          | WebAuthn-based passwordless auth using device biometrics (Better Auth plugin)                |
| **2FA**              | Two-Factor Authentication — TOTP via apps like Google Authenticator (Better Auth plugin)     |
| **Magic Link**       | Passwordless email login — click link in email to sign in (Better Auth plugin)               |
| **TOTP**             | Time-based One-Time Password — 6-digit code that rotates every 30s (RFC 6238)                |
| **OAuth**            | Open Authorization — sign in with Google, Facebook, Apple etc. (Better Auth socialProviders) |
| **WebAuthn**         | Web Authentication standard — basis for passkeys, uses device biometrics                     |
| **Turbopack**        | Next.js's Rust-based bundler (stable in Next 16, default)                                    |
| **React Compiler**   | Next.js 16+ feature for automatic memoization (replaces manual `useMemo`/`useCallback`)      |
| **Cache Components** | Next.js 16+ programming model using `'use cache'` directive + Partial Pre-Rendering          |
| **PPR**              | Partial Pre-Rendering — Next.js hybrid of static + dynamic rendering per route               |
| **pgvector**         | Postgres extension for vector similarity search (used in Postgres 18+ for AI features)       |
| **PostHog**          | Privacy-friendly product analytics                                                           |
| **Resend**           | Modern email API service                                                                     |
| **Neon**             | Serverless Postgres provider                                                                 |
| **Vercel Blob**      | Vercel's CDN-backed file storage                                                             |
| **Razorpay**         | Indian payment gateway                                                                       |
| **Shiprocket**       | Indian shipping aggregator                                                                   |
| **Saree**            | Traditional Indian garment — long fabric draped over body                                    |
| **Kanchipuram**      | South Indian silk weaving tradition                                                          |
| **Banarasi**         | North Indian silk weaving tradition (Varanasi)                                               |
| **Pallu**            | Decorative end-piece of a saree                                                              |
| **Blouse**           | Fitted top worn with saree                                                                   |
| **Petticoat**        | Underskirt worn under saree                                                                  |
| **Handloom**         | Fabric woven by hand (vs powerloom)                                                          |

---

## Document Status

- **Version**: 1.3
- **Last Updated**: June 2026
  - v1.1: Added 3-tier cost-optimized architecture (Section 4, 32, 35)
  - v1.2: Updated to Next.js 16, React 19.2, PostgreSQL 18, Node 22 LTS, Tailwind v4
  - v1.3: **Integrated Better Auth for customer auth** (Section 18) — hybrid approach with Payload admin auth
- **Tech versions pinned**: Next.js 16.2 · React 19.2 · Payload 3.x · Better Auth 1.x · PostgreSQL 18 · Node 22 LTS · TypeScript 5.7+ · Tailwind v4
- **Auth architecture**: Hybrid — Payload built-in for admin (`/admin`) + Better Auth for customers (`/account/*`)
- **Next Review**: After client sign-off on open questions (starting tier, Better Auth providers, SMS provider)
- **Owner**: Shagya delivery team
- **Client Sign-off**: Pending
- **Recommended starting tier**: **Tier 0** ($0/month — free tiers)
- **Companion**: `shagya-shopify.md` (alternative architecture)
