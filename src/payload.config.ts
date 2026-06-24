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
import { Users } from './collections/Users'
import { Products } from './collections/Products'
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
