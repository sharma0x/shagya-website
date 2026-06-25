# CLO-27: Set up Better Auth core + providers

## Overview

Setup `better-auth` base. Install package, configure auth.ts with Payload adapter, generate secrets. Configure providers: credentials (email+password), OTP (phone), Google OAuth, Facebook OAuth, Apple OAuth. Export createAuthMiddleware for Next.js.

## Acceptance Criteria

- [ ] Install `better-auth` and `better-auth/next-js` packages
- [ ] Create `src/lib/auth.ts` with betterAuth config using Drizzle adapter (pointing to same PostgreSQL)
- [ ] Configure email+password auth
- [ ] Configure phone number plugin with OTP (SMS stub for now)
- [ ] Configure social providers: Google, Facebook, Apple (env vars)
- [ ] Create `src/app/api/auth/[...all]/route.ts` with `toNextJsHandler`
- [ ] Add `BETTER_AUTH_SECRET`, provider env vars to `.env.example`
- [ ] Unit tests for auth config structure
- [ ] `make typecheck` and `make lint` pass

## Technical Notes

- Use Drizzle adapter since project uses PostgreSQL (same DB as Payload)
- Auth route: `src/app/api/auth/[...all]/route.ts`
- Social providers use env vars: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, etc.
- Phone OTP: stub implementation for now (CLO-35 handles real SMS)
- Secret: `BETTER_AUTH_SECRET` (generate via `openssl rand -hex 32`)
