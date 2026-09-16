import { describe, it, expect } from 'vitest'
import { Weaves } from '../Weaves'

describe('Weaves collection', () => {
  describe('Collection structure', () => {
    it('has correct slug', () => {
      expect(Weaves.slug).toBe('weaves')
    })

    it('uses name as display title', () => {
      expect(Weaves.admin?.useAsTitle).toBe('name')
    })

    it('is in Taxonomy admin group', () => {
      expect(Weaves.admin?.group).toBe('Taxonomy')
    })

    it('has timestamps enabled', () => {
      expect(Weaves.timestamps).toBe(true)
    })
  })

  describe('Access control', () => {
    it('allows public read', () => {
      const result = Weaves.access?.read?.({ req: {} } as any)
      expect(result).toBe(true)
    })

    it('blocks unauthenticated create', () => {
      const result = Weaves.access?.create?.({
        req: { user: undefined },
      } as any)
      expect(result).toBe(false)
    })

    it('allows authenticated create', () => {
      const result = Weaves.access?.create?.({
        req: { user: { id: '1' } },
      } as any)
      expect(result).toBe(true)
    })

    it('blocks unauthenticated update', () => {
      const result = Weaves.access?.update?.({
        req: { user: undefined },
      } as any)
      expect(result).toBe(false)
    })

    it('allows authenticated update', () => {
      const result = Weaves.access?.update?.({
        req: { user: { id: '1' } },
      } as any)
      expect(result).toBe(true)
    })

    it('blocks unauthenticated delete', () => {
      const result = Weaves.access?.delete?.({
        req: { user: undefined },
      } as any)
      expect(result).toBe(false)
    })

    it('allows authenticated delete', () => {
      const result = Weaves.access?.delete?.({
        req: { user: { id: '1' } },
      } as any)
      expect(result).toBe(true)
    })
  })

  describe('Fields', () => {
    it('has name field (text, required)', () => {
      const field = Weaves.fields?.find((f: any) => f.name === 'name') as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.required).toBe(true)
    })

    it('has slug field (text, unique, indexed, readOnly)', () => {
      const field = Weaves.fields?.find((f: any) => f.name === 'slug') as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.unique).toBe(true)
      expect(field?.index).toBe(true)
      expect(field?.admin?.readOnly).toBe(true)
    })

    it('has description field (textarea)', () => {
      const field = Weaves.fields?.find(
        (f: any) => f.name === 'description',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('textarea')
    })

    it('has exactly 3 fields', () => {
      expect(Weaves.fields).toHaveLength(3)
    })
  })

  describe('Slug generation hook', () => {
    it('generates lowercase slug from name', () => {
      const hook = Weaves.hooks?.beforeChange?.[0]
      expect(hook).toBeDefined()
      if (!hook) return

      const result = hook({
        data: { name: 'Banarasi Silk' },
        operation: 'create',
      } as any)

      expect(result.slug).toBe('banarasi-silk')
    })

    it('replaces spaces with dashes and trims', () => {
      const hook = Weaves.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = hook({
        data: { name: '  Kanchipuram  Silk  ' },
        operation: 'create',
      } as any)

      expect(result.slug).toBe('kanchipuram-silk')
    })

    it('removes special characters', () => {
      const hook = Weaves.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = hook({
        data: { name: "Weaver's Ikat & More!" },
        operation: 'create',
      } as any)

      expect(result.slug).not.toContain("'")
      expect(result.slug).not.toContain('&')
      expect(result.slug).not.toContain('!')
    })

    it('handles Devanagari text gracefully', () => {
      const hook = Weaves.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = hook({
        data: { name: 'बनारसी रेशम' },
        operation: 'create',
      } as any)

      expect(result.slug).toBeDefined()
    })
  })
})
