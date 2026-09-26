// =============================================================================
// Shayga — Create/Update the Home page hero (dev helper)
// =============================================================================
// Usage: node --env-file=.env --import tsx/esm scripts/create-home-hero.ts
// Requires: Docker services running (make infra-up) + dev server config (.env)
//
// Uploads the local hero images into the Media collection (if missing) and
// upserts the Page with slug 'home' containing a published hero block that
// references those images. This mirrors the hero config in scripts/seed-data.ts.
// =============================================================================

import { getPayload } from 'payload'
import config from '@payload-config'
import type { Page } from '../src/payload-types'
import type { Payload } from 'payload'
import fs from 'fs'
import path from 'path'

const HERO_SLIDES = [
  { path: 'images/hero/hero-1.jpg', alt: 'Shayga hero slide one' },
  { path: 'images/hero/hero-2.jpg', alt: 'Shayga hero slide two' },
]
const HERO_BACKGROUND = {
  path: 'images/hero/hero-main.jpg',
  alt: 'Shayga hero background',
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
    console.warn(`  ⚠️ Image file not found: ${fullPath}`)
    return null
  }

  const filename = path.basename(imagePath)
  const fileData = fs.readFileSync(fullPath)
  const fileSize = fs.statSync(fullPath).size

  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    const existingDoc = existing.docs[0] as any
    if (existingDoc.filesize === fileSize) {
      console.log(
        `  ⏭️  Media already exists: ${filename} (id ${existingDoc.id})`,
      )
      return existingDoc.id as number
    }
    console.log(`  🔄 File changed for ${filename}, re-uploading...`)
    try {
      await payload.delete({
        collection: 'media',
        id: existingDoc.id,
        overrideAccess: true,
      })
    } catch {
      // ignore delete errors
    }
  }

  try {
    const mediaDoc = await payload.create({
      collection: 'media',
      data: { alt: altText },
      file: {
        data: fileData,
        name: filename,
        mimetype: getMimeType(filename),
        size: fileSize,
      },
      overrideAccess: true,
    })
    console.log(`  ✅ Uploaded media: ${filename} (id ${mediaDoc.id})`)
    return mediaDoc.id as any
  } catch (err) {
    console.error(`  ❌ Failed to upload media ${filename}:`, err)
    return null
  }
}

async function main(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.error(
      '❌ DATABASE_URL is not set. Make sure Docker services are running:\n' +
        '   make infra-up\n',
    )
    process.exit(1)
  }

  console.log('🌱 Creating Home page hero')
  console.log('════════════════════════════\n')

  const payload = await getPayload({ config })

  const slideIds: number[] = []
  for (const slide of HERO_SLIDES) {
    const id = await uploadMedia(payload, slide.path, slide.alt)
    if (id) slideIds.push(id)
  }
  const backgroundId = await uploadMedia(
    payload,
    HERO_BACKGROUND.path,
    HERO_BACKGROUND.alt,
  )

  const heroBlock: NonNullable<Page['content']>[number] = {
    blockType: 'hero',
    heading: 'Shayga — Handwoven narratives from Varanasi',
    subheading:
      'Discover the heritage of Indian handloom. Each saree is a testament to centuries of artisanal weaving.',
    ...(slideIds.length > 0
      ? { images: slideIds.map((image) => ({ image, link: '/category/all' })) }
      : {}),
    ...(backgroundId ? { backgroundImage: backgroundId } : {}),
    ctaText: 'Shop the collection',
    ctaLink: '/category/all',
  }

  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'home' } },
    limit: 1,
    overrideAccess: true,
  })

  let pageId: number | string
  if (existing.totalDocs === 0) {
    const doc = await payload.create({
      collection: 'pages',
      data: {
        title: 'Home',
        slug: 'home',
        status: 'published',
        template: 'default',
        _status: 'published',
        content: [heroBlock],
        metaTitle: 'Home — Shayga',
        metaDescription:
          "Discover India's finest handloom traditions — from Banarasi to Kanchipuram.",
      },
      overrideAccess: true,
    })
    pageId = doc.id
    console.log(`  ✅ Created page: Home (/${doc.slug}, id ${doc.id})`)
  } else {
    const doc = existing.docs[0]
    const updateData: Record<string, unknown> = {
      content: [heroBlock],
      status: 'published',
      _status: 'published',
      template: doc.template ?? 'default',
    }
    await payload.update({
      collection: 'pages',
      id: doc.id,
      data: updateData,
      overrideAccess: true,
    })
    pageId = doc.id
    console.log(`  ✅ Updated page: Home (/${doc.slug}, id ${doc.id})`)
  }

  console.log(
    `\n🎉 Done! Home page id ${pageId} with ${slideIds.length} hero slides.`,
  )
  process.exit(0)
}

main()
