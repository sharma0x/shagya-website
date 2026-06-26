import type { CollectionConfig } from 'payload'

export const Carts: CollectionConfig = {
  slug: 'carts',
  admin: {
    useAsTitle: 'customer',
    group: 'Customers',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      unique: true,
      index: true,
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
          type: 'json',
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          max: 10,
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
        },
      ],
    },
    {
      name: 'coupon',
      type: 'relationship',
      relationTo: 'coupons',
    },
    {
      name: 'subtotal',
      type: 'number',
    },
    {
      name: 'lastActivity',
      type: 'date',
    },
  ],
  timestamps: true,
}
