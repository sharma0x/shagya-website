// =============================================================================
// Tests for Database Seed Data
// =============================================================================

import { describe, it, expect } from 'vitest'
import {
  adminUser,
  categories,
  collections,
  products,
  pages,
  siteSettingsData,
} from '../seed-data'

describe('Seed data', () => {
  // ---------------------------------------------------------------------------
  // Admin User
  // ---------------------------------------------------------------------------

  describe('Admin user', () => {
    it('has correct email', () => {
      expect(adminUser.email).toBe('admin@shagya.com')
    })

    it('has super-admin role', () => {
      expect(adminUser.role).toBe('super-admin')
    })

    it('has a name', () => {
      expect(adminUser.name).toBeTruthy()
      expect(typeof adminUser.name).toBe('string')
    })

    it('has a password set', () => {
      expect(adminUser.password).toBeTruthy()
      expect(adminUser.password.length).toBeGreaterThanOrEqual(6)
    })
  })

  // ---------------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------------

  describe('Categories', () => {
    it('has exactly 10 categories', () => {
      expect(categories).toHaveLength(10)
    })

    it('each category has a name and description', () => {
      for (const cat of categories) {
        expect(cat.name).toBeTruthy()
        expect(typeof cat.name).toBe('string')
        expect(cat.description).toBeTruthy()
        expect(typeof cat.description).toBe('string')
      }
    })

    it('has no duplicate category names', () => {
      const names = categories.map((c) => c.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })

    it('includes expected category names', () => {
      const names = categories.map((c) => c.name)
      expect(names).toContain('Silk')
      expect(names).toContain('Cotton')
      expect(names).toContain('Bridal')
      expect(names).toContain('Festive')
      expect(names).toContain('Banarasi')
    })
  })

  // ---------------------------------------------------------------------------
  // Collections
  // ---------------------------------------------------------------------------

  describe('Collections', () => {
    it('has exactly 2 collections', () => {
      expect(collections).toHaveLength(2)
    })

    it('each collection has a name and description', () => {
      for (const col of collections) {
        expect(col.name).toBeTruthy()
        expect(typeof col.name).toBe('string')
        expect(col.description).toBeTruthy()
        expect(typeof col.description).toBe('string')
      }
    })

    it('has expected collection names', () => {
      const names = collections.map((c) => c.name)
      expect(names).toContain('Summer Collection')
      expect(names).toContain('Bridal Edit')
    })
  })

  // ---------------------------------------------------------------------------
  // Products
  // ---------------------------------------------------------------------------

  describe('Products', () => {
    it('has exactly 5 products', () => {
      expect(products).toHaveLength(5)
    })

    it('each product has a name', () => {
      for (const product of products) {
        expect(product.name).toBeTruthy()
        expect(typeof product.name).toBe('string')
      }
    })

    it('each product has a valid status', () => {
      const validStatuses = ['draft', 'published', 'archived']
      for (const product of products) {
        expect(validStatuses).toContain(product.status)
      }
    })

    it('each product has a valid fabric', () => {
      const validFabrics = [
        'silk',
        'cotton',
        'linen',
        'georgette',
        'chiffon',
        'crepe',
        'velvet',
        'net',
        'blend',
      ]
      for (const product of products) {
        expect(validFabrics).toContain(product.fabric)
      }
    })

    it('each product has a valid weave', () => {
      const validWeaves = [
        'banarasi',
        'kanchipuram',
        'bandhani',
        'patola',
        'kalamkari',
        'ikkat',
        'paithani',
        'maheshwari',
        'chanderi',
        'tant',
        'baluchari',
      ]
      for (const product of products) {
        expect(validWeaves).toContain(product.weave)
      }
    })

    it('each product has a valid pattern', () => {
      const validPatterns = [
        'solid',
        'printed',
        'embroidered',
        'embellished',
        'painted',
      ]
      for (const product of products) {
        expect(validPatterns).toContain(product.pattern)
      }
    })

    it('each product has a positive basePrice', () => {
      for (const product of products) {
        expect(product.basePrice).toBeGreaterThan(0)
        expect(typeof product.basePrice).toBe('number')
      }
    })

    it('compareAtPrice (if set) is greater than basePrice', () => {
      for (const product of products) {
        if (product.compareAtPrice !== undefined) {
          expect(product.compareAtPrice).toBeGreaterThan(product.basePrice)
        }
      }
    })

    it('has no duplicate product names', () => {
      const names = products.map((p) => p.name)
      const uniqueNames = new Set(names)
      expect(uniqueNames.size).toBe(names.length)
    })
  })

  // ---------------------------------------------------------------------------
  // Pages
  // ---------------------------------------------------------------------------

  describe('Pages', () => {
    it('has exactly 4 pages', () => {
      expect(pages).toHaveLength(4)
    })

    it('each page has a title and template', () => {
      for (const page of pages) {
        expect(page.title).toBeTruthy()
        expect(typeof page.title).toBe('string')
        expect(page.template).toBeTruthy()
      }
    })

    it('all pages have published status', () => {
      for (const page of pages) {
        expect(page.status).toBe('published')
      }
    })

    it('has expected page titles', () => {
      const titles = pages.map((p) => p.title)
      expect(titles).toContain('Home')
      expect(titles).toContain('About')
      expect(titles).toContain('Contact')
      expect(titles).toContain('FAQ')
    })

    it('has correct template for Contact page', () => {
      const contactPage = pages.find((p) => p.title === 'Contact')
      expect(contactPage?.template).toBe('contact')
    })

    it('has correct template for About page', () => {
      const aboutPage = pages.find((p) => p.title === 'About')
      expect(aboutPage?.template).toBe('about')
    })

    it('has correct template for FAQ page', () => {
      const faqPage = pages.find((p) => p.title === 'FAQ')
      expect(faqPage?.template).toBe('faq')
    })
  })

  // ---------------------------------------------------------------------------
  // Site Settings
  // ---------------------------------------------------------------------------

  describe('Site settings', () => {
    it('has a site name', () => {
      expect(siteSettingsData.siteName).toBe('Shagya')
    })

    it('has a tagline', () => {
      expect(siteSettingsData.tagline).toBeTruthy()
      expect(typeof siteSettingsData.tagline).toBe('string')
    })

    it('has contact information', () => {
      expect(siteSettingsData.contactEmail).toContain('@')
      expect(siteSettingsData.contactPhone).toBeTruthy()
    })

    it('has social media URLs', () => {
      expect(siteSettingsData.instagramUrl).toContain('instagram')
      expect(siteSettingsData.facebookUrl).toContain('facebook')
    })

    it('has shipping and return policies', () => {
      expect(siteSettingsData.shippingPolicy).toBeTruthy()
      expect(siteSettingsData.returnPolicy).toBeTruthy()
    })

    it('has GST percent set to 5', () => {
      expect(siteSettingsData.gstPercent).toBe(5)
    })

    it('has currency set to INR', () => {
      expect(siteSettingsData.currency).toBe('INR')
    })
  })

  // ---------------------------------------------------------------------------
  // Data Integrity — Cross-checks
  // ---------------------------------------------------------------------------

  describe('Data integrity', () => {
    it('categories have meaningful descriptions (not empty)', () => {
      for (const cat of categories) {
        expect(cat.description.length).toBeGreaterThan(10)
      }
    })

    it('product descriptions are meaningful', () => {
      for (const product of products) {
        expect(product.description.length).toBeGreaterThan(20)
      }
    })

    it('at least one product is published', () => {
      const publishedCount = products.filter(
        (p) => p.status === 'published',
      ).length
      expect(publishedCount).toBeGreaterThanOrEqual(1)
    })
  })
})
