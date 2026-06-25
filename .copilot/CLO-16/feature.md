# CLO-16: Create Orders + Order Items collections

## Overview

Orders: order_number (auto), customer_email, phone, status (pending/confirmed/processing/shipped/delivered/cancelled/refunded), subtotal, shipping, tax, discount, total, payment_id, shipping_address, billing_address. Order Items: product_ref, variant_ref, quantity, unit_price, total_price.

## Acceptance Criteria

- [ ] Orders collection with auto-generated sequential order_number
- [ ] Status select with 7 options
- [ ] Financial fields: subtotal, shipping, tax, discount, total (all number, min=0)
- [ ] payment_id text field
- [ ] Addresses as group/object fields: shipping_address, billing_address (full_name, phone, line1, line2, city, state, pincode, country)
- [ ] Order Items as array field with product relationship, variant relationship, quantity, unit_price, total_price
- [ ] Registered in payload.config.ts
- [ ] Unit tests covering all fields

## Technical Notes

- Order number: auto-incremented via beforeChange hook (query max existing + 1)
- Order items: use Payload `array` field type (not separate collection for simpler data management)
- Address: use Payload `group` field for structured address data
- Status transitions could use hooks later; for now just select field
