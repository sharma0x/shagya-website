import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from './Footer'

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
})
