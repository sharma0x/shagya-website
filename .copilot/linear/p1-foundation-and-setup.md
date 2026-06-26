# P1: Foundation & Setup

**Summary:** Next.js 16 + Payload 3.x + Postgres + Tailwind v4 + CI/CD — Cycle 1

## Issues

### CLO-3: Initialize Next.js 16 + Payload 3.x Project

**Priority:** Urgent | **Status:** Done | **Labels:** DevOps, Frontend, Backend
**Estimate:** 3 Points

Scaffold project with `create-payload-app`. Pin versions (next ^16.2, react ^19.2, payload ^3.x, typescript ^5.7, tailwind ^4.0). TypeScript strict. Tailwind v4 + shadcn/ui. ESLint + Prettier.

---

### CLO-4: Set up Postgres 18 (Neon for Tier 0/2)

**Priority:** Urgent | **Status:** Done | **Labels:** Database, DevOps, Backend
**Estimate:** 3 Points

Provision Postgres 18 on Neon. DATABASE_URL in .env. Connection pooling via PgBouncer. Test connection.

---

### CLO-5: Set up Vercel Blob (or Cloudflare R2)

**Priority:** High | **Status:** Done | **Labels:** DevOps, Backend
**Estimate:** 2 Points

Configure file storage for images. Vercel Blob for Tier 0/2. Image sizes: thumbnail(400×500), card(600×750), product(1200×1500), hero(1920×800).

---

### CLO-6: Configure Environment Variables + Secrets

**Priority:** Urgent | **Status:** Done | **Labels:** Security, DevOps
**Estimate:** 2 Points

Document all env vars in .env.example. Generate PAYLOAD_SECRET + BETTER_AUTH_SECRET (openssl rand -base64 32). Add .env to .gitignore. Configure Vercel env vars.

---

### CLO-7: Set up payload.config.ts (DB + Storage + Admin)

**Priority:** Urgent | **Status:** Done | **Labels:** Backend
**Estimate:** 3 Points

Configure @payloadcms/db-postgres, @payloadcms/storage-vercel-blob, admin branding, CORS for Next.js, Sharp image processing.

---

### CLO-8: Set up CI/CD Pipeline (GitHub + Vercel)

**Priority:** High | **Status:** Done | **Labels:** DevOps
**Estimate:** 3 Points

GitHub repo + Vercel project link. Preview deploys on PR. Production deploys on main. DB migrations on build (pnpm payload migrate).

---

### CLO-9: Configure Cloudflare DNS + CDN

**Priority:** High | **Status:** Backlog | **Labels:** Security, DevOps
**Estimate:** 2 Points

Add domain, DNS records, SSL Full (strict), proxy enabled, DDoS protection, DNSSEC.

---

### PRI-54: Set up Postgres 18 (Neon for Tier 0/2)

**Priority:** Urgent | **Status:** Done | **Labels:** DevOps, Database, Backend
**Estimate:** 3 Points

**Description:**
Provision a Postgres 18 database on Neon (free tier for Tier 0). Configure DATABASE_URL in .env.example and local .env. Test connection.

**Acceptance Criteria:**

- [ ] Neon account created
- [ ] Database created (Postgres 18)
- [ ] `DATABASE_URL` in `.env.example` and `.env`
- [ ] Connection tested locally
- [ ] Connection pooling configured (PgBouncer via Neon)

**Sub-issues:**

- PRI-111: Provision Neon Postgres database
- PRI-112: Document DATABASE_URL format in .env.example

---

### PRI-55: Set up Vercel Blob (or Cloudflare R2)

**Priority:** High | **Status:** Done | **Labels:** DevOps, Backend
**Estimate:** 2 Points

**Description:**
Configure file storage for product images, banners, blog images. Use Vercel Blob for Tier 0/2, or Cloudflare R2 for Tier 1 (self-hosted, zero egress).

**Acceptance Criteria:**

- [ ] Vercel Blob (or R2) bucket created
- [ ] `@payloadcms/storage-vercel-blob` configured in payload.config.ts
- [ ] Image upload to admin works
- [ ] Image sizes (thumbnail, card, product, hero) configured

---

### PRI-56: Configure Environment Variables

**Priority:** Urgent | **Status:** Done | **Labels:** Security, DevOps
**Estimate:** 2 Points

**Description:**
Document all required environment variables in `.env.example`. Generate secrets. Add `.env` to `.gitignore`. Configure Vercel environment variables for production.

**Acceptance Criteria:**

- [ ] `.env.example` documents all required variables
- [ ] `.env` in `.gitignore`
- [ ] Vercel environment variables configured
- [ ] Secrets generated (`PAYLOAD_SECRET`, `BETTER_AUTH_SECRET`)

**Required Variables:**

- `DATABASE_URL`
- `PAYLOAD_SECRET`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `RESEND_API_KEY`
- `MSG91_AUTH_KEY`

---

### PRI-57: Set up payload.config.ts

**Priority:** Urgent | **Status:** Done | **Labels:** Backend
**Estimate:** 3 Points

**Description:**
Configure payload.config.ts with database adapter, storage plugin, admin panel customization, CORS, and image processing.

**Acceptance Criteria:**

- [ ] DB adapter (`@payloadcms/db-postgres`) configured
- [ ] Storage plugin (`@payloadcms/storage-vercel-blob`) configured
- [ ] Admin panel customization (title, branding, logo)
- [ ] CORS configured for Next.js
- [ ] Sharp image processing enabled
- [ ] Typescript output generated

---

### PRI-58: Set up CI/CD Pipeline

**Priority:** High | **Status:** Done | **Labels:** DevOps
**Estimate:** 3 Points

**Description:**
Set up GitHub repo, Vercel project link, preview deployments on PR, production deploys on main, database migrations on build.

**Acceptance Criteria:**

- [ ] GitHub repo created
- [ ] Vercel project linked
- [ ] Preview deployments on PR
- [ ] Production deploys on `main`
- [ ] Database migrations run on build (`pnpm payload migrate`)
- [ ] Environment variables synced

---

### PRI-59: Configure Cloudflare DNS + CDN

**Priority:** High | **Status:** Backlog | **Labels:** Security, DevOps
**Estimate:** 2 Points

**Description:**
Add domain to Cloudflare, configure DNS records, set SSL to Full (strict), enable proxy for DDoS protection.

**Acceptance Criteria:**

- [ ] Domain added to Cloudflare
- [ ] DNS records configured (A, CNAME)
- [ ] SSL/TLS set to Full (strict)
- [ ] Proxy enabled (orange cloud)
- [ ] DDoS protection active
- [ ] DNSSEC enabled

---

### PRI-60: Create Base Layout (Header + Footer Placeholders)

**Priority:** High | **Status:** Done | **Labels:** Frontend
**Estimate:** 3 Points

**Description:**
Build the root layout with placeholder Header and Footer components. Full designs come in P3.

**Acceptance Criteria:**

- [ ] Root layout with header + footer
- [ ] Header has logo, nav placeholder, search, account, cart icons
- [ ] Footer has policy links + social + payment icons
- [ ] Mobile responsive
