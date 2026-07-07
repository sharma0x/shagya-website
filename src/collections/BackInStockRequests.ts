import type { CollectionConfig } from 'payload'

export const BackInStockRequests: CollectionConfig = {
  slug: 'back-in-stock-requests',
  admin: {
    group: 'Marketing',
    useAsTitle: 'email',
    description: 'Users requesting notification when a product returns to stock',
  },
  access: {
    create: () => true,
    read: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'notified',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Auto-set to true after back-in-stock email is sent',
      },
    },
  ],
  timestamps: true,
}
