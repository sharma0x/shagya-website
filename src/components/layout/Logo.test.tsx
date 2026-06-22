import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Logo } from './Logo'

describe('Logo', () => {
  it('renders the wordmark by default', () => {
    render(<Logo />)
    expect(screen.getByText('Shagya')).toBeInTheDocument()
  })

  it('hides the wordmark when showWordmark is false', () => {
    render(<Logo showWordmark={false} />)
    expect(screen.queryByText('Shagya')).not.toBeInTheDocument()
  })

  it('renders as a link by default with aria-label', () => {
    render(<Logo />)
    const link = screen.getByRole('link', { name: /shagya/i })
    expect(link).toHaveAttribute('href', '/')
  })

  it('renders as a span when href is null', () => {
    render(<Logo href={null} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Shagya')).toBeInTheDocument()
  })

  it('uses custom href when provided', () => {
    render(<Logo href="/about" />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/about')
  })

  it('always renders the mark with proper aria-hidden', () => {
    render(<Logo />)
    const img = document.querySelector('img')
    expect(img).toHaveAttribute('aria-hidden', 'true')
    expect(img).toHaveAttribute('alt', '')
  })
})
