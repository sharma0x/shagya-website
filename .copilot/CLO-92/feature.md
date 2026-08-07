# CLO-92: Neon seed — products, variants, coupons, categories

## Overview

Comprehensive seed script for the Neon production database with gallery image fix.

## Seeded data
- 6 categories: Silk, Cotton, Banarasi, Wedding, Festive, Daily Wear
- 15 products across silk, cotton, blend, crepe fabrics with 9 weaves
- 39 color variants (2-4 per product)
- 1 test customer: test@shayga.com
- 6 coupons: categoriesConditions, productsConditions, customersConditions, public

## Gallery fix
- Image pool from 9 unique media images in existing products (IDs 1, 3, 5)
- Random 3-4 images copied to each new product (IDs 24-36)
- No identical image sets between products

## Files
- `scripts/seed-neon.ts`
- `scripts/fix-seed-data.ts`
