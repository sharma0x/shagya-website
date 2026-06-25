import { describe, it, expect } from 'vitest'
import { Coupons } from '../Coupons'

describe('Coupons collection', () => {
  describe('Collection structure', () => {
    it('has correct slug', () => {
      expect(Coupons.slug).toBe('coupons')
    })

    it('uses code as display title', () => {
      expect(Coupons.admin?.useAsTitle).toBe('code')
    })

    it('is in Marketing admin group', () => {
      expect(Coupons.admin?.group).toBe('Marketing')
    })

    it('has timestamps enabled', () => {
      expect(Coupons.timestamps).toBe(true)
    })

    it('has exactly 13 fields', () => {
      expect(Coupons.fields).toHaveLength(13)
    })
  })

  describe('Access control', () => {
    it('allows public read access', () => {
      const readAccess = Coupons.access?.read
      expect(readAccess).toBeDefined()
      // Public read should return true regardless of user
      if (typeof readAccess === 'function') {
        expect(readAccess({ req: {} } as any)).toBe(true)
        expect(readAccess({ req: { user: null } } as any)).toBe(true)
      }
    })

    it('restricts create to authenticated users', () => {
      const createAccess = Coupons.access?.create
      expect(createAccess).toBeDefined()
      if (typeof createAccess === 'function') {
        expect(createAccess({ req: {} } as any)).toBe(false)
        expect(
          createAccess({
            req: { user: { id: '1', email: 'admin@test.com' } },
          } as any),
        ).toBe(true)
      }
    })

    it('restricts update to authenticated users', () => {
      const updateAccess = Coupons.access?.update
      expect(updateAccess).toBeDefined()
      if (typeof updateAccess === 'function') {
        expect(updateAccess({ req: {} } as any)).toBe(false)
        expect(
          updateAccess({
            req: { user: { id: '1', email: 'admin@test.com' } },
          } as any),
        ).toBe(true)
      }
    })

    it('restricts delete to authenticated users', () => {
      const deleteAccess = Coupons.access?.delete
      expect(deleteAccess).toBeDefined()
      if (typeof deleteAccess === 'function') {
        expect(deleteAccess({ req: {} } as any)).toBe(false)
        expect(
          deleteAccess({
            req: { user: { id: '1', email: 'admin@test.com' } },
          } as any),
        ).toBe(true)
      }
    })
  })

  describe('Code field', () => {
    const codeField = Coupons.fields?.find((f: any) => f.name === 'code') as any

    it('exists and is a text field', () => {
      expect(codeField).toBeDefined()
      expect(codeField?.type).toBe('text')
    })

    it('is required, unique, and indexed', () => {
      expect(codeField?.required).toBe(true)
      expect(codeField?.unique).toBe(true)
      expect(codeField?.index).toBe(true)
    })
  })

  describe('Type field', () => {
    const typeField = Coupons.fields?.find((f: any) => f.name === 'type') as any

    it('exists and is a select field', () => {
      expect(typeField).toBeDefined()
      expect(typeField?.type).toBe('select')
      expect(typeField?.required).toBe(true)
    })

    it('has defaultValue of percentage', () => {
      expect(typeField?.defaultValue).toBe('percentage')
    })

    it('has all 3 type options', () => {
      const values = typeField?.options?.map((o: any) => o.value)
      expect(values).toHaveLength(3)
      expect(values).toContain('percentage')
      expect(values).toContain('fixed_amount')
      expect(values).toContain('free_shipping')
    })
  })

  describe('Value field', () => {
    const valueField = Coupons.fields?.find(
      (f: any) => f.name === 'value',
    ) as any

    it('exists and is a number field', () => {
      expect(valueField).toBeDefined()
      expect(valueField?.type).toBe('number')
    })

    it('has min value of 0', () => {
      expect(valueField?.min).toBe(0)
    })

    it('is hidden when type is free_shipping', () => {
      expect(valueField?.admin?.condition).toBeDefined()
      if (typeof valueField?.admin?.condition === 'function') {
        expect(valueField.admin.condition({ type: 'free_shipping' })).toBe(
          false,
        )
        expect(valueField.admin.condition({ type: 'percentage' })).toBe(true)
        expect(valueField.admin.condition({ type: 'fixed_amount' })).toBe(true)
        expect(valueField.admin.condition({})).toBeFalsy()
      }
    })
  })

  describe('minCartValue field', () => {
    const field = Coupons.fields?.find(
      (f: any) => f.name === 'minCartValue',
    ) as any

    it('exists and is a number field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
    })

    it('has min value of 0 and defaultValue of 0', () => {
      expect(field?.min).toBe(0)
      expect(field?.defaultValue).toBe(0)
    })
  })

  describe('maxDiscount field', () => {
    const field = Coupons.fields?.find(
      (f: any) => f.name === 'maxDiscount',
    ) as any

    it('exists and is a number field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
    })

    it('has min value of 0', () => {
      expect(field?.min).toBe(0)
    })

    it('is only visible when type is percentage', () => {
      expect(field?.admin?.condition).toBeDefined()
      if (typeof field?.admin?.condition === 'function') {
        expect(field.admin.condition({ type: 'percentage' })).toBe(true)
        expect(field.admin.condition({ type: 'fixed_amount' })).toBe(false)
        expect(field.admin.condition({ type: 'free_shipping' })).toBe(false)
      }
    })
  })

  describe('usageLimit field', () => {
    const field = Coupons.fields?.find(
      (f: any) => f.name === 'usageLimit',
    ) as any

    it('exists and is a number field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
    })

    it('has min value of 0', () => {
      expect(field?.min).toBe(0)
    })
  })

  describe('usedCount field', () => {
    const field = Coupons.fields?.find(
      (f: any) => f.name === 'usedCount',
    ) as any

    it('exists and is a number field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
    })

    it('has min value of 0 and defaultValue of 0', () => {
      expect(field?.min).toBe(0)
      expect(field?.defaultValue).toBe(0)
    })

    it('is readOnly in admin', () => {
      expect(field?.admin?.readOnly).toBe(true)
    })
  })

  describe('Date fields', () => {
    it('has startDate as a date field', () => {
      const field = Coupons.fields?.find(
        (f: any) => f.name === 'startDate',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('date')
    })

    it('has endDate as a date field', () => {
      const field = Coupons.fields?.find(
        (f: any) => f.name === 'endDate',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('date')
    })
  })

  describe('isActive field', () => {
    const field = Coupons.fields?.find((f: any) => f.name === 'isActive') as any

    it('exists and is a checkbox field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('checkbox')
    })

    it('defaults to true', () => {
      expect(field?.defaultValue).toBe(true)
    })
  })

  describe('Relationship fields', () => {
    it('has categoriesConditions as relationship to categories (hasMany)', () => {
      const field = Coupons.fields?.find(
        (f: any) => f.name === 'categoriesConditions',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('relationship')
      expect(field?.relationTo).toBe('categories')
      expect(field?.hasMany).toBe(true)
    })

    it('has productsConditions as relationship to products (hasMany)', () => {
      const field = Coupons.fields?.find(
        (f: any) => f.name === 'productsConditions',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('relationship')
      expect(field?.relationTo).toBe('products')
      expect(field?.hasMany).toBe(true)
    })

    it('has customersConditions as relationship to customers (hasMany)', () => {
      const field = Coupons.fields?.find(
        (f: any) => f.name === 'customersConditions',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('relationship')
      expect(field?.relationTo).toBe('customers')
      expect(field?.hasMany).toBe(true)
    })
  })
})
