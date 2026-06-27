# Live Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire Payload's Live Preview into the Shagya admin so editors see the frontend update in real time as they edit Pages, Posts, Products, and the SiteSettings global.

**Architecture:** Server-side Live Preview using `@payloadcms/live-preview-react`. A `RefreshRouteOnSave` client component listens for the admin panel's `postMessage` and calls Next.js's `router.refresh()`, which re-fetches the RSC tree from Payload's local API. Pages read `?preview=true&id=<docId>` from search params, fetch with `draft: true` and `overrideAccess: false`, and only mount the refresh component in preview mode. Versions + autosave (800ms) are enabled on all four versioned types so the preview feels live.

**Tech Stack:** Payload CMS 3.85.1, Next.js 16 (App Router, RSC), React 19, `@payloadcms/live-preview-react`, Vitest + Testing Library, TypeScript 5 strict.

**Spec:** `.copilot/superpowers/CLO-80-live-preview-design.md`
**Linear:** CLO-80
**Branch:** `feature/clo-80-payload-live-preview-for-pages-posts-products-and`

## Global Constraints

- Node ≥ 20.9.0, pnpm 10.1.0 (enforced by `packageManager`).
- TypeScript strict mode. Path aliases: `@/*` → `./src/*`, `@payload-config` → `./src/payload.config.ts`.
- `serverURL` in payload config: `process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'`.
- `secret` is required on the top-level payload config (already set).
- All commits use Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:`).
- Use `make` targets: `make typecheck`, `make lint`, `make test`. No direct `pnpm`/`tsc` invocations.
- Local API must use `overrideAccess: false` + `user` whenever reading drafts to prevent anonymous draft access.
- Live preview button is only shown by Payload for existing documents, so `data.id` and `data.slug` are guaranteed when the `livePreview.url` function runs for collections.
- The Header's `fetch('/api/globals/site-settings')` 404s today (pre-existing). SiteSettings live preview only updates server-rendered layout; Header is out of scope.
- The Payload admin SSR 500 (CLO-3) blocks end-to-end manual verification. Tests must pass without it.

## File Map

| File                                                      | Action | Responsibility                                                                    |
| --------------------------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| `package.json` + `pnpm-lock.yaml`                         | modify | Add `@payloadcms/live-preview-react`                                              |
| `src/payload.config.ts`                                   | modify | `admin.livePreview` block (url function + breakpoints)                            |
| `src/collections/Pages.ts`                                | modify | `versions: { drafts: { autosave: { interval: 800 } } }`                           |
| `src/collections/Posts.ts`                                | modify | Same                                                                              |
| `src/collections/Products.ts`                             | modify | Same                                                                              |
| `src/globals/SiteSettings.ts`                             | modify | Same                                                                              |
| `src/components/live-preview/RefreshRouteOnSave.tsx`      | create | Client component wrapping `@payloadcms/live-preview-react`'s `RefreshRouteOnSave` |
| `src/components/live-preview/RefreshRouteOnSave.test.tsx` | create | Vitest unit test for postMessage → router.refresh                                 |
| `src/app/(frontend)/[slug]/page.tsx`                      | modify | Accept `searchParams`, mount `<RefreshRouteOnSave />` when `preview=true`         |
| `src/app/(frontend)/blog/[slug]/page.tsx`                 | modify | Same                                                                              |
| `src/app/(frontend)/products/[slug]/page.tsx`             | modify | Same                                                                              |
| `src/app/(frontend)/page.tsx`                             | modify | Same (for SiteSettings)                                                           |

---

## Task 1: Install `@payloadcms/live-preview-react`

**Files:**

- Modify: `package.json`
- Modify: `pnpm-lock.yaml` (auto)

**Interfaces:**

- Produces: importable `RefreshRouteOnSave` and `ready`/`isDocumentEvent` from `@payloadcms/live-preview-react` (and `@payloadcms/live-preview`)

- [ ] **Step 1: Add the package**

Run: `pnpm add @payloadcms/live-preview-react@3.85.1`

Expected: Package added. `package.json` `dependencies` block gains the entry, `pnpm-lock.yaml` is updated, `node_modules/@payloadcms/live-preview-react/` exists.

- [ ] **Step 2: Verify the package exports**

Run: `pnpm exec node -e "const m = require('@payloadcms/live-preview-react'); console.log(Object.keys(m))"`

Expected: Logs an array including `RefreshRouteOnSave`. (If the package is ESM-only, use `import('@payloadcms/live-preview-react').then(m => console.log(Object.keys(m)))` instead.)

- [ ] **Step 3: Verify the underlying live-preview package is also available**

Run: `pnpm exec node -e "import('@payloadcms/live-preview').then(m => console.log(Object.keys(m)))"`

Expected: Logs an array including `ready` and `isDocumentEvent`.

- [ ] **Step 4: Run typecheck to confirm no regressions**

Run: `make typecheck`

Expected: Exit 0. Same errors as `main` (likely none, but allow for pre-existing).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): add @payloadcms/live-preview-react@3.85.1"
```

---

## Task 2: Add `admin.livePreview` to payload.config.ts

**Files:**

- Modify: `src/payload.config.ts:225-235` (the `admin` block)

**Interfaces:**

- Consumes: `process.env.NEXT_PUBLIC_SERVER_URL` env var (already in use elsewhere in the file)
- Produces: `admin.livePreview.url` resolver and `admin.livePreview.breakpoints` array, consumed by Task 3+ via the admin UI

- [ ] **Step 1: Add the `livePreview` block to the admin config**

In `src/payload.config.ts`, replace the existing `admin: { ... }` block (currently spans lines 225-235) so it reads:

```ts
admin: {
  user: 'users',
  importMap: {
    baseDir: path.resolve(dirname),
    importMapFile: path.resolve(dirname, 'app/(payload)/admin/importMap.js'),
  },
  meta: {
    titleSuffix: '— Shagya',
    icons: [{ url: '/favicon.ico' }],
  },
  livePreview: {
    url: ({ data, collectionConfig, globalConfig }) => {
      const base =
        process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
      if (collectionConfig?.slug === 'pages' && data) {
        return `${base}/${data.slug}?preview=true&id=${data.id}`
      }
      if (collectionConfig?.slug === 'posts' && data) {
        return `${base}/blog/${data.slug}?preview=true&id=${data.id}`
      }
      if (collectionConfig?.slug === 'products' && data) {
        return `${base}/products/${data.slug}?preview=true&id=${data.id}`
      }
      if (globalConfig?.slug === 'site-settings') {
        return `${base}/?preview=true&id=site-settings`
      }
      return undefined
    },
    breakpoints: [
      { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
      { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
      { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
    ],
  },
},
```

- [ ] **Step 2: Typecheck**

Run: `make typecheck`

Expected: Exit 0. The `url` callback's return type should be inferred as `string | undefined` from Payload's types.

- [ ] **Step 3: Commit**

```bash
git add src/payload.config.ts
git commit -m "feat(payload): add admin.livePreview config for pages, posts, products, site-settings"
```

---

## Task 3: Enable drafts + autosave on Pages, Posts, Products, SiteSettings

**Files:**

- Modify: `src/collections/Pages.ts` — add `versions` key
- Modify: `src/collections/Posts.ts` — add `versions` key
- Modify: `src/collections/Products.ts` — add `versions` key
- Modify: `src/globals/SiteSettings.ts` — add `versions` key

**Interfaces:**

- Produces: every previewable type now has a `versions._status` field and a `versions.drafts.autosave.interval` of 800ms, so Payload can store and serve drafts.

- [ ] **Step 1: Update Pages**

In `src/collections/Pages.ts`, add a `versions` key as a sibling of `access` (above `hooks`):

```ts
  versions: {
    drafts: {
      autosave: { interval: 800 },
    },
  },
  hooks: {
```

- [ ] **Step 2: Update Posts**

In `src/collections/Posts.ts`, add the same `versions` block as a sibling of `access`:

```ts
  versions: {
    drafts: {
      autosave: { interval: 800 },
    },
  },
  hooks: {
```

- [ ] **Step 3: Update Products**

In `src/collections/Products.ts`, add the same `versions` block as a sibling of `hooks` (Products has no `access` block — `hooks` is the first key after `admin`):

```ts
  versions: {
    drafts: {
      autosave: { interval: 800 },
    },
  },
  fields: [
```

- [ ] **Step 4: Update SiteSettings**

In `src/globals/SiteSettings.ts`, add the same `versions` block as a sibling of `access`:

```ts
  versions: {
    drafts: {
      autosave: { interval: 800 },
    },
  },
  fields: [
```

- [ ] **Step 5: Regenerate Payload types**

Run: `make db-generate-types`

Expected: `src/payload-types.ts` updated with `_status` fields and version types on the four affected types. No errors.

- [ ] **Step 6: Typecheck**

Run: `make typecheck`

Expected: Exit 0. If `payload-types.ts` introduces any new required types, the page changes in Tasks 5-8 will pick them up — the typecheck after THIS step should still pass because the existing pages don't reference `_status` yet.

- [ ] **Step 7: Commit**

```bash
git add src/collections/Pages.ts src/collections/Posts.ts src/collections/Products.ts src/globals/SiteSettings.ts src/payload-types.ts
git commit -m "feat(payload): enable versions.drafts.autosave on pages, posts, products, site-settings"
```

---

## Task 4: Create `RefreshRouteOnSave` client component (TDD)

**Files:**

- Create: `src/components/live-preview/RefreshRouteOnSave.tsx`
- Create: `src/components/live-preview/RefreshRouteOnSave.test.tsx`

**Interfaces:**

- Consumes: `useRouter` from `next/navigation` (already mocked in `vitest.setup.ts` to return `{ refresh: vi.fn() }`); `RefreshRouteOnSave as PayloadLivePreview` and `isDocumentEvent` from `@payloadcms/live-preview-react`; `process.env.NEXT_PUBLIC_SERVER_URL` (default to `http://localhost:3000`)
- Produces: a default-export React component that renders `null`, listens for admin `postMessage` events matching the serverURL, calls `router.refresh()` on match, sends a `ready` postMessage handshake on mount, and removes its listener on unmount

- [ ] **Step 1: Write the failing test**

Create `src/components/live-preview/RefreshRouteOnSave.test.tsx`:

```tsx
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import React from 'react'
import { useRouter } from 'next/navigation'
import { RefreshRouteOnSave } from './RefreshRouteOnSave'

const SERVER_URL = 'http://localhost:3000'

describe('RefreshRouteOnSave', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SERVER_URL = SERVER_URL
    vi.clearAllMocks()
  })

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SERVER_URL
  })

  it('renders nothing', () => {
    const { container } = render(<RefreshRouteOnSave />)
    expect(container.firstChild).toBeNull()
  })

  it('calls router.refresh() on a postMessage from the serverURL', () => {
    const router = useRouter() as unknown as {
      refresh: ReturnType<typeof vi.fn>
    }
    render(<RefreshRouteOnSave />)

    const event = new MessageEvent('message', {
      origin: SERVER_URL,
      data: { type: 'payload-live-preview', data: { id: '123' } },
    })

    act(() => {
      window.dispatchEvent(event)
    })

    expect(router.refresh).toHaveBeenCalledTimes(1)
  })

  it('ignores postMessages from other origins', () => {
    const router = useRouter() as unknown as {
      refresh: ReturnType<typeof vi.fn>
    }
    render(<RefreshRouteOnSave />)

    const event = new MessageEvent('message', {
      origin: 'http://evil.example',
      data: { type: 'payload-live-preview' },
    })

    act(() => {
      window.dispatchEvent(event)
    })

    expect(router.refresh).not.toHaveBeenCalled()
  })
})
```

> Note: The `next/navigation` mock in `vitest.setup.ts` returns the same `{ refresh: vi.fn() }` for every `useRouter()` call (module-level state). The two assertions above work because `vi.clearAllMocks()` in `beforeEach` resets call history but the mock object itself is reused.

- [ ] **Step 2: Run the test to verify it fails**

Run: `pnpm exec vitest run src/components/live-preview/RefreshRouteOnSave.test.tsx`

Expected: FAIL with "Cannot find module './RefreshRouteOnSave'" or similar — the component does not exist yet.

- [ ] **Step 3: Implement the component**

Create `src/components/live-preview/RefreshRouteOnSave.tsx`:

```tsx
'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { isDocumentEvent, ready } from '@payloadcms/live-preview'

export function RefreshRouteOnSave() {
  const router = useRouter()
  const hasSentReadyMessage = useRef(false)

  const serverURL =
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  const onMessage = useCallback(
    (event: MessageEvent) => {
      if (isDocumentEvent(event, serverURL)) {
        router.refresh()
      }
    },
    [router, serverURL],
  )

  useEffect(() => {
    window.addEventListener('message', onMessage)
    if (!hasSentReadyMessage.current) {
      hasSentReadyMessage.current = true
      ready({ serverURL })
    }
    return () => {
      window.removeEventListener('message', onMessage)
    }
  }, [onMessage, serverURL])

  return null
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `make test -- src/components/live-preview/RefreshRouteOnSave.test.tsx`

Expected: 3 tests pass.

- [ ] **Step 5: Typecheck**

Run: `make typecheck`

Expected: Exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/components/live-preview/
git commit -m "feat(live-preview): add RefreshRouteOnSave client component"
```

---

## Task 5: Wire Pages route (`/[slug]`) to live preview

**Files:**

- Modify: `src/app/(frontend)/[slug]/page.tsx`

**Interfaces:**

- Consumes: `RefreshRouteOnSave` from `@/components/live-preview/RefreshRouteOnSave`; `headers` from `next/headers`; `payload.auth` from the local API
- Produces: a page that, when loaded with `?preview=true&id=<docId>`, fetches the doc by id with `draft: true, overrideAccess: false`, falls back to the existing published-by-slug query otherwise, and mounts `<RefreshRouteOnSave />` only in preview mode

- [ ] **Step 1: Update the imports and Props type**

In `src/app/(frontend)/[slug]/page.tsx`, replace the `Props` type (lines 17-19) so it accepts searchParams:

```ts
import { headers as nextHeaders } from 'next/headers'
import { RefreshRouteOnSave } from '@/components/live-preview/RefreshRouteOnSave'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string; id?: string }>
}
```

- [ ] **Step 2: Update the page function signature and add the preview branch**

In the `CatchAllPage` function, replace the body so it reads:

```ts
export default async function CatchAllPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { preview, id } = await searchParams
  const isPreview = preview === 'true' && Boolean(id)
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })

  const page = isPreview
    ? await payload.findByID({
        collection: 'pages',
        id: id!,
        draft: true,
        overrideAccess: false,
        user: user ?? undefined,
        depth: 2,
      })
    : ((await payload.find({
        collection: 'pages',
        where: {
          slug: { equals: slug },
          status: { equals: 'published' },
        },
        limit: 1,
        depth: 2,
      })).docs[0] as any)

  if (!page) {
    return notFound()
  }

  const template = page.template || 'default'

  // If page is contact, search for contact form
  let contactFormDoc = null
  if (template === 'contact') {
    const forms = await payload.find({
      collection: 'forms',
      where: {
        slug: { equals: 'contact' },
      },
      limit: 1,
    })
    contactFormDoc = forms.docs[0] || null
  }

  return (
    <div className="bg-surface min-h-screen">
      {isPreview && <RefreshRouteOnSave />}
      {/* ...existing template + blocks render unchanged... */}
    </div>
  )
}
```

Leave the rest of the function body (template rendering, blocks, etc.) untouched.

- [ ] **Step 3: Typecheck**

Run: `make typecheck`

Expected: Exit 0. The `findByID` returns a typed `Page` from `payload-types`, while the existing code does `(result.docs[0] as any)` and reads `page.content` etc. as `any`. Cast `page` to `any` if TypeScript complains:

```ts
const page: any = isPreview
  ? await payload.findByID({ ... })
  : (await payload.find({ ... })).docs[0]
```

(The `as any` on the docs[0] is already present in the original code, so this stays consistent.)

- [ ] **Step 4: Run unit tests to make sure nothing regressed**

Run: `make test`

Expected: All passing. The live preview test from Task 4 still passes.

- [ ] **Step 5: Commit**

```bash
git add src/app/(frontend)/[slug]/page.tsx
git commit -m "feat(pages): enable live preview for pages route"
```

---

## Task 6: Wire Posts route (`/blog/[slug]`) to live preview

**Files:**

- Modify: `src/app/(frontend)/blog/[slug]/page.tsx`

**Interfaces:**

- Consumes: same as Task 5
- Produces: same as Task 5, but for `posts` collection and `draft: true` fetch

- [ ] **Step 1: Update the imports and Props type**

In `src/app/(frontend)/blog/[slug]/page.tsx`, add to the import block:

```ts
import { headers as nextHeaders } from 'next/headers'
import { RefreshRouteOnSave } from '@/components/live-preview/RefreshRouteOnSave'
```

Replace the `Props` type (lines 7-9) with:

```ts
type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string; id?: string }>
}
```

- [ ] **Step 2: Update the page function body**

In `BlogDetailPage`, replace the body so it reads:

```ts
export default async function BlogDetailPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { preview, id } = await searchParams
  const isPreview = preview === 'true' && Boolean(id)
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })

  const post: any = isPreview
    ? await payload.findByID({
        collection: 'posts',
        id: id!,
        draft: true,
        overrideAccess: false,
        user: user ?? undefined,
        depth: 2,
      })
    : ((await payload.find({
        collection: 'posts',
        where: {
          slug: { equals: slug },
          status: { equals: 'published' },
        },
        limit: 1,
        depth: 2,
      })).docs[0] as any)

  if (!post) {
    return notFound()
  }

  const dateStr = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'Journal Entry'

  return (
    <div className="bg-surface min-h-screen px-4 py-12 sm:px-6 lg:px-8">
      {isPreview && <RefreshRouteOnSave />}
      <article className="mx-auto max-w-3xl space-y-8">
        {/* ...existing JSX unchanged... */}
      </article>
    </div>
  )
}
```

- [ ] **Step 3: Typecheck**

Run: `make typecheck`

Expected: Exit 0.

- [ ] **Step 4: Run unit tests**

Run: `make test`

Expected: All passing.

- [ ] **Step 5: Commit**

```bash
git add src/app/(frontend)/blog/[slug]/page.tsx
git commit -m "feat(posts): enable live preview for blog post route"
```

---

## Task 7: Wire Products route (`/products/[slug]`) to live preview

**Files:**

- Modify: `src/app/(frontend)/products/[slug]/page.tsx`

**Interfaces:**

- Consumes: same as Task 5
- Produces: same as Task 5, but for `products` collection

- [ ] **Step 1: Update the imports and Props type**

In `src/app/(frontend)/products/[slug]/page.tsx`, add to the import block:

```ts
import { headers as nextHeaders } from 'next/headers'
import { RefreshRouteOnSave } from '@/components/live-preview/RefreshRouteOnSave'
```

Replace the `Props` type at the top of the file with:

```ts
type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview?: string; id?: string }>
}
```

(If `Props` is defined elsewhere in the file, locate it and replace it. The variable name may differ — adapt the type name as needed but keep the same shape.)

- [ ] **Step 2: Update the page function body**

Find the page's default export and replace the data-fetching block so it follows the same pattern as Tasks 5 and 6:

```ts
export default async function ProductDetailPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { preview, id } = await searchParams
  const isPreview = preview === 'true' && Boolean(id)
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: await nextHeaders() })

  const product: any = isPreview
    ? await payload.findByID({
        collection: 'products',
        id: id!,
        draft: true,
        overrideAccess: false,
        user: user ?? undefined,
        depth: 2,
      })
    : ((await payload.find({
        collection: 'products',
        where: {
          slug: { equals: slug },
          status: { equals: 'published' },
        },
        limit: 1,
        depth: 2,
      })).docs[0] as any)

  if (!product) {
    return notFound()
  }

  // ...rest of existing product render logic unchanged...

  return (
    <div className="bg-surface min-h-screen">
      {isPreview && <RefreshRouteOnSave />}
      {/* ...existing product page JSX... */}
    </div>
  )
}
```

> Read the existing `src/app/(frontend)/products/[slug]/page.tsx` to find the exact JSX wrapper element (it may use `<div className="bg-surface min-h-screen ...">` or a different container). Mount `<RefreshRouteOnSave />` as the first child of that wrapper so it sits at the top of the rendered tree.

- [ ] **Step 3: Typecheck**

Run: `make typecheck`

Expected: Exit 0.

- [ ] **Step 4: Run unit tests**

Run: `make test`

Expected: All passing.

- [ ] **Step 5: Commit**

```bash
git add src/app/(frontend)/products/[slug]/page.tsx
git commit -m "feat(products): enable live preview for product detail route"
```

---

## Task 8: Wire homepage (`/`) to live preview for SiteSettings

**Files:**

- Modify: `src/app/(frontend)/page.tsx`

**Interfaces:**

- Consumes: `RefreshRouteOnSave`; `payload.findGlobal` from the local API
- Produces: a homepage that, when loaded with `?preview=true&id=site-settings`, fetches the global with `draft: true, overrideAccess: false`, and mounts `<RefreshRouteOnSave />`. Public traffic uses the existing published global query.

- [ ] **Step 1: Update the imports**

In `src/app/(frontend)/page.tsx`, add to the import block:

```ts
import { RefreshRouteOnSave } from '@/components/live-preview/RefreshRouteOnSave'
```

- [ ] **Step 2: Add searchParams to the home component and gate the preview mount**

Read the existing default export's signature in `src/app/(frontend)/page.tsx`. Add a `searchParams` prop and an `isPreview` check:

```ts
type Props = {
  searchParams: Promise<{ preview?: string; id?: string }>
}

export default async function HomePage({ searchParams }: Props) {
  const { preview, id } = await searchParams
  const isPreview = preview === 'true' && id === 'site-settings'
  // ...existing homepage logic unchanged...

  return (
    <div className="...">
      {isPreview && <RefreshRouteOnSave />}
      {/* ...existing homepage JSX... */}
    </div>
  )
}
```

- [ ] **Step 3: Re-fetch SiteSettings with `draft: true` when in preview mode**

If the homepage fetches `SiteSettings` today (it currently doesn't — only the Header does, via a broken client fetch), add a `findGlobal` call. Otherwise, no fetch change is needed; the existing server-rendered layout will continue to work as-is, and the `RefreshRouteOnSave` mounted at the top of the page will trigger re-renders on every save so the layout picks up the new global state on the next render.

> If the homepage does not currently read SiteSettings server-side, skip the fetch change and only add the `RefreshRouteOnSave` mount. SiteSettings live preview is documented as limited to server-rendered layout in `.copilot/superpowers/CLO-80-live-preview-design.md`.

- [ ] **Step 4: Typecheck**

Run: `make typecheck`

Expected: Exit 0.

- [ ] **Step 5: Run unit tests**

Run: `make test`

Expected: All passing.

- [ ] **Step 6: Commit**

```bash
git add src/app/(frontend)/page.tsx
git commit -m "feat(homepage): enable live preview for site-settings global"
```

---

## Task 9: Final verification

**Files:** none — verification only

- [ ] **Step 1: Lint**

Run: `make lint`

Expected: Exit 0. If Prettier wants to reformat anything, run `make format` and re-commit.

- [ ] **Step 2: Typecheck**

Run: `make typecheck`

Expected: Exit 0.

- [ ] **Step 3: Unit tests**

Run: `make test`

Expected: All tests pass, including the 3 new `RefreshRouteOnSave` tests.

- [ ] **Step 4: Verify `admin.livePreview` shows up in the config**

Run: `pnpm exec payload generate:types && grep -A 2 "livePreview" src/payload.config.ts | head -20`

Expected: `livePreview:` is present in the `admin:` block of `payload.config.ts` with the `url` function and `breakpoints` array.

- [ ] **Step 5: Push branch and open PR**

```bash
git push -u origin feature/clo-80-payload-live-preview-for-pages-posts-products-and
gh pr create --base develop \
  --title "feat(clo-80): add Payload live preview for pages, posts, products, site-settings" \
  --body "Implements CLO-80. See .copilot/superpowers/CLO-80-live-preview-design.md for the design.

End-to-end admin verification is blocked on CLO-3 (admin SSR 500). The wiring is unit-tested and ready to verify as soon as the admin panel renders."
```

Expected: PR opened against `develop`. CI passes lint + typecheck + unit tests.

---

## Self-Review (filled in by planner)

**Spec coverage:**

- [x] Install `@payloadcms/live-preview-react` → Task 1
- [x] `admin.livePreview.url` for all 3 collections + global → Task 2
- [x] `admin.livePreview.breakpoints` (Mobile/Tablet/Desktop) → Task 2
- [x] `versions.drafts.autosave.interval = 800` on all 4 → Task 3
- [x] `src/components/live-preview/RefreshRouteOnSave.tsx` exists, `'use client'`, renders null → Task 4
- [x] Three collection pages + homepage read `searchParams` and mount `RefreshRouteOnSave` only in preview mode → Tasks 5-8
- [x] Preview queries use `draft: true`, `overrideAccess: false`, pass `user` → Tasks 5-8
- [x] Vitest test covers `postMessage` → `router.refresh` + origin filtering → Task 4
- [x] `make typecheck`, `make lint`, `make test` pass → Task 9

**Out of scope (documented in spec):**

- Header's broken `fetch('/api/globals/site-settings')` — pre-existing.
- Admin SSR 500 (CLO-3) — end-to-end manual verification gated on this.
