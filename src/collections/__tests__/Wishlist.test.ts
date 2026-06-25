import { describe, it, expect } from 'vitest'
import { Wishlist } from '../Wishlist'
import type { User } from '@/payload-types'

describe('Wishlist collection', () => {
  describe('collection structure', () => {
    it('has the correct slug', () => {
      expect(Wishlist.slug).toBe('wishlist')
    })

    it('uses customer as the display title', () => {
      expect(Wishlist.admin?.useAsTitle).toBe('customer')
    })

    it('is in the Customers admin group', () => {
      expect(Wishlist.admin?.group).toBe('Customers')
    })

    it('has timestamps enabled', () => {
      expect(Wishlist.timestamps).toBe(true)
    })
  })

  describe('fields', () => {
    describe('customer relationship', () => {
      it('has a customer relationship field', () => {
        const field = Wishlist.fields?.find(
          (f: any) => f.name === 'customer',
        ) as any
        expect(field).toBeDefined()
        expect(field.type).toBe('relationship')
        expect(field.relationTo).toBe('customers')
        expect(field.required).toBe(true)
        expect(field.hasMany).toBe(false)
      })

      it('has a unique constraint on customer', () => {
        const field = Wishlist.fields?.find(
          (f: any) => f.name === 'customer',
        ) as any
        expect(field.unique).toBe(true)
      })
    })

    describe('items array', () => {
      it('has an items array field', () => {
        const field = Wishlist.fields?.find(
          (f: any) => f.name === 'items',
        ) as any
        expect(field).toBeDefined()
        expect(field.type).toBe('array')
      })

      it('has product sub-field in items array', () => {
        const itemsField = Wishlist.fields?.find(
          (f: any) => f.name === 'items',
        ) as any
        const productField = itemsField?.fields?.find(
          (f: any) => f.name === 'product',
        ) as any
        expect(productField).toBeDefined()
        expect(productField.type).toBe('relationship')
        expect(productField.relationTo).toBe('products')
        expect(productField.required).toBe(true)
      })

      it('has variant sub-field in items array', () => {
        const itemsField = Wishlist.fields?.find(
          (f: any) => f.name === 'items',
        ) as any
        const variantField = itemsField?.fields?.find(
          (f: any) => f.name === 'variant',
        ) as any
        expect(variantField).toBeDefined()
        expect(variantField.type).toBe('relationship')
        expect(variantField.relationTo).toBe('variants')
      })
    })
  })

  describe('collection-level access control', () => {
    const makeReq = (role: string | null) =>
      ({
        req: {
          user: role ? ({ id: 'user-1', role } as unknown as User) : undefined,
        },
      }) as any

    describe('read', () => {
      it('allows super-admin to read', () => {
        expect(Wishlist.access?.read?.(makeReq('super-admin'))).toBe(true)
      })

      it('allows admin to read', () => {
        expect(Wishlist.access?.read?.(makeReq('admin'))).toBe(true)
      })

      it('allows editor to read', () => {
        expect(Wishlist.access?.read?.(makeReq('editor'))).toBe(true)
      })

      it('denies unauthenticated users from reading', () => {
        expect(Wishlist.access?.read?.(makeReq(null))).toBe(false)
      })
    })

    describe('create', () => {
      it('allows super-admin to create', () => {
        expect(Wishlist.access?.create?.(makeReq('super-admin'))).toBe(true)
      })

      it('allows admin to create', () => {
        expect(Wishlist.access?.create?.(makeReq('admin'))).toBe(true)
      })

      it('allows editor to create', () => {
        expect(Wishlist.access?.create?.(makeReq('editor'))).toBe(true)
      })

      it('denies unauthenticated users from creating', () => {
        expect(Wishlist.access?.create?.(makeReq(null))).toBe(false)
      })
    })

    describe('update', () => {
      it('allows super-admin to update', () => {
        expect(Wishlist.access?.update?.(makeReq('super-admin'))).toBe(true)
      })

      it('denies admin from updating', () => {
        expect(Wishlist.access?.update?.(makeReq('admin'))).toBe(false)
      })

      it('denies editor from updating', () => {
        expect(Wishlist.access?.update?.(makeReq('editor'))).toBe(false)
      })

      it('denies unauthenticated users from updating', () => {
        expect(Wishlist.access?.update?.(makeReq(null))).toBe(false)
      })
    })

    describe('delete', () => {
      it('allows super-admin to delete', () => {
        expect(Wishlist.access?.delete?.(makeReq('super-admin'))).toBe(true)
      })

      it('denies admin from deleting', () => {
        expect(Wishlist.access?.delete?.(makeReq('admin'))).toBe(false)
      })

      it('denies editor from deleting', () => {
        expect(Wishlist.access?.delete?.(makeReq('editor'))).toBe(false)
      })

      it('denies unauthenticated users from deleting', () => {
        expect(Wishlist.access?.delete?.(makeReq(null))).toBe(false)
      })
    })
  })
})
