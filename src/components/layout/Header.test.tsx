import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'

vi.mock('@/lib/auth-client', () => ({
  useSession: () => ({ data: null, isPending: false }),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
}))

vi.stubGlobal(
  'fetch',
  vi.fn((url: string) =>
    Promise.resolve({
      ok: true,
      json: () => {
        if (url.includes('/api/wishlist')) {
          return Promise.resolve({ items: [] })
        }
        return Promise.resolve({
          announcementBar: {
            enabled: true,
            announcements: [
              {
                text: 'Free shipping on orders above ₹999 \u00A0·\u00A0 Easy 7-day returns',
              },
            ],
          },
        })
      },
    }),
  ),
)

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the announcement bar', async () => {
    render(<Header />)
    expect(await screen.findByText(/free shipping/i)).toBeInTheDocument()
  })

  it('renders the brand logo', () => {
    render(<Header />)
    // The Logo component appears in the main header and in the mobile menu
    // overlay, so use getAllByRole and assert at least one is present.
    const homeLinks = screen.getAllByRole('link', { name: /shayga/i })
    expect(homeLinks.length).toBeGreaterThan(0)
  })

  it('renders all desktop nav links', () => {
    render(<Header />)
    // "Sarees" is a NavigationMenuTrigger (button), not a link.
    // Desktop nav links are Collections and Journal.
    const expected = [
      { name: 'Collections', href: '/collections' },
      { name: 'Journal', href: '/blog' },
    ]
    for (const { name, href } of expected) {
      const links = screen.getAllByRole('link', { name })
      expect(links.some((link) => link.getAttribute('href') === href)).toBe(
        true,
      )
    }
    // Sarees trigger appears in both desktop and mobile nav, so use
    // getAllByText and assert at least one is present.
    expect(screen.getAllByText('Sarees').length).toBeGreaterThan(0)
  })

  it('renders action buttons (search, account, wishlist, cart)', () => {
    render(<Header />)
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: /account|my account/i }).length,
    ).toBeGreaterThan(0)
    expect(
      screen.getAllByRole('link', { name: /wishlist/i }).length,
    ).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /^cart$/i })).toBeInTheDocument()
  })

  it('shows no cart count badge by default (zero count)', () => {
    render(<Header />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('toggles mobile menu when menu button is clicked', async () => {
    const user = userEvent.setup()
    render(<Header />)

    const menuButton = screen.getByRole('button', { name: /open menu/i })
    expect(menuButton).toBeInTheDocument()

    await user.click(menuButton)

    expect(
      screen.getByRole('button', { name: /close menu/i }),
    ).toBeInTheDocument()
  })
})
