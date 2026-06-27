import type { CollectionConfig } from 'payload'

export const Variants: CollectionConfig = {
  slug: 'variants',
  admin: {
    useAsTitle: 'id',
    group: 'Products',
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
      hasMany: false,
    },
    {
      name: 'size',
      type: 'select',
      required: true,
      options: [
        { label: 'XS', value: 'XS' },
        { label: 'S', value: 'S' },
        { label: 'M', value: 'M' },
        { label: 'L', value: 'L' },
        { label: 'XL', value: 'XL' },
        { label: '2XL', value: '2XL' },
        { label: '3XL', value: '3XL' },
        { label: '4XL', value: '4XL' },
        { label: '5XL', value: '5XL' },
        { label: '6XL', value: '6XL' },
        { label: 'Free', value: 'Free' },
      ],
    },
    {
      name: 'color',
      type: 'text',
      required: true,
    },
    {
      name: 'blouseSize',
      type: 'text',
    },
    {
      name: 'sku',
      type: 'text',
      unique: true,
    },
    {
      name: 'stock',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'priceOverride',
      type: 'number',
      min: 0,
    },
  ],
  timestamps: true,
}
