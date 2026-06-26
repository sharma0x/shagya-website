# CLO-33: Webhooks + Event Logging

## Overview

Webhook endpoints for order events using Payload afterChange hooks. Event log collection for audit trail.

## Acceptance Criteria

- [ ] EventLog collection to record all events
- [ ] afterChange hook on Orders to fire webhooks on status change
- [ ] Webhook utility: POST to configured URLs with retry
- [ ] Registered in payload.config.ts
