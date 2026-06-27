import { describe, it, expect } from 'vitest'
import { extractSearchText } from '../payload.config'
import { Products } from '../collections/Products'
import { Pages } from '../collections/Pages'
import { Posts } from '../collections/Posts'

describe('Search Plugin', () => {
  describe('Plugin registration', () => {
    it('can import searchPlugin from @payloadcms/plugin-search', async () => {
      const mod = await import('@payloadcms/plugin-search')
      expect(mod.searchPlugin).toBeDefined()
      expect(typeof mod.searchPlugin).toBe('function')
    })

    it('Products collection is configured for search', () => {
      expect(Products).toBeDefined()
      expect(Products.slug).toBe('products')
    })

    it('Pages collection is configured for search', () => {
      expect(Pages).toBeDefined()
      expect(Pages.slug).toBe('pages')
    })

    it('Posts collection is configured for search', () => {
      expect(Posts).toBeDefined()
      expect(Posts.slug).toBe('posts')
    })
  })

  describe('Collection fields used by search', () => {
    it('Products has a name field (used as title in search index)', () => {
      const nameField = Products.fields?.find(
        (f: any) => f.name === 'name',
      ) as any
      expect(nameField).toBeDefined()
      expect(nameField?.type).toBe('text')
      expect(nameField?.required).toBe(true)
    })

    it('Products has a description field (indexed by beforeSync)', () => {
      const descField = Products.fields?.find(
        (f: any) => f.name === 'description',
      ) as any
      expect(descField).toBeDefined()
      expect(descField?.type).toBe('richText')
    })

    it('Pages has a title field (used as title in search index)', () => {
      const titleField = Pages.fields?.find(
        (f: any) => f.name === 'title',
      ) as any
      expect(titleField).toBeDefined()
      expect(titleField?.type).toBe('text')
      expect(titleField?.required).toBe(true)
    })

    it('Pages has a content field (indexed by beforeSync)', () => {
      const contentField = Pages.fields?.find(
        (f: any) => f.name === 'content',
      ) as any
      expect(contentField).toBeDefined()
      expect(contentField?.type).toBe('blocks')
    })

    it('Posts has a title field (used as title in search index)', () => {
      const titleField = Posts.fields?.find(
        (f: any) => f.name === 'title',
      ) as any
      expect(titleField).toBeDefined()
      expect(titleField?.type).toBe('text')
      expect(titleField?.required).toBe(true)
    })

    it('Posts has a content field (indexed by beforeSync)', () => {
      const contentField = Posts.fields?.find(
        (f: any) => f.name === 'content',
      ) as any
      expect(contentField).toBeDefined()
      expect(contentField?.type).toBe('richText')
    })

    it('Posts has an excerpt field (indexed by beforeSync)', () => {
      const excerptField = Posts.fields?.find(
        (f: any) => f.name === 'excerpt',
      ) as any
      expect(excerptField).toBeDefined()
      expect(excerptField?.type).toBe('textarea')
    })
  })

  describe('extractSearchText', () => {
    it('extracts text from string excerpt', () => {
      const result = extractSearchText({
        excerpt: 'A short summary of the post',
      })
      expect(result).toBe('A short summary of the post')
    })

    it('extracts text from string description', () => {
      const result = extractSearchText({
        description: 'Handwoven Banarasi silk saree',
      })
      expect(result).toBe('Handwoven Banarasi silk saree')
    })

    it('extracts text from Lexical richText description', () => {
      const result = extractSearchText({
        description: {
          root: {
            children: [
              {
                type: 'paragraph',
                children: [
                  { text: 'Beautiful', type: 'text' },
                  { text: 'silk', type: 'text' },
                  { text: 'saree', type: 'text' },
                ],
              },
              {
                type: 'paragraph',
                children: [{ text: 'With zari work', type: 'text' }],
              },
            ],
          },
        },
      })
      expect(result).toBe('Beautiful silk saree With zari work')
    })

    it('extracts text from Lexical richText content (Posts)', () => {
      const result = extractSearchText({
        content: {
          root: {
            children: [
              {
                type: 'paragraph',
                children: [{ text: 'Blog post content here', type: 'text' }],
              },
            ],
          },
        },
      })
      expect(result).toBe('Blog post content here')
    })

    it('extracts text from content blocks (Pages)', () => {
      const result = extractSearchText({
        content: [
          {
            heading: 'Welcome to Shayga',
            subheading: 'Discover the finest handloom sarees',
            body: 'Our collection features exquisite weaves from across India.',
          },
        ],
      })
      expect(result).toBe(
        'Welcome to Shayga Discover the finest handloom sarees Our collection features exquisite weaves from across India.',
      )
    })

    it('extracts text from nested features in blocks', () => {
      const result = extractSearchText({
        content: [
          {
            heading: 'Why Choose Us',
            features: [
              { title: 'Handcrafted', description: 'Made by artisans' },
              { title: 'Authentic', description: 'Traditional weaves' },
            ],
          },
        ],
      })
      expect(result).toBe(
        'Why Choose Us Handcrafted Made by artisans Authentic Traditional weaves',
      )
    })

    it('extracts text from FAQ blocks', () => {
      const result = extractSearchText({
        content: [
          {
            heading: 'FAQ',
            questions: [
              {
                question: 'What is Banarasi silk?',
                answer: 'A traditional weave from Varanasi.',
              },
            ],
          },
        ],
      })
      expect(result).toBe(
        'FAQ What is Banarasi silk? A traditional weave from Varanasi.',
      )
    })

    it('extracts text from testimonial items', () => {
      const result = extractSearchText({
        content: [
          {
            heading: 'Testimonials',
            items: [{ name: 'Priya', quote: 'Beautiful sarees!' }],
          },
        ],
      })
      expect(result).toBe('Testimonials Beautiful sarees! Priya')
    })

    it('combines excerpt, description, and content', () => {
      const result = extractSearchText({
        excerpt: 'Quick overview',
        description: 'Detailed description here',
        content: [
          {
            heading: 'Main Content',
            body: 'Full article body text.',
          },
        ],
      })
      expect(result).toBe(
        'Quick overview Detailed description here Main Content Full article body text.',
      )
    })

    it('handles empty description object gracefully', () => {
      const result = extractSearchText({
        description: { root: { children: [] } },
      })
      expect(result).toBe('')
    })

    it('handles empty content array gracefully', () => {
      const result = extractSearchText({
        content: [],
      })
      expect(result).toBe('')
    })

    it('handles RichText body in blocks', () => {
      const result = extractSearchText({
        content: [
          {
            heading: 'About',
            body: {
              root: {
                children: [
                  {
                    type: 'paragraph',
                    children: [
                      { text: 'Rich text body content', type: 'text' },
                    ],
                  },
                ],
              },
            },
          },
        ],
      })
      expect(result).toBe('About Rich text body content')
    })

    it('handles undefined doc fields gracefully', () => {
      const result = extractSearchText({})
      expect(result).toBe('')
    })

    it('normalizes whitespace in extracted text', () => {
      const result = extractSearchText({
        excerpt: '  Extra   spaces   here  ',
      })
      expect(result).toBe('Extra spaces here')
    })
  })
})
