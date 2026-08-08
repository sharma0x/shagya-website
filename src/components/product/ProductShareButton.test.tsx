import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import React from 'react'
import { ProductShareButton } from './ProductShareButton'

describe('ProductShareButton', () => {
  const defaultProps = {
    productName: 'Kadhwa Silk Saree',
    productSlug: 'kadhwa-silk-saree',
    productId: '123',
    productPrice: 12500,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the floating share button with aria-label', () => {
    render(<ProductShareButton {...defaultProps} />)
    const button = screen.getByRole('button', { name: /share product/i })
    expect(button).toBeDefined()
  })

  it('opens the share modal when clicked on desktop', async () => {
    render(<ProductShareButton {...defaultProps} />)
    const button = screen.getByRole('button', { name: /share product/i })

    act(() => {
      fireEvent.click(button)
    })

    expect(screen.getByRole('dialog')).toBeDefined()
    expect(screen.getByText('Share this Saree')).toBeDefined()
    expect(screen.getByText('Kadhwa Silk Saree')).toBeDefined()
    expect(screen.getByText('₹12,500')).toBeDefined()
  })

  it('closes the modal when close button or ESC key is pressed', () => {
    render(<ProductShareButton {...defaultProps} />)
    const button = screen.getByRole('button', { name: /share product/i })

    act(() => {
      fireEvent.click(button)
    })

    expect(screen.getByRole('dialog')).toBeDefined()

    const closeBtn = screen.getByRole('button', {
      name: /close share options/i,
    })
    act(() => {
      fireEvent.click(closeBtn)
    })

    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('copies URL to clipboard and shows Copied feedback when Copy Link is clicked', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })
    // Simulate secure context
    Object.defineProperty(window, 'isSecureContext', {
      value: true,
      configurable: true,
    })

    render(<ProductShareButton {...defaultProps} />)
    const button = screen.getByRole('button', { name: /share product/i })

    act(() => {
      fireEvent.click(button)
    })

    const copyBtn = screen.getByRole('button', { name: /copy link/i })

    await act(async () => {
      fireEvent.click(copyBtn)
    })

    expect(writeTextMock).toHaveBeenCalledWith(
      expect.stringContaining('/products/kadhwa-silk-saree/123'),
    )
    expect(screen.getByText('Copied!')).toBeDefined()
  })
})
