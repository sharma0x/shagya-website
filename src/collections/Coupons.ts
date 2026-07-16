import type { CollectionConfig } from 'payload'

export const Coupons: CollectionConfig = {
  slug: 'coupons',
  admin: {
    useAsTitle: 'code',
    group: 'Marketing',
  },
  access: {
    // Public read so the checkout flow can validate coupons
    read: () => true,
    // Admin-only create, update, delete
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'description',
      type: 'text',
      label: 'Campaign Description',
      admin: {
        description: 'e.g., Diwali Sale 2026, Welcome Offer, Influencer — Ananya',
      },
    },
    {
      name: 'influencerCode',
      type: 'text',
      label: 'Influencer Tracking Code',
      admin: {
        description: 'Optional: unique identifier for influencer/collaborator tracking',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'percentage',
      options: [
        { label: 'Percentage', value: 'percentage' },
        { label: 'Fixed Amount', value: 'fixed_amount' },
        { label: 'Free Shipping', value: 'free_shipping' },
      ],
    },
    {
      name: 'value',
      type: 'number',
      min: 0,
      admin: {
        condition: (data) => data?.type && data.type !== 'free_shipping',
      },
    },
    {
      name: 'minCartValue',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'maxDiscount',
      type: 'number',
      min: 0,
      admin: {
        condition: (data) => data?.type === 'percentage',
      },
    },
    {
      name: 'usageLimit',
      type: 'number',
      min: 0,
    },
    {
      name: 'usedCount',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'startDate',
      type: 'date',
    },
    {
      name: 'endDate',
      type: 'date',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
    {
      name: 'categoriesConditions',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
    },
    {
      name: 'productsConditions',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
    },
    {
      name: 'customersConditions',
      type: 'relationship',
      relationTo: 'customers',
      hasMany: true,
    },
  ],
  timestamps: true,
}
