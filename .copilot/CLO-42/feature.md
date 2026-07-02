# CLO-42: Order Management Features

## Overview

Add shipment tracking, customer self-service cancellation, returns/RMA workflow, GST invoice PDF generation, and one-click reorder functionality.

## Stack Constraints

- **Frontend**: Next.js 16 App Router, React 19, existing order detail page
- **Backend**: Payload 3.x, existing Orders/EventLogs collections
- **Email**: Existing email system (Resend/Nodemailer)
- **No new packages**: Use existing infrastructure

## OOP / DRY Principles

- Tracking info stored on Orders collection (add `tracking` group field)
- Cancel + returns: status transitions with validation (`canTransition(from, to)`)
- Reorder: reuses existing cart store + add-to-cart logic
- Invoice: server-side PDF generation, stored on media collection
- All order mutations log to EventLogs (existing pattern)

## Acceptance Criteria

### 1. Shipment Tracking
- [ ] Orders collection: add `tracking` group: `carrier` (select), `trackingNumber` (text), `trackingUrl` (text), `shippedAt` (date)
- [ ] Admin: set tracking info when moving order to `shipped` status
- [ ] Auto-generate tracking URL based on carrier (BlueDart/Delhivery/FedEx/DHL/IndiaPost)
- [ ] Customer order detail: "Track Shipment" button → opens carrier URL
- [ ] Order shipped email: includes tracking number + link
- [ ] Order detail page: visual status timeline (pending → confirmed → processing → shipped → delivered)

### 2. Customer Order Cancellation
- [ ] Order detail page: "Cancel Order" button (only for pending/confirmed status)
- [ ] Confirmation dialog with reason selection
- [ ] `PUT /api/orders/[id]/cancel` — validates ownership + status eligibility
- [ ] Auto-refund trigger via Razorpay if payment was captured
- [ ] Cancel email to customer + admin
- [ ] EventLog entry

### 3. Returns / RMA
- [ ] Create `returns` collection: `order` (relation), `items` (array), `reason`, `status` (requested/approved/rejected/received/refunded), `refundAmount`
- [ ] Order detail page: "Request Return" button (only for delivered status, within 7 days)
- [ ] RMA flow: request → admin review → approve/reject → customer ships back → admin marks received → refund
- [ ] Return status emails at each step
- [ ] Returns page under `/account/returns`

### 4. Invoice Download
- [ ] Orders collection: auto-generate GST invoice on order confirmation
- [ ] `src/lib/invoice.ts` — generate invoice HTML → PDF using existing email HTML builder pattern
- [ ] Store invoice URL on order record
- [ ] Order detail page: "Download Invoice" button
- [ ] Order confirmation email: attach or link to invoice

### 5. Reorder
- [ ] Order detail page: "Reorder" button (for delivered orders)
- [ ] Click: adds all order items to cart (with same variants)
- [ ] Validates items still exist + in stock
- [ ] Toast/notification: "X items added to cart"
- [ ] Redirect to cart

### 6. Order Status Timeline
- [ ] `<OrderTimeline />` component — visual progress bar
- [ ] Steps: Placed → Confirmed → Processing → Shipped → Delivered
- [ ] Current step highlighted, completed steps green
- [ ] Shown on: order detail page, order confirmation page

## Technical Notes

### Files to Create
- `src/collections/Returns.ts` — new returns collection
- `src/app/api/orders/[id]/cancel/route.ts`
- `src/app/api/returns/route.ts` + `src/app/api/returns/[id]/route.ts`
- `src/lib/invoice.ts` — GST invoice generator
- `src/components/order/OrderTimeline.tsx` — visual tracker
- `src/app/(frontend)/account/orders/[id]/return/page.tsx` — return request page
- `src/app/(frontend)/account/returns/page.tsx` — returns list

### Files to Modify
- `src/collections/Orders.ts` — add `tracking` group, `notes`, `gstin`, `needsInvoice`
- `src/app/(frontend)/account/orders/[id]/page.tsx` — add cancel/reorder/invoice buttons, timeline
- `src/email/send.ts` — add return/cancel/tracking email triggers
- `src/email/defaults.ts` — add return/cancel email templates
- `src/collections/EmailTemplates.ts` — add return/cancel template slugs
