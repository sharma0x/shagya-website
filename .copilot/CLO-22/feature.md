# CLO-22: Create Reviews / Ratings collection

## Overview

Reviews collection for customer product reviews. Links to customers, products, and variants. Includes rating (1-5), written review, images, verified purchase flag, and admin moderation workflow.

## Acceptance Criteria

- [ ] Reviews collection with customer, product, variant relationships
- [ ] Rating field (number, 1-5, required)
- [ ] Title, body, images fields
- [ ] verifiedPurchase boolean (auto-set from orders)
- [ ] Status: pending/approved/rejected (admin moderation)
- [ ] Registered in payload.config.ts
- [ ] Unit tests for all fields and status workflow
