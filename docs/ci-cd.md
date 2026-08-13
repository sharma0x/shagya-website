# CI/CD & Release Pipeline

## Branches & Environments

| Git branch | Environment | Neon branch   | R2 bucket      | Docker Tag (GHCR) |
| ---------- | ----------- | ------------- | -------------- | ----------------- |
| `develop`  | Preview     | `development` | `shayga-dev`   | `:develop`        |
| `main`     | Production  | `production`  | `shayga-media` | `:latest`, `:v*`  |

Both Neon branches live in the same project (`shayga`, region `aws-us-east-1`).

## Workflows

| File                 | Trigger                                             | Purpose                                                                        |
| -------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------ |
| `ci.yml`             | Push / PR on `main` or `develop`                    | Format, lint, typecheck, unit tests, Next.js build                             |
| `release.yml`        | Push on `main`                                      | Semantic-release: bumps version, updates CHANGELOG, creates git tag `vX.Y.Z`   |
| `docker-publish.yml` | Push on `main`, `develop`, tags `v*.*.*`, or manual | Builds multi-stage Docker image & publishes to `ghcr.io` with appropriate tags |

## Image Tagging Matrix

| Trigger Event                         | Git Ref         | Published Docker Tags                                            |
| ------------------------------------- | --------------- | ---------------------------------------------------------------- |
| Push to `develop`                     | `develop`       | `:develop`, `:sha-<short-sha>`                                   |
| Push to `main` (Release tag)          | `v1.2.3`        | `:v1.2.3`, `:1.2.3`, `:1.2`, `:1`, `:latest`, `:sha-<short-sha>` |
| Manual Dispatch (`workflow_dispatch`) | Any branch      | `:<custom_tag>` (defaults to `:testing`), `:sha-<short-sha>`     |
| Local developer build                 | Local workspace | `:<custom_tag>` (defaults to `:testing`)                         |

## Developer Workflow & Commands

### 1. Simulate Full CI Pipeline Locally

Run the entire CI validation suite locally before committing:

```bash
make ci-local
```

### 2. Build & Push Custom Images to GHCR

Build and push images locally with a custom tag (e.g. for testing a feature branch or VPS deployment):

```bash
# Build locally with tag 'testing' (default)
make ghcr-build

# Build and push with a custom tag
make ghcr-build-push TAG=feature-checkout
```

### 3. Pull & Test Container Images Locally

Test any production container image locally with custom environment variables before deploying:

```bash
# Pull and test 'testing' tag with local .env file on port 3000
make docker-test-image

# Test a specific tag with custom env file on port 8080
make docker-test-image TAG=v1.0.0 ENV_FILE=.env.production PORT=8080

# View test container logs
make docker-test-logs

# Stop test container
make docker-test-stop
```

## Semantic Versioning

| Commit type                                           | Version bump |
| ----------------------------------------------------- | ------------ |
| `feat:`                                               | minor        |
| `fix:`, `perf:`, `refactor:`, `revert:`               | patch        |
| `feat!:` or `BREAKING CHANGE:` footer                 | major        |
| `docs:`, `style:`, `test:`, `build:`, `ci:`, `chore:` | none         |

Husky + commitlint enforces Conventional Commits on every commit.

## Production Deployment (VPS)

Follow the [Production Deployment Guide](deployment.md) to deploy containerized replicas with Caddy:

```bash
make prod-deploy                  # Deploy latest image
make prod-deploy TAG=v1.0.0       # Deploy specific release
make prod-deploy TAG=develop      # Deploy develop preview image
```
