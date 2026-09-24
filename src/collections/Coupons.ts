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
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const promotionType = data?.promotionType ?? originalDoc?.promotionType
        if (promotionType === 'buy_quantity') {
          if (data) {
            data.type = 'percentage'
          }
          const collectionsConditions =
            data?.collectionsConditions ?? originalDoc?.collectionsConditions
          if (
            !Array.isArray(collectionsConditions) ||
            collectionsConditions.length === 0
          ) {
            throw new Error(
              'Buy quantity coupons must target at least one collection',
            )
          }
          const minimumQuantity =
            data?.minimumQuantity ?? originalDoc?.minimumQuantity ?? 2
          const minQtyNum = Number(minimumQuantity)
          if (!Number.isInteger(minQtyNum) || minQtyNum < 1) {
            throw new Error(
              'Buy quantity coupons must have a minimum quantity of at least 1',
            )
          }
          const value = data?.value ?? originalDoc?.value
          const valNum = Number(value)
          if (!Number.isFinite(valNum) || valNum <= 0 || valNum > 100) {
            throw new Error(
              'Buy quantity coupons must have a percentage between 1 and 100',
            )
          }
        }
        return data
      },
    ],
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
      name: 'promotionType',
      type: 'select',
      required: true,
      defaultValue: 'standard',
      options: [
        { label: 'Standard coupon', value: 'standard' },
        { label: 'Buy quantity from collection', value: 'buy_quantity' },
      ],
      admin: {
        description:
          'Choose whether this is a regular coupon or a quantity offer.',
      },
    },
    {
      name: 'description',
      type: 'text',
      label: 'Campaign Description',
      admin: {
        description:
          'e.g., Diwali Sale 2026, Welcome Offer, Influencer — Ananya',
      },
    },
    {
      name: 'influencerCode',
      type: 'text',
      label: 'Influencer Tracking Code',
      admin: {
        description:
          'Optional: unique identifier for influencer/collaborator tracking',
      },
    },
    {
      name: 'minimumQuantity',
      type: 'number',
      min: 1,
      defaultValue: 2,
      admin: {
        condition: (data) => data?.promotionType === 'buy_quantity',
        description: 'Required total quantity across the selected collections.',
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
      validate: (val: number | null | undefined, { data }: { data: any }) => {
        if (
          data?.type &&
          data.type !== 'free_shipping' &&
          (val == null || val <= 0)
        ) {
          return 'Discount value is required for percentage and fixed amount coupons'
        }
        if (data?.type === 'percentage' && val != null && val > 100) {
          return 'Percentage discount cannot be greater than 100'
        }
        return true
      },
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
      admin: {
        description:
          'Total number of times this coupon can be used across all customers',
      },
    },
    {
      name: 'perUserUsageLimit',
      type: 'number',
      min: 0,
      admin: {
        description:
          'Number of times a single customer can use this coupon (e.g., 1 for one-time use)',
      },
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
      name: 'collectionsConditions',
      type: 'relationship',
      relationTo: 'collections',
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
