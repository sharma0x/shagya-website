# CLO-114: Remove conflicting custom API routes blocking Payload admin

## Overview

Deleted two custom API routes that only exported GET, blocking Payload admin from using other HTTP methods.

## Problem
- `products/[slug]/route.ts` only exported GET → blocked PATCH (product updates in admin)
- `coupons/active/route.ts` only exported GET → dead code (replaced by /coupons/available)
- Payload admin sent PATCH to /api/products/1 → Next.js routed to custom handler → 405

## Deleted files
- `src/app/api/products/[slug]/route.ts` (47 lines, dead code — PDP uses Payload SDK)
- `src/app/api/coupons/active/route.ts` (dead code — replaced by /coupons/available)

## No frontend impact
- PDP queries Payload SDK directly, not the REST API
- Checkout now uses /coupons/available, not /coupons/active
