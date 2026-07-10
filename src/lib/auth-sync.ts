import { getPayload } from 'payload'
import config from '@payload-config'

interface BetterAuthUser {
  id: string
  email: string
  name: string
  phoneNumber?: string
}

/**
 * Sync a Better Auth user to the Payload Customers collection.
 *
 * - If customer exists with betterAuthUserId → skip (already linked)
 * - If customer exists with matching phone → link them (guest → account)
 * - If customer exists with matching email → link them
 * - Otherwise → create new customer
 */
export async function syncCustomer(user: BetterAuthUser): Promise<void> {
  try {
    const payload = await getPayload({ config })

    // 1. Check if already linked by betterAuthUserId
    const byAuthId = await payload.find({
      collection: 'customers',
      where: { betterAuthUserId: { equals: user.id } },
      limit: 1,
    })

    if (byAuthId.docs.length > 0) return

    // 2. Check if a guest customer exists with matching phone
    if (user.phoneNumber) {
      const byPhone = await payload.find({
        collection: 'customers',
        where: { phone: { equals: user.phoneNumber } },
        limit: 1,
      })

      if (byPhone.docs.length > 0) {
        // Link the existing guest customer to this Better Auth account
        await payload.update({
          collection: 'customers',
          id: byPhone.docs[0].id,
          data: {
            betterAuthUserId: user.id,
            name: user.name || (byPhone.docs[0] as any).name,
            email: user.email || (byPhone.docs[0] as any).email,
          },
          overrideAccess: true,
        } as any)
        return
      }
    }

    // 3. Check by email
    if (user.email) {
      const byEmail = await payload.find({
        collection: 'customers',
        where: { email: { equals: user.email } },
        limit: 1,
      })

      if (byEmail.docs.length > 0) {
        await payload.update({
          collection: 'customers',
          id: byEmail.docs[0].id,
          data: {
            betterAuthUserId: user.id,
            name: user.name || (byEmail.docs[0] as any).name,
            phone: user.phoneNumber || (byEmail.docs[0] as any).phone || '',
          },
          overrideAccess: true,
        } as any)
        return
      }
    }

    // 4. Create new customer
    await payload.create({
      collection: 'customers',
      data: {
        name: user.name,
        email: user.email,
        phone: user.phoneNumber || '',
        betterAuthUserId: user.id,
      },
      overrideAccess: true,
    })
  } catch (error) {
    console.error(
      `[Auth Sync] Failed to sync customer for user ${user.id}:`,
      error,
    )
  }
}
