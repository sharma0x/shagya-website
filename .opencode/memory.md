# OpenCode Memory — Lessons Learned

This file tracks correct API calls, MCP patterns, and configurations discovered
after trial and error. Update previous entries when you find a better way.

---

## Vercel

### Set env vars: use REST API, not CLI for scripting

The Vercel CLI `env add preview` hangs waiting for a git-branch prompt even with
`--yes`. Use the REST API instead.

**Correct call** — create an encrypted env var:

```bash
curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key":"VAR_NAME","value":"value","type":"encrypted","target":["production"]}'
```

**Valid `type` values**: `"encrypted"`, `"plain"`, `"sensitive"`, `"system"`
(not `"secret"` — that returns HTTP 400).

### Delete env var via REST API

```bash
curl -s -X DELETE "https://api.vercel.com/v10/projects/$PROJECT_ID/env/$ENV_ID" \
  -H "Authorization: Bearer $VERCEL_TOKEN"
```

### Per-environment split

When an env var already exists with `target: ["production", "preview"]`,
you cannot add a separate one for just `"production"` — you get `ENV_CONFLICT`.
First DELETE the shared var, then create two separate entries with single-target arrays.

### List env vars with IDs

```bash
curl -s "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  | python3 -c "import json,sys;data=json.load(sys.stdin);[print(f\"{e['id']} {e['key']} {e['target']}\") for e in data['envs']]"
```

### Link project for CLI

```bash
vercel link --yes   # from project directory
vercel whoami       # verify auth
```

The OAuth token is not stored as a plain file. For CI/CD, use a dashboard-created
token from https://vercel.com/account/tokens and pass it via `--token`.

### Vercel CLI binary path (macOS Homebrew)

When npm/pnpm installs `vercel` globally, the binary goes to
`/opt/homebrew/Cellar/node/<version>/bin/`. Symlink to `/opt/homebrew/bin/`
to get it in PATH:

```bash
ln -sf /opt/homebrew/Cellar/node/$(node -v | cut -d. -f1)/bin/vercel /opt/homebrew/bin/vercel
```

---

## Cloudflare

### R2 S3 access keys — dashboard only

R2 S3 access keys CANNOT be created via the Cloudflare REST API or MCP.
No endpoint exists in the API spec. Must use:
Dashboard → R2 → Manage R2 API Tokens → Create API Token → Object Read & Write.

The `POST /user/tokens` or `POST /accounts/:id/tokens` endpoints create
**Cloudflare API tokens**, not R2 S3 access keys. These are different auth systems.

### R2 bucket creation (via MCP works fine)

```js
cloudflare.request({
  method: 'POST',
  path: `/accounts/${accountId}/r2/buckets`,
  body: { name: 'bucket-name' },
})
```

### Account ID is not sensitive

The Cloudflare account ID (e.g., `eca0c10fdcfa4b0300aad801b8b850e0`) appears
in R2 S3 endpoint URLs and Workers URLs. It's acceptable in docs/commits.

---

## Neon

### Password rotation via SQL works

```sql
ALTER ROLE neondb_owner PASSWORD 'npg_newpasswordhere';
```

Execute via `neon_run_sql` MCP tool. The password is shared across all branches
of the project (Neon branches share the same role).

### Connection strings — never commit

Neon connection strings contain passwords prefixed with `npg_`.
Never put them in committed files (docs, configs, etc.).
Store them in GitHub Secrets or Vercel encrypted env vars.

### Branch setup

Use `neon_create_branch` to fork a dev branch from production:

```js
neon_create_branch({
  projectId: '...',
  branchName: 'development',
  parentId: 'br-...', // production branch
})
```

---

## GitHub CLI (`gh`)

### Set secrets

```bash
gh secret set SECRET_NAME --body "value" --repo owner/repo
```

### Set variables

```bash
gh variable set VAR_NAME --body "value" --repo owner/repo
```

### Delete secrets

```bash
gh secret delete SECRET_NAME --repo owner/repo
```

### List secrets (values are hidden)

```bash
gh secret list --repo owner/repo
```

---

## Next.js 16

### ESLint — `next lint` was REMOVED

Next.js 16.x removed the built-in `next lint` command. Must use `eslint`
directly with a flat config (`eslint.config.mjs`).

**Correct `package.json` script:**

```json
"lint": "eslint ."
```

### ESLint config — flat config with next/core-web-vitals

```js
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals'

export default [
  { ignores: ['.next/**', 'node_modules/**', ...] },
  ...nextCoreWebVitals,
  { rules: { 'react/no-unescaped-entities': 'off', '@next/next/no-img-element': 'off' } },
]
```

The import path is `eslint-config-next/core-web-vitals` (without `.js` — uses
package.json `exports` mapping).

---

## Husky + lint-staged

### Husky v9 init

```bash
mkdir -p .husky && npx husky init
```

### pre-commit hook (`.husky/pre-commit`)

```
pnpm exec lint-staged
```

### commit-msg hook (`.husky/commit-msg`)

```
pnpm exec commitlint --edit "$1"
```

### lint-staged config (in `package.json`)

```json
"lint-staged": {
  "*.{ts,tsx,js,jsx,json,md,css}": ["prettier --write"]
}
```

---

## Prettier

### Ignoring pre-existing legacy docs

Add to `.prettierignore`:

```
docs/research/
docs/shayga-payloadcms.md
docs/shayga-shopify.md
docs/linear-plan.md
```

---

## Commit Squashing (remove leaked secrets from history)

When commits contain secrets that must be removed:

```bash
git reset --soft <safe-commit-hash>   # soft reset to before bad commits
git add -A                              # re-stage everything
git commit -m "clean message"           # single clean commit
git push --force-with-lease origin develop
```

---

## GitHub Actions Workflows

### pnpm/action-setup@v4 — do NOT specify `version` if package.json has packageManager

The `pnpm/action-setup@v4` auto-reads `packageManager` from `package.json`.
Specifying an additional `version:` in the workflow YAML causes a conflict error:

```
Error: Multiple versions of pnpm specified:
  - version 10 in the GitHub Action config with the key "version"
  - version pnpm@10.1.0 in the package.json with the key "packageManager"
```

**Correct — no version field (action reads from package.json):**

```yaml
- uses: pnpm/action-setup@v4
- uses: actions/setup-node@v4
  with: { node-version: 22, cache: 'pnpm' }
```

**Wrong — duplicate version causes failure:**

```yaml
- uses: pnpm/action-setup@v4
  with: { version: 10 } # ← REMOVE THIS
```

### deploy workflows — pnpm must be installed globally for `vercel build`

`vercel build` detects `pnpm` from `pnpm-lock.yaml` and `package.json#packageManager`,
then runs `pnpm install` as the install command. The GitHub Actions default runner
**does not** have pnpm pre-installed.

**Correct — install pnpm globally before vercel build:**

```yaml
- run: npm install --global vercel@latest pnpm@10
- run: vercel build --token=${{ secrets.VERCEL_TOKEN }}
```

### Vercel environment variable resolution during build

When `vercel build` runs outside Vercel's infrastructure (e.g., in GitHub Actions),
it does NOT have access to Vercel's system environment variables. It shows:

```
WARNING! Build not running on Vercel. System environment variables will not be available.
```

This means `NEXT_PUBLIC_*` vars from Vercel project settings ARE injected
(because `vercel pull` downloads them), but Vercel system vars like `VERCEL_URL`
are NOT available. For preview deployments, `NEXT_PUBLIC_SERVER_URL` should be
set explicitly in Vercel project env vars, not rely on `VERCEL_URL`.

### CI workflow build step needs placeholder env vars

The CI build job runs `pnpm build` which loads `payload.config.ts` and other
configs that reference `R2_*`, `DATABASE_URL`, `PAYLOAD_SECRET`. These must be
provided even as placeholders since the build just runs Next.js compilation and
doesn't actually connect to the database or R2 at build time.

---

## Vercel Preview Deploy

### R2 Bucket CORS

The `shayga-dev` Cloudflare R2 bucket needs CORS configured for Vercel preview domains. Use `s3cmd` or Cloudflare Dashboard to set:

```
AllowedOrigins: https://*.vercel.app, http://localhost:3000
AllowedMethods: GET, HEAD
AllowedHeaders: *
```

### R2 API Token Permissions

When creating an R2 API token for write access, it needs **Object Read & Write** permission (not just Read). The token format is a long hex string (e.g., `d876a66f77eacda...`). Store as `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`, `S3_REGION` in Vercel env.

### Vercel Preview Env Variables

Set preview env variables with `vercel env add`:

- `BETTER_AUTH_SECRET` — random 32+ char string (from `openssl rand -base64 32`)
- `BETTER_AUTH_URL` — set to the static Vercel alias (e.g., `https://shagya-website-sharma0x-4079-clow-work.vercel.app`)
- `NEXT_PUBLIC_SERVER_URL` — same as `BETTER_AUTH_URL`
  These must be set **before** the seed runs, otherwise media URLs get stored with `http://localhost:3000` prefix.

### Payload Migrations in Preview Deploy

The `deploy-preview.yml` workflow needs:

1. `vercel pull --environment=preview` to get env vars
2. Source `.vercel/.env.preview.local` before running commands
3. `npx payload migrate` before `vercel build`
4. `npx payload run scripts/seed.ts` to populate data (idempotent)

### Payload CORS/CSRF

`src/payload.config.ts` must include Vercel deployment domains:

```ts
cors: [
  process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  'https://shagya-website-sharma0x-4079-clow-work.vercel.app',
  'https://shagya-website.vercel.app',
]
```

Same for `csrf`.

### Next.js Image remotePatterns

`next.config.ts` needs Vercel preview + R2 endpoints:

```ts
remotePatterns: [
  {
    protocol: 'https',
    hostname: 'shagya-website-sharma0x-4079-clow-work.vercel.app',
  },
  { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
]
```

### Media URL is Virtual

Payload's `upload` plugin `url` field is computed dynamically at query time based on `serverURL`. It's NOT stored in the DB. If `serverURL` changes after seeding, the URLs returned by API will automatically use the new serverURL. No need to migrate existing records.

### Seed Link Failure Warning

During seeding, some image uploads may fail with `ValidationError: filename` from Payload Drizzle adapter. This happens when a file with the same filename already exists in the DB (from a previous failed seed run). The seed script skips these gracefully — just re-run with `NEXT_PUBLIC_SERVER_URL` set correctly and the previously-uploaded images will still work.

---

## TSX / Node.js 23.5+ Compatibility

### Migration ENOENT error on Node 23.5+

If you receive an error like `Error: Error creating migration: ENOENT: no such file or directory, open 'node:crypto?tsx-namespace=...'` when running migrations or TS scripts via `tsx` on Node.js v23.5.0 or later (e.g. Node 25.6.0):

This is caused by a namespace-resolution bug in `tsx` versions `>=4.22.0` where it appends `?tsx-namespace=` query parameters to Node's built-in modules (like `node:crypto`).

**Correct fix** — Pin `tsx` to `4.21.0` in `package.json` and add a pnpm override:

```json
  "devDependencies": {
    "tsx": "4.21.0"
  },
  "pnpm": {
    "overrides": {
      "tsx": "4.21.0"
    }
  }
```
