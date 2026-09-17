import { describe, it, expect } from 'vitest'
import { Media } from '../Media'

describe('Media collection', () => {
  describe('Collection structure', () => {
    it('has correct slug', () => {
      expect(Media.slug).toBe('media')
    })

    it('is in Media admin group', () => {
      expect(Media.admin?.group).toBe('Media')
    })

    it('has upload enabled', () => {
      expect(Media.upload).toBeTruthy()
      expect(typeof Media.upload).toBe('object')
    })

    it('has timestamps enabled', () => {
      expect(Media.timestamps).toBe(true)
    })
  })

  describe('Upload configuration', () => {
    const uploadConfig = Media.upload as Record<string, unknown>

    it('has staticDir set to media', () => {
      expect(uploadConfig.staticDir).toBe('media')
    })

    it('has adminThumbnail set to thumbnail', () => {
      expect(uploadConfig.adminThumbnail).toBe('thumbnail')
    })

    it('restricts mimeTypes to image/*', () => {
      expect(uploadConfig.mimeTypes).toEqual(['image/*'])
    })
  })

  describe('Image sizes', () => {
    const uploadConfig = Media.upload as Record<string, unknown>
    const imageSizes = uploadConfig.imageSizes as Array<{
      name: string
      width: number
      height: number
      position: string
    }>

    it('has 4 image sizes', () => {
      expect(imageSizes).toHaveLength(4)
    })

    it('has thumbnail size (400×500, centre)', () => {
      const size = imageSizes.find((s) => s.name === 'thumbnail')
      expect(size).toBeDefined()
      expect(size?.width).toBe(400)
      expect(size?.height).toBe(500)
      expect(size?.position).toBe('centre')
    })

    it('has card size (600×750, centre)', () => {
      const size = imageSizes.find((s) => s.name === 'card')
      expect(size).toBeDefined()
      expect(size?.width).toBe(600)
      expect(size?.height).toBe(750)
      expect(size?.position).toBe('centre')
    })

    it('has product size (1200×1500, centre)', () => {
      const size = imageSizes.find((s) => s.name === 'product')
      expect(size).toBeDefined()
      expect(size?.width).toBe(1200)
      expect(size?.height).toBe(1500)
      expect(size?.position).toBe('centre')
    })

    it('has hero size (2000×1000, centre)', () => {
      const size = imageSizes.find((s) => s.name === 'hero')
      expect(size).toBeDefined()
      expect(size?.width).toBe(2000)
      expect(size?.height).toBe(1000)
      expect(size?.position).toBe('centre')
    })
  })

  describe('Fields', () => {
    it('has alt text field (required)', () => {
      const field = Media.fields?.find((f: any) => f.name === 'alt') as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.required).toBe(true)
    })

    it('has caption text field (optional)', () => {
      const field = Media.fields?.find((f: any) => f.name === 'caption') as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
      expect(field?.required).toBeUndefined()
    })

    it('has exactly 2 fields', () => {
      expect(Media.fields).toHaveLength(2)
    })
  })

  describe('Access control', () => {
    it('allows public read access', () => {
      const readAccess = Media.access?.read as Function
      expect(readAccess).toBeDefined()
      // Public read should return true regardless of user
      const result = readAccess({ req: { user: undefined } })
      expect(result).toBe(true)
    })

    it('requires authenticated user for create', () => {
      const createAccess = Media.access?.create as Function
      expect(createAccess).toBeDefined()
      // Unauthenticated should be rejected
      expect(createAccess({ req: { user: undefined } })).toBe(false)
      // Authenticated should be allowed
      expect(createAccess({ req: { user: { id: '1' } } })).toBe(true)
    })

    it('requires authenticated user for update', () => {
      const updateAccess = Media.access?.update as Function
      expect(updateAccess).toBeDefined()
      expect(updateAccess({ req: { user: undefined } })).toBe(false)
      expect(updateAccess({ req: { user: { id: '1' } } })).toBe(true)
    })

    it('requires authenticated user for delete', () => {
      const deleteAccess = Media.access?.delete as Function
      expect(deleteAccess).toBeDefined()
      expect(deleteAccess({ req: { user: undefined } })).toBe(false)
      expect(deleteAccess({ req: { user: { id: '1' } } })).toBe(true)
    })
  })
})
