import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FormSubmissions } from '../FormSubmissions'

// We test that the module imports and the hook is correctly wired.
// Email sending is tested at the structural level since it requires a real
// Payload request context.

vi.mock('@/lib/email', () => ({
  sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test-id' }),
}))

describe('FormSubmissions collection', () => {
  describe('Collection structure', () => {
    it('has correct slug', () => {
      expect(FormSubmissions.slug).toBe('form-submissions')
    })

    it('uses form as display title', () => {
      expect(FormSubmissions.admin?.useAsTitle).toBe('form')
    })

    it('is in Content admin group', () => {
      expect(FormSubmissions.admin?.group).toBe('Content')
    })

    it('has timestamps enabled', () => {
      expect(FormSubmissions.timestamps).toBe(true)
    })
  })

  describe('Access control', () => {
    describe('read access', () => {
      it('denies unauthenticated reads', () => {
        const readAccess = FormSubmissions.access?.read
        expect(readAccess).toBeDefined()
        if (typeof readAccess === 'function') {
          expect(readAccess({ req: {} } as any)).toBe(false)
          expect(readAccess({ req: { user: null } } as any)).toBe(false)
        }
      })

      it('allows authenticated reads', () => {
        const readAccess = FormSubmissions.access?.read
        if (typeof readAccess === 'function') {
          expect(
            readAccess({
              req: { user: { id: '1', role: 'admin' } },
            } as any),
          ).toBe(true)
        }
      })
    })

    describe('create access', () => {
      it('allows public create (anyone can submit)', () => {
        const createAccess = FormSubmissions.access?.create
        expect(createAccess).toBeDefined()
        if (typeof createAccess === 'function') {
          // Returns true unconditionally (public access)
          expect(createAccess({ req: {} } as any)).toBe(true)
          expect(createAccess({ req: { user: null } } as any)).toBe(true)
          expect(
            createAccess({
              req: { user: { id: '1' } },
            } as any),
          ).toBe(true)
        }
      })
    })

    describe('update access', () => {
      it('denies unauthenticated updates', () => {
        const updateAccess = FormSubmissions.access?.update
        if (typeof updateAccess === 'function') {
          expect(updateAccess({ req: {} } as any)).toBe(false)
          expect(updateAccess({ req: { user: null } } as any)).toBe(false)
        }
      })

      it('allows authenticated updates', () => {
        const updateAccess = FormSubmissions.access?.update
        if (typeof updateAccess === 'function') {
          expect(
            updateAccess({
              req: { user: { id: '1', role: 'admin' } },
            } as any),
          ).toBe(true)
        }
      })
    })

    describe('delete access', () => {
      it('denies unauthenticated deletes', () => {
        const deleteAccess = FormSubmissions.access?.delete
        if (typeof deleteAccess === 'function') {
          expect(deleteAccess({ req: {} } as any)).toBe(false)
          expect(deleteAccess({ req: { user: null } } as any)).toBe(false)
        }
      })

      it('allows authenticated deletes', () => {
        const deleteAccess = FormSubmissions.access?.delete
        if (typeof deleteAccess === 'function') {
          expect(
            deleteAccess({
              req: { user: { id: '1', role: 'admin' } },
            } as any),
          ).toBe(true)
        }
      })
    })
  })

  describe('Fields', () => {
    it('has exactly 3 fields', () => {
      expect(FormSubmissions.fields).toHaveLength(3)
    })

    describe('form field', () => {
      const field = FormSubmissions.fields?.find(
        (f: any) => f.name === 'form',
      ) as any

      it('exists and is a relationship field', () => {
        expect(field).toBeDefined()
        expect(field?.type).toBe('relationship')
      })

      it('relates to forms and is required', () => {
        expect(field?.relationTo).toBe('forms')
        expect(field?.required).toBe(true)
      })
    })

    describe('data field', () => {
      const field = FormSubmissions.fields?.find(
        (f: any) => f.name === 'data',
      ) as any

      it('exists and is a json field', () => {
        expect(field).toBeDefined()
        expect(field?.type).toBe('json')
      })

      it('has a user-friendly label', () => {
        expect(field?.label).toBe('Submission Data')
      })
    })

    describe('honeypot field', () => {
      const field = FormSubmissions.fields?.find(
        (f: any) => f.name === 'honeypot',
      ) as any

      it('exists and is a text field', () => {
        expect(field).toBeDefined()
        expect(field?.type).toBe('text')
      })

      it('is hidden in admin UI', () => {
        expect(field?.admin?.hidden).toBe(true)
      })
    })
  })

  describe('Hooks', () => {
    it('has an afterChange hook defined', () => {
      const hooks = FormSubmissions.hooks
      expect(hooks).toBeDefined()
      expect(hooks?.afterChange).toBeDefined()
      expect(hooks?.afterChange?.length).toBeGreaterThan(0)
    })

    it('afterChange hook skips non-create operations', async () => {
      const hook = FormSubmissions.hooks?.afterChange?.[0]
      expect(hook).toBeDefined()
      if (!hook) return

      const { sendEmail } = await import('@/lib/email')

      const result = await hook({
        doc: { form: 'form-1', data: {}, honeypot: '' },
        previousDoc: {},
        operation: 'update',
        req: { payload: { logger: { error: vi.fn() } } } as any,
        collection: { slug: 'form-submissions' } as any,
      } as any)

      // Should return doc without calling sendEmail
      expect(result).toBeDefined()
      expect(sendEmail).not.toHaveBeenCalled()
    })

    it('afterChange hook skips when honeypot is filled (spam)', async () => {
      const hook = FormSubmissions.hooks?.afterChange?.[0]
      if (!hook) return

      const { sendEmail } = await import('@/lib/email')
      vi.mocked(sendEmail).mockClear()

      const result = await hook({
        doc: { form: 'form-1', data: { name: 'Spam' }, honeypot: 'bot-filled' },
        previousDoc: {},
        operation: 'create',
        req: { payload: { logger: { error: vi.fn() } } } as any,
        collection: { slug: 'form-submissions' } as any,
      } as any)

      // Should skip email for spam
      expect(sendEmail).not.toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('afterChange hook skips when honeypot has whitespace only', async () => {
      const hook = FormSubmissions.hooks?.afterChange?.[0]
      if (!hook) return

      const { sendEmail } = await import('@/lib/email')
      vi.mocked(sendEmail).mockClear()

      const result = await hook({
        doc: { form: 'form-1', data: {}, honeypot: '   ' },
        previousDoc: {},
        operation: 'create',
        req: { payload: { logger: { error: vi.fn() } } } as any,
        collection: { slug: 'form-submissions' } as any,
      } as any)

      expect(sendEmail).not.toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('afterChange hook processes valid submissions (honeypot empty)', async () => {
      const hook = FormSubmissions.hooks?.afterChange?.[0]
      if (!hook) return

      const { sendEmail } = await import('@/lib/email')
      vi.mocked(sendEmail).mockClear()

      // Mock req.payload.findByID to return a form with emailTo
      const mockReq = {
        payload: {
          findByID: vi.fn().mockResolvedValue({
            id: 'form-1',
            title: 'Contact Us',
            emailTo: 'admin@shayga.com',
          }),
          logger: { error: vi.fn() },
        },
      } as any

      await hook({
        doc: { form: 'form-1', data: { name: 'John', email: 'john@test.com' } },
        previousDoc: {},
        operation: 'create',
        req: mockReq,
        collection: { slug: 'form-submissions' } as any,
      } as any)

      expect(mockReq.payload.findByID).toHaveBeenCalledWith({
        collection: 'forms',
        id: 'form-1',
      })
      expect(sendEmail).toHaveBeenCalledTimes(1)

      const callArgs = vi.mocked(sendEmail).mock.calls[0][0]
      expect(callArgs.to).toBe('admin@shayga.com')
      expect(callArgs.subject).toContain('Contact Us')
      expect(callArgs.html).toContain('John')
      expect(callArgs.html).toContain('john@test.com')
    })

    it('afterChange hook handles missing form gracefully', async () => {
      const hook = FormSubmissions.hooks?.afterChange?.[0]
      if (!hook) return

      const { sendEmail } = await import('@/lib/email')
      vi.mocked(sendEmail).mockClear()

      const result = await hook({
        doc: { data: { name: 'Test' } },
        previousDoc: {},
        operation: 'create',
        req: { payload: { logger: { error: vi.fn() } } } as any,
        collection: { slug: 'form-submissions' } as any,
      } as any)

      expect(sendEmail).not.toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('afterChange hook handles missing emailTo on form gracefully', async () => {
      const hook = FormSubmissions.hooks?.afterChange?.[0]
      if (!hook) return

      const { sendEmail } = await import('@/lib/email')
      vi.mocked(sendEmail).mockClear()

      const mockReq = {
        payload: {
          findByID: vi.fn().mockResolvedValue({
            id: 'form-1',
            title: 'No Email Form',
            // No emailTo
          }),
          logger: { error: vi.fn() },
        },
      } as any

      await hook({
        doc: { form: 'form-1', data: { field: 'value' } },
        previousDoc: {},
        operation: 'create',
        req: mockReq,
        collection: { slug: 'form-submissions' } as any,
      } as any)

      expect(mockReq.payload.findByID).toHaveBeenCalled()
      expect(sendEmail).not.toHaveBeenCalled()
    })
  })
})
