import { describe, it, expect } from 'vitest'
import { Categories } from '../Categories'

describe('Categories collection', () => {
  describe('Collection structure', () => {
    it('has correct slug', () => {
      expect(Categories.slug).toBe('categories')
    })

    it('uses name as display title', () => {
      expect(Categories.admin?.useAsTitle).toBe('name')
    })

    it('is in Taxonomy admin group', () => {
      expect(Categories.admin?.group).toBe('Taxonomy')
    })

    it('has timestamps enabled', () => {
      expect(Categories.timestamps).toBe(true)
    })
  })

  describe('Fields', () => {
    it('has name field (text, required)', () => {
      const field = Categories.fields?.find(
        (f: any) => f.name === 'name',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.required).toBe(true)
    })

    it('has slug field (text, unique, indexed, readOnly)', () => {
      const field = Categories.fields?.find(
        (f: any) => f.name === 'slug',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.unique).toBe(true)
      expect(field?.index).toBe(true)
      expect(field?.admin?.readOnly).toBe(true)
    })

    it('has description field (textarea)', () => {
      const field = Categories.fields?.find(
        (f: any) => f.name === 'description',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('textarea')
    })

    it('has image field (upload to Media)', () => {
      const field = Categories.fields?.find(
        (f: any) => f.name === 'image',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('upload')
      expect(field?.relationTo).toBe('media')
    })

    it('has parent field (relationship to categories)', () => {
      const field = Categories.fields?.find(
        (f: any) => f.name === 'parent',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('relationship')
      expect(field?.relationTo).toBe('categories')
      expect(field?.hasMany).toBe(false)
    })

    it('has exactly 5 fields', () => {
      expect(Categories.fields).toHaveLength(5)
    })
  })

  describe('Slug generation hook', () => {
    it('generates lowercase slug from name', () => {
      const hook = Categories.hooks?.beforeChange?.[0]
      expect(hook).toBeDefined()
      if (!hook) return

      const result = hook({
        data: { name: 'Silk Sarees' },
        operation: 'create',
      } as any)

      expect(result.slug).toBe('silk-sarees')
    })

    it('replaces spaces with dashes and trims', () => {
      const hook = Categories.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = hook({
        data: { name: '  Handloom  Cotton  ' },
        operation: 'create',
      } as any)

      expect(result.slug).toBe('handloom-cotton')
    })

    it('removes special characters', () => {
      const hook = Categories.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = hook({
        data: { name: "Men's & Women's Wear!" },
        operation: 'create',
      } as any)

      expect(result.slug).not.toContain("'")
      expect(result.slug).not.toContain('&')
      expect(result.slug).not.toContain('!')
    })

    it('handles Devanagari text gracefully', () => {
      const hook = Categories.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = hook({
        data: { name: 'रेसमी साड़ी' },
        operation: 'create',
      } as any)

      // Non-ASCII characters are stripped; slug may be empty or minimal
      expect(result.slug).toBeDefined()
    })
  })

  describe('Parent relationship', () => {
    it('supports self-referencing hierarchy', () => {
      const parentField = Categories.fields?.find(
        (f: any) => f.name === 'parent',
      ) as any
      // Self-referencing: relationTo is its own slug
      expect(parentField?.relationTo).toBe('categories')
      expect(parentField?.hasMany).toBe(false)
    })
  })
})
