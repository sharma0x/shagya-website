# CLO-46: Admin Operations

## Overview

Implement inventory auto-decrement on orders, low stock alerts to admin, sales analytics dashboard in admin panel, and CSV export for products/orders/customers.

## Stack Constraints

- **Backend**: Payload 3.x — use Payload's admin UI customization (custom views, components)
- **Frontend**: Payload admin panel (React), existing admin branding
- **Data**: Postgres via @payloadcms/db-postgres
- **No new charting libraries**: Build simple analytics with raw HTML tables + CSS
- **Export**: Server-side CSV generation via Payload endpoints

## OOP / DRY Principles

- Inventory decrement: hook on Orders collection (afterChange → decrement product/variant stock)
- Low stock alerts: single function called from product update hook + order decrement
- Analytics: use Payload's find() with where clauses — no raw SQL
- CSV export: single utility function with column config, reused for products/orders/customers
- All admin features use Payload's custom component API (no separate admin build)

## Acceptance Criteria

### 1. Inventory Auto-Decrement
- [ ] Orders collection: `afterChange` hook — `updateStatus: 'confirmed'` → decrement stock
- [ ] Product: `quantity -= orderItem.quantity` for each ordered item
- [ ] Variant: `stock -= orderItem.quantity` if variant tracked
- [ ] Prevent negative stock: check before decrement, log error if insufficient
- [ ] Restore stock on order cancellation/refund
- [ ] Transaction safety: use Postgres transaction (payload.db.transaction)
- [ ] Only decrement if `trackQuantity: true`

### 2. Low Stock Alerts
- [ ] `src/lib/low-stock.ts` — `checkLowStock(product)` returns threshold info
- [ ] Trigger on: product update (hook), order decrement (CLO-46.1), manual admin action
- [ ] Alert: send email to admin (`ADMIN_EMAIL` env var)
- [ ] Admin dashboard: "Low Stock Products" widget showing products below threshold
- [ ] Product list view: color-coded stock column (green/amber/red)
- [ ] No SMS for low stock — email only to admin

### 3. Sales Analytics Dashboard
- [ ] Custom admin view: `/admin/analytics` (Payload custom view)
- [ ] KPI cards row: Total Orders, Revenue, Avg Order Value, Customers
- [ ] Date range filter: last 7/30/90 days, custom range
- [ ] Status breakdown: pie chart using CSS conic-gradient (no chart library)
- [ ] Top products: table (product name, units sold, revenue)
- [ ] Daily revenue chart: simple bar chart using CSS
- [ ] All data from Payload queries on Orders + Products collections

### 4. CSV Export
- [ ] Admin: "Export" buttons on Products, Orders, Customers list views
- [ ] `src/app/api/admin/export/products/route.ts` — CSV generation
- [ ] `src/app/api/admin/export/orders/route.ts`
- [ ] `src/app/api/admin/export/customers/route.ts`
- [ ] Admin auth required (check `req.user`)
- [ ] CSV format: headers row + data rows, UTF-8 BOM for Excel compatibility
- [ ] Product export: name, slug, fabric, weave, pattern, basePrice, compareAtPrice, stock, cityOfOrigin
- [ ] Order export: orderNumber, date, status, customer, total, items count
- [ ] Single `generateCSV(cols, rows)` utility in `src/lib/csv.ts`

## Technical Notes

### Files to Create
- `src/lib/inventory.ts` — stock decrement/restore logic (extend from CLO-39)
- `src/lib/low-stock.ts` — low stock checker + alert sender
- `src/lib/csv.ts` — CSV generation utility
- `src/components/admin/AnalyticsDashboard.tsx` — custom admin view
- `src/components/admin/LowStockWidget.tsx` — admin dashboard widget
- `src/app/api/admin/export/products/route.ts`
- `src/app/api/admin/export/orders/route.ts`
- `src/app/api/admin/export/customers/route.ts`

### Files to Modify
- `src/collections/Orders.ts` — add afterChange hook for stock decrement
- `src/collections/Products.ts` — add afterChange hook for low stock alert
- `src/collections/Products.ts` — add admin UI customizations (stock column colors)
- `src/payload.config.ts` — register custom analytics view
