import { describe, it, expect } from 'vitest'
import { Customers } from '../Customers'

type TestUser = { id: string; role?: string }

describe('Customers collection', () => {
  describe('structure', () => {
    it('has the correct slug', () => {
      expect(Customers.slug).toBe('customers')
    })

    it('uses email as title field', () => {
      expect(Customers.admin?.useAsTitle).toBe('email')
    })

    it('is in the Customers admin group', () => {
      expect(Customers.admin?.group).toBe('Customers')
    })

    it('has timestamps enabled', () => {
      expect(Customers.timestamps).toBe(true)
    })
  })

  describe('fields', () => {
    it('has a required name text field', () => {
      const field = Customers.fields?.find((f: any) => f.name === 'name') as any
      expect(field).toBeDefined()
      expect(field.type).toBe('text')
      expect(field.required).toBe(true)
    })

    it('has a required email field that is unique', () => {
      const field = Customers.fields?.find(
        (f: any) => f.name === 'email',
      ) as any
      expect(field).toBeDefined()
      expect(field.type).toBe('email')
      expect(field.required).toBe(true)
      expect(field.unique).toBe(true)
    })

    it('has an optional phone text field', () => {
      const field = Customers.fields?.find(
        (f: any) => f.name === 'phone',
      ) as any
      expect(field).toBeDefined()
      expect(field.type).toBe('text')
    })

    it('has a betterAuthUserId text field that is unique', () => {
      const field = Customers.fields?.find(
        (f: any) => f.name === 'betterAuthUserId',
      ) as any
      expect(field).toBeDefined()
      expect(field.type).toBe('text')
      expect(field.unique).toBe(true)
    })

    it('has betterAuthUserId as read-only in admin', () => {
      const field = Customers.fields?.find(
        (f: any) => f.name === 'betterAuthUserId',
      ) as any
      expect(field.admin?.readOnly).toBe(true)
    })
  })

  describe('collection-level access control', () => {
    const makeReq = (role: string | null) =>
      ({
        req: {
          user: role
            ? ({ id: 'user-1', role } as unknown as TestUser)
            : undefined,
        },
      }) as any

    describe('read', () => {
      it('allows anyone to read (public read)', () => {
        expect(Customers.access?.read?.(makeReq('super-admin'))).toBe(true)
        expect(Customers.access?.read?.(makeReq('admin'))).toBe(true)
        expect(Customers.access?.read?.(makeReq('editor'))).toBe(true)
        expect(Customers.access?.read?.(makeReq(null))).toBe(true)
      })
    })

    describe('create', () => {
      it('allows super-admin to create', () => {
        expect(Customers.access?.create?.(makeReq('super-admin'))).toBe(true)
      })

      it('denies admin from creating', () => {
        expect(Customers.access?.create?.(makeReq('admin'))).toBe(false)
      })

      it('denies editor from creating', () => {
        expect(Customers.access?.create?.(makeReq('editor'))).toBe(false)
      })

      it('denies unauthenticated users from creating', () => {
        expect(Customers.access?.create?.(makeReq(null))).toBe(false)
      })
    })

    describe('update', () => {
      it('allows super-admin to update', () => {
        expect(Customers.access?.update?.(makeReq('super-admin'))).toBe(true)
      })

      it('denies admin from updating', () => {
        expect(Customers.access?.update?.(makeReq('admin'))).toBe(false)
      })

      it('denies editor from updating', () => {
        expect(Customers.access?.update?.(makeReq('editor'))).toBe(false)
      })

      it('denies unauthenticated users from updating', () => {
        expect(Customers.access?.update?.(makeReq(null))).toBe(false)
      })
    })

    describe('delete', () => {
      it('allows super-admin to delete', () => {
        expect(Customers.access?.delete?.(makeReq('super-admin'))).toBe(true)
      })

      it('denies admin from deleting', () => {
        expect(Customers.access?.delete?.(makeReq('admin'))).toBe(false)
      })

      it('denies editor from deleting', () => {
        expect(Customers.access?.delete?.(makeReq('editor'))).toBe(false)
      })

      it('denies unauthenticated users from deleting', () => {
        expect(Customers.access?.delete?.(makeReq(null))).toBe(false)
      })
    })
  })
})
