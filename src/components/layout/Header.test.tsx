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
            text: 'Free shipping on orders above ₹999 \u00A0·\u00A0 Easy 7-day returns',
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
    const homeLink = screen.getByRole('link', { name: /shagya/i })
    expect(homeLink).toBeInTheDocument()
  })

  it('renders all desktop nav links', () => {
    render(<Header />)
    const expected = [
      { name: 'Silk', href: '/category/silk' },
      { name: 'Cotton', href: '/category/cotton' },
      { name: 'Handloom', href: '/category/handloom' },
      { name: 'Designer', href: '/category/designer' },
      { name: 'Collections', href: '/collections' },
      { name: 'Journal', href: '/blog' },
    ]
    for (const { name, href } of expected) {
      const links = screen.getAllByRole('link', { name })
      expect(links.some((link) => link.getAttribute('href') === href)).toBe(
        true,
      )
    }
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
