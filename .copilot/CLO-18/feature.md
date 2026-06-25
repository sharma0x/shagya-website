# CLO-18: Create Coupons / Discounts collection

## Overview

A Coupons collection for managing discount codes in the Shagya saree ecommerce platform. Supports percentage, fixed amount, and free shipping discount types with cart validation, usage tracking, and date-based expiry.

## Acceptance Criteria

- [ ] Coupons collection with unique code field
- [ ] Discount type select: percentage, fixed_amount, free_shipping
- [ ] Discount value (required for percentage and fixed_amount types)
- [ ] Minimum cart value for coupon applicability
- [ ] Maximum discount cap (for percentage coupons)
- [ ] Usage limit (total uses allowed) and used_count (auto-tracked)
- [ ] Date range: start_date and end_date for coupon validity
- [ ] Conditions support: restrict by categories, products, or customers
- [ ] Active/inactive status toggle
- [ ] Registered in payload.config.ts
- [ ] Unit tests covering field types, validation, and defaults

## Technical Notes

- New file: `src/collections/Coupons.ts`
- Code field is text, unique, indexed (case-insensitive lookup via hook)
- Type uses Payload select field
- Date fields use Payload date field type
- Conditions use relationship fields (hasMany: true) to categories/products/customers
- used_count starts at 0 and is auto-incremented (hook or programmatic)

## Field Schema

| Field                | Type         | Required    | Default      | Notes                                     |
| -------------------- | ------------ | ----------- | ------------ | ----------------------------------------- |
| code                 | text         | yes         | —            | unique, indexed                           |
| type                 | select       | yes         | 'percentage' | percentage / fixed_amount / free_shipping |
| value                | number       | conditional | —            | required for percentage + fixed           |
| minCartValue         | number       | no          | 0            | min cart total to apply                   |
| maxDiscount          | number       | no          | —            | cap for percentage coupons                |
| usageLimit           | number       | no          | —            | max total uses                            |
| usedCount            | number       | no          | 0            | auto-incremented                          |
| startDate            | date         | no          | —            | coupon valid from                         |
| endDate              | date         | no          | —            | coupon valid until                        |
| isActive             | checkbox     | no          | true         | manual on/off switch                      |
| categoriesConditions | relationship | no          | —            | restrict to categories                    |
| productsConditions   | relationship | no          | —            | restrict to products                      |
| customersConditions  | relationship | no          | —            | restrict to customers                     |
