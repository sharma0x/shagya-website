import type { CollectionConfig } from 'payload'

export const Customers: CollectionConfig = {
  slug: 'customers',
  admin: {
    useAsTitle: 'email',
    group: 'Customers',
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
      required: true,
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
