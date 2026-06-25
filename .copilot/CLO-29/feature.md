# CLO-29: Better Auth ↔ Payload hybrid auth integration

## Overview

Customer table shared between Better Auth and Payload. Better Auth manages credentials/sessions; Payload admin sees read-only customer data. Sync on register. Customer collection in Payload linked via better-auth user ID.

## Acceptance Criteria

- [ ] Create Customers collection in Payload with betterAuthUserId field
- [ ] Sync: when Better Auth creates user, auto-create Customer via Payload Local API
- [ ] Customer fields: name, email, phone, betterAuthUserId (unique)
- [ ] Payload admin: read-only view of customer data
- [ ] Registered in payload.config.ts
- [ ] Unit tests for Customers collection and sync hook
