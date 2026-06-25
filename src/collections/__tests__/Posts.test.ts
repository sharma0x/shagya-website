import { describe, it, expect } from 'vitest'
import { Posts } from '../Posts'

describe('Posts collection', () => {
  describe('Collection structure', () => {
    it('has correct slug', () => {
      expect(Posts.slug).toBe('posts')
    })

    it('uses title as display title', () => {
      expect(Posts.admin?.useAsTitle).toBe('title')
    })

    it('is in Content admin group', () => {
      expect(Posts.admin?.group).toBe('Content')
    })

    it('has timestamps enabled', () => {
      expect(Posts.timestamps).toBe(true)
    })

    it('has exactly 10 top-level fields', () => {
      expect(Posts.fields).toHaveLength(10)
    })
  })

  describe('Title field', () => {
    const field = Posts.fields?.find((f: any) => f.name === 'title') as any

    it('exists and is a text field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })

    it('is required', () => {
      expect(field?.required).toBe(true)
    })
  })

  describe('Slug field', () => {
    const field = Posts.fields?.find((f: any) => f.name === 'slug') as any

    it('exists and is a text field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })

    it('is unique and indexed', () => {
      expect(field?.unique).toBe(true)
      expect(field?.index).toBe(true)
    })

    it('is readOnly in admin', () => {
      expect(field?.admin?.readOnly).toBe(true)
    })
  })

  describe('Content field', () => {
    const field = Posts.fields?.find((f: any) => f.name === 'content') as any

    it('exists and is a richText field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('richText')
    })

    it('is required', () => {
      expect(field?.required).toBe(true)
    })
  })

  describe('Excerpt field', () => {
    const field = Posts.fields?.find((f: any) => f.name === 'excerpt') as any

    it('exists and is a textarea field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('textarea')
    })
  })

  describe('FeaturedImage field', () => {
    const field = Posts.fields?.find(
      (f: any) => f.name === 'featuredImage',
    ) as any

    it('exists and is an upload field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('upload')
    })

    it('points to media collection', () => {
      expect(field?.relationTo).toBe('media')
    })
  })

  describe('Author field', () => {
    const field = Posts.fields?.find((f: any) => f.name === 'author') as any

    it('exists and is a relationship field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('relationship')
    })

    it('points to users collection', () => {
      expect(field?.relationTo).toBe('users')
    })

    it('is required', () => {
      expect(field?.required).toBe(true)
    })
  })

  describe('Categories field', () => {
    const field = Posts.fields?.find((f: any) => f.name === 'categories') as any

    it('exists and is a relationship field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('relationship')
    })

    it('points to categories collection', () => {
      expect(field?.relationTo).toBe('categories')
    })

    it('supports multiple categories', () => {
      expect(field?.hasMany).toBe(true)
    })
  })

  describe('Tags field', () => {
    const field = Posts.fields?.find((f: any) => f.name === 'tags') as any

    it('exists and is a relationship field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('relationship')
    })

    it('points to tags collection', () => {
      expect(field?.relationTo).toBe('tags')
    })

    it('supports multiple tags', () => {
      expect(field?.hasMany).toBe(true)
    })
  })

  describe('PublishedAt field', () => {
    const field = Posts.fields?.find(
      (f: any) => f.name === 'publishedAt',
    ) as any

    it('exists and is a date field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('date')
    })

    it('has dayAndTime picker appearance', () => {
      expect(field?.admin?.date?.pickerAppearance).toBe('dayAndTime')
    })
  })

  describe('Status field', () => {
    const field = Posts.fields?.find((f: any) => f.name === 'status') as any

    it('exists and is a select field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('select')
    })

    it('defaults to draft', () => {
      expect(field?.defaultValue).toBe('draft')
    })

    it('has draft and published options', () => {
      const values = field?.options?.map((o: any) => o.value)
      expect(values).toContain('draft')
      expect(values).toContain('published')
    })

    it('has exactly 2 status options', () => {
      expect(field?.options).toHaveLength(2)
    })
  })

  describe('Slug generation hook', () => {
    const hook = Posts.hooks?.beforeChange?.[0]

    it('hook is defined', () => {
      expect(hook).toBeDefined()
    })

    it('generates lowercase slug from title', () => {
      if (!hook) return

      const result = hook({
        data: { title: 'My First Blog Post' },
        operation: 'create',
      } as any)

      expect(result.slug).toBe('my-first-blog-post')
    })

    it('replaces spaces with dashes', () => {
      if (!hook) return

      const result = hook({
        data: { title: '  Hello   World  ' },
        operation: 'create',
      } as any)

      expect(result.slug).toBe('hello-world')
    })

    it('removes special characters', () => {
      if (!hook) return

      const result = hook({
        data: { title: 'Top 10 Tips & Tricks!' },
        operation: 'create',
      } as any)

      expect(result.slug).not.toContain('&')
      expect(result.slug).not.toContain('!')
      expect(result.slug).toBe('top-10-tips-tricks')
    })

    it('collapses multiple dashes into one', () => {
      if (!hook) return

      const result = hook({
        data: { title: 'Modern---Design   Trends' },
        operation: 'create',
      } as any)

      expect(result.slug).toBe('modern-design-trends')
    })
  })

  describe('Access control', () => {
    it('allows public read access', () => {
      const readAccess = Posts.access?.read as Function
      expect(readAccess).toBeDefined()
      const result = readAccess({ req: { user: undefined } })
      expect(result).toBe(true)
    })

    it('requires authenticated user for create', () => {
      const createAccess = Posts.access?.create as Function
      expect(createAccess).toBeDefined()
      expect(createAccess({ req: { user: undefined } })).toBe(false)
      expect(createAccess({ req: { user: { id: '1' } } })).toBe(true)
    })

    it('requires authenticated user for update', () => {
      const updateAccess = Posts.access?.update as Function
      expect(updateAccess).toBeDefined()
      expect(updateAccess({ req: { user: undefined } })).toBe(false)
      expect(updateAccess({ req: { user: { id: '1' } } })).toBe(true)
    })

    it('requires authenticated user for delete', () => {
      const deleteAccess = Posts.access?.delete as Function
      expect(deleteAccess).toBeDefined()
      expect(deleteAccess({ req: { user: undefined } })).toBe(false)
      expect(deleteAccess({ req: { user: { id: '1' } } })).toBe(true)
    })
  })
})
