# CI/CD Pipeline

This document describes Shagya's CI/CD setup: branches, environments, secrets, and the GitHub Actions workflows that run on each.

## Branches & Environments

| Git branch | Environment | Neon branch   | R2 bucket      |
| ---------- | ----------- | ------------- | -------------- |
| `develop`  | Preview     | `development` | `shagya-dev`   |
| `main`     | Production  | `production`  | `shagya-media` |

Both Neon branches live in the same project (`shagya`, region `aws-us-east-1`).

## Workflows

| File                 | Trigger                 | Purpose                                               |
| -------------------- | ----------------------- | ----------------------------------------------------- |
| `ci.yml`             | push/PR to main/develop | Format, lint, typecheck, unit tests, production build |
| `release.yml`        | push to main            | semantic-release: bumps version, updates CHANGELOG    |
| `deploy-preview.yml` | push to develop         | Build + deploy to Vercel preview                      |
| `deploy-prod.yml`    | push to main            | Build + deploy to Vercel production                   |

## Manual Setup (one-time, ~5 min)

### 1. Create Vercel token for GitHub Actions

1. Go to https://vercel.com/account/tokens
2. Create token named `shagya-ci`, scope: Full Account
3. Run: `gh secret set VERCEL_TOKEN --body "vercel-token-here" --repo sharma0x/shagya-website`

### 2. Create Cloudflare R2 S3 API tokens

1. Go to https://dash.cloudflare.com/ → R2 → Manage R2 API Tokens
2. Create **two** tokens (each with **Object Read & Write**):
   - **shagya-r2-dev**: scope to bucket `shagya-dev`
   - **shagya-r2-prod**: scope to bucket `shagya-media`
3. Save the Access Key ID and Secret Access Key for each.

### 3. Set Vercel env vars per environment

In Vercel Dashboard → shagya-website → Settings → Environment Variables:

| Variable                 | Production value                                                    | Preview value                     |
| ------------------------ | ------------------------------------------------------------------- | --------------------------------- |
| `NEXT_PUBLIC_SERVER_URL` | `https://shagya.com`                                                | (Vercel auto-assigns)             |
| `DATABASE_URL`           | Neon prod branch connection string                                  | Neon dev branch connection string |
| `PAYLOAD_SECRET`         | `openssl rand -base64 32` (same for both)                           | (same as prod)                    |
| `R2_ENDPOINT`            | `https://eca0c10fdcfa4b0300aad801b8b850e0.r2.cloudflarestorage.com` | (same)                            |
| `R2_ACCESS_KEY_ID`       | From shagya-r2-prod token                                           | From shagya-r2-dev token          |
| `R2_SECRET_ACCESS_KEY`   | From shagya-r2-prod token                                           | From shagya-r2-dev token          |
| `R2_BUCKET`              | `shagya-media`                                                      | `shagya-dev`                      |
| `R2_REGION`              | `auto`                                                              | `auto`                            |

> **Neon connection strings** are stored in GitHub Secrets (`NEON_DATABASE_URL_DEV`, `NEON_DATABASE_URL_PROD`).  
> Do **not** commit or document them — they contain database credentials.  
> Retrieve them from GitHub Secrets or the Neon dashboard if needed.

## GitHub Secrets (already configured)

| Secret                   | Status                                   |
| ------------------------ | ---------------------------------------- |
| `VERCEL_TOKEN`           | ⚠️ Placeholder — replace with real token |
| `VERCEL_PROJECT_ID`      | ✅ prj_9ukLY4iSNNqLH1Fz7kRO21WVj3Z2      |
| `VERCEL_ORG_ID`          | ✅ team_PDEqGGotRP1BxyRqoJG2t5AJ         |
| `NEON_DATABASE_URL_DEV`  | ✅ Real value                            |
| `NEON_DATABASE_URL_PROD` | ✅ Real value                            |
| `PAYLOAD_SECRET`         | ✅ Real value                            |

## GitHub Variables

| Variable                | Value                                             |
| ----------------------- | ------------------------------------------------- |
| `VERCEL_PREVIEW_DOMAIN` | `shagya-website-git-develop-clow-work.vercel.app` |
| `VERCEL_PROD_DOMAIN`    | `shagya.com`                                      |

## Semantic Versioning

| Commit type                                           | Version bump |
| ----------------------------------------------------- | ------------ |
| `feat:`                                               | minor        |
| `fix:`, `perf:`, `refactor:`, `revert:`               | patch        |
| `feat!:` or `BREAKING CHANGE:` footer                 | major        |
| `docs:`, `style:`, `test:`, `build:`, `ci:`, `chore:` | none         |

Husky + commitlint enforces Conventional Commits on every commit.

## Local Development

```bash
make setup                 # install deps
make infra-up              # local Postgres + MinIO
make db-migrate            # run migrations
make dev                   # start dev server
make test / make test-all  # run tests
```
