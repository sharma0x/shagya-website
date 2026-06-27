# CI/CD Pipeline

## Branches & Environments

| Git branch | Environment | Neon branch   | R2 bucket      |
| ---------- | ----------- | ------------- | -------------- |
| `develop`  | Preview     | `development` | `shayga-dev`   |
| `main`     | Production  | `production`  | `shayga-media` |

Both Neon branches live in the same project (`shayga`, region `aws-us-east-1`).

## Workflows

| File                 | Trigger                 | Purpose                                               |
| -------------------- | ----------------------- | ----------------------------------------------------- |
| `ci.yml`             | push/PR to main/develop | Format, lint, typecheck, unit tests, production build |
| `release.yml`        | push to main            | semantic-release: bumps version, updates CHANGELOG    |
| `deploy-preview.yml` | push to develop         | Build + deploy to Vercel preview                      |
| `deploy-prod.yml`    | push to main            | Build + deploy to Vercel production                   |

## Environment Variables (fully automated)

All Vercel project env vars are configured per-environment. No manual setup needed.

| Variable                 | Production                                | Preview                               |
| ------------------------ | ----------------------------------------- | ------------------------------------- |
| `DATABASE_URL`           | Neon `production` branch (encrypted)      | Neon `development` branch (encrypted) |
| `PAYLOAD_SECRET`         | Set (encrypted)                           | Set (encrypted)                       |
| `R2_ENDPOINT`            | `https://<acct>.r2.cloudflarestorage.com` | Same                                  |
| `R2_ACCESS_KEY_ID`       | Prod R2 key (encrypted)                   | Dev R2 key (encrypted)                |
| `R2_SECRET_ACCESS_KEY`   | Prod R2 secret (encrypted)                | Dev R2 secret (encrypted)             |
| `R2_BUCKET`              | `shayga-media`                            | `shayga-dev`                          |
| `R2_REGION`              | `auto`                                    | `auto`                                |
| `NEXT_PUBLIC_SERVER_URL` | `https://shayga.com`                      | (Vercel auto-assigns at deploy time)  |
| `RESEND_API_KEY`         | Set (encrypted)                           | Set (encrypted)                       |

## GitHub Secrets (all set)

| Secret                   | Status                              |
| ------------------------ | ----------------------------------- |
| `VERCEL_TOKEN`           | ✅ Set                              |
| `VERCEL_PROJECT_ID`      | ✅ prj_9ukLY4iSNNqLH1Fz7kRO21WVj3Z2 |
| `VERCEL_ORG_ID`          | ✅ team_PDEqGGotRP1BxyRqoJG2t5AJ    |
| `NEON_DATABASE_URL_DEV`  | ✅ Set                              |
| `NEON_DATABASE_URL_PROD` | ✅ Set                              |
| `PAYLOAD_SECRET`         | ✅ Set                              |

## GitHub Variables

| Variable                | Value                                             |
| ----------------------- | ------------------------------------------------- |
| `VERCEL_PREVIEW_DOMAIN` | `shayga-website-git-develop-clow-work.vercel.app` |
| `VERCEL_PROD_DOMAIN`    | `shayga.com`                                      |

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
