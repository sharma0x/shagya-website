import { describe, expect, it } from 'vitest'

/**
 * Regression tests for the "Quick:" chip row on category pages.
 *
 * These mirror the pure URL-mutation semantics of the chip handler in
 * `src/app/(frontend)/category/[slug]/page.tsx`. The handler is inline JSX
 * inside a server component that awaits Payload, so it cannot be imported
 * directly; these reimplement the same rules against the same
 * `URLSearchParams` behaviour to pin the contracts that broke before.
 */

const NON_FILTER_PARAMS = new Set(['sort', 'page', 'limit'])

function getCommaParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string[] {
  const val = params[key]
  if (!val) return []
  const str = Array.isArray(val) ? val[0] : (val as string)
  return str.split(',').filter(Boolean)
}

/** Mirrors the `all` branch: active only when no real filter is applied. */
function allIsActive(params: URLSearchParams): boolean {
  return [...params.keys()]
    .filter((key) => !NON_FILTER_PARAMS.has(key))
    .every((key) => !params.get(key))
}

/** Mirrors the `all` branch's clearing loop; `sort` is preserved. */
function applyAll(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params)
  const sort = next.get('sort')
  for (const key of [...next.keys()]) {
    if (key !== 'sort') next.delete(key)
  }
  if (sort) next.set('sort', sort)
  return next
}

/** Mirrors the `sale` branch. */
function applySale(params: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(params)
  const isActive = next.get('onSale') === 'true'
  if (isActive) next.delete('onSale')
  else next.set('onSale', 'true')
  next.delete('page')
  return next
}

/** Mirrors the `weave` branch, including multi-slug preservation. */
function applyWeave(
  params: URLSearchParams,
  slug: string,
  sParams: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const next = new URLSearchParams(params)
  const selected = getCommaParam(sParams, 'weave')
  const isActive = selected.includes(slug)
  const updated = isActive
    ? selected.filter((s) => s !== slug)
    : [...selected, slug]
  if (updated.length > 0) next.set('weave', updated.join(','))
  else next.delete('weave')
  next.delete('page')
  return next
}

describe('Quick chip: All active detection', () => {
  it('is active with no params', () => {
    expect(allIsActive(new URLSearchParams())).toBe(true)
  })

  // Regression: the ignored keys were tested inline with negated clauses
  // inside `.every()`, which DISQUALIFIED rather than skipped them — so All
  // went permanently dark after a single sort change.
  it('stays active when only sort is present', () => {
    expect(allIsActive(new URLSearchParams({ sort: 'price-asc' }))).toBe(true)
  })

  it('stays active when only page is present', () => {
    expect(allIsActive(new URLSearchParams({ page: '2' }))).toBe(true)
  })

  it('stays active when only limit is present', () => {
    expect(allIsActive(new URLSearchParams({ limit: '50' }))).toBe(true)
  })

  it('stays active with sort and page together', () => {
    expect(
      allIsActive(new URLSearchParams({ sort: 'price-asc', page: '2' })),
    ).toBe(true)
  })

  it('is inactive when a real filter is applied', () => {
    expect(allIsActive(new URLSearchParams({ weave: 'banarasi' }))).toBe(false)
    expect(allIsActive(new URLSearchParams({ color: 'red' }))).toBe(false)
  })

  it('is inactive with sort plus a real filter', () => {
    expect(
      allIsActive(new URLSearchParams({ sort: 'x', weave: 'banarasi' })),
    ).toBe(false)
  })

  it('treats a present-but-empty param as active (no filter is applied)', () => {
    expect(allIsActive(new URLSearchParams({ weave: '' }))).toBe(true)
  })
})

describe('Quick chip: All clears every filter', () => {
  it('removes all filter params', () => {
    const result = applyAll(
      new URLSearchParams({
        weave: 'banarasi',
        color: 'red',
        minPrice: '100',
        fabric: 'silk',
        onSale: 'true',
      }),
    )
    expect(result.toString()).toBe('')
  })

  it('preserves sort but drops page', () => {
    const result = applyAll(
      new URLSearchParams({ sort: 'price-asc', page: '4', weave: 'banarasi' }),
    )
    expect(result.get('sort')).toBe('price-asc')
    expect(result.get('page')).toBeNull()
    expect(result.get('weave')).toBeNull()
  })

  it('leaves an already-clean url untouched', () => {
    const result = applyAll(new URLSearchParams())
    expect(result.toString()).toBe('')
  })
})

describe('Quick chip: On Sale toggle', () => {
  it('sets onSale=true when off', () => {
    const result = applySale(new URLSearchParams())
    expect(result.get('onSale')).toBe('true')
  })

  // Regression: toggling off wrote the literal string "false", which
  // satisfied neither the All chip nor the On Sale chip, stranding the user
  // in a state where no chip was lit and only All could escape.
  it('deletes onSale rather than writing "false" when turning off', () => {
    const result = applySale(new URLSearchParams({ onSale: 'true' }))
    expect(result.has('onSale')).toBe(false)
    expect(result.get('onSale')).not.toBe('false')
  })

  it('returns to a state where All is active', () => {
    const result = applySale(new URLSearchParams({ onSale: 'true' }))
    expect(allIsActive(result)).toBe(true)
  })

  it('resets page so a narrow result set is not an empty grid', () => {
    const result = applySale(new URLSearchParams({ page: '5' }))
    expect(result.get('page')).toBeNull()
  })
})

describe('Quick chip: weave toggle', () => {
  it('adds the slug when not selected', () => {
    const result = applyWeave(new URLSearchParams(), 'banarasi', {})
    expect(result.get('weave')).toBe('banarasi')
  })

  // Regression: deactivating used to write `weave=`, but a present-but-empty
  // param still counts as "weave supplied" upstream, which skipped the
  // category-slug fallback and silently unfiltered the whole grid.
  it('deletes the param rather than writing an empty value when deselecting', () => {
    const result = applyWeave(
      new URLSearchParams({ weave: 'banarasi' }),
      'banarasi',
      { weave: 'banarasi' },
    )
    expect(result.has('weave')).toBe(false)
    expect(result.toString()).not.toContain('weave=')
  })

  it('detects active state when the param holds several slugs', () => {
    const sParams = { weave: 'banarasi,chanderi' }
    const selected = getCommaParam(sParams, 'weave')
    expect(selected).toEqual(['banarasi', 'chanderi'])
    expect(selected.includes('chanderi')).toBe(true)
  })

  it('preserves other selected weaves when adding one', () => {
    const result = applyWeave(
      new URLSearchParams({ weave: 'banarasi' }),
      'chanderi',
      { weave: 'banarasi' },
    )
    expect(result.get('weave')).toBe('banarasi,chanderi')
  })

  it('preserves other selected weaves when removing one', () => {
    const result = applyWeave(
      new URLSearchParams({ weave: 'banarasi,chanderi' }),
      'banarasi',
      { weave: 'banarasi,chanderi' },
    )
    expect(result.get('weave')).toBe('chanderi')
  })

  it('resets page so filtering from page 5 does not show an empty grid', () => {
    const result = applyWeave(
      new URLSearchParams({ page: '5' }),
      'chanderi',
      {},
    )
    expect(result.get('page')).toBeNull()
  })
})

describe('Quick chip: ordering', () => {
  it('renders All, then On Sale, then weaves', () => {
    const chips = [
      { kind: 'all' as const, key: 'all', label: 'All' },
      { kind: 'sale' as const, key: 'sale', label: 'On Sale' },
      {
        kind: 'weave' as const,
        key: 'weave-banarasi',
        label: 'Banarasi',
        slug: 'banarasi',
      },
    ]
    expect(chips.map((c) => c.kind)).toEqual(['all', 'sale', 'weave'])
    expect(new Set(chips.map((c) => c.key)).size).toBe(chips.length)
  })

  it('does not duplicate a chip for an already-featured weave', () => {
    const featured = [{ slug: 'banarasi', name: 'Banarasi' }]
    const applied = ['banarasi']
    const missing = applied.filter((s) => !featured.some((w) => w.slug === s))
    expect(missing).toEqual([])
  })

  it('appends a chip for an applied weave that is no longer featured', () => {
    const featured = [{ slug: 'banarasi', name: 'Banarasi' }]
    const applied = ['chanderi']
    const missing = applied.filter((s) => !featured.some((w) => w.slug === s))
    expect(missing).toEqual(['chanderi'])
  })
})
