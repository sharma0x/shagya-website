import { describe, it, expect } from 'vitest'
import { Collections } from '../Collections'

describe('Collections collection', () => {
  describe('Collection structure', () => {
    it('has correct slug', () => {
      expect(Collections.slug).toBe('collections')
    })

    it('uses name as display title', () => {
      expect(Collections.admin?.useAsTitle).toBe('name')
    })

    it('is in Taxonomy admin group', () => {
      expect(Collections.admin?.group).toBe('Taxonomy')
    })

    it('has timestamps enabled', () => {
      expect(Collections.timestamps).toBe(true)
    })
  })

  describe('Fields', () => {
    it('has name field (text, required)', () => {
      const field = Collections.fields?.find(
        (f: any) => f.name === 'name',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.required).toBe(true)
    })

    it('has slug field (text, unique, indexed, readOnly)', () => {
      const field = Collections.fields?.find(
        (f: any) => f.name === 'slug',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.unique).toBe(true)
      expect(field?.index).toBe(true)
      expect(field?.admin?.readOnly).toBe(true)
    })

    it('has description field (textarea)', () => {
      const field = Collections.fields?.find(
        (f: any) => f.name === 'description',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('textarea')
    })

    it('has image field (text placeholder for Media)', () => {
      const field = Collections.fields?.find(
        (f: any) => f.name === 'image',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.admin?.description).toContain('Media collection')
    })

    it('has exactly 4 fields (no parent)', () => {
      expect(Collections.fields).toHaveLength(4)
    })
  })

  describe('Slug generation hook', () => {
    it('generates lowercase slug from name', () => {
      const hook = Collections.hooks?.beforeChange?.[0]
      expect(hook).toBeDefined()
      if (!hook) return

      const result = hook({
        data: { name: 'Summer Festive 2025' },
        operation: 'create',
      } as any)

      expect(result.slug).toBe('summer-festive-2025')
    })

    it('replaces spaces with dashes and trims', () => {
      const hook = Collections.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = hook({
        data: { name: '  Wedding  Collection  ' },
        operation: 'create',
      } as any)

      expect(result.slug).toBe('wedding-collection')
    })

    it('removes special characters', () => {
      const hook = Collections.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = hook({
        data: { name: 'Spring/Summer 2025 (New!)' },
        operation: 'create',
      } as any)

      expect(result.slug).not.toContain('/')
      expect(result.slug).not.toContain('(')
      expect(result.slug).not.toContain(')')
      expect(result.slug).not.toContain('!')
    })

    it('handles Devanagari text gracefully', () => {
      const hook = Collections.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = hook({
        data: { name: 'शादी का संग्रह' },
        operation: 'create',
      } as any)

      // Non-ASCII characters are stripped; slug may be empty or minimal
      expect(result.slug).toBeDefined()
    })

    it('handles leading/trailing dashes', () => {
      const hook = Collections.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = hook({
        data: { name: '---Festive---' },
        operation: 'create',
      } as any)

      expect(result.slug).toBe('festive')
    })
  })
})
