import { describe, it, expect } from 'vitest'
import { Reviews } from '../Reviews'

describe('Reviews collection', () => {
  describe('Collection structure', () => {
    it('has correct slug', () => {
      expect(Reviews.slug).toBe('reviews')
    })

    it('uses title as display title', () => {
      expect(Reviews.admin?.useAsTitle).toBe('title')
    })

    it('is in Products admin group', () => {
      expect(Reviews.admin?.group).toBe('Products')
    })

    it('has timestamps enabled', () => {
      expect(Reviews.timestamps).toBe(true)
    })

    it('has exactly 11 fields', () => {
      expect(Reviews.fields).toHaveLength(11)
    })
  })

  describe('Access control', () => {
    it('allows public read access', () => {
      const readAccess = Reviews.access?.read
      expect(readAccess).toBeDefined()
      if (typeof readAccess === 'function') {
        expect(readAccess({ req: {} } as any)).toBe(true)
        expect(readAccess({ req: { user: null } } as any)).toBe(true)
      }
    })

    it('restricts create to authenticated users', () => {
      const createAccess = Reviews.access?.create
      expect(createAccess).toBeDefined()
      if (typeof createAccess === 'function') {
        expect(createAccess({ req: {} } as any)).toBe(false)
        expect(
          createAccess({
            req: { user: { id: '1', email: 'customer@test.com' } },
          } as any),
        ).toBe(true)
      }
    })

    it('restricts update to authenticated users', () => {
      const updateAccess = Reviews.access?.update
      expect(updateAccess).toBeDefined()
      if (typeof updateAccess === 'function') {
        expect(updateAccess({ req: {} } as any)).toBe(false)
        expect(
          updateAccess({
            req: { user: { id: '1', email: 'customer@test.com' } },
          } as any),
        ).toBe(true)
      }
    })

    it('restricts delete to super-admin and admin users', () => {
      const deleteAccess = Reviews.access?.delete
      expect(deleteAccess).toBeDefined()
      if (typeof deleteAccess === 'function') {
        // Unauthenticated
        expect(deleteAccess({ req: {} } as any)).toBe(false)
        // Regular authenticated (editor, customer, etc.)
        expect(
          deleteAccess({
            req: { user: { id: '1', role: 'editor' } },
          } as any),
        ).toBe(false)
        expect(
          deleteAccess({
            req: { user: { id: '1', role: 'content-manager' } },
          } as any),
        ).toBe(false)
        // Admin
        expect(
          deleteAccess({
            req: { user: { id: '2', role: 'admin' } },
          } as any),
        ).toBe(true)
        // Super-admin
        expect(
          deleteAccess({
            req: { user: { id: '3', role: 'super-admin' } },
          } as any),
        ).toBe(true)
      }
    })
  })

  describe('customer field', () => {
    const field = Reviews.fields?.find((f: any) => f.name === 'customer') as any

    it('exists and is a relationship field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('relationship')
    })

    it('is required and relates to customers (hasMany: false)', () => {
      expect(field?.required).toBe(true)
      expect(field?.relationTo).toBe('customers')
      expect(field?.hasMany).toBe(false)
    })
  })

  describe('product field', () => {
    const field = Reviews.fields?.find((f: any) => f.name === 'product') as any

    it('exists and is a relationship field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('relationship')
    })

    it('is required and relates to products (hasMany: false)', () => {
      expect(field?.required).toBe(true)
      expect(field?.relationTo).toBe('products')
      expect(field?.hasMany).toBe(false)
    })
  })

  describe('variant field', () => {
    const field = Reviews.fields?.find((f: any) => f.name === 'variant') as any

    it('exists and is a relationship field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('relationship')
    })

    it('relates to variants (hasMany: false, not required)', () => {
      expect(field?.relationTo).toBe('variants')
      expect(field?.hasMany).toBe(false)
      expect(field?.required).toBeUndefined()
    })
  })

  describe('rating field', () => {
    const field = Reviews.fields?.find((f: any) => f.name === 'rating') as any

    it('exists and is a number field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('number')
    })

    it('is required with min=1, max=5, defaultValue=5', () => {
      expect(field?.required).toBe(true)
      expect(field?.min).toBe(1)
      expect(field?.max).toBe(5)
      expect(field?.defaultValue).toBe(5)
    })
  })

  describe('title field', () => {
    const field = Reviews.fields?.find((f: any) => f.name === 'title') as any

    it('exists and is a text field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })

    it('is required', () => {
      expect(field?.required).toBe(true)
    })
  })

  describe('body field', () => {
    const field = Reviews.fields?.find((f: any) => f.name === 'body') as any

    it('exists and is a textarea field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('textarea')
    })

    it('is required', () => {
      expect(field?.required).toBe(true)
    })
  })

  describe('images field', () => {
    const field = Reviews.fields?.find((f: any) => f.name === 'images') as any

    it('exists and is an array field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('array')
    })

    it('has singular and plural labels', () => {
      expect(field?.labels?.singular).toBe('Image')
      expect(field?.labels?.plural).toBe('Images')
    })

    it('has image upload sub-field', () => {
      expect(field?.fields).toHaveLength(1)
      const imageField = field?.fields?.[0] as any
      expect(imageField?.name).toBe('image')
      expect(imageField?.type).toBe('upload')
      expect(imageField?.relationTo).toBe('media')
    })
  })

  describe('verifiedPurchase field', () => {
    const field = Reviews.fields?.find(
      (f: any) => f.name === 'verifiedPurchase',
    ) as any

    it('exists and is a checkbox field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('checkbox')
    })

    it('defaults to false and is readOnly in admin', () => {
      expect(field?.defaultValue).toBe(false)
      expect(field?.admin?.readOnly).toBe(true)
    })
  })

  describe('status field', () => {
    const field = Reviews.fields?.find((f: any) => f.name === 'status') as any

    it('exists and is a select field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('select')
    })

    it('is required with defaultValue of pending', () => {
      expect(field?.required).toBe(true)
      expect(field?.defaultValue).toBe('pending')
    })

    it('has all 3 status options', () => {
      const values = field?.options?.map((o: any) => o.value)
      expect(values).toHaveLength(3)
      expect(values).toContain('pending')
      expect(values).toContain('approved')
      expect(values).toContain('rejected')
    })
  })
})
