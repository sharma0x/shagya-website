// =============================================================================
// Shagya — Database Seed Script (Dev Data)
// =============================================================================
// Usage: pnpm seed
// Requires: Docker services running (make infra-up)
// =============================================================================

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Payload } from 'payload'
import {
  adminUser,
  categories,
  collections,
  products,
  pages,
  siteSettingsData,
} from './seed-data'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a minimal valid Lexical rich text node for a given plain text.
 */
function lexicalRichText(text: string): Record<string, unknown> {
  return {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children: [
        {
          type: 'paragraph',
          format: '',
          indent: 0,
          version: 1,
          children: [
            {
              mode: 'normal',
              text,
              type: 'text',
              style: '',
              detail: 0,
              format: 0,
              version: 1,
            },
          ],
          direction: 'ltr',
          textStyle: '',
          textFormat: 0,
        },
      ],
    },
  }
}

/**
 * Creates a hero block for Pages content.
 */
function heroBlock(
  heading: string,
  subheading?: string,
): Record<string, unknown> {
  const block: Record<string, unknown> = {
    blockType: 'hero',
    heading,
  }
  if (subheading) {
    block.subheading = subheading
  }
  return block
}

// ---------------------------------------------------------------------------
// Seed Functions
// ---------------------------------------------------------------------------

export async function seedAdmin(payload: Payload): Promise<void> {
  console.log('👤 Seeding admin user...')

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: adminUser.email } },
    overrideAccess: true,
  })

  if (existing.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: adminUser,
      overrideAccess: true,
    })
    console.log(`  ✅ Admin user created: ${adminUser.email}`)
  } else {
    console.log(`  ⏭️  Admin user already exists: ${adminUser.email}`)
  }
}

export async function seedCategories(payload: Payload): Promise<void> {
  console.log(`\n📁 Seeding ${categories.length} categories...`)

  for (const cat of categories) {
    const existing = await payload.find({
      collection: 'categories',
      where: { name: { equals: cat.name } },
      overrideAccess: true,
    })

    if (existing.totalDocs === 0) {
      await payload.create({
        collection: 'categories',
        data: cat,
        overrideAccess: true,
      })
      console.log(`  ✅ Created category: ${cat.name}`)
    } else {
      console.log(`  ⏭️  Category already exists: ${cat.name}`)
    }
  }
}

export async function seedCollections(payload: Payload): Promise<void> {
  console.log(`\n🗂️  Seeding ${collections.length} collections...`)

  for (const col of collections) {
    const existing = await payload.find({
      collection: 'collections',
      where: { name: { equals: col.name } },
      overrideAccess: true,
    })

    if (existing.totalDocs === 0) {
      await payload.create({
        collection: 'collections',
        data: col,
        overrideAccess: true,
      })
      console.log(`  ✅ Created collection: ${col.name}`)
    } else {
      console.log(`  ⏭️  Collection already exists: ${col.name}`)
    }
  }
}

export async function seedProducts(payload: Payload): Promise<void> {
  console.log(`\n👗 Seeding ${products.length} products...`)

  for (const prod of products) {
    const { description, ...rest } = prod
    const existing = await (payload.find as any)({
      collection: 'products',
      where: { name: { equals: prod.name } },
      overrideAccess: true,
    })

    if (existing.totalDocs === 0) {
      await (payload.create as any)({
        collection: 'products',
        data: {
          ...rest,
          description: lexicalRichText(description),
          length: 5.5,
          trackQuantity: false,
        },
        overrideAccess: true,
      })
      console.log(`  ✅ Created product: ${prod.name}`)
    } else {
      console.log(`  ⏭️  Product already exists: ${prod.name}`)
    }
  }
}

export async function seedPages(payload: Payload): Promise<void> {
  console.log(`\n📄 Seeding ${pages.length} pages...`)

  for (const page of pages) {
    const existing = await (payload.find as any)({
      collection: 'pages',
      where: { title: { equals: page.title } },
      overrideAccess: true,
    })

    if (existing.totalDocs === 0) {
      await (payload.create as any)({
        collection: 'pages',
        data: {
          title: page.title,
          status: page.status,
          template: page.template,
          content: [
            heroBlock(
              page.title === 'Home' ? 'Welcome to Shagya' : page.title,
              page.title === 'Home'
                ? 'Discover timeless Indian sarees, handcrafted with love.'
                : undefined,
            ),
          ],
          metaTitle: `${page.title} — Shagya`,
          metaDescription:
            page.title === 'Home'
              ? 'Shagya — Timeless Indian sarees crafted with love. Explore our curated collection of handloom, silk, and designer sarees.'
              : `${page.title} page for Shagya, your destination for exquisite Indian sarees.`,
        },
        overrideAccess: true,
      })
      console.log(`  ✅ Created page: ${page.title}`)
    } else {
      console.log(`  ⏭️  Page already exists: ${page.title}`)
    }
  }
}

export async function seedSiteSettings(payload: Payload): Promise<void> {
  console.log('\n⚙️  Updating site settings...')

  const existing = await (payload.findGlobal as any)({
    slug: 'site-settings',
    overrideAccess: true,
  })

  await (payload.updateGlobal as any)({
    slug: 'site-settings',
    data: {
      ...(existing as Record<string, unknown>),
      ...siteSettingsData,
    },
    overrideAccess: true,
  })

  console.log('  ✅ Site settings updated')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const startTime = Date.now()

  console.log('🌱 Shagya Database Seed')
  console.log('══════════════════════════\n')

  // Check environment
  if (!process.env.DATABASE_URL) {
    console.error(
      '❌ DATABASE_URL is not set. Make sure Docker services are running:\n' +
        '   make infra-up\n' +
        '   Then run: pnpm seed\n',
    )
    process.exit(1)
  }

  const payload = await getPayload({ config })

  try {
    await seedAdmin(payload)
    await seedCategories(payload)
    await seedCollections(payload)
    await seedProducts(payload)
    await seedPages(payload)
    await seedSiteSettings(payload)

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`\n🎉 Seed complete! (${elapsed}s)`)
  } catch (error) {
    console.error('\n❌ Seed failed:', error)
    process.exit(1)
  } finally {
    process.exit(0)
  }
}

// Only run main when executed directly (not imported for testing)
const isDirectRun =
  process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed')
if (isDirectRun) {
  main()
}
