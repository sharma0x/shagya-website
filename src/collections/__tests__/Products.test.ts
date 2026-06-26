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

  describe('Detail fields', () => {
    it('has length field (number, min=1, max=9, step=0.1)', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'length',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.min).toBe(1)
      expect(field?.max).toBe(9)
      expect(field?.admin?.step).toBe(0.1)
    })

    it('has blouseType text field', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'blouseType',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })

    it('has palluDetails text field', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'palluDetails',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })

    it('has borderType text field', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'borderType',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })

    it('has weavePattern text field', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'weavePattern',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })

    it('has occasion text field', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'occasion',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })

    it('has exactly 24 fields in total', () => {
      expect(Products.fields).toHaveLength(24)
    })
  })

  describe('Gallery field', () => {
    it('has gallery array field with image upload', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'gallery',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('array')
      expect(field?.label).toBe('Product Images')
      expect(field?.minRows).toBe(1)
      expect(field?.maxRows).toBe(8)
      expect(field?.fields).toHaveLength(2)
      const imageField = field?.fields?.find((sf: any) => sf.name === 'image')
      expect(imageField?.type).toBe('upload')
      expect(imageField?.relationTo).toBe('media')
    })
  })

  describe('Pricing fields', () => {
    it('has basePrice number field (required, min=0)', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'basePrice',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.required).toBe(true)
      expect(field?.min).toBe(0)
    })

    it('has compareAtPrice number field (optional, min=0)', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'compareAtPrice',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.min).toBe(0)
    })

    it('has costPrice number field (optional, min=0)', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'costPrice',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.min).toBe(0)
    })

    it('has gstPercent number field (default=5)', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'gstPercent',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.defaultValue).toBe(5)
    })

    it('has shippingPrice number field (optional, min=0)', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'shippingPrice',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.min).toBe(0)
    })
  })

  describe('Inventory fields', () => {
    it('has trackQuantity checkbox field (default=false)', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'trackQuantity',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('checkbox')
      expect(field?.defaultValue).toBe(false)
    })

    it('has quantity number field (min=0, default=0)', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'quantity',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.min).toBe(0)
      expect(field?.defaultValue).toBe(0)
    })

    it('has lowStockThreshold number field (default=5, min=0)', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'lowStockThreshold',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.defaultValue).toBe(5)
      expect(field?.min).toBe(0)
    })

    it('has allowBackorder checkbox field (default=false)', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'allowBackorder',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('checkbox')
      expect(field?.defaultValue).toBe(false)
    })

    it('has soldIndividually checkbox field (default=false)', () => {
      const field = Products.fields?.find(
        (f: any) => f.name === 'soldIndividually',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('checkbox')
      expect(field?.defaultValue).toBe(false)
    })
  })
})
