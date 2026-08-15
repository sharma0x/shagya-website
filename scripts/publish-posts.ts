import { getPayload } from 'payload'
import config from '@payload-config'

async function main() {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'posts',
    limit: 100,
    overrideAccess: true,
  })

  console.log(`Found ${docs.length} posts`)

  for (const post of docs) {
    const updated = await payload.update({
      collection: 'posts',
      id: post.id,
      data: { _status: 'published' },
      overrideAccess: true,
    })
    console.log(
      `  published #${post.id}: ${(post as any).title} (_status: ${(updated as any)._status})`,
    )
  }
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
