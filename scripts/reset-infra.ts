// =============================================================================
// Shayga — Database and S3 Bucket Reset Script
// =============================================================================
// Drops and recreates the public schema in the database, and deletes all
// objects in the S3-compatible storage (MinIO / Cloudflare R2).
//
// Requires env vars: DATABASE_URL, R2_ENDPOINT, R2_ACCESS_KEY_ID,
//   R2_SECRET_ACCESS_KEY, R2_BUCKET, R2_REGION
// =============================================================================

import pg from 'pg'
import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3'

const { Client } = pg

async function resetDatabase() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not defined.')
  }

  console.log('⚡ Connecting to database...')
  const client = new Client({
    connectionString,
    ssl: connectionString.includes('neon.tech')
      ? { rejectUnauthorized: false }
      : false,
  })

  await client.connect()
  console.log('🔥 Nuking database schema (dropping public schema)...')
  await client.query('DROP SCHEMA public CASCADE;')
  await client.query('CREATE SCHEMA public;')
  await client.query('GRANT ALL ON SCHEMA public TO public;')
  await client.end()
  console.log('✅ Database reset complete!')
}

async function resetBucket() {
  const endpoint = process.env.R2_ENDPOINT
  const bucket = process.env.R2_BUCKET

  if (!endpoint || !bucket) {
    throw new Error(
      'R2_ENDPOINT and R2_BUCKET environment variables must be defined.',
    )
  }

  console.log('⚡ Connecting to S3/R2 storage...')
  const s3 = new S3Client({
    endpoint,
    region: process.env.R2_REGION || 'auto',
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
    forcePathStyle: true,
  })

  console.log(`🔥 Listing and deleting all objects in bucket "${bucket}"...`)
  let isTruncated = true
  let continuationToken: string | undefined = undefined
  let totalDeleted = 0

  while (isTruncated) {
    const listResponse = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        ContinuationToken: continuationToken,
      }),
    )

    const objects = listResponse.Contents || []
    if (objects.length > 0) {
      console.log(`🗑️  Deleting ${objects.length} objects...`)
      await s3.send(
        new DeleteObjectsCommand({
          Bucket: bucket,
          Delete: {
            Objects: objects.map((o) => ({ Key: o.Key })),
          },
        }),
      )
      totalDeleted += objects.length
    }

    isTruncated = listResponse.IsTruncated || false
    continuationToken = listResponse.NextContinuationToken
  }

  console.log(
    `✅ Storage bucket reset complete! (Deleted ${totalDeleted} files)`,
  )
}

async function main() {
  try {
    await resetDatabase()
    console.log('')
    await resetBucket()
    console.log('\n✨ Reset completed successfully.')
    process.exit(0)
  } catch (error) {
    console.error('\n❌ Reset failed:', error)
    process.exit(1)
  }
}

main()
