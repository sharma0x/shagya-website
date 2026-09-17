// =============================================================================
// Shayga — Sync Local Media Files to R2 (Direct S3 Upload)
// =============================================================================
// Uploads local images and their size variants directly to the configured
// S3-compatible storage (R2) using the AWS SDK. This preserves existing DB
// media records and all their relationships.
//
// Usage:
//   set -a && source .env.preview && set +a && node --import tsx/esm scripts/sync-media-to-r2.ts
//
// Requires env vars: DATABASE_URL, PAYLOAD_SECRET, R2_ENDPOINT,
//   R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_REGION
// =============================================================================

import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

// Image size configs matching Media.ts collection config
const IMAGE_SIZES = [
  { name: 'thumbnail', width: 400, height: 500 },
  { name: 'card', width: 600, height: 750 },
  { name: 'product', width: 1200, height: 1500 },
  { name: 'hero', width: 2000, height: 1000 },
]

const SRC_DIRS = [
  path.join(process.cwd(), 'public/images/products'),
  path.join(process.cwd(), 'public/images/blogs'),
  path.join(process.cwd(), 'public/images/hero'),
  path.join(process.cwd(), 'public/images/avatars'),
]

function getS3Client(): S3Client {
  return new S3Client({
    endpoint: process.env.R2_ENDPOINT || '',
    region: process.env.R2_REGION || 'auto',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: true,
  })
}

async function fileExists(
  s3: S3Client,
  bucket: string,
  key: string,
): Promise<boolean> {
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
    return true
  } catch {
    return false
  }
}

async function uploadFile(
  s3: S3Client,
  bucket: string,
  key: string,
  buffer: Buffer,
  contentType: string,
) {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  )
}

function filenameVariant(
  filename: string,
  width: number,
  height: number,
): string {
  const ext = path.extname(filename)
  const base = path.basename(filename, ext)
  return `${base}-${width}x${height}${ext}`
}

async function processFile(
  s3: S3Client,
  bucket: string,
  filePath: string,
  filename: string,
): Promise<{ uploaded: number; skipped: number }> {
  let uploaded = 0
  let skipped = 0

  const bucketKey = filename
  if (await fileExists(s3, bucket, bucketKey)) {
    skipped++
  } else {
    const buffer = fs.readFileSync(filePath)
    await uploadFile(s3, bucket, bucketKey, buffer, 'image/jpeg')
    console.log(`  ✅ ${filename}`)
    uploaded++
  }

  // Upload sized variants
  const originalBuffer = fs.readFileSync(filePath)
  for (const size of IMAGE_SIZES) {
    const variantName = filenameVariant(filename, size.width, size.height)
    const variantKey = variantName

    if (await fileExists(s3, bucket, variantKey)) {
      skipped++
      continue
    }

    try {
      const resized = await sharp(originalBuffer)
        .resize(size.width, size.height, { fit: 'cover', position: 'centre' })
        .jpeg({ quality: 85 })
        .toBuffer()

      await uploadFile(s3, bucket, variantKey, resized, 'image/jpeg')
      console.log(`  ✅ ${variantName}`)
      uploaded++
    } catch (err) {
      console.error(`  ❌ ${variantName} — resize failed:`, err)
    }
  }

  return { uploaded, skipped }
}

async function main() {
  const startTime = Date.now()
  console.log('🔄 Shayga — Direct Media Sync to R2')
  console.log('══════════════════════════════════════\n')

  if (
    !process.env.R2_ENDPOINT ||
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY
  ) {
    console.error('❌ R2 environment variables are not set.')
    process.exit(1)
  }

  const bucket = process.env.R2_BUCKET || 'shayga-dev'
  const s3 = getS3Client()
  let totalUploaded = 0
  let totalSkipped = 0

  // Collect all local files
  const localFiles: { filePath: string; filename: string }[] = []
  for (const dir of SRC_DIRS) {
    if (!fs.existsSync(dir)) continue
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isFile()) continue
      const ext = path.extname(entry.name).toLowerCase()
      if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
        localFiles.push({
          filePath: path.join(dir, entry.name),
          filename: entry.name,
        })
      }
    }
  }

  console.log(`📂 Found ${localFiles.length} local image files\n`)

  for (const { filePath, filename } of localFiles) {
    const { uploaded, skipped } = await processFile(
      s3,
      bucket,
      filePath,
      filename,
    )
    totalUploaded += uploaded
    totalSkipped += skipped
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)
  console.log(
    `\n📊 Results: ${totalUploaded} uploaded, ${totalSkipped} skipped (already exist) — ${elapsed}s`,
  )
  console.log(
    '\n✅ Sync complete. Refresh the preview deployment to see images.',
  )
}

main().catch((err) => {
  console.error('\n❌ Sync failed:', err)
  process.exit(1)
})
