# CI/CD & Release Pipeline

## Branches & Environments

| Git branch | Environment | Neon branch   | R2 bucket      | Docker Tag (GHCR) |
| ---------- | ----------- | ------------- | -------------- | ----------------- |
| `develop`  | Preview     | `development` | `shayga-dev`   | `:develop`        |
| `main`     | Production  | `production`  | `shayga-media` | `:latest`, `:v*`  |

Both Neon branches live in the same project (`shayga`, region `aws-us-east-1`).

## Workflows

| File                 | Trigger                            | Purpose                                                                  |
| -------------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| `ci.yml`             | push/PR to main/develop            | Format, lint, typecheck, unit tests, Next.js build                       |
| `release.yml`        | push to main                       | semantic-release: bumps version, updates CHANGELOG, creates git tag `v*` |
| `docker-publish.yml` | push to main/develop, release tags | Builds multi-layer Docker image & publishes to `ghcr.io`                 |

## GitHub Container Registry (GHCR)

Container image repository: `ghcr.io/sharma0x/shagya-website`

- Automatically tagged with the semantic version (e.g. `v1.0.0`, `1.0.0`, `1.0`), commit SHA (`sha-xxxxxxx`), and `latest`.
- Can be manually triggered on any branch/tag via GitHub Actions `workflow_dispatch`.

## Semantic Versioning

| Commit type                                           | Version bump |
| ----------------------------------------------------- | ------------ |
| `feat:`                                               | minor        |
| `fix:`, `perf:`, `refactor:`, `revert:`               | patch        |
| `feat!:` or `BREAKING CHANGE:` footer                 | major        |
| `docs:`, `style:`, `test:`, `build:`, `ci:`, `chore:` | none         |

Husky + commitlint enforces Conventional Commits on every commit.

## Deployment Targets

### 1. Self-Hosted VPS (Hetzner / DO / EC2)

Follow the [Production Deployment Guide](deployment.md) to deploy containerized replicas with Caddy:

```bash
make prod-deploy                      # Deploy latest image
make prod-deploy IMAGE_TAG=v1.0.0     # Deploy specific release
```

### 2. Local Development

```bash
make setup                 # install deps
make infra-up              # local Postgres + MinIO
make db-migrate            # run migrations
make dev                   # start dev server
make test / make test-all  # run tests
```
