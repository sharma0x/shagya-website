# P4: Cart & Checkout

**Summary:** Cart logic, multi-step checkout, Razorpay, COD — Cycles 3-5

## Issues

### CLO-50: Cart state (zustand store, localStorage, API sync)

**Priority:** Urgent | **Status:** Backlog
**Description:** Cart state management (zustand). Persistent (localStorage for guests, server for logged-in). Add/remove/update quantity. Coupon apply. Cart count in header badge. Sync between tabs.

### CLO-51: Cart page (items, coupon, totals)

**Priority:** Urgent | **Status:** Backlog
**Description:** Full cart page: item list with images, quantity +/- , remove, subtotal per item. Coupon input + apply. Order summary sidebar (subtotal, discount, shipping, tax, total). Proceed to checkout CTA. Empty cart state.

### CLO-52: Mobile cart sheet (drawer)

**Priority:** High | **Status:** Backlog
**Description:** Mobile cart slide-out drawer. Shows cart items mini, total, checkout CTA. Trigger from header cart icon. Swipe to dismiss.

### CLO-53: Checkout page (shipping, review, payment steps)

**Priority:** Urgent | **Status:** Backlog
**Description:** 3-step checkout: Shipping (select/edit address), Review (order summary, coupon), Payment (Razorpay). Address auto-suggest for pincode. Order notes. Progress stepper.

### CLO-54: Razorpay payment integration

**Priority:** Urgent | **Status:** Backlog
**Description:** Razorpay integration. Server-side order creation (Razorpay API), client-side checkout.js modal. Webhook handler for payment success/failure. Refund API. Test mode vs live mode. Staging: Razorpay test keys.

### CLO-55: Order confirmation / thank-you page

**Priority:** Urgent | **Status:** Backlog
**Description:** Post-payment page. Order number, success animation, order summary, shipping info. Email + SMS confirmation sent. "Continue shopping" and "View order" CTAs. Failure/retry page if payment declined.

### CLO-56: Guest checkout flow

**Priority:** High | **Status:** Backlog
**Description:** Guest checkout flow. Collect email + phone at start. Guest order lookup page (by email + order number). Option to create account after checkout.
