import { getPayload } from 'payload'
import config from '@payload-config'

async function main() {
  const payload = await getPayload({ config })
  console.log('Connected to database.')

  // ─── Create Categories ────────────────────────────────
  const categoryNames = ['Silk', 'Cotton', 'Banarasi', 'Wedding', 'Festive', 'Daily Wear']
  const categoryIds: Record<string, number> = {}
  for (const name of categoryNames) {
    const existing = await payload.find({ collection: 'categories', where: { name: { equals: name } }, limit: 1 })
    if (existing.docs.length > 0) {
      categoryIds[name] = existing.docs[0].id as number
      console.log(`  Category exists: ${name} (id: ${categoryIds[name]})`)
    } else {
      const cat = await payload.create({ collection: 'categories', data: { name } })
      categoryIds[name] = cat.id as number
      console.log(`  Category created: ${name} (id: ${cat.id})`)
    }
  }

  // ─── Create Products ──────────────────────────────────
  const products = [
    { name: 'Kadhwa Banarasi Silk Saree in Mehendi Green', fabric: 'silk', weave: 'banarasi', pattern: 'embroidered', color: 'green', basePrice: 5999, compareAtPrice: 8999, cityOfOrigin: 'Varanasi, Uttar Pradesh' },
    { name: 'Kanjipuram Temple Border Silk Saree', fabric: 'silk', weave: 'kanchipuram', pattern: 'embroidered', color: 'gold', basePrice: 12999, compareAtPrice: 16999, cityOfOrigin: 'Kanchipuram, Tamil Nadu' },
    { name: 'Bengal Tant Cotton Saree in Jamdani Weave', fabric: 'cotton', weave: 'tant', pattern: 'printed', color: 'white', basePrice: 2499, compareAtPrice: 3999, cityOfOrigin: 'Phulia, West Bengal' },
    { name: 'Bandhani Silk Saree from Bhuj', fabric: 'silk', weave: 'bandhani', pattern: 'printed', color: 'red', basePrice: 4599, compareAtPrice: 6999, cityOfOrigin: 'Bhuj, Gujarat' },
    { name: 'Chanderi Silk-Cotton with Gold Booti', fabric: 'blend', weave: 'chanderi', pattern: 'embellished', color: 'ivory', basePrice: 3499, compareAtPrice: 4999, cityOfOrigin: 'Chanderi, Madhya Pradesh' },
    { name: 'Patola Silk Double Ikat Saree', fabric: 'silk', weave: 'patola', pattern: 'printed', color: 'multicolor', basePrice: 8999, compareAtPrice: 12999, cityOfOrigin: 'Patan, Gujarat' },
    { name: 'Maheshwari Cotton Silk Saree with Zari', fabric: 'blend', weave: 'maheshwari', pattern: 'embroidered', color: 'pink', basePrice: 2999, compareAtPrice: 4499, cityOfOrigin: 'Maheshwar, Madhya Pradesh' },
    { name: 'Ikat Cotton Saree from Odisha', fabric: 'cotton', weave: 'ikkat', pattern: 'printed', color: 'blue', basePrice: 1999, basePriceOnly: true, cityOfOrigin: 'Bargarh, Odisha' },
    { name: 'Paithani Pure Silk Saree', fabric: 'silk', weave: 'paithani', pattern: 'embroidered', color: 'purple', basePrice: 7999, compareAtPrice: 10999, cityOfOrigin: 'Yeola, Maharashtra' },
    { name: 'Kalamkari Hand-Painted Cotton Saree', fabric: 'cotton', weave: 'kalamkari', pattern: 'painted', color: 'pink', basePrice: 2999, basePriceOnly: true, cityOfOrigin: 'Srikalahasti, Andhra Pradesh' },
    { name: 'Crepe Silk Embroidered Saree', fabric: 'crepe', weave: 'ikkat', pattern: 'embroidered', color: 'black', basePrice: 4999, compareAtPrice: 7499, cityOfOrigin: 'Jaipur, Rajasthan' },
    { name: 'Baluchari Silk Saree — Ramayana Motif', fabric: 'silk', weave: 'baluchari', pattern: 'embroidered', color: 'burgundy', basePrice: 15999, compareAtPrice: 21999, cityOfOrigin: 'Bishnupur, West Bengal' },
    { name: 'Tant Cotton Linen Saree from Bengal', fabric: 'cotton', weave: 'tant', pattern: 'solid', color: 'orange', basePrice: 1499, basePriceOnly: true, cityOfOrigin: 'Bolpur, West Bengal' },
    { name: 'Linen Silk Blend Chikankari Saree', fabric: 'blend', weave: 'ikkat', pattern: 'embroidered', color: 'white', basePrice: 3999, compareAtPrice: 5999, cityOfOrigin: 'Lucknow, Uttar Pradesh' },
    { name: 'Kanchi Silk Saree — Traditional Gold', fabric: 'silk', weave: 'kanchipuram', pattern: 'embroidered', color: 'burgundy', basePrice: 14999, compareAtPrice: 19999, cityOfOrigin: 'Kanchipuram, Tamil Nadu' },
  ]

  const productIds: number[] = []
  for (const p of products) {
    const existing = await payload.find({ collection: 'products', where: { name: { equals: p.name } }, limit: 1 })
    if (existing.docs.length > 0) {
      productIds.push(existing.docs[0].id as number)
      console.log(`  Product exists: ${p.name.substring(0, 40)} (id: ${existing.docs[0].id})`)
    } else {
      const data: any = {
        name: p.name,
        fabric: p.fabric,
        weave: p.weave,
        pattern: p.pattern,
        color: p.color,
        basePrice: p.basePrice,
        compareAtPrice: (p as any).compareAtPrice || 0,
        cityOfOrigin: (p as any).cityOfOrigin,
        quantity: 20,
        trackQuantity: true,
        status: 'published',
      }
      const prod = await payload.create({ collection: 'products', data })
      if (prod.id) {
        await payload.update({ collection: 'products', id: prod.id, data: { _status: 'published' } } as any)
      }
      productIds.push(prod.id as number)
      console.log(`  Product created: ${p.name.substring(0, 40)} (id: ${prod.id})`)
    }
  }

  // ─── Create Variants ──────────────────────────────────
  const colors = ['Red', 'Blue', 'Green', 'Gold', 'Maroon', 'Pink', 'Black', 'White', 'Yellow', 'Purple']
  for (const pid of productIds) {
    const existingVariants = await payload.find({ collection: 'variants', where: { product: { equals: pid } }, limit: 1 })
    if (existingVariants.docs.length > 0) {
      console.log(`  Variants exist for product ${pid}`)
      continue
    }
    const numVariants = 2 + Math.floor(Math.random() * 3)
    const usedColors = new Set<string>()
    for (let i = 0; i < numVariants; i++) {
      let col: string
      do { col = colors[Math.floor(Math.random() * colors.length)] } while (usedColors.has(col))
      usedColors.add(col)
      await payload.create({
        collection: 'variants',
        data: {
          product: pid,
          color: col,
          size: 'Free',
          stock: 5 + Math.floor(Math.random() * 15),
          sku: `SKU-${pid}-${col.toUpperCase()}`,
        },
      })
    }
    console.log(`  Created ${numVariants} variants for product ${pid}`)
  }

  // ─── Assign products to categories ────────────────────
  // Silk products → Silk category
  const silkProds = productIds.slice(0, 3)
  for (const pid of silkProds) {
    await payload.update({
      collection: 'products', id: pid,
      data: { categories: [categoryIds['Silk']] } as any,
    })
  }
  // Cotton products → Cotton category
  const cottonProds = productIds.slice(3, 6)
  for (const pid of cottonProds) {
    await payload.update({
      collection: 'products', id: pid,
      data: { categories: [categoryIds['Cotton']] } as any,
    })
  }
  // Banarasi products → Banarasi category
  if (productIds[1]) {
    await payload.update({
      collection: 'products', id: productIds[1],
      data: { categories: [categoryIds['Banarasi']] } as any,
    })
  }
  console.log('  Assigned products to categories')

  // ─── Create Test Customer ─────────────────────────────
  let customerId: number | undefined
  const existingCust = await payload.find({
    collection: 'customers',
    where: { email: { equals: 'test@shayga.com' } },
    limit: 1,
  })
  if (existingCust.docs.length > 0) {
    customerId = existingCust.docs[0].id as number
    console.log(`  Customer exists: test@shayga.com (id: ${customerId})`)
  } else {
    const cust = await payload.create({
      collection: 'customers',
      data: { name: 'Test Customer', email: 'test@shayga.com' },
    })
    customerId = cust.id as number
    console.log(`  Customer created: test@shayga.com (id: ${customerId})`)
  }

  // ─── Create Coupons ───────────────────────────────────
  const couponDefs = [
    {
      code: 'CATSILK20',
      description: '20% off on Silk category — Testing categories conditions',
      type: 'percentage' as const, value: 20, maxDiscount: 1000,
      categoriesConditions: [categoryIds['Silk']],
    },
    {
      code: 'PROD999',
      description: '₹999 off on specific products — Testing products conditions',
      type: 'fixed_amount' as const, value: 999,
      productsConditions: productIds.slice(0, 3),
    },
    {
      code: 'VIPMEMBER',
      description: 'Exclusive VIP coupon — Testing customers conditions',
      type: 'percentage' as const, value: 25, maxDiscount: 2000, minCartValue: 5000,
      customersConditions: customerId ? [customerId] : [],
    },
    {
      code: 'WELCOME50',
      description: '₹50 off on your first order — No conditions (public)',
      type: 'fixed_amount' as const, value: 50, minCartValue: 999,
    },
    {
      code: 'FESTIVE30',
      description: '30% off Festive category — Testing categories conditions',
      type: 'percentage' as const, value: 30, maxDiscount: 1500, minCartValue: 2999,
      categoriesConditions: [categoryIds['Festive']],
    },
    {
      code: 'LAUNCH500',
      description: '₹500 off on select new arrivals — Testing products conditions',
      type: 'fixed_amount' as const, value: 500, minCartValue: 1999,
      productsConditions: productIds.slice(6, 9),
    },
  ]

  for (const cd of couponDefs) {
    const existing = await payload.find({ collection: 'coupons', where: { code: { equals: cd.code } }, limit: 1 })
    if (existing.docs.length > 0) {
      console.log(`  Coupon exists: ${cd.code}`)
      continue
    }
    await payload.create({
      collection: 'coupons',
      data: {
        code: cd.code,
        description: cd.description,
        type: cd.type,
        value: cd.value,
        maxDiscount: (cd as any).maxDiscount || 0,
        minCartValue: (cd as any).minCartValue || 0,
        categoriesConditions: (cd as any).categoriesConditions || [],
        productsConditions: (cd as any).productsConditions || [],
        customersConditions: (cd as any).customersConditions || [],
        isActive: true,
        usageLimit: 100,
      },
    })
    console.log(`  Coupon created: ${cd.code}`)
  }

  console.log('\n✓ Seed complete!')
  process.exit(0)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
