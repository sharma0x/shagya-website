import { describe, it, expect } from 'vitest'
import { DEFAULT_TEMPLATES } from '../defaults'

describe('DEFAULT_TEMPLATES email logo rendering', () => {
  it('renders standard <img> tag for logo rather than inline <svg>', () => {
    const welcomeHtml = DEFAULT_TEMPLATES['welcome-customer'].body

    // Should include <img src="{{storeUrl}}/shayga-logo.svg"
    expect(welcomeHtml).toContain('<img src="{{storeUrl}}/shayga-logo.svg"')
    expect(welcomeHtml).toContain('alt="Shayga Logo"')

    // Should NOT contain raw inline <svg>
    expect(welcomeHtml).not.toContain('<svg')
  })

  it('includes logo img tag in all template bodies', () => {
    for (const [slug, template] of Object.entries(DEFAULT_TEMPLATES)) {
      expect(template.body, `Template ${slug} body`).toContain(
        '<img src="{{storeUrl}}/shayga-logo.svg"',
      )
    }
  })
})
