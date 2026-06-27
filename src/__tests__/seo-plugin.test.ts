import { describe, it, expect } from 'vitest'
import { generateTitle, generateDescription } from '../payload.config'
import { Products } from '../collections/Products'
import { Pages } from '../collections/Pages'
import { Media } from '../collections/Media'

describe('SEO Plugin', () => {
  describe('Plugin registration', () => {
    it('can import seoPlugin from @payloadcms/plugin-seo', async () => {
      const mod = await import('@payloadcms/plugin-seo')
      expect(mod.seoPlugin).toBeDefined()
      expect(typeof mod.seoPlugin).toBe('function')
    })

    it('Products collection exists for SEO targeting', () => {
      expect(Products).toBeDefined()
      expect(Products.slug).toBe('products')
    })

    it('Pages collection exists for SEO targeting', () => {
      expect(Pages).toBeDefined()
      expect(Pages.slug).toBe('pages')
    })

    it('Media collection exists for SEO image uploads', () => {
      expect(Media).toBeDefined()
      expect(Media.slug).toBe('media')
    })

    it('Products has a name field (used for title fallback)', () => {
      const nameField = Products.fields?.find(
        (f: any) => f.name === 'name',
      ) as any
      expect(nameField).toBeDefined()
      expect(nameField?.type).toBe('text')
      expect(nameField?.required).toBe(true)
    })

    it('Pages has a title field (used for title fallback)', () => {
      const titleField = Pages.fields?.find(
        (f: any) => f.name === 'title',
      ) as any
      expect(titleField).toBeDefined()
      expect(titleField?.type).toBe('text')
      expect(titleField?.required).toBe(true)
    })

    it('Products has a description field (used for description fallback)', () => {
      const descField = Products.fields?.find(
        (f: any) => f.name === 'description',
      ) as any
      expect(descField).toBeDefined()
      expect(descField?.type).toBe('richText')
    })
  })

  describe('generateTitle', () => {
    it('returns the doc title when present', () => {
      const result = generateTitle({
        doc: { title: 'Banarasi Silk Saree', name: 'Saree' },
      })
      expect(result).toBe('Banarasi Silk Saree')
    })

    it('falls back to doc.name when title is absent', () => {
      const result = generateTitle({
        doc: { name: 'Product Name' },
      })
      expect(result).toBe('Product Name')
    })

    it('falls back to empty string when neither title nor name exist', () => {
      const result = generateTitle({
        doc: {},
      })
      expect(result).toBe('')
    })

    it('handles undefined doc gracefully', () => {
      const result = generateTitle({ doc: undefined as any })
      expect(result).toBe('')
    })

    it('handles null doc gracefully', () => {
      const result = generateTitle({ doc: null as any })
      expect(result).toBe('')
    })

    it('prioritizes title over name when both exist', () => {
      const result = generateTitle({
        doc: { title: 'Page Title', name: 'Product Name' },
      })
      expect(result).toBe('Page Title')
    })
  })

  describe('generateDescription', () => {
    it('returns string description truncated to 160 chars', () => {
      const result = generateDescription({
        doc: {
          description:
            'A beautiful handwoven Banarasi silk saree with intricate zari work',
        },
      })
      expect(result).toBe(
        'A beautiful handwoven Banarasi silk saree with intricate zari work',
      )
    })

    it('truncates long string descriptions at 160 characters', () => {
      const longDesc = 'A'.repeat(200)
      const result = generateDescription({ doc: { description: longDesc } })
      expect(result).toHaveLength(160)
    })

    it('extracts text from Lexical richText description', () => {
      const result = generateDescription({
        doc: {
          description: {
            root: {
              children: [
                {
                  type: 'paragraph',
                  children: [
                    {
                      text: 'Handwoven silk saree with zari border.',
                      type: 'text',
                    },
                  ],
                },
              ],
            },
          },
        },
      })
      expect(result).toBe('Handwoven silk saree with zari border.')
    })

    it('handles multiple text nodes in Lexical paragraph', () => {
      const result = generateDescription({
        doc: {
          description: {
            root: {
              children: [
                {
                  type: 'paragraph',
                  children: [
                    { text: 'This is rich text', type: 'text' },
                    { text: 'content.', type: 'text' },
                  ],
                },
              ],
            },
          },
        },
      })
      expect(result).toBe('This is rich text content.')
    })

    it('returns empty string for Lexical description with no paragraphs', () => {
      const result = generateDescription({
        doc: {
          description: {
            root: {
              children: [{ type: 'heading', children: [{ text: 'Title' }] }],
            },
          },
        },
      })
      expect(result).toBe('')
    })

    it('extracts from content blocks heading (Pages)', () => {
      const result = generateDescription({
        doc: {
          content: [{ heading: 'Welcome to Shayga' }, { heading: 'Our Story' }],
        },
      })
      expect(result).toBe('Welcome to Shayga')
    })

    it('falls back to content block body when no heading', () => {
      const result = generateDescription({
        doc: {
          content: [{ body: 'Discover our collection.' }],
        },
      })
      expect(result).toBe('Discover our collection.')
    })

    it('returns empty string when no description or content blocks', () => {
      const result = generateDescription({ doc: {} })
      expect(result).toBe('')
    })

    it('handles undefined doc gracefully', () => {
      const result = generateDescription({ doc: undefined as any })
      expect(result).toBe('')
    })
  })
})
