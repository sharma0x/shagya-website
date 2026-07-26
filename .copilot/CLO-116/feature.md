# CLO-116: Remove redundant database workaround scripts

## Overview

Deleted two direct-SQL workaround scripts that bypass Payload's migration system and Better Auth's CLI.

## Removed scripts

### create-missing-tables.cjs
- Created `site_settings_rels` and `_site_settings_v_rels` (already covered by registered migration **20260719**)
- Created Better Auth tables (user, session, account, etc.) — already covered by `@better-auth/cli migrate` in Makefile
- Bypassed Payload migration tracking entirely

### wipe-db.cjs
- Raw database wipe — already covered by `make infra-reset` and `make reset-local` commands

## Standard migration flow
```
Schema change → payload migrate:create → register in index.ts → payload migrate
```
No direct SQL scripts — everything tracked and reproducible.

## Files
- Deleted: `scripts/create-missing-tables.cjs`
- Deleted: `scripts/wipe-db.cjs`
