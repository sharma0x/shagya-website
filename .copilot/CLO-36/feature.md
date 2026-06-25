# CLO-36: Public API routes

## Overview

Public API routes: product listing with filters, product detail, search, wishlist CRUD. Paginated. Cache headers. Next.js route handlers via Payload Local API.

## Routes to create

- `GET /api/products` — listing with filters (fabric, weave, pattern, price min/max, status=published, pagination)
- `GET /api/products/[slug]` — product detail by slug
- `GET /api/search?q=...` — search products
- `GET/POST/DELETE /api/wishlist` — wishlist CRUD

## Acceptance Criteria

- [ ] Product listing with filter params and pagination (page, limit)
- [ ] Cache-Control headers on GET responses
- [ ] Product detail by slug
- [ ] Search endpoint with query param
- [ ] Wishlist CRUD (requires auth via Better Auth)
- [ ] Proper error responses (404, 400, 500)
- [ ] Unit tests for each route handler
