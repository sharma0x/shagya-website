# Delhivery Integration Runbook

Integration scope: **Delhivery One API** (prepaid and COD) for Shayga order fulfilment —
waybill generation, shipment creation, label generation, pickup request, and webhook status sync.

## Architecture

- Payment mode is derived from `paymentId`: `COD` orders are sent with
  `payment_mode: 'COD'` and `cod_amount` equal to the order total; all other
  payment IDs are sent as prepaid.
- Waybill & shipment requests are issued from the order "ship" endpoint; fulfilment and
  tracking endpoints are closed-loop (not exposed publicly).
- Delhivery pushes delivery updates to our webhook; we translate scans to order statuses
  and write an idempotent audit trail into `event-logs`.

```
Admin / API ──> POST /api/orders/:id/delhivery/ship ──> Delhivery One API
                                                            │
Admin ───────> GET /api/orders/:id/delhivery/{label,pickup,track,sync}
                                                            │
Delhivery ───> POST /api/webhooks/delhivery ──> update order.status + event-logs
```

## Files

| Area                 | Files                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------- |
| Config & client      | `src/lib/delhivery/config.ts`, `src/lib/delhivery/client.ts`                              |
| Domain types         | `src/lib/delhivery/types.ts`                                                              |
| Shipment creation    | `src/lib/delhivery/shipping.ts`, `src/lib/delhivery/ship-order.ts`                        |
| Fulfilment           | `src/lib/delhivery/fulfillment.ts`                                                        |
| Webhook sync         | `src/lib/delhivery/mapping.ts`, `src/lib/delhivery/webhook-processor.ts`                  |
| Route                | `src/app/api/webhooks/delhivery/route.ts`                                                 |
| Collection endpoints | `src/collections/Orders.ts` (group + 5 endpoints)                                         |
| Tests                | `src/lib/delhivery/__tests__/*`, `src/app/api/webhooks/delhivery/__tests__/route.test.ts` |

## Delhivery settings

Environment variables (see `.env.example` placeholders — real values live only in
`.env` / `.env.staging`, both gitignored):

| Variable                                           | Purpose                                                                                  |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `DELHIVERY_API_TOKEN`                              | One Panel API token                                                                      |
| `DELHIVERY_MODE`                                   | `test` → `https://staging-express.delhivery.com`, `prod` → `https://track.delhivery.com` |
| `DELHIVERY_PICKUP_PIN`                             | Pickup pincode (default `400068`, Mumbai)                                                |
| `DELHIVERY_WEBHOOK_SECRET`                         | Shared secret configured by Delhivery in the `x-delhivery-signature` header              |
| `DELHIVERY_CLIENT_NAME` / `DELHIVERY_SELLER_EMAIL` | Consignee/seller identity in shipment JSON                                               |

Pickup location name is `SHAYGA B2C` (configured in the One Panel under
`Settings → API setup`; also referenced by pickup requests).

## Endpoints

All under `/api/orders/:id/delhivery/...` (collection endpoints — user session required):

- `POST …/ship` — validate order, fetch waybill, create shipment, set `shipped`,
  store `delhivery.waybill`. Guards: status `confirmed`, payment method present,
  total < ₹50,000
  (ewaybill exemption; higher amounts must be manifested in One Panel), no existing waybill,
  complete address. Unit weight fallback **500 g** (products have no weight field).
- `GET …/label` — 4R PDF packing-slip URL.
- `POST …/pickup` — schedule pickup for packaged orders.
- `GET …/track` — live tracking via `track.delhivery.com` lookup.
- `POST …/sync` — re-run status mapping for an existing waybill.

## Webhook

- URL to register with Delhivery (`lastmile-integration@delhivery.com`):
  `https://<host>/api/webhooks/delhivery` (production: Shayga domain).
- Header `x-delhivery-signature` is the shared value configured with Delhivery
  and is compared with `crypto.timingSafeEqual`. Missing/invalid header → `401`.
- Unknown waybill → `200` + `delhivery.webhook_orphan` audit row (never a 404, so
  Delhivery stops retrying, and we keep a record to reconcile).
- Status updates are guarded against duplicate or regressing transitions and use
  `overrideAccess: true` (orders `update` access requires a session).

## Status mapping (`mapping.ts`)

| `status_type` | `status`                                | Order status change             |
| ------------- | --------------------------------------- | ------------------------------- |
| `UD`          | `IN TRANSIT` / `PENDING` / `DISPATCHED` | → `shipped`                     |
| `DL`          | `DELIVERED`                             | → `delivered`                   |
| `DL`          | `RTO`                                   | audit only, no automatic change |
| `CN`          | `CANCELED` / `CLOSED`                   | → `cancelled`                   |
| anything else | —                                       | audit only, no status change    |

`s/RTO` updates are logged but do **not** change order status automatically
(return handling requires manual refund action).

## Failure modes & ops actions

| Symptom                                      | Cause / action                                                                                                                                |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Ship returns `401 Login or API Key Required` | Token missing/wrong, or using test base with a prod token (staging base rejects direct token calls; test E2E only via `DELHIVERY_MODE=prod`). |
| Ship fails validation                        | Check order status, `paymentId`, total < ₹50,000, and complete `shippingAddress`.                                                             |
| Order stuck `pending` / no waybill           | `delhivery.ship_failed` row in `event-logs` — read `payload.response`.                                                                        |
| Webhook `401`                                | Verify `DELHIVERY_WEBHOOK_SECRET` matches the token registered with Delhivery.                                                                |
| Webhook returns `200` but order unchanged    | Scan mapped to audit-only (`/RTO`, unknown type) or status already current — check `event-logs`.                                              |

## Onboarding checklist (production go-live)

- [ ] Add the `x-delhivery-signature` shared value to Delhivery's requirement
      document + verify the `POST /api/webhooks/delhivery` route responds `200`
      to a signed test request.
- [ ] Register webhook URL with `lastmile-integration@delhivery.com`.
- [ ] Register `SHAYGA B2C` pickup location (name + default pincode) in One Panel.
- [ ] Set `DELHIVERY_CLIENT_NAME` / `DELHIVERY_SELLER_EMAIL` in production env.
- [ ] Place a real prepaid order → ship → label → pickup → track.
- [ ] Raise the ₹50,000 ewaybill threshold only after One-Panel manifest flow is verified.
