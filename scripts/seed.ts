// =============================================================================
// SHAYGA - The Saree Studio — Database Seed Script (Dev Data)
// =============================================================================
// Usage: pnpm seed
// Requires: Docker services running (make infra-up)
// =============================================================================

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Payload } from 'payload'
import fs from 'fs'
import path from 'path'
import {
  adminUser,
  categories,
  collections,
  tags,
  brands,
  products,
  pages,
  blogPosts,
  navigations,
  instagramPosts,
  siteSettingsData,
  type SeedBlock,
} from './seed-data'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a valid Lexical rich text node. Splits on double newlines to
 * produce multiple paragraph children.
 */
function lexicalRichText(text: string): Record<string, unknown> {
  const paragraphs = text.split('\n\n').filter((p) => p.trim().length > 0)
  const children = paragraphs.map((para) => ({
    type: 'paragraph',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    textStyle: '',
    textFormat: 0,
    children: [
      {
        mode: 'normal',
        text: para.trim(),
        type: 'text',
        style: '',
        detail: 0,
        format: 0,
        version: 1,
      },
    ],
  }))
  if (children.length === 0) {
    children.push({
      type: 'paragraph',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      textStyle: '',
      textFormat: 0,
      children: [
        {
          mode: 'normal',
          text: '',
          type: 'text',
          style: '',
          detail: 0,
          format: 0,
          version: 1,
        },
      ],
    })
  }
  return {
    root: {
      type: 'root',
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
      children,
    },
  }
}

/**
 * Converts a SeedBlock (plain-text bodies) to the Payload block format,
 * wrapping textImage body strings in Lexical rich text.
 */
async function processBlock(
  payload: Payload,
  block: SeedBlock,
): Promise<Record<string, unknown>> {
  if (block.blockType === 'textImage') {
    let imageId = null
    if (block.imagePath) {
      // Need a way to call uploadMedia, we can just call the existing uploadMedia function since it's defined later in the file, wait, uploadMedia is defined at line 216. We can hoist it or just use it. Let's assume it works since it's in the same file.
      imageId = await uploadMedia(payload, block.imagePath, block.heading)
    }
    return {
      blockType: 'textImage',
      heading: block.heading,
      body: lexicalRichText(block.body),
      imagePosition: block.imagePosition ?? 'left',
      ...(imageId ? { image: imageId } : {}),
    }
  }

  if (block.blockType === 'hero') {
    let backgroundImageId = null
    if (block.imagePath) {
      backgroundImageId = await uploadMedia(
        payload,
        block.imagePath,
        block.heading || 'Hero background',
      )
    }
    return {
      blockType: 'hero',
      heading: block.heading,
      subheading: block.subheading,
      ctaText: block.ctaText,
      ctaLink: block.ctaLink,
      ...(backgroundImageId ? { backgroundImage: backgroundImageId } : {}),
    }
  }

  return block as unknown as Record<string, unknown>
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
      const imageId = cat.imagePath
        ? await uploadMedia(payload, cat.imagePath, cat.name)
        : null
      await payload.create({
        collection: 'categories',
        data: { ...cat, image: imageId ?? undefined },
        overrideAccess: true,
      })
      console.log(`  ✅ Created category: ${cat.name}`)
    } else {
      const doc = existing.docs[0]
      if (!doc.image && cat.imagePath) {
        const imageId = await uploadMedia(payload, cat.imagePath, cat.name)
        if (imageId) {
          await payload.update({
            collection: 'categories',
            id: doc.id,
            data: { image: imageId },
            overrideAccess: true,
          })
          console.log(`  ✅ Updated image for category: ${cat.name}`)
        }
      } else {
        console.log(`  ⏭️  Category already exists: ${cat.name}`)
      }
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
      const imageId = col.imagePath
        ? await uploadMedia(payload, col.imagePath, col.name)
        : null
      await payload.create({
        collection: 'collections',
        data: {
          name: col.name,
          description: col.description,
          image: imageId ?? undefined,
        },
        overrideAccess: true,
      })
      console.log(`  ✅ Created collection: ${col.name}`)
    } else {
      const doc = existing.docs[0]
      if (!doc.image && col.imagePath) {
        const imageId = await uploadMedia(payload, col.imagePath, col.name)
        if (imageId) {
          await payload.update({
            collection: 'collections',
            id: doc.id,
            data: { image: imageId },
            overrideAccess: true,
          })
          console.log(`  ✅ Updated image for collection: ${col.name}`)
        }
      } else {
        console.log(`  ⏭️  Collection already exists: ${col.name}`)
      }
    }
  }
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const map: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  }
  return map[ext] || 'image/jpeg'
}

async function uploadMedia(
  payload: Payload,
  imagePath: string,
  altText: string,
): Promise<number | null> {
  const fullPath = path.join(process.cwd(), 'public', imagePath)
  if (!fs.existsSync(fullPath)) {
    console.warn(`    ⚠️ Image file not found: ${fullPath}`)
    return null
  }

  const filename = path.basename(imagePath)
  const fileData = fs.readFileSync(fullPath)
  const fileSize = fs.statSync(fullPath).size

  const existing = await payload.find({
    collection: 'media',
    where: {
      filename: { equals: filename },
    },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    const existingDoc = existing.docs[0] as any
    // If file sizes differ, re-upload (delete old, create new)
    if (existingDoc.filesize !== fileSize) {
      console.log(`    🔄 File changed for ${filename}, re-uploading...`)
      try {
        await payload.delete({
          collection: 'media',
          id: existingDoc.id,
          overrideAccess: true,
        })
      } catch {
        // ignore delete errors
      }
    } else {
      return existingDoc.id as number
    }
  }

  try {
    const mediaDoc = await payload.create({
      collection: 'media',
      data: {
        alt: altText,
      },
      file: {
        data: fileData,
        name: filename,
        mimetype: getMimeType(filename),
        size: fileSize,
      },
      overrideAccess: true,
    })
    return mediaDoc.id as any
  } catch (err) {
    console.error(`    ❌ Failed to upload media ${filename}:`, err)
    return null
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

    // Determine collections mapping
    const collectionSlugs: string[] = []
    const lowerName = prod.name.toLowerCase()
    if (
      lowerName.includes('banarasi') ||
      lowerName.includes('kanchipuram') ||
      lowerName.includes('patola') ||
      lowerName.includes('paithani')
    ) {
      collectionSlugs.push('bridal-edit', 'handloom-heritage')
    }
    if (
      lowerName.includes('cotton') ||
      lowerName.includes('chanderi') ||
      lowerName.includes('kota doria') ||
      lowerName.includes('khadi')
    ) {
      collectionSlugs.push('everyday-elegance', 'summer-collection')
    }
    if (
      lowerName.includes('bandhani') ||
      lowerName.includes('maheshwari') ||
      lowerName.includes('gota patti')
    ) {
      collectionSlugs.push('festive-special')
    }

    const collectionIds: string[] = []
    if (collectionSlugs.length > 0) {
      const foundCols = await payload.find({
        collection: 'collections',
        where: {
          slug: { in: collectionSlugs },
        },
        limit: 10,
        overrideAccess: true,
      })
      collectionIds.push(...foundCols.docs.map((c) => c.id as any))
    }

    if (existing.totalDocs === 0) {
      let gallery: any[] = []
      if (prod.imagePath) {
        const mediaId = await uploadMedia(payload, prod.imagePath, prod.name)
        if (mediaId) {
          gallery.push({ image: mediaId, alt: prod.name })
        }
      }
      if (prod.galleryImages && prod.galleryImages.length > 0) {
        for (let i = 0; i < prod.galleryImages.length; i++) {
          const mId = await uploadMedia(
            payload,
            prod.galleryImages[i],
            `${prod.name} ${i + 2}`,
          )
          if (mId) {
            gallery.push({ image: mId, alt: `${prod.name} view ${i + 2}` })
          }
        }
      }

      await (payload.create as any)({
        collection: 'products',
        data: {
          ...rest,
          gallery,
          collections: collectionIds,
          description: lexicalRichText(description),
          length: 5.5,
          gstPercent: 5,
          shippingPrice: 0,
        },
        overrideAccess: true,
      })
      console.log(`  ✅ Created product: ${prod.name}`)
    } else {
      const doc = existing.docs[0]
      const updateData: any = {}

      // Update gallery if missing or only has 1 image when more are requested
      if (
        !doc.gallery ||
        doc.gallery.length === 0 ||
        (prod.galleryImages &&
          doc.gallery.length < prod.galleryImages.length + 1)
      ) {
        let newGallery: any[] = []
        if (prod.imagePath) {
          const mediaId = await uploadMedia(payload, prod.imagePath, prod.name)
          if (mediaId) {
            newGallery.push({ image: mediaId, alt: prod.name })
          }
        }
        if (prod.galleryImages && prod.galleryImages.length > 0) {
          for (let i = 0; i < prod.galleryImages.length; i++) {
            const mId = await uploadMedia(
              payload,
              prod.galleryImages[i],
              `${prod.name} ${i + 2}`,
            )
            if (mId) {
              newGallery.push({ image: mId, alt: `${prod.name} view ${i + 2}` })
            }
          }
        }
        if (newGallery.length > 0) {
          updateData.gallery = newGallery
        }
      }

      // Update collections if missing or empty
      if (!doc.collections || doc.collections.length === 0) {
        updateData.collections = collectionIds
      }

      // Update color if missing (field was newly added)
      if (!(doc as any).color) {
        updateData.color = prod.color
      }

      if (Object.keys(updateData).length > 0) {
        await (payload.update as any)({
          collection: 'products',
          id: doc.id,
          data: updateData,
          overrideAccess: true,
        })
        console.log(`  ✅ Updated product fields for: ${prod.name}`)
      } else {
        console.log(`  ⏭️  Product already exists: ${prod.name}`)
      }
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

    const contentBlocks = await Promise.all(
      page.blocks.map((b) => processBlock(payload, b)),
    )

    if (existing.totalDocs === 0) {
      await (payload.create as any)({
        collection: 'pages',
        data: {
          title: page.title,
          slug: page.slug,
          status: page.status,
          template: page.template,
          content: contentBlocks,
          metaTitle: `${page.title} — SHAYGA - The Saree Studio`,
          metaDescription: page.heroSubheading,
        },
        overrideAccess: true,
      })
      console.log(`  ✅ Created page: ${page.title} (/${page.slug})`)
    } else {
      const doc = existing.docs[0]
      const updateData: Record<string, unknown> = { content: contentBlocks }

      if (doc.slug !== page.slug) {
        updateData.slug = page.slug
      }

      await (payload.update as any)({
        collection: 'pages',
        id: doc.id,
        data: updateData,
        overrideAccess: true,
      })

      const slugNote =
        doc.slug !== page.slug ? ` (slug: ${doc.slug} → ${page.slug})` : ''
      console.log(`  ✅ Updated content: ${page.title}${slugNote}`)
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

export async function seedTags(payload: Payload): Promise<void> {
  console.log(`\n🏷️  Seeding ${tags.length} tags...`)

  for (const tag of tags) {
    const existing = await (payload.find as any)({
      collection: 'tags',
      where: { name: { equals: tag.name } },
      overrideAccess: true,
    })

    if (existing.totalDocs === 0) {
      await (payload.create as any)({
        collection: 'tags',
        data: tag,
        overrideAccess: true,
      })
      console.log(`  ✅ Created tag: ${tag.name}`)
    } else {
      console.log(`  ⏭️  Tag already exists: ${tag.name}`)
    }
  }
}

export async function seedBrands(payload: Payload): Promise<void> {
  console.log(`\n🏢 Seeding ${brands.length} brands...`)

  for (const brand of brands) {
    const existing = await (payload.find as any)({
      collection: 'brands',
      where: { name: { equals: brand.name } },
      overrideAccess: true,
    })

    if (existing.totalDocs === 0) {
      await (payload.create as any)({
        collection: 'brands',
        data: brand,
        overrideAccess: true,
      })
      console.log(`  ✅ Created brand: ${brand.name}`)
    } else {
      console.log(`  ⏭️  Brand already exists: ${brand.name}`)
    }
  }
}

export async function seedInstagramPosts(payload: Payload): Promise<void> {
  console.log(`\n📸 Seeding ${instagramPosts.length} Instagram posts...`)

  for (const ig of instagramPosts) {
    const existing = await (payload.find as any)({
      collection: 'instagram-posts',
      where: { caption: { equals: ig.caption } },
      overrideAccess: true,
    })

    if (existing.totalDocs === 0) {
      const imageId = await uploadMedia(payload, ig.imagePath, ig.caption)
      await (payload.create as any)({
        collection: 'instagram-posts',
        data: {
          source: 'manual',
          image: imageId,
          caption: ig.caption,
          permalink: ig.permalink,
          mediaType: 'IMAGE',
          sortOrder: ig.sortOrder,
        },
        overrideAccess: true,
      })
      console.log(`  ✅ Created Instagram post: ${ig.caption.slice(0, 50)}…`)
    } else {
      console.log(
        `  ⏭️  Instagram post already exists: ${ig.caption.slice(0, 50)}…`,
      )
    }
  }
}

export async function seedBlogPosts(payload: Payload): Promise<void> {
  console.log(`\n📝 Seeding ${blogPosts.length} blog posts...`)

  // Get the admin user as the blog author
  const adminUsers = await payload.find({
    collection: 'users',
    where: { email: { equals: adminUser.email } },
    overrideAccess: true,
  })
  const authorId = adminUsers.docs[0]?.id

  for (const post of blogPosts) {
    const existing = await (payload.find as any)({
      collection: 'posts',
      where: { title: { equals: post.title } },
      overrideAccess: true,
    })

    if (existing.totalDocs === 0) {
      const featuredImageId = post.imagePath
        ? await uploadMedia(payload, post.imagePath, post.title)
        : null
      await (payload.create as any)({
        collection: 'posts',
        data: {
          title: post.title,
          status: post.status,
          excerpt: post.excerpt,
          author: authorId,
          content: lexicalRichText(post.body),
          publishedAt: new Date().toISOString(),
          featuredImage: featuredImageId ?? undefined,
        },
        overrideAccess: true,
      })
      console.log(`  ✅ Created blog post: ${post.title}`)
    } else {
      const doc = existing.docs[0]
      const featuredImageId = post.imagePath
        ? await uploadMedia(payload, post.imagePath, post.title)
        : null
      if (featuredImageId) {
        const oldImageId = doc.featuredImage
          ? typeof doc.featuredImage === 'object'
            ? (doc.featuredImage as any).id
            : doc.featuredImage
          : null
        if (oldImageId !== featuredImageId) {
          await (payload.update as any)({
            collection: 'posts',
            id: doc.id,
            data: { featuredImage: featuredImageId },
            overrideAccess: true,
          })
          console.log(`  ✅ Updated featured image for: ${post.title}`)
        }
      }
      console.log(`  ⏭️  Blog post already exists: ${post.title}`)
    }
  }
}

export async function seedNavigation(payload: Payload): Promise<void> {
  console.log(`\n🧭 Seeding ${navigations.length} navigation menus...`)

  for (const nav of navigations) {
    const existing = await (payload.find as any)({
      collection: 'navigation',
      where: { name: { equals: nav.name } },
      overrideAccess: true,
    })

    if (existing.totalDocs === 0) {
      await (payload.create as any)({
        collection: 'navigation',
        data: {
          name: nav.name,
          location: nav.location,
          items: nav.items.map((item) => ({
            label: item.label,
            type: item.type,
            url: item.url || '',
          })),
        },
        overrideAccess: true,
      })
      console.log(`  ✅ Created navigation: ${nav.name}`)
    } else {
      console.log(`  ⏭️  Navigation already exists: ${nav.name}`)
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const startTime = Date.now()

  console.log('🌱 SHAYGA - The Saree Studio Database Seed')
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

  if (!process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD) {
    console.error(
      '❌ Error: SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD environment variables are required and must be defined in your env file.\n',
    )
    process.exit(1)
  }

  const payload = await getPayload({ config })

  try {
    await seedAdmin(payload)
    await seedCategories(payload)
    await seedCollections(payload)
    await seedTags(payload)
    await seedBrands(payload)
    await seedInstagramPosts(payload)
    await seedProducts(payload)
    await seedPages(payload)
    await seedBlogPosts(payload)
    await seedNavigation(payload)
    await seedSiteSettings(payload)

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
    console.log(`\n🎉 Seed complete! (${elapsed}s)`)

    console.log('\n========================================')
    console.log('  Seed complete!')
    console.log('========================================')
    console.log(
      `  App:      ${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}`,
    )
    console.log(
      `  Admin:    ${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'}/admin`,
    )
    console.log(`  Email:    ${process.env.SEED_ADMIN_EMAIL}`)
    console.log(`  Password: ${process.env.SEED_ADMIN_PASSWORD}`)
    console.log('========================================\n')
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
