import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Header } from './Header'

describe('Header', () => {
  it('renders the announcement bar', () => {
    render(<Header />)
    expect(screen.getByText(/free shipping/i)).toBeInTheDocument()
  })

  it('renders the brand logo', () => {
    render(<Header />)
    const homeLink = screen.getByRole('link', { name: /shagya/i })
    expect(homeLink).toBeInTheDocument()
  })

  it('renders all desktop nav links', () => {
    render(<Header />)
    // Links appear in both desktop nav and mobile nav, so use getAllByRole
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
    // Account appears as an icon link and a "My Account" mobile nav link
    expect(
      screen.getAllByRole('link', { name: /account|my account/i }).length,
    ).toBeGreaterThan(0)
    // Wishlist also appears twice (desktop + mobile)
    expect(
      screen.getAllByRole('link', { name: /wishlist/i }).length,
    ).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /cart/i })).toBeInTheDocument()
  })

  it('shows cart count of zero by default', () => {
    render(<Header />)
    expect(screen.getByText('0')).toBeInTheDocument()
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
