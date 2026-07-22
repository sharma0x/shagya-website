import { getPayload } from 'payload'
import config from '@payload-config'

const CITY_SAMPLES: Record<string, string> = {
  1: 'Varanasi',
  2: 'Kanchipuram',
  3: 'Varanasi',
  4: 'Bhagalpur',
  5: 'Kanchipuram, Tamil Nadu',
  6: 'Varanasi, Uttar Pradesh',
  7: 'Bhagalpur',
  8: 'Kanchipuram',
}

async function main() {
  const payload = await getPayload({ config })

  const { docs: products } = await payload.find({
    collection: 'products',
    where: { status: { equals: 'published' } },
    limit: 20,
    pagination: false,
  })

  console.log(`Found ${products.length} published products.\n`)

  for (const p of products as any[]) {
    const city = CITY_SAMPLES[(p.id as number) % 8 + 1] || null
    if (!city) continue

    await payload.update({
      collection: 'products',
      id: p.id,
      data: { cityOfOrigin: city },
    })

    console.log(`  Updated product #${p.id}: ${p.name} → cityOfOrigin: "${city}"`)
  }

  console.log(`\nDone! Updated ${products.length} products.`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
