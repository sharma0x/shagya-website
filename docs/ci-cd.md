# CI/CD & Release Pipeline

## Branches & Environments

| Git branch | Environment | Machine          | Runner label | Domain             | DB                    | Storage (R2)       | Deployed tag |
| ---------- | ----------- | ---------------- | ------------ | ------------------ | --------------------- | ------------------ | ------------ |
| `develop`  | Staging     | Dev Mac (arm64)  | `staging`    | `shayga.localhost` | local Docker Postgres | `shayga-media-dev` | `:develop`   |
| `main`     | Production  | AWS EC2 (x86_64) | `production` | `shayga.in`        | AWS RDS (Postgres 18) | `shayga-media`     | `:latest`    |

## Workflows

| File                 | Trigger                                    | Purpose                                                                         |
| -------------------- | ------------------------------------------ | ------------------------------------------------------------------------------- |
| `ci.yml`             | Push / PR on `main` or `develop`           | Format, lint, typecheck, unit tests, Next.js build                              |
| `release.yml`        | Push on `main`                             | semantic-release: bumps version, CHANGELOG, git tag `vX.Y.Z`, GitHub release    |
| `deploy-staging.yml` | Push on `develop`                          | Multi-arch build (`:develop`, `:sha-*`) → deploy to `staging` runner            |
| `deploy-prod.yml`    | `release: published` + `workflow_dispatch` | Multi-arch build (`:latest`, `:vX.Y.Z`, semver) → deploy to `production` runner |

## How it flows

1. Merge a PR to `main` → `release.yml` runs semantic-release → creates a GitHub release (published event) + git tag `vX.Y.Z`.
2. The `release: published` event triggers `deploy-prod.yml`, which **builds** the image (`:latest`, `:vX.Y.Z`, `:1.2.3`, `:1.2`, `:1`, `:sha-*`) and then **deploys** `:latest` on the production self-hosted runner.
3. Push to `develop` → `deploy-staging.yml` builds `:develop` + `:sha-*` and deploys to the local staging runner.

The prod deploy is triggered on `release: published` (not tag push) because the
release commit carries a `[skip ci]` marker; GitHub's skip directives apply to
`push` events (including tags), but **not** to the `release` event.

## Image Tagging Matrix

| Trigger Event                   | Published Tags                                               |
| ------------------------------- | ------------------------------------------------------------ |
| Push to `develop`               | `:develop`, `:sha-<short>`                                   |
| `release: published` (`v1.2.3`) | `:latest`, `:v1.2.3`, `:1.2.3`, `:1.2`, `:1`, `:sha-<short>` |
| `workflow_dispatch` (rollback)  | deploy only — no build                                       |

Images are **multi-arch** (`linux/amd64` + `linux/arm64`): the prod EC2 pulls
amd64, the dev Mac pulls arm64 natively.

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
