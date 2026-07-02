# CLO-40: Search Experience Enhancements

## Overview

Add search autocomplete dropdown to the search bar, no-results recommendations ("try category X instead"), and typo-tolerant "did you mean...?" suggestions.

## Stack Constraints

- **Frontend**: Next.js 16 App Router, React 19, Tailwind v4
- **Backend**: Payload 3.x search plugin (already configured for products, pages, posts)
- **API**: Existing `/api/search?q=` endpoint
- **No new packages**: Use existing search infrastructure, no Elasticsearch/Meilisearch
- **Design**: Match existing SearchCommand modal styling

## OOP / DRY Principles

- Search autocomplete reuses existing `/api/search` endpoint (add `limit=5` for suggestions)
- Did-you-mean uses simple Levenshtein distance against known product names (no external library — implement inline)
- No-results recommendations reuse existing category data from `/api/categories`
- Single `<SearchSuggestions />` component handles autocomplete + spellcheck + no-results

## Acceptance Criteria

### 1. Search Autocomplete Dropdown
- [ ] Header search input (currently opens command palette) shows dropdown on typing
- [ ] Dropdown: top 5 product/posts results with thumbnail + name + price
- [ ] Fetches via API: `GET /api/search?q={query}&limit=5` (add `limit` param)
- [ ] Keyboard navigation: arrow keys + Enter to select
- [ ] Click outside to close
- [ ] Debounced: 300ms delay before fetch
- [ ] "View all results for '{query}'" link at bottom → navigates to `/search?q=`

### 2. No-Results Recommendations
- [ ] When search returns 0 results, show: "No results for '{query}'. Try these categories:"
- [ ] Show 4 category links (top categories or semantically close ones)
- [ ] Show "Popular searches" chips: Silk, Banarasi, Cotton, Handloom, Bridal
- [ ] Offer "Browse all products" link

### 3. Did-You-Mean Spell Correction
- [ ] On 0 results: run Levenshtein check against known product names
- [ ] If a close match found (distance ≤ 2), show "Did you mean {suggestion}?"
- [ ] Clicking suggestion navigates to search with corrected query
- [ ] Known names cached from product `name` field on server startup/first request

### 4. Search Results Page Improvements
- [ ] `/search` page: add filter sidebar (reuse ProductFilters without category-specific sections)
- [ ] Split results: "Products (X)" tab + "Stories (Y)" tab (already partially done)
- [ ] Show result count + search time display (optional)

## Technical Notes

### Files to Create
- `src/components/search/SearchDropdown.tsx` — autocomplete dropdown
- `src/lib/search-suggestions.ts` — Levenshtein distance + cached product names

### Files to Modify
- `src/components/layout/Header.tsx` — replace command palette trigger with search input + autocomplete
- `src/app/api/search/route.ts` — add `limit` query param support
- `src/app/(frontend)/search/page.tsx` — add no-results UI, did-you-mean, filter sidebar

### Levenshtein Implementation
```typescript
// Simple inline — no dependency needed
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) => [i])
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[m][n]
}
```
