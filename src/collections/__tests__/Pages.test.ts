import { describe, it, expect } from 'vitest'
import { Pages } from '../Pages'

describe('Pages collection', () => {
  describe('Collection structure', () => {
    it('has correct slug', () => {
      expect(Pages.slug).toBe('pages')
    })

    it('uses title as display title', () => {
      expect(Pages.admin?.useAsTitle).toBe('title')
    })

    it('is in Content admin group', () => {
      expect(Pages.admin?.group).toBe('Content')
    })

    it('has timestamps enabled', () => {
      expect(Pages.timestamps).toBe(true)
    })

    it('has exactly 7 top-level fields', () => {
      expect(Pages.fields).toHaveLength(7)
    })
  })

  describe('Title field', () => {
    const field = Pages.fields?.find((f: any) => f.name === 'title') as any

    it('exists and is a text field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })

    it('is required', () => {
      expect(field?.required).toBe(true)
    })
  })

  describe('Slug field', () => {
    const field = Pages.fields?.find((f: any) => f.name === 'slug') as any

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

  describe('Status field', () => {
    const field = Pages.fields?.find((f: any) => f.name === 'status') as any

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
      expect(values).toHaveLength(2)
    })
  })

  describe('Template field', () => {
    const field = Pages.fields?.find((f: any) => f.name === 'template') as any

    it('exists and is a select field', () => {
      expect(field).toBeDefined()
      expect(field?.type).toBe('select')
    })

    it('defaults to default', () => {
      expect(field?.defaultValue).toBe('default')
    })

    it('has all 4 template options', () => {
      const values = field?.options?.map((o: any) => o.value)
      expect(values).toHaveLength(4)
      expect(values).toEqual(['default', 'contact', 'about', 'faq'])
    })
  })

  describe('SEO meta fields', () => {
    it('has metaTitle text field', () => {
      const field = Pages.fields?.find(
        (f: any) => f.name === 'metaTitle',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('text')
    })

    it('has metaDescription textarea field', () => {
      const field = Pages.fields?.find(
        (f: any) => f.name === 'metaDescription',
      ) as any
      expect(field).toBeDefined()
      expect(field?.type).toBe('textarea')
    })
  })

  describe('Content blocks field', () => {
    const contentField = Pages.fields?.find(
      (f: any) => f.name === 'content',
    ) as any

    it('exists and is a blocks field', () => {
      expect(contentField).toBeDefined()
      expect(contentField?.type).toBe('blocks')
    })

    it('has exactly 6 block types', () => {
      expect(contentField?.blocks).toHaveLength(6)
    })

    const blockSlugs = contentField?.blocks?.map((b: any) => b.slug) || []

    it('includes hero block', () => {
      expect(blockSlugs).toContain('hero')
    })

    it('includes textImage block', () => {
      expect(blockSlugs).toContain('textImage')
    })

    it('includes featureGrid block', () => {
      expect(blockSlugs).toContain('featureGrid')
    })

    it('includes testimonials block', () => {
      expect(blockSlugs).toContain('testimonials')
    })

    it('includes faq block', () => {
      expect(blockSlugs).toContain('faq')
    })

    it('includes cta block', () => {
      expect(blockSlugs).toContain('cta')
    })
  })

  describe('Hero block', () => {
    const contentField = Pages.fields?.find(
      (f: any) => f.name === 'content',
    ) as any
    const heroBlock = contentField?.blocks?.find((b: any) => b.slug === 'hero')
    const fieldNames = heroBlock?.fields?.map((f: any) => f.name) || []

    it('has heading text field', () => {
      expect(fieldNames).toContain('heading')
      const f = heroBlock?.fields?.find((x: any) => x.name === 'heading')
      expect(f?.type).toBe('text')
    })

    it('has subheading text field', () => {
      expect(fieldNames).toContain('subheading')
      const f = heroBlock?.fields?.find((x: any) => x.name === 'subheading')
      expect(f?.type).toBe('text')
    })

    it('has backgroundImage upload field', () => {
      expect(fieldNames).toContain('backgroundImage')
      const f = heroBlock?.fields?.find(
        (x: any) => x.name === 'backgroundImage',
      )
      expect(f?.type).toBe('upload')
      expect(f?.relationTo).toBe('media')
    })

    it('has ctaText text field', () => {
      expect(fieldNames).toContain('ctaText')
      const f = heroBlock?.fields?.find((x: any) => x.name === 'ctaText')
      expect(f?.type).toBe('text')
    })

    it('has ctaLink text field', () => {
      expect(fieldNames).toContain('ctaLink')
      const f = heroBlock?.fields?.find((x: any) => x.name === 'ctaLink')
      expect(f?.type).toBe('text')
    })

    it('has exactly 5 fields', () => {
      expect(heroBlock?.fields).toHaveLength(5)
    })
  })

  describe('TextImage block', () => {
    const contentField = Pages.fields?.find(
      (f: any) => f.name === 'content',
    ) as any
    const block = contentField?.blocks?.find((b: any) => b.slug === 'textImage')
    const fieldNames = block?.fields?.map((f: any) => f.name) || []

    it('has heading text field', () => {
      expect(fieldNames).toContain('heading')
    })

    it('has body richText field', () => {
      const f = block?.fields?.find((x: any) => x.name === 'body')
      expect(f?.type).toBe('richText')
    })

    it('has image upload field pointing to media', () => {
      const f = block?.fields?.find((x: any) => x.name === 'image')
      expect(f?.type).toBe('upload')
      expect(f?.relationTo).toBe('media')
    })

    it('has imagePosition select field defaulting to left', () => {
      const f = block?.fields?.find((x: any) => x.name === 'imagePosition')
      expect(f?.type).toBe('select')
      expect(f?.defaultValue).toBe('left')
      const values = f?.options?.map((o: any) => o.value)
      expect(values).toEqual(['left', 'right'])
    })

    it('has exactly 4 fields', () => {
      expect(block?.fields).toHaveLength(4)
    })
  })

  describe('FeatureGrid block', () => {
    const contentField = Pages.fields?.find(
      (f: any) => f.name === 'content',
    ) as any
    const block = contentField?.blocks?.find(
      (b: any) => b.slug === 'featureGrid',
    )

    it('has heading text field', () => {
      const f = block?.fields?.find((x: any) => x.name === 'heading')
      expect(f?.type).toBe('text')
    })

    it('has features array field', () => {
      const f = block?.fields?.find((x: any) => x.name === 'features')
      expect(f?.type).toBe('array')
      expect(f?.fields).toHaveLength(3)
    })

    it('features array has icon, title, description sub-fields', () => {
      const featuresField = block?.fields?.find(
        (x: any) => x.name === 'features',
      ) as any
      const subNames = featuresField?.fields?.map((x: any) => x.name) || []
      expect(subNames).toContain('icon')
      expect(subNames).toContain('title')
      expect(subNames).toContain('description')
      expect(
        featuresField?.fields?.find((x: any) => x.name === 'icon')?.type,
      ).toBe('text')
      expect(
        featuresField?.fields?.find((x: any) => x.name === 'title')?.type,
      ).toBe('text')
      expect(
        featuresField?.fields?.find((x: any) => x.name === 'description')?.type,
      ).toBe('textarea')
    })
  })

  describe('Testimonials block', () => {
    const contentField = Pages.fields?.find(
      (f: any) => f.name === 'content',
    ) as any
    const block = contentField?.blocks?.find(
      (b: any) => b.slug === 'testimonials',
    )

    it('has heading text field', () => {
      const f = block?.fields?.find((x: any) => x.name === 'heading')
      expect(f?.type).toBe('text')
    })

    it('has items array field', () => {
      const f = block?.fields?.find((x: any) => x.name === 'items')
      expect(f?.type).toBe('array')
      expect(f?.fields).toHaveLength(4)
    })

    it('items array has avatar upload field pointing to media', () => {
      const itemsField = block?.fields?.find(
        (x: any) => x.name === 'items',
      ) as any
      const avatar = itemsField?.fields?.find((x: any) => x.name === 'avatar')
      expect(avatar?.type).toBe('upload')
      expect(avatar?.relationTo).toBe('media')
    })
  })

  describe('FAQ block', () => {
    const contentField = Pages.fields?.find(
      (f: any) => f.name === 'content',
    ) as any
    const block = contentField?.blocks?.find((b: any) => b.slug === 'faq')

    it('has heading text field', () => {
      const f = block?.fields?.find((x: any) => x.name === 'heading')
      expect(f?.type).toBe('text')
    })

    it('has questions array field with question and answer', () => {
      const f = block?.fields?.find((x: any) => x.name === 'questions')
      expect(f?.type).toBe('array')
      expect(f?.fields).toHaveLength(2)
      const subNames = f?.fields?.map((x: any) => x.name) || []
      expect(subNames).toEqual(['question', 'answer'])
    })
  })

  describe('CTA block', () => {
    const contentField = Pages.fields?.find(
      (f: any) => f.name === 'content',
    ) as any
    const block = contentField?.blocks?.find((b: any) => b.slug === 'cta')

    it('has heading text field', () => {
      const f = block?.fields?.find((x: any) => x.name === 'heading')
      expect(f?.type).toBe('text')
    })

    it('has body textarea field', () => {
      const f = block?.fields?.find((x: any) => x.name === 'body')
      expect(f?.type).toBe('textarea')
    })

    it('has buttonText and buttonLink text fields', () => {
      const btnText = block?.fields?.find((x: any) => x.name === 'buttonText')
      const btnLink = block?.fields?.find((x: any) => x.name === 'buttonLink')
      expect(btnText?.type).toBe('text')
      expect(btnLink?.type).toBe('text')
    })

    it('has exactly 4 fields', () => {
      expect(block?.fields).toHaveLength(4)
    })
  })

  describe('Slug generation hook', () => {
    it('generates lowercase slug from title', () => {
      const hook = Pages.hooks?.beforeChange?.[0]
      expect(hook).toBeDefined()
      if (!hook) return

      const result = hook({
        data: { title: 'About Our Company' },
        operation: 'create',
      } as any)

      expect(result.slug).toBe('about-our-company')
    })

    it('replaces spaces with dashes', () => {
      const hook = Pages.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = hook({
        data: { title: '  Contact  Us  ' },
        operation: 'create',
      } as any)

      expect(result.slug).toBe('contact-us')
    })

    it('removes special characters', () => {
      const hook = Pages.hooks?.beforeChange?.[0]
      if (!hook) return

      const result = hook({
        data: { title: 'FAQ & Support!' },
        operation: 'create',
      } as any)

      expect(result.slug).not.toContain('&')
      expect(result.slug).not.toContain('!')
    })
  })

  describe('Access control', () => {
    it('allows public read access', () => {
      const readAccess = Pages.access?.read as Function
      expect(readAccess).toBeDefined()
      const result = readAccess({ req: { user: undefined } })
      expect(result).toBe(true)
    })

    it('requires authenticated user for create', () => {
      const createAccess = Pages.access?.create as Function
      expect(createAccess).toBeDefined()
      expect(createAccess({ req: { user: undefined } })).toBe(false)
      expect(createAccess({ req: { user: { id: '1' } } })).toBe(true)
    })

    it('requires authenticated user for update', () => {
      const updateAccess = Pages.access?.update as Function
      expect(updateAccess).toBeDefined()
      expect(updateAccess({ req: { user: undefined } })).toBe(false)
      expect(updateAccess({ req: { user: { id: '1' } } })).toBe(true)
    })

    it('requires authenticated user for delete', () => {
      const deleteAccess = Pages.access?.delete as Function
      expect(deleteAccess).toBeDefined()
      expect(deleteAccess({ req: { user: undefined } })).toBe(false)
      expect(deleteAccess({ req: { user: { id: '1' } } })).toBe(true)
    })
  })
})
