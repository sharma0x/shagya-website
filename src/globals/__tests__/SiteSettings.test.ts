import { describe, it, expect } from 'vitest'
import { SiteSettings } from '../SiteSettings'

describe('SiteSettings global', () => {
  // ---- Global Structure ----
  describe('Global structure', () => {
    it('has correct slug', () => {
      expect(SiteSettings.slug).toBe('site-settings')
    })

    it('has correct label', () => {
      expect(SiteSettings.label).toBe('Site Settings')
    })

    it('is in Settings admin group', () => {
      expect(SiteSettings.admin?.group).toBe('Settings')
    })
  })

  // ---- Access Control ----
  describe('Access control', () => {
    it('gates read access to published for anonymous users', () => {
      const result = SiteSettings.access?.read?.({ req: {} } as any)
      expect(result).toEqual({ _status: { equals: 'published' } })
    })

    it('blocks unauthenticated update', () => {
      const result = SiteSettings.access?.update?.({
        req: { user: undefined },
      } as any)
      expect(result).toBe(false)
    })

    it('allows authenticated update', () => {
      const result = SiteSettings.access?.update?.({
        req: { user: { id: '1' } },
      } as any)
      expect(result).toBe(true)
    })
  })

  // ---- Brand Identity Fields ----
  describe('Brand identity fields', () => {
    it('has siteName field (text)', () => {
      const field = findField('siteName')
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.label).toBe('Site Name')
    })

    it('has tagline field (text)', () => {
      const field = findField('tagline')
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.label).toBe('Tagline')
    })

    it('has logo field (upload → media)', () => {
      const field = findField('logo')
      expect(field).toBeDefined()
      expect(field?.type).toBe('upload')
      expect(field?.relationTo).toBe('media')
      expect(field?.label).toBe('Logo')
    })

    it('has favicon field (upload → media)', () => {
      const field = findField('favicon')
      expect(field).toBeDefined()
      expect(field?.type).toBe('upload')
      expect(field?.relationTo).toBe('media')
      expect(field?.label).toBe('Favicon')
    })
  })

  // ---- Contact Info Fields ----
  describe('Contact info fields', () => {
    it('has contactEmail field (email)', () => {
      const field = findField('contactEmail')
      expect(field).toBeDefined()
      expect(field?.type).toBe('email')
      expect(field?.label).toBe('Contact Email')
    })

    it('has contactPhone field (text)', () => {
      const field = findField('contactPhone')
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.label).toBe('Contact Phone')
    })

    it('has address field (textarea)', () => {
      const field = findField('address')
      expect(field).toBeDefined()
      expect(field?.type).toBe('textarea')
      expect(field?.label).toBe('Address')
    })
  })

  // ---- Social Media Fields ----
  describe('Social media fields', () => {
    it('has instagramUrl field (text)', () => {
      const field = findField('instagramUrl')
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })

    it('has facebookUrl field (text)', () => {
      const field = findField('facebookUrl')
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })

    it('has youtubeUrl field (text)', () => {
      const field = findField('youtubeUrl')
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })

    it('has pinterestUrl field (text)', () => {
      const field = findField('pinterestUrl')
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })
  })

  // ---- Policy Fields ----
  describe('Policy fields', () => {
    it('has shippingPolicy field (textarea)', () => {
      const field = findField('shippingPolicy')
      expect(field).toBeDefined()
      expect(field?.type).toBe('textarea')
    })

    it('has returnPolicy field (textarea)', () => {
      const field = findField('returnPolicy')
      expect(field).toBeDefined()
      expect(field?.type).toBe('textarea')
    })
  })

  // ---- Store Configuration Fields ----
  describe('Store configuration fields', () => {
    it('has gstPercent field (number, default 5)', () => {
      const field = findField('gstPercent')
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.defaultValue).toBe(5)
    })

    it('has currency field (text, default INR)', () => {
      const field = findField('currency')
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.defaultValue).toBe('INR')
    })
  })

  // ---- Count Assertion ----
  describe('Field count', () => {
    it('has exactly 17 fields', () => {
      expect(SiteSettings.fields).toHaveLength(17)
    })
  })
})

// Helper to find a field by name in the SiteSettings global
function findField(name: string) {
  return SiteSettings.fields?.find((f: any) => f.name === name) as any
}
