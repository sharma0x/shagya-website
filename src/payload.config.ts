// =============================================================================
// Shayga — Payload CMS Configuration
// =============================================================================
// This is the central configuration file for the entire backend.
// All collections, globals, plugins, and admin settings live here.
// =============================================================================

import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { resendAdapter } from '@payloadcms/email-resend'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'
import { s3Storage } from '@payloadcms/storage-s3'
import { searchPlugin } from '@payloadcms/plugin-search'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import nodemailer from 'nodemailer'
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
import { Carts } from './collections/Carts'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Reviews } from './collections/Reviews'
import { Tags } from './collections/Tags'
import { Brands } from './collections/Brands'
import { FabricTypes } from './collections/FabricTypes'
import { Occasions } from './collections/Occasions'
import { Wishlist } from './collections/Wishlist'
import { Navigation } from './collections/Navigation'
import { Forms } from './collections/Forms'
import { FormSubmissions } from './collections/FormSubmissions'
import { SiteSettings } from './globals/SiteSettings'
import { EmailTemplates } from './collections/EmailTemplates'
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

// ---------------------------------------------------------------------------
// Email adapter — Mailpit (dev) or Resend (prod/staging)
// Switch is driven by MAILPIT_SMTP_HOST: present → Mailpit, absent → Resend.
// ---------------------------------------------------------------------------
const FROM_NAME = process.env.EMAIL_FROM_NAME || 'Shayga'
const FROM_ADDRESS = process.env.EMAIL_FROM_ADDRESS || 'noreply@shayga.in'

const emailAdapter = process.env.MAILPIT_SMTP_HOST
  ? nodemailerAdapter({
      defaultFromName: FROM_NAME,
      defaultFromAddress: FROM_ADDRESS,
      transport: nodemailer.createTransport({
        host: process.env.MAILPIT_SMTP_HOST,
        port: Number(process.env.MAILPIT_SMTP_PORT || 1025),
        secure: false,
        ignoreTLS: true,
      }),
    })
  : resendAdapter({
      defaultFromName: FROM_NAME,
      defaultFromAddress: FROM_ADDRESS,
      apiKey: process.env.RESEND_API_KEY || '',
    })

export default buildConfig({
  // Secret for encrypting JWT tokens, API keys, and cookies
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-in-production',

  // ---------------------------------------------------------------------------
  // Email
  // ---------------------------------------------------------------------------
  email: emailAdapter,

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
      titleSuffix: '— Shayga',
      icons: [{ url: '/favicon.ico' }],
    },
    livePreview: {
      url: ({ data, collectionConfig, globalConfig, req }) => {
        let base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

        if (req && typeof req === 'object' && 'headers' in req) {
          const headers = req.headers as any
          const host =
            typeof headers.get === 'function'
              ? headers.get('host')
              : headers.host
          if (host) {
            const protocol = host.includes('localhost') ? 'http' : 'https'
            base = `${protocol}://${host}`
          }
        }

        if (collectionConfig?.slug === 'pages' && data) {
          return `${base}/${data.slug}?preview=true&id=${data.id}`
        }
        if (collectionConfig?.slug === 'posts' && data) {
          return `${base}/blog/${data.slug}?preview=true&id=${data.id}`
        }
        if (collectionConfig?.slug === 'products' && data) {
          return `${base}/products/${data.slug}?preview=true&id=${data.id}`
        }
        if (globalConfig?.slug === 'site-settings') {
          return `${base}/?preview=true&id=site-settings`
        }
        return undefined
      },
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
      collections: ['pages', 'posts', 'products'],
      globals: ['site-settings'],
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
    EmailTemplates,
    Products,
    Categories,
    Collections,
    Variants,
    Orders,
    Customers,
    Addresses,
    Carts,
    Coupons,
    Media,
    Pages,
    Reviews,
    Tags,
    Brands,
    FabricTypes,
    Occasions,
    EventLogs,
    Navigation,
    Wishlist,
    Posts,
    Forms,
    FormSubmissions,
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
    // Disabled automatic schema push to prevent conflict/deletion of Better Auth tables in development
    push: false,
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
      bucket: process.env.R2_BUCKET || 'shayga-media',
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
  serverURL: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',

  localization: {
    locales: ['en'],
    defaultLocale: 'en',
    fallback: true,
  },

  // ---------------------------------------------------------------------------
  // CORS — allow Next.js frontend and admin
  // ---------------------------------------------------------------------------
  cors: [
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
    'https://shagya-website-sharma0x-4079-clow-work.vercel.app',
    'https://shagya-website.vercel.app',
    'https://shagya-website-clow-work.vercel.app',
  ].filter(Boolean),

  // ---------------------------------------------------------------------------
  // CSRF — protect admin routes
  // ---------------------------------------------------------------------------
  csrf: [
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
    'https://shagya-website-sharma0x-4079-clow-work.vercel.app',
    'https://shagya-website.vercel.app',
    'https://shagya-website-clow-work.vercel.app',
  ].filter(Boolean),

  // ---------------------------------------------------------------------------
  // Image Processing
  // ---------------------------------------------------------------------------
  sharp,
})
