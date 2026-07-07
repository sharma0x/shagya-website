# CLO-49: Performance & SEO

## Overview

Implement sitemap.xml auto-generation, robots.txt, JSON-LD structured data for products, image optimization (WebP/AVIF), PWA support with service worker, and bundle optimization.

## Stack Constraints

- **Frontend**: Next.js 16 App Router
- **Images**: sharp (already installed), Payload media with S3/R2 storage
- **SEO**: Payload SEO plugin (already configured)
- **PWA**: Next.js built-in PWA support or next-pwa
- **No new heavy packages**: Use native platform features where possible

## OOP / DRY Principles

- Sitemap: Next.js `sitemap.ts` convention (dynamic, reads from Payload)
- Robots.txt: static file in `public/` or Next.js `robots.ts`
- Structured data: `<script type="application/ld+json">` in page head — reusable JSON-LD builder
- Image optimization: configure Payload media sizes + next/image config
- PWA: single manifest + service worker file

## Acceptance Criteria

### 1. Sitemap.xml
- [ ] `src/app/sitemap.ts` — Next.js convention, auto-generated
- [ ] Includes: homepage, all product pages, all blog posts, all CMS pages, all categories, all collections
- [ ] LastMod: product.updatedAt, changefreq: daily (products) / weekly (pages) / monthly (blog)
- [ ] Priority: 1.0 (homepage), 0.9 (products), 0.7 (categories), 0.5 (blog/pages)
- [ ] Max 50,000 URLs per sitemap (well within for current scale)
- [ ] Auto-submitted to Google via next.config or manual

### 2. Robots.txt
- [ ] `src/app/robots.ts` — Next.js convention
- [ ] Allow: all product pages, categories, blog
- [ ] Disallow: `/admin`, `/api`, `/account`, `/checkout`, `/cart`
- [ ] Sitemap URL reference

### 3. JSON-LD Structured Data
- [ ] `src/lib/structured-data.ts` — JSON-LD builders
- [ ] Product pages: `Product` schema (name, image, price, availability, description)
- [ ] Blog pages: `Article` schema (headline, author, datePublished, image)
- [ ] Homepage: `WebSite` + `Organization` schema
- [ ] BreadcrumbList on category/product pages
- [ ] Injected via `<script>` tag in page head metadata

### 4. Image Optimization
- [ ] next.config.ts: configure `images.formats = ['image/avif', 'image/webp']`
- [ ] Payload media sizes: already have thumbnail(400), card(600), product(1200), hero(1920)
- [ ] Next.js Image component: use everywhere (replace any remaining `<img>` tags)
- [ ] Lazy loading: all images below fold use `loading="lazy"` or `priority={false}`
- [ ] Blur placeholder: generate base64 blur hash via Payload media hook

### 5. PWA Support
- [ ] `public/manifest.json` — app manifest (name, icons, theme_color, background_color)
- [ ] `public/sw.js` or `src/app/sw.ts` — simple service worker for offline caching
- [ ] Cache strategy: network-first for pages, cache-first for images/static assets
- [ ] Install prompt: minimal, no aggressive banner
- [ ] Icons: generate PWA icons from logo (192x192, 512x512)
- [ ] Theme color: brand wine/maroon

### 6. Performance Optimization
- [ ] next.config.ts: enable `compress: true` (gzip in Vercel)
- [ ] Font optimization: next/font already configured for Sora + Public Sans
- [ ] Remove unused CSS: Tailwind v4 purge is automatic
- [ ] Script loading: use `next/script` with `strategy="lazyOnload"` for Razorpay SDK
- [ ] Bundle analysis: add `ANALYZE=true` support via `@next/bundle-analyzer` (dev dependency)

## Technical Notes

### Files to Create
- `src/app/sitemap.ts`
- `src/app/robots.ts`
- `src/lib/structured-data.ts`
- `public/manifest.json`
- `public/sw.js`

### Files to Modify
- `next.config.ts` — add image formats, compress, PWA headers
- `src/app/(frontend)/layout.tsx` — add manifest link
- `src/app/(frontend)/products/[slug]/page.tsx` — add JSON-LD
- `src/app/(frontend)/blog/[slug]/page.tsx` — add JSON-LD
- `package.json` — add `@next/bundle-analyzer` as devDependency
