import type { CollectionConfig } from 'payload'

export const Wishlist: CollectionConfig = {
  slug: 'wishlist',
  admin: {
    useAsTitle: 'customer',
    group: 'Customers',
  },
  access: {
    // Customer can read own wishlist; admin all
    read: ({ req: { user } }) => {
      if (!user) return false
      return true
    },
    // Authenticated users can create
    create: ({ req: { user } }) => {
      if (!user) return false
      return true
    },
    // Only super-admin can update/delete
    update: ({ req: { user } }) => user?.role === 'super-admin',
    delete: ({ req: { user } }) => user?.role === 'super-admin',
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      hasMany: false,
      unique: true,
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'variant',
          type: 'relationship',
          relationTo: 'variants',
        },
      ],
    },
  ],
  timestamps: true,
}
