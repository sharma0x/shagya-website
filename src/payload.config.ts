// =============================================================================
// Shagya — Payload CMS Configuration
// =============================================================================
// This is the central configuration file for the entire backend.
// All collections, globals, plugins, and admin settings live here.
// =============================================================================

import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { searchPlugin } from '@payloadcms/plugin-search'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { Users } from './collections/Users'
import { Products } from './collections/Products'
import { Categories } from './collections/Categories'
import { Collections } from './collections/Collections'
import { Variants } from './collections/Variants'
import { Orders } from './collections/Orders'
import { EventLogs } from './collections/EventLogs'
import { Customers } from './collections/Customers'
import { Addresses } from './collections/Addresses'
import { Coupons } from './collections/Coupons'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Reviews } from './collections/Reviews'
import { Tags } from './collections/Tags'
import { Brands } from './collections/Brands'
import { FabricTypes } from './collections/FabricTypes'
import { Occasions } from './collections/Occasions'
import { Wishlist } from './collections/Wishlist'
import { SiteSettings } from './globals/SiteSettings'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// ---------------------------------------------------------------------------
// SEO Plugin — helpers
// ---------------------------------------------------------------------------
export const generateTitle = ({ doc }: { doc: any }): string => {
  return (doc?.title || doc?.name || '').toString()
}

export const generateDescription = ({ doc }: { doc: any }): string => {
  const description = doc?.description
  if (typeof description === 'string') return description.slice(0, 160)
  if (typeof description === 'object' && description?.root) {
    // Lexical richText — extract plain text from first paragraph
    const firstParagraph = description.root.children?.find(
      (child: any) => child.type === 'paragraph',
    )
    if (firstParagraph) {
      const text = firstParagraph.children
        ?.map((node: any) => node.text || '')
        .join(' ')
      return text.slice(0, 160)
    }
  }
  // Fallback to content blocks text extraction (Pages)
  const blocks = doc?.content
  if (Array.isArray(blocks) && blocks.length > 0) {
    const firstBlock = blocks[0]
    if (firstBlock?.heading) return firstBlock.heading.slice(0, 160)
    if (firstBlock?.body) {
      return typeof firstBlock.body === 'string'
        ? firstBlock.body.slice(0, 160)
        : firstBlock.body.slice(0, 160)
    }
  }
  return ''
}

// ---------------------------------------------------------------------------
// Search Plugin — helpers
// ---------------------------------------------------------------------------

/**
 * Extracts searchable plain text from a document's description/content fields.
 * Used by the search plugin's `beforeSync` to enrich the indexed title.
 */
export const extractSearchText = (doc: Record<string, unknown>): string => {
  const parts: string[] = []

  // Extract from excerpt (Posts)
  if (typeof doc.excerpt === 'string' && doc.excerpt.length > 0) {
    parts.push(doc.excerpt)
  }

  // Extract from description: string or Lexical richText (Products)
  const description = doc.description
  if (typeof description === 'string' && description.length > 0) {
    parts.push(description)
  } else if (typeof description === 'object' && (description as any)?.root) {
    const richText = description as any
    const allText: string[] = []
    const walkLexicalNodes = (children: any[]) => {
      for (const child of children) {
        if (child.text) {
          allText.push(child.text)
        }
        if (child.children) {
          walkLexicalNodes(child.children)
        }
      }
    }
    walkLexicalNodes(richText.root.children || [])
    if (allText.length > 0) {
      parts.push(allText.join(' '))
    }
  }

  // Extract from content: richText (Posts) or blocks (Pages)
  const content = doc.content
  if (typeof content === 'object' && (content as any)?.root) {
    // Lexical richText (Posts)
    const richText = content as any
    const allText: string[] = []
    const walkLexicalNodes = (children: any[]) => {
      for (const child of children) {
        if (child.text) {
          allText.push(child.text)
        }
        if (child.children) {
          walkLexicalNodes(child.children)
        }
      }
    }
    walkLexicalNodes(richText.root.children || [])
    if (allText.length > 0) {
      parts.push(allText.join(' '))
    }
  } else if (Array.isArray(content)) {
    // Blocks (Pages)
    for (const block of content) {
      if (block?.heading) parts.push(block.heading)
      if (block?.subheading) parts.push(block.subheading)
      if (block?.body) {
        if (typeof block.body === 'string') {
          parts.push(block.body)
        } else if (typeof block.body === 'object' && block.body?.root) {
          const allText: string[] = []
          const walkLexicalNodes = (children: any[]) => {
            for (const child of children) {
              if (child.text) allText.push(child.text)
              if (child.children) walkLexicalNodes(child.children)
            }
          }
          walkLexicalNodes(block.body.root.children || [])
          if (allText.length > 0) parts.push(allText.join(' '))
        }
      }
      // Extract from nested arrays (e.g., features, questions, items)
      if (block?.features) {
        for (const f of block.features) {
          if (f?.title) parts.push(f.title)
          if (f?.description) parts.push(f.description)
        }
      }
      if (block?.questions) {
        for (const q of block.questions) {
          if (q?.question) parts.push(q.question)
          if (q?.answer) parts.push(q.answer)
        }
      }
      if (block?.items) {
        for (const item of block.items) {
          if (item?.quote) parts.push(item.quote)
          if (item?.name) parts.push(item.name)
        }
      }
    }
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

export default buildConfig({
  // Secret for encrypting JWT tokens, API keys, and cookies
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-in-production',

  // ---------------------------------------------------------------------------
  // Admin Panel
  // ---------------------------------------------------------------------------
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
      importMapFile: path.resolve(dirname, 'app/(payload)/admin/importMap.js'),
    },
    meta: {
      titleSuffix: '— Shagya',
      icons: [{ url: '/favicon.ico' }],
    },
  },

  // ---------------------------------------------------------------------------
  // Rich Text Editor
  // ---------------------------------------------------------------------------
  editor: lexicalEditor({}),

  // ---------------------------------------------------------------------------
  // Collections — will be added phase by phase
  // ---------------------------------------------------------------------------
  collections: [
    Users,
    Products,
    Categories,
    Collections,
    Variants,
    Orders,
    Customers,
    Addresses,
    Coupons,
    Media,
    Pages,
    Reviews,
    Tags,
    Brands,
    FabricTypes,
    Occasions,
    EventLogs,
    Wishlist,
    Posts,
  ],

  // ---------------------------------------------------------------------------
  // Globals
  // ---------------------------------------------------------------------------
  globals: [SiteSettings],

  // ---------------------------------------------------------------------------
  // Database — PostgreSQL 18 via Neon
  // ---------------------------------------------------------------------------
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    // Enable schema push in dev, migrations in production
    push: process.env.NODE_ENV !== 'production',
  }),

  // ---------------------------------------------------------------------------
  // Plugins
  // ---------------------------------------------------------------------------
  plugins: [
    searchPlugin({
      collections: ['products', 'pages', 'posts'],
      syncDrafts: false,
      beforeSync: ({ originalDoc, searchDoc }) => {
        const extraText = extractSearchText(originalDoc)
        if (extraText) {
          return {
            ...searchDoc,
            title: [searchDoc.title, extraText].filter(Boolean).join(' '),
          }
        }
        return searchDoc
      },
    }),
    seoPlugin({
      collections: ['products', 'pages', 'posts'],
      uploadsCollection: 'media',
      generateTitle,
      generateDescription,
    }),
    s3Storage({
      collections: {
        media: true,
      },
      bucket: process.env.R2_BUCKET || 'shagya-media',
      config: {
        endpoint: process.env.R2_ENDPOINT || '',
        credentials: {
          accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
        },
        region: process.env.R2_REGION || 'auto',
        forcePathStyle: true,
      },
    }),
  ],

  // ---------------------------------------------------------------------------
  // TypeScript — auto-generate types from schema
  // ---------------------------------------------------------------------------
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },

  // ---------------------------------------------------------------------------
  // Server
  // ---------------------------------------------------------------------------
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',

  localization: {
    locales: ['en'],
    defaultLocale: 'en',
    fallback: true,
  },

  // ---------------------------------------------------------------------------
  // CORS — allow Next.js frontend and admin
  // ---------------------------------------------------------------------------
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'].filter(
    Boolean,
  ),

  // ---------------------------------------------------------------------------
  // CSRF — protect admin routes
  // ---------------------------------------------------------------------------
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'].filter(
    Boolean,
  ),

  // ---------------------------------------------------------------------------
  // Image Processing
  // ---------------------------------------------------------------------------
  sharp,
})
