# CI/CD & Release Pipeline

## Branches & Environments

| Git branch | Environment | Machine          | Runner label | Domain             | DB                    | Storage (R2)       | Deployed tag |
| ---------- | ----------- | ---------------- | ------------ | ------------------ | --------------------- | ------------------ | ------------ |
| `develop`  | Staging     | Dev Mac (arm64)  | `staging`    | `shayga.localhost` | local Docker Postgres | `shayga-media-dev` | `:develop`   |
| `main`     | Production  | AWS EC2 (x86_64) | `production` | `shayga.in`        | AWS RDS (Postgres 18) | `shayga-media`     | `:latest`    |

## Workflows

| File                 | Trigger                                    | Purpose                                                                                          |
| -------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `ci.yml`             | Push on `develop` / PR on `main`+`develop` | Format, lint, typecheck, unit tests, migrations, Next.js build (against ephemeral Postgres)      |
| `deploy-staging.yml` | Push on `develop`                          | Build + push (`:develop`, `:sha-*`) → deploy to `staging` runner                                 |
| `deploy-prod.yml`    | Push on `main` + `workflow_dispatch`       | Validate → semantic-release → build + push (`:latest`, `:vX.Y.Z`, semver) → deploy to production |

## How it flows

1. Merge a PR to `main` → `deploy-prod.yml` runs `validate` (lint/typecheck/test/build against an ephemeral Postgres), then `release` (semantic-release creates the GitHub release + git tag `vX.Y.Z`).
2. If a new version was published, the `build` job starts a throwaway Postgres ("builddb") and runs `docker build --network=host --build-arg DATABASE_URL=...` — the builder stage applies migrations before `next build` — tagging `:latest`, `:vX.Y.Z`, `:X.Y.Z`, `:X.Y`, `:X`, `:sha-*`.
3. The `deploy` job (production self-hosted runner) pulls `:latest`, syncs compose files to `/opt/shayga`, and runs `make prod-deploy`.
4. Push to `develop` → `deploy-staging.yml` builds `:develop` + `:sha-*` the same way and deploys to the local staging runner.

The release commit pushed by semantic-release carries a `[skip ci]` marker, so
GitHub's push-trigger skips that commit and the workflow does not re-run itself.

## Secrets

| Secret      | Purpose                                         |
| ----------- | ----------------------------------------------- |
| `GH_SECRET` | Fine-grained/PAT token used to push the release |

## Image Tagging Matrix

| Trigger Event                  | Published Tags                                               |
| ------------------------------ | ------------------------------------------------------------ |
| Push to `develop`              | `:develop`, `:sha-<short>`                                   |
| Push to `main` (new `v1.2.3`)  | `:latest`, `:v1.2.3`, `:1.2.3`, `:1.2`, `:1`, `:sha-<short>` |
| `workflow_dispatch` (rollback) | deploy only — no build                                       |

Images are built **amd64-only** on the hosted ubuntu runner. The prod EC2 pulls
amd64 natively; the dev Mac runs the amd64 image under Rosetta
(`platform: linux/amd64` pinned in the compose file). Builds use
`docker build --network=host` so the builder stage can reach the ephemeral
`builddb` Postgres on `127.0.0.1:5432` (Linux runner only — that flag doesn't
work on Docker Desktop/macOS).

## Self-Hosted Runners

Two self-hosted runners power the deploy jobs (they run _on_ the target machine,
dialing GitHub over outbound HTTPS — no SSH/ingress required):

- **`production`** — the AWS EC2, installed as a systemd service
  (`actions.runner.sharma0x-shagya-website.shayga-prod-runner`).
- **`staging`** — the developer Mac, installed as a launchd service.

Deploy jobs run `docker compose pull → migrate → up` against `/opt/shayga`
(prod) or the repo checkout (staging). Prod deploy files
(`docker-compose.prod.yml`, `Caddyfile`, `Makefile`) are re-synced from the repo
on every run to prevent drift.

## Staging (local) Setup

```bash
# one-time: hosts entry
sudo sh -c 'echo "127.0.0.1 shayga.localhost" >> /etc/hosts'

# one-time: env file
cp .env.staging.example .env.staging   # then fill in secrets

# manual run (workflow also does this automatically)
docker compose -f docker-compose.staging.yml up -d
```

Served at `http://shayga.localhost`.

## Rollback

Roll back production to any immutable version from the Actions UI
(`deploy-prod.yml` → Run workflow → `version=v1.2.3`), or from a machine with
SSH access:

```bash
make prod-deploy IMAGE_TAG=v1.2.3
```

## Semantic Versioning

| Commit type                                           | Version bump |
| ----------------------------------------------------- | ------------ |
| `feat:`                                               | minor        |
| `fix:`, `perf:`, `refactor:`, `revert:`               | patch        |
| `feat!:` or `BREAKING CHANGE:` footer                 | major        |
| `docs:`, `style:`, `test:`, `build:`, `ci:`, `chore:` | none         |

Husky + commitlint enforces Conventional Commits on every commit.
