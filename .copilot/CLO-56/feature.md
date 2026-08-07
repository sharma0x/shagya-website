# CLO-56: Add inline profile editing on account dashboard

## Overview

Add ability for customers to edit their name and phone number directly from the account dashboard, without navigating to a separate page. Inline edit toggle switches fields between view mode (read-only) and edit mode (inputs with Save/Cancel).

## Changes

1. NEW API: `GET/PATCH /api/customers/me` — fetch and update the logged-in customer profile
2. Account page: add Profile card with inline edit toggle

## Flow

- View mode: shows name, email (read-only), phone
- Click "Edit" → fields become editable inputs (name, phone)
- Email stays read-only (changing requires verification)
- Click "Save" → PATCH /api/customers/me → update DB → back to view mode
- Click "Cancel" → revert changes → back to view mode

## Files

- `src/app/api/customers/me/route.ts` (new)
- `src/app/(frontend)/account/page.tsx`
