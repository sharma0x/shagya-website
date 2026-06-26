# P8: Testing, QA & Launch

**Summary:** Tests, performance, accessibility, launch — Cycles 6-7

## Issues

### CLO-71: Performance optimization (Lighthouse, Core Web Vitals)

**Priority:** High | **Status:** Backlog
**Description:** Lighthouse audit target: Performance >90, Accessibility >95, SEO >95, Best Practices >95. Image optimization (next/image, WebP, responsive sizes, lazy loading). Bundle analysis + code splitting. Font loading optimization. Core Web Vitals.

### CLO-72: Security headers + CSP + rate limiting

**Priority:** Urgent | **Status:** Backlog
**Description:** Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options). CSP policy for Razorpay, Google, Facebook scripts. Vercel headers config or next.config.js. Rate limiting on API routes. Input sanitization.

### CLO-76: Sentry error + performance monitoring

**Priority:** High | **Status:** Backlog
**Description:** Setup Sentry for error tracking. Source maps upload. Performance monitoring. Error grouping for backend (API routes) and frontend (React error boundaries). Alert on critical errors.

### CLO-77: Load testing (k6)

**Priority:** Medium | **Status:** Backlog
**Description:** Load testing with k6. Scenarios: homepage, product listing, search, checkout flow. Baseline metrics: <500ms P95, <1% error rate. Test under concurrent users (10/50/100/200). Fix bottlenecks.

### CLO-78: Production deployment runbook

**Priority:** High | **Status:** Backlog
**Description:** Deployment runbook: Tier 0 (Vercel + Neon + Blob + Resend + Cloudflare). Environment variable checklist. Migration run on deploy. Health check endpoint. Rollback procedure. Monitoring dashboard. DNS propagation check.

### CLO-79: Launch checklist + go-live validation

**Priority:** Urgent | **Status:** Backlog
**Description:** Launch checklist: Domain DNS verified, SSL green, CDN active, Payment test mode verified, Email delivery test, SMS delivery test, Search working, Sitemap submitted to GSC, GA4 events verified, FB Pixel firing, Lighthouse scores met, Error monitoring active, Load test passed, Backup strategy confirmed.
