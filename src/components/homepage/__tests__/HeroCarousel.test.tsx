import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { HeroCarousel, type HeroSlide } from '../HeroCarousel'

describe('HeroCarousel', () => {
  it('renders nothing when no slides provided', () => {
    const { container } = render(<HeroCarousel slides={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders slides with responsive wrappers for mobile and desktop images', () => {
    const slides: HeroSlide[] = [
      {
        imageUrl: 'https://cdn.shayga.in/desktop-1.png',
        mobileImageUrl: 'https://cdn.shayga.in/mobile-1.png',
        link: '/category/festive',
      },
      {
        imageUrl: 'https://cdn.shayga.in/desktop-2.png',
        mobileImageUrl: 'https://cdn.shayga.in/mobile-2.png',
        link: '/category/silk',
      },
    ]

    const { container } = render(<HeroCarousel slides={slides} />)

    // Verify links for both slides exist
    const links = container.querySelectorAll('a')
    expect(links).toHaveLength(2)

    // For each slide with mobileImageUrl, mobile wrapper must have md:hidden
    // and desktop wrapper must have hidden md:block so skeletons are scoped
    links.forEach((link) => {
      const mobileWrapper = link.querySelector('.md\\:hidden')
      expect(mobileWrapper).not.toBeNull()
      expect(mobileWrapper?.className).toContain('absolute inset-0')

      const desktopWrapper = link.querySelector('.hidden.md\\:block')
      expect(desktopWrapper).not.toBeNull()
      expect(desktopWrapper?.className).toContain('absolute inset-0')
    })
  })

  it('renders single wrapper when mobileImageUrl is omitted', () => {
    const slides: HeroSlide[] = [
      {
        imageUrl: 'https://cdn.shayga.in/desktop-only.png',
        link: '/category/all',
      },
    ]

    const { container } = render(<HeroCarousel slides={slides} />)
    const link = container.querySelector('a')
    expect(link).not.toBeNull()

    // No md:hidden wrapper
    expect(link?.querySelector('.md\\:hidden')).toBeNull()

    // Desktop wrapper is not hidden on mobile
    const wrapper = link?.querySelector('.absolute.inset-0')
    expect(wrapper?.className).not.toContain('hidden')
  })
})
