import { getPayload } from 'payload'
import config from '@payload-config'
import {
  createPhoneIdentity,
  getPhoneIdentityByUserId,
  getUserIdByPhoneNumber,
} from './phone-identity'

interface BetterAuthUser {
  id: string
  email: string
  name: string
  phoneNumber?: string
  // Firebase UID is passed when user signs up with phone
  firebaseUid?: string
}

/**
 * Sync a Better Auth user to the Payload Customers collection.
 *
 * NEW FLOW (with phone identities):
 * - If user has phoneNumber and firebaseUid → create phone identity entry
 * - If customer exists with betterAuthUserId → skip (already linked)
 * - If customer exists with matching email → link them
 * - Otherwise → create new customer
 *
 * NOTE: We no longer link by customers.phone because it's editable contact info,
 * not a verified identity. Phone identities are managed separately.
 */
export async function syncCustomer(user: BetterAuthUser): Promise<void> {
  try {
    const payload = await getPayload({ config })

    // 1. Create phone identity if user signed up with phone
    if (user.phoneNumber && user.firebaseUid) {
      try {
        // Check if phone identity already exists
        const existingPhoneIdentity = await getPhoneIdentityByUserId(user.id)
        if (!existingPhoneIdentity) {
          await createPhoneIdentity({
            userId: user.id,
            phoneNumber: user.phoneNumber,
            firebaseUid: user.firebaseUid,
          })
        }
      } catch (error) {
        console.error(
          `[Auth Sync] Failed to create phone identity for user ${user.id}:`,
          error,
        )
        // Continue with customer sync even if phone identity creation fails
      }
    }

    // 2. Check if already linked by betterAuthUserId
    const byAuthId = await payload.find({
      collection: 'customers',
      where: { betterAuthUserId: { equals: user.id } },
      limit: 1,
    })

    if (byAuthId.docs.length > 0) return

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
        name: user.name || user.email?.split('@')[0] || 'Customer',
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
