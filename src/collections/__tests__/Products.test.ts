import { describe, it, expect } from 'vitest'
import { Products } from '../Products'

describe('Products collection', () => {
  describe('Collection structure', () => {
    it('has correct slug', () => {
      expect(Products.slug).toBe('products')
    })

    it('uses name as display title', () => {
      expect(Products.admin?.useAsTitle).toBe('name')
    })

    it('is in Products admin group', () => {
      expect(Products.admin?.group).toBe('Products')
    })

    it('has timestamps enabled', () => {
      expect(Products.timestamps).toBe(true)
    })
  })

  describe('Foundation fields', () => {
    it('has name field (text, required)', () => {
      const field = Products.fields?.find((f: any) => f.name === 'name') as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.required).toBe(true)
    })

    it('has slug field (text, unique, indexed, readOnly)', () => {
      const field = Products.fields?.find((f: any) => f.name === 'slug') as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.unique).toBe(true)
      expect(field?.index).toBe(true)
      expect(field?.admin?.readOnly).toBe(true)
    })

    it('has description field (richText)', () => {
      const field = Products.fields?.find((f: any) => f.name === 'description')
      expect(field).toBeDefined()
      expect(field?.type).toBe('richText')
    })

    it('has status field with draft as default', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'status',
      ) as any
      expect(field).toBeDefined()
      expect(field.type).toBe('select')
      expect(field.defaultValue).toBe('draft')
      const values = field.options.map((o: any) => o.value)
      expect(values).toContain('draft')
      expect(values).toContain('published')
      expect(values).toContain('archived')
    })
  })

  describe('Slug generation hook', () => {
    it('generates lowercase slug from name', () => {
      const hook = Products.hooks?.beforeChange?.[0]
      expect(hook).toBeDefined()
      if (!hook) return

      const result = hook({
        data: { name: 'Banarasi Silk Saree' },
        operation: 'create',
      } as any)

      expect(result.slug).toBe('banarasi-silk-saree')
    })

    it('replaces spaces with dashes', () => {
      const hook = Products.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = hook({
        data: { name: 'Pure Cotton  Saree  ' },
        operation: 'create',
      } as any)

      expect(result.slug).toBe('pure-cotton-saree')
    })

    it('removes special characters', () => {
      const hook = Products.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = hook({
        data: { name: 'Bandhani Silk (Pure) @ ₹5000!' },
        operation: 'create',
      } as any)

      expect(result.slug).not.toContain('(')
      expect(result.slug).not.toContain(')')
      expect(result.slug).not.toContain('@')
      expect(result.slug).not.toContain('₹')
      expect(result.slug).not.toContain('!')
    })
  })

  describe('Fabric field', () => {
    const fabricField = Products.fields?.find(
      (f: any) => f.name === 'fabric',
    ) as any

    it('exists and is a select field', () => {
      expect(fabricField).toBeDefined()
      expect(fabricField?.type).toBe('select')
      expect(fabricField?.required).toBe(true)
    })

    it('has all 9 fabric options', () => {
      const values = fabricField?.options?.map((o: any) => o.value)
      expect(values).toHaveLength(9)
      expect(values).toEqual([
        'silk',
        'cotton',
        'linen',
        'georgette',
        'chiffon',
        'crepe',
        'velvet',
        'net',
        'blend',
      ])
    })
  })

  describe('Weave field', () => {
    const weaveField = Products.fields?.find(
      (f: any) => f.name === 'weave',
    ) as any

    it('exists and is a select field', () => {
      expect(weaveField).toBeDefined()
      expect(weaveField?.type).toBe('select')
      expect(weaveField?.required).toBe(true)
    })

    it('has all 11 weave options', () => {
      const values = weaveField?.options?.map((o: any) => o.value)
      expect(values).toHaveLength(11)
      expect(values).toEqual([
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
      ])
    })
  })

  describe('Pattern field', () => {
    const patternField = Products.fields?.find(
      (f: any) => f.name === 'pattern',
    ) as any

    it('exists and is a select field', () => {
      expect(patternField).toBeDefined()
      expect(patternField?.type).toBe('select')
      expect(patternField?.required).toBe(true)
    })

    it('has all 5 pattern options', () => {
      const values = patternField?.options?.map((o: any) => o.value)
      expect(values).toHaveLength(5)
      expect(values).toEqual([
        'solid',
        'printed',
        'embroidered',
        'embellished',
        'painted',
      ])
    })
  })
})
