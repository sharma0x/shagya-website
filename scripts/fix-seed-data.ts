/**
 * Fix seeded data:
 * 1. Copy gallery images from existing products (1, 3, 5) to new ones (24-36)
 * 2. Update variant colors to use palette values
 */
import { getPayload } from 'payload'
import config from '@payload-config'

const PALETTE_COLORS = [
  'red', 'blue', 'green', 'gold', 'pink', 'black', 'white', 'purple', 'orange', 'ivory',
  'maroon', 'burgundy', 'navy-blue', 'teal', 'yellow', 'beige', 'cream', 'turquoise',
  'mehendi', 'coral', 'peach', 'emerald', 'saffron', 'crimson', 'lavender',
]

const PRODUCT_IDS = [24, 25, 26, 27, 28, 29, 31, 32, 33, 34, 35, 36]
const SOURCE_PRODUCT_IDS = [1, 3, 5]

async function main() {
  const payload = await getPayload({ config })
  console.log('Connected to database.\n')

  // ─── Step 1: Build image pool from source products ────────
  const imagePool: any[] = []
  for (const sid of SOURCE_PRODUCT_IDS) {
    const src = await payload.findByID({ collection: 'products', id: sid, depth: 1 })
    const gallery = (src as any).gallery || []
    for (const g of gallery) {
      const mediaId = typeof g.image === 'object' ? g.image?.id : g.image
      if (mediaId && !imagePool.find((i) => i.id === mediaId)) {
        imagePool.push({ id: mediaId, url: g.image?.url || '' })
      }
    }
  }
  console.log(`Image pool: ${imagePool.length} unique media images from products ${SOURCE_PRODUCT_IDS.join(', ')}\n`)

  // ─── Step 2: Add gallery images to new products ──────────
  for (const pid of PRODUCT_IDS) {
    try {
      const prod = await payload.findByID({ collection: 'products', id: pid, depth: 0 })
      const existingGallery = (prod as any).gallery || []
      if (existingGallery.length > 0) {
        console.log(`  Product ${pid}: already has ${existingGallery.length} images — skipping`)
        continue
      }

      // Pick 3-4 random images from pool
      const count = 3 + Math.floor(Math.random() * 2) // 3 or 4
      const shuffled = [...imagePool].sort(() => Math.random() - 0.5)
      const selected = shuffled.slice(0, count).map((img) => ({
        image: img.id,
        alt: (prod as any).name || '',
      }))

      await payload.update({
        collection: 'products',
        id: pid,
        data: { gallery: selected } as any,
      })
      console.log(`  Product ${pid}: added ${count} images → ${(prod as any).name?.substring(0, 40)}`)
    } catch (e: any) {
      console.error(`  Product ${pid} FAILED:`, e.message)
    }
  }

  // ─── Step 3: Update variant colors to palette values ─────
  console.log('')
  for (const pid of PRODUCT_IDS) {
    try {
      const variants = await payload.find({
        collection: 'variants',
        where: { product: { equals: pid } },
        limit: 20,
        depth: 0,
      })

      for (const v of variants.docs as any[]) {
        const currentColor = (v.color || '').trim()
        // Skip if already a valid palette color
        if (PALETTE_COLORS.includes(currentColor.toLowerCase())) continue

        // Pick a random palette color
        const newColor = PALETTE_COLORS[Math.floor(Math.random() * PALETTE_COLORS.length)]
        await payload.update({
          collection: 'variants',
          id: v.id,
          data: { color: newColor } as any,
        })
        console.log(`  Variant ${v.id} (product ${pid}): "${currentColor}" → "${newColor}"`)
      }
    } catch (e: any) {
      console.error(`  Product ${pid} variants FAILED:`, e.message)
    }
  }

  console.log('\n✓ Fix complete!')
  process.exit(0)
}

main().catch((err) => {
  console.error('Fix failed:', err)
  process.exit(1)
})
