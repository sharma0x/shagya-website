import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

vi.stubGlobal(
  'fetch',
  vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          instagramUrl: 'https://instagram.com/shayga.official',
          facebookUrl: 'https://facebook.com/shayga',
          youtubeUrl: 'https://youtube.com/@shayga',
          whatsappUrl: 'https://wa.me/91906566511',
        }),
    }),
  ),
)

describe('Footer', () => {
  it('renders the brand name', () => {
    render(<Footer />)
    // "Shayga" appears in both the Logo wordmark and the company column title
    expect(screen.getAllByText('Shayga').length).toBeGreaterThanOrEqual(1)
  })

  it('renders a copyright line with the current year', () => {
    render(<Footer />)
    const year = new Date().getFullYear()
    expect(screen.getByText(new RegExp(`©.*${year}`))).toBeInTheDocument()
  })

  it('renders social links from site settings', async () => {
    render(<Footer />)
    const instagram = await screen.findByRole('link', { name: /instagram/i })
    expect(instagram.getAttribute('href')).toBe(
      'https://instagram.com/shayga.official',
    )
    expect(
      screen.getByRole('link', { name: /whatsapp/i }).getAttribute('href'),
    ).toBe('https://wa.me/91906566511')
    expect(screen.getByRole('link', { name: /youtube/i })).toBeInTheDocument()
  })

  it('does not render a Pinterest link', async () => {
    render(<Footer />)
    await screen.findByRole('link', { name: /instagram/i })
    expect(
      screen.queryByRole('link', { name: /pinterest/i }),
    ).not.toBeInTheDocument()
  })

  it('falls back to the default WhatsApp number when not set in site settings', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              instagramUrl: 'https://instagram.com/shayga',
              facebookUrl: 'https://facebook.com/shayga',
            }),
        }),
      ),
    )
    render(<Footer />)
    await screen.findByRole('link', { name: /instagram/i })
    expect(
      screen.getByRole('link', { name: /whatsapp/i }).getAttribute('href'),
    ).toBe('https://wa.me/91906566511')
  })
})
