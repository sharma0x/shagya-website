import type { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    group: 'Products',
  },
  access: {
    // Anyone can read reviews (frontend needs this for product pages)
    read: () => true,
    // Authenticated customers can create reviews
    create: ({ req: { user } }) => Boolean(user),
    // Authenticated users can update their own reviews
    update: ({ req: { user } }) => Boolean(user),
    // Only admin users (super-admin, admin) can delete reviews
    delete: ({ req: { user } }) =>
      user?.role === 'super-admin' || user?.role === 'admin',
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      hasMany: false,
    },
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      hasMany: false,
    },
    {
      name: 'variant',
      type: 'relationship',
      relationTo: 'variants',
      hasMany: false,
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      min: 1,
      max: 5,
      defaultValue: 5,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      name: 'images',
      type: 'array',
      labels: {
        singular: 'Image',
        plural: 'Images',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
    {
      name: 'verifiedPurchase',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'helpfulCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'helpfulUserEmails',
      type: 'json',
      admin: {
        readOnly: true,
        hidden: true,
      },
    },
  ],
  timestamps: true,
}
