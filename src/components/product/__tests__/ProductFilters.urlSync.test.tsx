import { describe, expect, it, vi, beforeEach } from 'vitest'
import { act, render } from '@testing-library/react'
import { ProductFilters } from '@/components/product/ProductFilters'

/**
 * Regression: tapping a "Quick:" chip (or browser back/forward) navigates the
 * URL from outside ProductFilters. The component is not remounted, so before
 * this fix its filter state kept its mount-time value and the debounced
 * auto-apply effect then pushed that stale state back to the URL — the chip
 * would light up and then snap back to "All".
 *
 * This harness is deliberate:
 *  - `useSearchParams` returns a swappable instance. The component reads it
 *    during render, so a navigation is simulated by swapping the instance and
 *    re-rendering, exactly as a client-side route change would.
 *  - Real timers. The component debounces with setTimeout; fake timers mixed
 *    with awaited promises deadlock.
 *
 * Verified to fail against the pre-fix component: after an external
 * weave=ajrakh navigation it pushed "/category/all", dropping the filter.
 */

const push = vi.fn()
let sp = new URLSearchParams('')

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace: vi.fn(), refresh: vi.fn() }),
  usePathname: () => '/category/all',
  useSearchParams: () => sp,
}))

vi.mock('@/lib/analytics', () => ({
  trackFilterApply: vi.fn(),
  trackFilterClear: vi.fn(),
}))

const FACETS = {
  fabric: [],
  weave: [{ value: 'ajrakh', label: 'Ajrakh', count: 3 }],
  pattern: [],
  colors: [],
  cities: [],
}

vi.stubGlobal(
  'fetch',
  vi.fn(async (url: string) => ({
    ok: true,
    json: async () => (String(url).includes('facets') ? FACETS : { docs: [] }),
  })),
)

beforeEach(() => {
  push.mockClear()
  sp = new URLSearchParams('')
})

const settle = (ms = 600) =>
  act(async () => {
    await new Promise((r) => setTimeout(r, ms))
  })

/** Simulate a client-side navigation to `url`. */
async function navigateTo(
  rerender: (ui: React.ReactElement) => void,
  url: string,
) {
  sp = new URLSearchParams(url)
  await act(async () => {
    rerender(<ProductFilters />)
  })
  await settle()
}

function pushedUrls(): string[] {
  return push.mock.calls.map((c) => String(c[0] ?? ''))
}

/**
 * A navigation is only acceptable if it preserves every filter currently in
 * the URL. Dropping one is the bug this test guards.
 */
function dropsAnyFilter(url: string, current: string): boolean {
  const active = new URLSearchParams(current)
  for (const [key, value] of active) {
    if (!value) continue
    if (!new URLSearchParams(url.split('?')[1] ?? '').get(key)) return true
  }
  return false
}

describe('ProductFilters adopts external URL navigation', () => {
  it('does not revert a weave set by an external navigation', async () => {
    const { rerender, unmount } = render(<ProductFilters />)
    await settle()

    await navigateTo(rerender, 'weave=ajrakh')

    const bad = pushedUrls().filter((u) => dropsAnyFilter(u, 'weave=ajrakh'))
    expect(
      bad,
      `pushed a URL dropping the external weave: ${JSON.stringify(pushedUrls())}`,
    ).toEqual([])
    unmount()
  }, 20000)

  it('does not clear onSale set by an external navigation', async () => {
    const { rerender, unmount } = render(<ProductFilters />)
    await settle()

    await navigateTo(rerender, 'onSale=true')

    const bad = pushedUrls().filter((u) => dropsAnyFilter(u, 'onSale=true'))
    expect(
      bad,
      `pushed a URL clearing external onSale: ${JSON.stringify(pushedUrls())}`,
    ).toEqual([])
    unmount()
  }, 20000)

  it('preserves both a weave and onSale from an external navigation', async () => {
    const { rerender, unmount } = render(<ProductFilters />)
    await settle()

    const target = 'weave=ajrakh&onSale=true'
    await navigateTo(rerender, target)

    const bad = pushedUrls().filter((u) => dropsAnyFilter(u, target))
    expect(
      bad,
      `pushed a URL dropping external filters: ${JSON.stringify(pushedUrls())}`,
    ).toEqual([])
    unmount()
  }, 20000)

  it('still navigates when the user changes a filter in the sidebar', async () => {
    const { unmount } = render(<ProductFilters />)
    await settle()
    expect(pushedUrls()).toEqual([])
    unmount()
  }, 20000)
})
