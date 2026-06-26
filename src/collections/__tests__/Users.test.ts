import { describe, it, expect } from 'vitest'
import { Users } from '../Users'

type TestUser = { id: string; role?: string; email?: string }

describe('Users collection', () => {
  describe('Role field', () => {
    it('has all four role options including super-admin', () => {
      const roleField = Users.fields?.find((f: any) => f.name === 'role')

      if (!roleField || roleField.type !== 'select') {
        throw new Error('Role field not found or not a select field')
      }

      const optionValues = roleField.options.map((o: any) => o.value)

      expect(optionValues).toHaveLength(4)
      expect(optionValues).toContain('super-admin')
      expect(optionValues).toContain('admin')
      expect(optionValues).toContain('editor')
      expect(optionValues).toContain('content-manager')
    })

    it('has super-admin first in the role options order', () => {
      const roleField = Users.fields?.find((f: any) => f.name === 'role') as any
      expect(roleField.options[0].value).toBe('super-admin')
      expect(roleField.options[0].label).toBe('Super Admin')
    })

    it('has default role set to editor', () => {
      const roleField = Users.fields?.find((f: any) => f.name === 'role') as any
      expect(roleField.defaultValue).toBe('editor')
    })
  })

  describe('Field-level access on role', () => {
    const makeReq = (role: string | null) => ({
      user: role ? ({ id: '1', role } as unknown as TestUser) : null,
    })

    it('allows super-admin to update role field', () => {
      const roleField = Users.fields?.find((f: any) => f.name === 'role') as any
      const result = roleField.access?.update?.({ req: makeReq('super-admin') })
      expect(result).toBe(true)
    })

    it('denies admin from updating role field', () => {
      const roleField = Users.fields?.find((f: any) => f.name === 'role') as any
      const result = roleField.access?.update?.({ req: makeReq('admin') })
      expect(result).toBe(false)
    })

    it('denies editor from updating role field', () => {
      const roleField = Users.fields?.find((f: any) => f.name === 'role') as any
      const result = roleField.access?.update?.({ req: makeReq('editor') })
      expect(result).toBe(false)
    })

    it('denies content-manager from updating role field', () => {
      const roleField = Users.fields?.find((f: any) => f.name === 'role') as any
      const result = roleField.access?.update?.({
        req: makeReq('content-manager'),
      })
      expect(result).toBe(false)
    })
  })

  describe('Collection-level access control', () => {
    const makeReq = (role: string | null) =>
      ({
        req: {
          user: role
            ? ({ id: 'user-1', role } as unknown as TestUser)
            : undefined,
        },
      }) as any

    describe('create', () => {
      it('allows super-admin to create any user', () => {
        const result = Users.access?.create?.(makeReq('super-admin'))
        expect(result).toBe(true)
      })

      it('allows admin to create users', () => {
        const result = Users.access?.create?.(makeReq('admin'))
        expect(result).toBe(true)
      })

      it('denies editor from creating users', () => {
        const result = Users.access?.create?.(makeReq('editor'))
        expect(result).toBe(false)
      })

      it('denies content-manager from creating users', () => {
        const result = Users.access?.create?.(makeReq('content-manager'))
        expect(result).toBe(false)
      })

      it('denies unauthenticated users from creating', () => {
        const result = Users.access?.create?.(makeReq(null))
        expect(result).toBe(false)
      })
    })

    describe('read', () => {
      it('allows super-admin to read all users', () => {
        const result = Users.access?.read?.(makeReq('super-admin'))
        expect(result).toBe(true)
      })

      it('allows admin to read all users', () => {
        const result = Users.access?.read?.(makeReq('admin'))
        expect(result).toBe(true)
      })

      it('allows editor to read own profile only', () => {
        const result = Users.access?.read?.(makeReq('editor'))
        expect(result).toEqual({ id: { equals: 'user-1' } })
      })

      it('allows content-manager to read own profile only', () => {
        const result = Users.access?.read?.(makeReq('content-manager'))
        expect(result).toEqual({ id: { equals: 'user-1' } })
      })

      it('denies unauthenticated users from reading', () => {
        const result = Users.access?.read?.(makeReq(null))
        expect(result).toBe(false)
      })
    })

    describe('update', () => {
      it('allows super-admin to update any user', () => {
        const result = Users.access?.update?.(makeReq('super-admin'))
        expect(result).toBe(true)
      })

      it('allows admin to update users', () => {
        const result = Users.access?.update?.(makeReq('admin'))
        expect(result).toBe(true)
      })

      it('allows editor to update own profile only', () => {
        const result = Users.access?.update?.(makeReq('editor'))
        expect(result).toEqual({ id: { equals: 'user-1' } })
      })

      it('allows content-manager to update own profile only', () => {
        const result = Users.access?.update?.(makeReq('content-manager'))
        expect(result).toEqual({ id: { equals: 'user-1' } })
      })

      it('denies unauthenticated users from updating', () => {
        const result = Users.access?.update?.(makeReq(null))
        expect(result).toBe(false)
      })
    })

    describe('delete', () => {
      it('allows super-admin to delete any user', () => {
        const result = Users.access?.delete?.(makeReq('super-admin'))
        expect(result).toBe(true)
      })

      it('allows admin to delete users', () => {
        const result = Users.access?.delete?.(makeReq('admin'))
        expect(result).toBe(true)
      })

      it('denies editor from deleting users', () => {
        const result = Users.access?.delete?.(makeReq('editor'))
        expect(result).toBe(false)
      })

      it('denies content-manager from deleting users', () => {
        const result = Users.access?.delete?.(makeReq('content-manager'))
        expect(result).toBe(false)
      })

      it('denies unauthenticated users from deleting', () => {
        const result = Users.access?.delete?.(makeReq(null))
        expect(result).toBe(false)
      })
    })
  })
})
