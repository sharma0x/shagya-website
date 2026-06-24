# Shagya — Agent Instructions

## Memory File

Maintain `.opencode/memory.md` as a living knowledge base of correct API calls,
MCP patterns, and configurations discovered after trial and error. When you
learn a better way to do something (or the first time you figure out the right
call after getting errors), write it there. When a previously documented
method has an improved approach, update the existing entry — don't duplicate.
This file is for the AI, by the AI.

## Architecture

Single-repo fullstack: **Payload CMS 3.x** (backend) + **Next.js 16 App Router** (frontend). Both share one Next.js process. One `pnpm dev` starts everything.

```
src/
├── app/                    # Next.js App Router
│   ├── (payload)/          # Payload admin + API routes (route group, no URL prefix)
│   │   ├── admin/[[...segments]]/page.tsx  # Payload admin panel
│   │   │   └── importMap.js  # ← MUST be pure JS, at this exact location
│   │   ├── api/[...slug]/route.ts  # Payload REST + GraphQL API
│   │   └── layout.tsx
│   ├── globals.css         # OKLCH design tokens (Tailwind v4 @theme)
│   ├── layout.tsx          # Root layout (Header, Footer, fonts)
│   └── page.tsx            # Homepage
├── collections/Users.ts    # Admin auth collection (email/password, roles)
├── components/
│   ├── layout/             # Header, Footer
│   └── ui/                 # shadcn/ui components
├── lib/utils.ts            # cn() helper for className merging
└── payload.config.ts       # Central backend config
```

## Design Language (Impeccable)

**.impeccable.md** contains the canonical brand context. Key rules:

- **Colors**: OKLCH only. Brand = warm amber/saffron (`oklch(0.65 0.18 65)`). Neutrals are tinted toward brand hue (chroma 0.005–0.008). Never pure gray or pure black.
- **Fonts**: Display = **Sora**, Body = **Public Sans**, Devanagari = Noto Sans Devanagari. Do NOT use Inter, DM Sans, Playfair Display, Fraunces, or any font in the Impeccable banned list.
- **Spacing**: 4pt scale (xs=4, sm=8, md=12, base=16, lg=24, xl=32, 2xl=48, 3xl=64, 4xl=96).
- **Absolute bans**: No `border-left` > 1px accent stripes on cards. No gradient text (`background-clip: text`).
- Tailwind v4 uses CSS-based `@theme` blocks, not `tailwind.config.ts`.

## Commands (Use Makefile)

```bash
make setup           # First-time: install deps + copy .env.example → .env
make infra-up        # Start PostgreSQL 18 + MinIO (Docker)
make infra-down      # Stop Docker services
make infra-reset     # Nuke Docker volumes (fresh DB)
make dev             # Start dev server (Turbopack + Payload)
make build           # Production build
make lint            # ESLint
make format          # Prettier
make typecheck       # TypeScript check (tsc --noEmit)
make test            # Unit + component tests (Vitest)
make test-watch      # Vitest in watch mode
make test-coverage   # Vitest with coverage
make test-e2e        # End-to-end tests (Playwright)
make test-e2e-install  # Install Playwright browsers (one-time)
make test-all        # Unit + E2E
make release         # Local semantic-release (needs GH_TOKEN)
make db-migrate      # Run Payload migrations
make db-generate-types  # Regenerate payload-types.ts
```

Always use `make` targets — the pnpm scripts and docker compose paths are wired there.

## Docker Dev Services

Must be running **before** `make dev`:

| Service       | Port                       | Credentials                        |
| ------------- | -------------------------- | ---------------------------------- |
| PostgreSQL 18 | 5432                       | `shagya` / `shagya_dev` / `shagya` |
| MinIO (S3)    | 9000 (API), 9001 (Console) | `minioadmin` / `minioadmin`        |

`.env` defaults to Docker: `DATABASE_URL=postgres://shagya:shagya_dev@localhost:5432/shagya`. For production, switch to Neon connection string.

**Volume mount gotcha**: Postgres 18 Alpine requires `PGDATA=/var/lib/postgresql/pgdata` and volume at `/var/lib/postgresql` (not `/var/lib/postgresql/data`). If PG restarts in a loop, run `make infra-reset` and restart.

## Payload Config Notes

- `payload.config.ts` is the single central config. All collections/globals/plugins register here.
- `sharp` field must be the imported module (`import sharp from 'sharp'`), not an options object.
- `secret` is required on the top-level config object.
- TypeScript alias `@payload-config` resolves to `./src/payload.config.ts` (defined in `tsconfig.json`).
- `importMap.js` must be at `src/app/(payload)/admin/importMap.js` — **pure JavaScript**, no `import type` or other TS syntax. Not at `(payload)/importMap.ts`.
- `next.config.ts` must wrap config with `withPayload()` from `@payloadcms/next/withPayload`.
- `@payloadcms/ui` must be a **direct dependency** in `package.json` (pnpm strict mode won't resolve it as a transitive dep).
- `payload-types.ts` is auto-generated at `src/payload-types.ts` — run `make db-generate-types` after schema changes.
- Schema push is enabled in dev (`push: process.env.NODE_ENV !== 'production'`). Use migrations in production.

## Known Issue: Admin Panel SSR

The Payload admin panel (`/admin`) returns HTTP 500 during SSR. The REST API (`/api/*`) works fine. This is a known edge case with Payload 3.85.1 + Next.js 16.2.9 where `useConfig()` returns an empty `ClientConfig` during server rendering. Documented on Linear **CLO-3**.

Workaround: create the first admin user via API:

```bash
curl -X POST http://localhost:3000/api/users/first-register \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@shagya.com","password":"...","name":"Admin"}'
```

## Package Manager

**pnpm only.** `package.json` enforces `pnpm@10.1.0` via `packageManager` field. `node >=20.9.0`. Dependencies installed with `pnpm install`.

## TypeScript

Strict mode. Path aliases: `@/*` → `./src/*`, `@payload-config` → `./src/payload.config.ts`. `jsx: react-jsx` (set by Next.js, don't change to `preserve`).

## CI/CD

See [`docs/ci-cd.md`](docs/ci-cd.md) for the full setup. Quick reference:

- **Branches**: `develop` (preview env), `main` (production)
- **Workflows**: `ci.yml` (lint/test/build), `release.yml` (semantic-release on main), `deploy-preview.yml` (Vercel preview on develop), `deploy-prod.yml` (Vercel production on main)
- **Environments**:
  - Dev DB: Neon branch `development`
  - Prod DB: Neon branch `production`
  - Dev storage: Cloudflare R2 bucket `shagya-dev`
  - Prod storage: Cloudflare R2 bucket `shagya-media`
- **Versioning**: semantic-release, Conventional Commits enforced by commitlint (husky hook on `commit-msg`)

GitHub Actions runs on push/PR to `main` or `develop`: format check → lint → typecheck → unit tests → production build. Needs `PAYLOAD_SECRET` env var set in CI.

## Git

Use Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.). Husky + commitlint enforces this on every commit. semantic-release bumps the version on `main` and updates `CHANGELOG.md` automatically. No direct commits to `main` — work on `develop` or feature branches, then open a PR.

## Linear

Team: **Clow**. All issues are `CLO-*`. Projects: P1–P8. Labels: Backend, Frontend, Auth, Payment, Design, Content, DevOps, Database, Security, Email, SMS.

## Git

Use Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.). No direct commits to `main` — work on feature branches.
