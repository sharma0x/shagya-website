# Current Architecture

## What exists today

The product listing pages have rudimentary, page-specific filtering with no shared component architecture.

### Page: `/category/[slug]`

```
Server Component (async)
├── Static `where` clause built from slug (fabric/weave/occasion match)
├── Hardcoded weave filter chips (All, Banarasi, Kanchipuram, Chanderi)
│   └── Navigate via `<Link>` with `?sort=...&weave=...`
├── SortSelect client component (sort param only)
│   └── Uses `useRouter().push()` — only preserves `weave` param
└── Product grid (server-rendered)
```

### Page: `/collections/[slug]`

```
Server Component (async)
├── Static `where` clause: `collections: { contains: collection.id }`
├── No filtering at all
├── SortSelect client component (sort param only)
└── Product grid (server-rendered)
```

### Page: `/search`

```
Server Component (async)
├── FTS query via payload.find on 'search' collection
├── No filtering at all
├── No sort dropdown
└── Product grid (server-rendered)
```

### Shared patterns

- All pages are **server components** with `async` data fetching
- URL searchParams are the only state carrier for filters
- `SortSelect` at `src/components/ui/sort-select.tsx` is the only shared filtering component
- No client-side filter state management exists
- No mobile-adapted filter UI exists
- The `Filter` icon from `lucide-react` is imported but unused in the category page

### Data flow (current)

```
User clicks filter chip → URL changes via Link navigation
       ↓
Server re-renders → payload.find() with static where clause
       ↓
HTML returned to browser
```

[↑ Overview](./README.md)
