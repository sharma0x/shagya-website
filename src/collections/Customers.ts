import type { CollectionConfig } from 'payload'
import { sendWelcomeEmail } from '@/email/send'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'email',
    group: 'Customers',
  },
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create') return doc
        const email = (doc as Record<string, unknown>).email as
          | string
          | undefined
        const name = (doc as Record<string, unknown>).name as string | undefined
        if (!email) return doc
        sendWelcomeEmail(req.payload, email, name || '').catch((err) =>
          req.payload.logger.error(`[Email] sendWelcomeEmail failed: ${err}`),
        )
        return doc
      },
    ],
  },
  access: {
    // Anyone can read customer profiles (frontend needs this for orders/profile)
    read: () => true,
    // Only super-admin can create/update/delete customers
    create: ({ req: { user } }) => user?.role === 'super-admin',
    update: ({ req: { user } }) => user?.role === 'super-admin',
    delete: ({ req: { user } }) => user?.role === 'super-admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'betterAuthUserId',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
      },
    },
  ],
  timestamps: true,
}
