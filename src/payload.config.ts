// =============================================================================
// Shagya — Payload CMS Configuration
// =============================================================================
// This is the central configuration file for the entire backend.
// All collections, globals, plugins, and admin settings live here.
// =============================================================================

import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { Users } from './collections/Users'
import { Products } from './collections/Products'
import { Categories } from './collections/Categories'
import { Collections } from './collections/Collections'
import { Variants } from './collections/Variants'
import { Orders } from './collections/Orders'
import { Customers } from './collections/Customers'
import { Addresses } from './collections/Addresses'
import { Coupons } from './collections/Coupons'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Reviews } from './collections/Reviews'
import { Tags } from './collections/Tags'
import { Brands } from './collections/Brands'
import { FabricTypes } from './collections/FabricTypes'
import { Occasions } from './collections/Occasions'
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
  // File Storage — Cloudflare R2 (S3-compatible)
  // ---------------------------------------------------------------------------
  plugins: [
    seoPlugin({
      collections: ['products', 'pages'],
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
