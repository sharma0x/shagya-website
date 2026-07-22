import { getPayload } from 'payload'
import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'

const CITY_POOL = [
  'Varanasi',
  'Kanchipuram',
  'Bhagalpur',
  'Varanasi, Uttar Pradesh',
  'Kanchipuram, Tamil Nadu',
]

async function main() {
  const payload = await getPayload({ config })
  const db = (payload.db as any).drizzle ?? (payload.db as any).pool

  // Use direct SQL to bypass Payload's versioning (avoid migration table gaps)
  const { rows } = await (payload.db as any).execute?.({ raw: sql`SELECT id, name FROM products WHERE status = 'published'` })
    ?? await db.query(sql`SELECT id, name FROM products WHERE status = 'published'`)

  const products = (Array.isArray(rows) ? rows : rows?.rows ?? []) as { id: number; name: string }[]
  console.log(`Found ${products.length} published products.\n`)

  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const city = CITY_POOL[i % CITY_POOL.length]

    try {
      await (payload.db as any).execute?.({ raw: sql`UPDATE products SET city_of_origin = ${city}, updated_at = NOW() WHERE id = ${p.id}` })
        ?? await db.run(sql`UPDATE products SET city_of_origin = ${city}, updated_at = NOW() WHERE id = ${p.id}`)
      console.log(`  Updated product #${p.id}: ${p.name.substring(0, 50)} → "${city}"`)
    } catch (e: any) {
      console.error(`  Failed product #${p.id}:`, e.message)
    }
  }

  console.log(`\nDone! Updated ${products.length} products.`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
