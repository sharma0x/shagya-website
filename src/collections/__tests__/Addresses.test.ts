import { describe, it, expect } from 'vitest'
import { Addresses } from '../Addresses'
import type { User } from '@/payload-types'

describe('Addresses collection', () => {
  describe('collection structure', () => {
    it('has the correct slug', () => {
      expect(Addresses.slug).toBe('addresses')
    })

    it('uses fullName as the display title', () => {
      expect(Addresses.admin?.useAsTitle).toBe('fullName')
    })

    it('is in the Customers admin group', () => {
      expect(Addresses.admin?.group).toBe('Customers')
    })

    it('has timestamps enabled', () => {
      expect(Addresses.timestamps).toBe(true)
    })
  })

  describe('fields', () => {
    describe('customer relationship', () => {
      it('has a customer relationship field', () => {
        const field = Addresses.fields?.find(
          (f: any) => f.name === 'customer',
        ) as any
        expect(field).toBeDefined()
        expect(field.type).toBe('relationship')
        expect(field.relationTo).toBe('customers')
        expect(field.required).toBe(true)
        expect(field.hasMany).toBe(false)
      })
    })

    describe('fullName field', () => {
      it('has a required fullName text field', () => {
        const field = Addresses.fields?.find(
          (f: any) => f.name === 'fullName',
        ) as any
        expect(field).toBeDefined()
        expect(field.type).toBe('text')
        expect(field.required).toBe(true)
      })
    })

    describe('phone field', () => {
      it('has a required phone text field', () => {
        const field = Addresses.fields?.find(
          (f: any) => f.name === 'phone',
        ) as any
        expect(field).toBeDefined()
        expect(field.type).toBe('text')
        expect(field.required).toBe(true)
      })
    })

    describe('line1 field', () => {
      it('has a required line1 text field', () => {
        const field = Addresses.fields?.find(
          (f: any) => f.name === 'line1',
        ) as any
        expect(field).toBeDefined()
        expect(field.type).toBe('text')
        expect(field.required).toBe(true)
      })
    })

    describe('line2 field', () => {
      it('has an optional line2 text field', () => {
        const field = Addresses.fields?.find(
          (f: any) => f.name === 'line2',
        ) as any
        expect(field).toBeDefined()
        expect(field.type).toBe('text')
        expect(field.required).toBeUndefined()
      })
    })

    describe('city field', () => {
      it('has a required city text field', () => {
        const field = Addresses.fields?.find(
          (f: any) => f.name === 'city',
        ) as any
        expect(field).toBeDefined()
        expect(field.type).toBe('text')
        expect(field.required).toBe(true)
      })
    })

    describe('state field', () => {
      it('has a required state text field', () => {
        const field = Addresses.fields?.find(
          (f: any) => f.name === 'state',
        ) as any
        expect(field).toBeDefined()
        expect(field.type).toBe('text')
        expect(field.required).toBe(true)
      })
    })

    describe('pincode field', () => {
      it('has a required pincode text field', () => {
        const field = Addresses.fields?.find(
          (f: any) => f.name === 'pincode',
        ) as any
        expect(field).toBeDefined()
        expect(field.type).toBe('text')
        expect(field.required).toBe(true)
      })

      it('has a validate function for pincode', () => {
        const field = Addresses.fields?.find(
          (f: any) => f.name === 'pincode',
        ) as any
        expect(field?.validate).toBeDefined()
        expect(typeof field.validate).toBe('function')
      })

      describe('pincode validation', () => {
        const getPincodeField = () =>
          Addresses.fields?.find((f: any) => f.name === 'pincode') as any

        it('accepts valid 6-digit Indian pincodes', () => {
          const validate = getPincodeField()?.validate
          expect(validate?.('110001')).toBe(true)
          expect(validate?.('400001')).toBe(true)
          expect(validate?.('560001')).toBe(true)
          expect(validate?.('700001')).toBe(true)
          expect(validate?.('999999')).toBe(true)
          expect(validate?.('123456')).toBe(true)
        })

        it('rejects pincodes starting with 0', () => {
          const validate = getPincodeField()?.validate
          const result = validate?.('012345')
          expect(result).not.toBe(true)
          expect(typeof result).toBe('string')
        })

        it('rejects pincodes shorter than 6 digits', () => {
          const validate = getPincodeField()?.validate
          const result = validate?.('12345')
          expect(result).not.toBe(true)
          expect(typeof result).toBe('string')
        })

        it('rejects pincodes longer than 6 digits', () => {
          const validate = getPincodeField()?.validate
          const result = validate?.('1234567')
          expect(result).not.toBe(true)
          expect(typeof result).toBe('string')
        })

        it('rejects non-numeric pincodes', () => {
          const validate = getPincodeField()?.validate
          const result = validate?.('abc123')
          expect(result).not.toBe(true)
          expect(typeof result).toBe('string')
        })

        it('passes validation on empty/null value (required handles that)', () => {
          const validate = getPincodeField()?.validate
          expect(validate?.('')).toBe(true)
          expect(validate?.(undefined)).toBe(true)
          expect(validate?.(null)).toBe(true)
        })
      })
    })

    describe('country field', () => {
      it('has a country text field with default value India', () => {
        const field = Addresses.fields?.find(
          (f: any) => f.name === 'country',
        ) as any
        expect(field).toBeDefined()
        expect(field.type).toBe('text')
        expect(field.defaultValue).toBe('India')
      })
    })

    describe('isDefault field', () => {
      it('has an isDefault checkbox with default value false', () => {
        const field = Addresses.fields?.find(
          (f: any) => f.name === 'isDefault',
        ) as any
        expect(field).toBeDefined()
        expect(field.type).toBe('checkbox')
        expect(field.defaultValue).toBe(false)
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

    describe('create', () => {
      it('allows super-admin to create', () => {
        expect(Addresses.access?.create?.(makeReq('super-admin'))).toBe(true)
      })

      it('allows admin to create', () => {
        expect(Addresses.access?.create?.(makeReq('admin'))).toBe(true)
      })

      it('allows editor to create', () => {
        expect(Addresses.access?.create?.(makeReq('editor'))).toBe(true)
      })

      it('denies unauthenticated users from creating', () => {
        expect(Addresses.access?.create?.(makeReq(null))).toBe(false)
      })
    })

    describe('read', () => {
      it('allows super-admin to read', () => {
        expect(Addresses.access?.read?.(makeReq('super-admin'))).toBe(true)
      })

      it('allows admin to read', () => {
        expect(Addresses.access?.read?.(makeReq('admin'))).toBe(true)
      })

      it('allows editor to read', () => {
        expect(Addresses.access?.read?.(makeReq('editor'))).toBe(true)
      })

      it('denies unauthenticated users from reading', () => {
        expect(Addresses.access?.read?.(makeReq(null))).toBe(false)
      })
    })

    describe('update', () => {
      it('allows super-admin to update', () => {
        expect(Addresses.access?.update?.(makeReq('super-admin'))).toBe(true)
      })

      it('allows admin to update', () => {
        expect(Addresses.access?.update?.(makeReq('admin'))).toBe(true)
      })

      it('allows editor to update', () => {
        expect(Addresses.access?.update?.(makeReq('editor'))).toBe(true)
      })

      it('denies unauthenticated users from updating', () => {
        expect(Addresses.access?.update?.(makeReq(null))).toBe(false)
      })
    })

    describe('delete', () => {
      it('allows super-admin to delete', () => {
        expect(Addresses.access?.delete?.(makeReq('super-admin'))).toBe(true)
      })

      it('allows admin to delete', () => {
        expect(Addresses.access?.delete?.(makeReq('admin'))).toBe(true)
      })

      it('allows editor to delete', () => {
        expect(Addresses.access?.delete?.(makeReq('editor'))).toBe(true)
      })

      it('denies unauthenticated users from deleting', () => {
        expect(Addresses.access?.delete?.(makeReq(null))).toBe(false)
      })
    })
  })
})
