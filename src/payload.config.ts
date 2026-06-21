// =============================================================================
// Shagya — Payload CMS Configuration
// =============================================================================
// This is the central configuration file for the entire backend.
// All collections, globals, plugins, and admin settings live here.
// =============================================================================

import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder'
import { Users } from './collections/Users'
import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  // Secret for encrypting JWT tokens, API keys, and cookies
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-in-production',

  // ---------------------------------------------------------------------------
  // Admin Panel
  // ---------------------------------------------------------------------------
  admin: {
    // Admin users are managed through the standard Payload Users collection
    user: 'users',
    meta: {
      titleSuffix: '— Shagya',
      icons: [{ url: '/favicon.ico' }],
    },
    components: {
      // Custom admin branding will go here (Phase 2)
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
    // Products collection (Phase 2)
    // Media collection (Phase 2)
    // Categories, Orders, etc. (Phase 2+)
  ],

  // ---------------------------------------------------------------------------
  // Globals
  // ---------------------------------------------------------------------------
  globals: [
    // Site Settings (Phase 2)
  ],

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

    // SEO plugin — auto-generates meta fields for specified collections
    seoPlugin({
      collections: [],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `Shagya — ${doc?.title || 'Saree Store'}`,
      generateDescription: ({ doc }) =>
        (doc as Record<string, unknown>)?.excerpt as string ||
        'Shop handcrafted Indian sarees at Shagya. Premium silk, cotton, and designer sarees with free shipping in India.',
    }),

    // Form Builder — contact forms, inquiry forms, newsletter signup
    formBuilderPlugin({
      fields: {
        // Custom field overrides can be added here
      },
      formOverrides: {
        // Admin UI label for forms
        admin: {
          group: 'Content',
        },
      },
    }),
  ],

  // ---------------------------------------------------------------------------
  // TypeScript — auto-generate types from schema
  // ---------------------------------------------------------------------------
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },

  // ---------------------------------------------------------------------------
  // Server
  // ---------------------------------------------------------------------------
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',

  // ---------------------------------------------------------------------------
  // CORS — allow Next.js frontend and admin
  // ---------------------------------------------------------------------------
  cors: [
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ].filter(Boolean),

  // ---------------------------------------------------------------------------
  // CSRF — protect admin routes
  // ---------------------------------------------------------------------------
  csrf: [
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  ].filter(Boolean),

  // ---------------------------------------------------------------------------
  // Image Processing
  // ---------------------------------------------------------------------------
  sharp,
})
