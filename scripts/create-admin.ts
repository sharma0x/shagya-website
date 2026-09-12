import { getPayload } from 'payload'
import config from '@payload-config'

async function run() {
  const payload = await getPayload({ config })

  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD

  if (!email || !password) {
    console.error(
      '❌ SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env',
    )
    process.exit(1)
  }

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    overrideAccess: true,
  })

  if (existing.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        name: 'Admin',
        role: 'super-admin',
      },
      overrideAccess: true,
    })
    console.log(`✅ Admin user created: ${email}`)
  } else {
    console.log(`⏭️  Admin user already exists: ${email}`)
  }

  process.exit(0)
}

run().catch((err) => {
  console.error('❌ Error creating admin user:', err)
  process.exit(1)
})
