import { describe, it, expect } from 'vitest'
import { Variants } from '../Variants'

describe('Variants collection', () => {
  describe('Collection structure', () => {
    it('has correct slug', () => {
      expect(Variants.slug).toBe('variants')
    })

    it('has timestamps enabled', () => {
      expect(Variants.timestamps).toBe(true)
    })
  })

  describe('Core fields', () => {
    it('has product relationship field (required)', () => {
      const field = Variants.fields?.find(
        (f: any) => f.name === 'product',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('relationship')
      expect(field?.relationTo).toBe('products')
      expect(field?.required).toBe(true)
      expect(field?.hasMany).toBe(false)
    })

    it('has size select field with 11 options', () => {
      const field = Variants.fields?.find((f: any) => f.name === 'size') as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('select')
      expect(field?.required).toBe(true)
      const values = field?.options?.map((o: any) => o.value)
      expect(values).toHaveLength(11)
      expect(values).toEqual([
        'XS',
        'S',
        'M',
        'L',
        'XL',
        '2XL',
        '3XL',
        '4XL',
        '5XL',
        '6XL',
        'Free',
      ])
    })

    it('has color select field (required)', () => {
      const field = Variants.fields?.find((f: any) => f.name === 'color') as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('select')
      expect(field?.required).toBe(true)
      expect(field?.options?.length).toBeGreaterThan(0)
    })

    it('has blouseSize text field', () => {
      const field = Variants.fields?.find(
        (f: any) => f.name === 'blouseSize',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })
  })

  describe('Inventory fields', () => {
    it('has sku text field (unique)', () => {
      const field = Variants.fields?.find((f: any) => f.name === 'sku') as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.unique).toBe(true)
    })

    it('has stock quantity number field (min=0)', () => {
      const field = Variants.fields?.find((f: any) => f.name === 'stock') as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.min).toBe(0)
      expect(field?.defaultValue).toBe(0)
    })

    it('has priceOverride number field (optional)', () => {
      const field = Variants.fields?.find(
        (f: any) => f.name === 'priceOverride',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
      expect(field?.min).toBe(0)
    })

    it('has exactly 7 fields total', () => {
      expect(Variants.fields).toHaveLength(7)
    })
  })
})
