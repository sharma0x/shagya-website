# CLO-44: Marketing Automation

## Overview

Implement abandoned cart recovery emails, sale/offer campaign banners, price drop alerts (notify me when price drops), and automated post-delivery review request emails.

## Stack Constraints

- **Frontend**: Next.js 16, existing cart store (Zustand), existing newsletter/email system
- **Backend**: Payload 3.x, Postgres, existing EmailLogs/EmailTemplates
- **Email**: Resend (prod) / Nodemailer+Mailpit (dev)
- **No new packages**: Use existing email infra, no third-party marketing services

## OOP / DRY Principles

- Abandoned cart: cron/background task NOT needed — send on next user login if cart has items
- Campaign banners: extend SiteSettings global (not a new collection)
- Price drop alerts: extend back-in-stock notification pattern from CLO-39
- Review emails: extend existing email system — new template + fire on `delivered` status
- All emails use existing `renderEmail()` + `EmailLogs` + `EmailTemplates` pipeline

## Acceptance Criteria

### 1. Abandoned Cart Emails
- [ ] Trigger: when a user with items in cart logs in after 24h+ inactivity
- [ ] Check `carts.lastActivity` timestamp — if > 24h, send reminder
- [ ] Email: "You left something behind" with cart items + prices + CTA button
- [ ] Only 1 reminder per cart (checked via flag on cart record or email log)
- [ ] Email template: use existing `EmailTemplates` collection + `defaults.ts`
- [ ] Simple approach: check on login (in auth-sync or login callback), NOT cron

### 2. Sale/Offer Campaign Banners
- [ ] SiteSettings: add `campaignBanners` array field
- [ ] Each banner: `title`, `subtitle`, `ctaText`, `ctaLink`, `bgColor`, `startDate`, `endDate`, `isActive`
- [ ] `<CampaignBanner />` component: shown on homepage + category pages when active
- [ ] Replaces/extends existing `announcementBar` (or shown below it)
- [ ] Admin can create multiple active banners — carousel if multiple

### 3. Price Drop Alerts
- [ ] Product detail page: "Notify me if price drops" button (shown always, not just out-of-stock)
- [ ] `src/app/api/products/notify-price-drop/route.ts` — POST: productId + email
- [ ] Trigger: on product update, if new basePrice < old basePrice, email all subscribers
- [ ] One-time: auto-delete subscription after first notification
- [ ] `src/collections/PriceAlerts.ts` — product relation, email, createdAt

### 4. Post-Delivery Review Emails
- [ ] Trigger: 3 days after order moves to `delivered` status (use a scheduled check or immediate delay)
- [ ] Email: "How do you like your {product}?" with star rating links
- [ ] Deep link: `/products/{slug}?review=true` — opens review form on product page
- [ ] Only send once per order (track via order flag or email log)
- [ ] Smart: send 1 email per order listing all products (not per-product spam)
- [ ] Email template: new template in `EmailTemplates` collection

### 5. Welcome Series (Optional)
- [ ] Post-registration: send welcome + coupon code after 1 day
- [ ] `src/email/send.ts` already has `sendWelcomeEmail` — enhance with coupon
- [ ] Create "WELCOME10" coupon auto-assigned to new customers
- [ ] Second email after 3 days: "Explore our collection" with top categories

## Technical Notes

### Files to Create
- `src/collections/PriceAlerts.ts`
- `src/app/api/products/notify-price-drop/route.ts`
- `src/components/marketing/CampaignBanner.tsx`

### Files to Modify
- `src/globals/SiteSettings.ts` — add `campaignBanners` array
- `src/lib/auth-sync.ts` — add abandoned cart check on login
- `src/email/send.ts` — add `sendAbandonedCartEmail`, `sendPriceDropAlert`, `sendReviewRequest`
- `src/email/defaults.ts` — add abandoned cart + review request templates
- `src/collections/EmailTemplates.ts` — add new template slugs
- `src/collections/Orders.ts` — add `reviewRequestSent` boolean, `priceDropAlertsSent` boolean
- `src/collections/Products.ts` — add `priceDropAlerts` hook in afterChange
