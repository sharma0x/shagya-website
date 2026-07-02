# CLO-7: Create pincode verification API with India Post proxy

## Overview

Create Next.js API routes that proxy to the free India Post API for pincode verification and city search. Add in-memory caching to reduce external API calls.

## Acceptance Criteria

- [ ] POST /api/pincode/verify accepts pincode and returns city, state, country
- [ ] GET /api/pincode/city-search?city=name returns matching pincodes
- [ ] In-memory cache with 60s TTL for repeated lookups
- [ ] Proper error handling for API failures and invalid inputs
- [ ] Server-side only (no direct browser call to India Post API)
