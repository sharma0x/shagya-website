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
 * Called after a user registers via Better Auth. Creates a Customer record
 * linked by `betterAuthUserId`. If the customer already exists, it skips
 * creation. If any error occurs, it logs the error but does NOT throw —
 * Customer sync failure MUST NOT break user registration.
 */
export async function syncCustomer(user: BetterAuthUser): Promise<void> {
  try {
    const payload = await getPayload({ config })

    // Check if customer already exists for this Better Auth user
    const existing = await payload.find({
      collection: 'customers',
      where: {
        betterAuthUserId: { equals: user.id },
      },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return // Already synced — nothing to do
    }

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
    // Log but don't throw — Customer sync failure should not break auth flow
    console.error(
      `[Auth Sync] Failed to sync customer for user ${user.id}:`,
      error,
    )
  }
}
