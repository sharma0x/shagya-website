import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    group: 'Products',
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data?.name) {
          data.slug = data.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '')
        }
        return data
      },
    ],
  },
  versions: {
    drafts: {
      autosave: { interval: 800 },
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'description',
      type: 'richText',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'Archived', value: 'archived' },
      ],
    },
    {
      name: 'fabric',
      type: 'select',
      required: true,
      options: [
        { label: 'Silk', value: 'silk' },
        { label: 'Cotton', value: 'cotton' },
        { label: 'Linen', value: 'linen' },
        { label: 'Georgette', value: 'georgette' },
        { label: 'Chiffon', value: 'chiffon' },
        { label: 'Crepe', value: 'crepe' },
        { label: 'Velvet', value: 'velvet' },
        { label: 'Net', value: 'net' },
        { label: 'Blend', value: 'blend' },
      ],
    },
    {
      name: 'weave',
      type: 'select',
      required: true,
      options: [
        { label: 'Banarasi', value: 'banarasi' },
        { label: 'Kanchipuram', value: 'kanchipuram' },
        { label: 'Bandhani', value: 'bandhani' },
        { label: 'Patola', value: 'patola' },
        { label: 'Kalamkari', value: 'kalamkari' },
        { label: 'Ikat', value: 'ikkat' },
        { label: 'Paithani', value: 'paithani' },
        { label: 'Maheshwari', value: 'maheshwari' },
        { label: 'Chanderi', value: 'chanderi' },
        { label: 'Tant', value: 'tant' },
        { label: 'Baluchari', value: 'baluchari' },
      ],
    },
    {
      name: 'pattern',
      type: 'select',
      required: true,
      options: [
        { label: 'Solid', value: 'solid' },
        { label: 'Printed', value: 'printed' },
        { label: 'Embroidered', value: 'embroidered' },
        { label: 'Embellished', value: 'embellished' },
        { label: 'Painted', value: 'painted' },
      ],
    },
    {
      name: 'length',
      type: 'number',
      min: 1,
      max: 9,
      admin: {
        step: 0.1,
      },
    },
    {
      name: 'blouseType',
      type: 'text',
    },
    {
      name: 'palluDetails',
      type: 'text',
    },
    {
      name: 'borderType',
      type: 'text',
    },
    {
      name: 'weavePattern',
      type: 'text',
    },
    {
      name: 'occasion',
      type: 'text',
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Product Images',
      minRows: 1,
      maxRows: 8,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Alt Text',
        },
      ],
    },
    {
      name: 'basePrice',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
    },
    {
      name: 'costPrice',
      type: 'number',
      min: 0,
    },
    {
      name: 'gstPercent',
      type: 'number',
      defaultValue: 5,
    },
    {
      name: 'shippingPrice',
      type: 'number',
      min: 0,
    },
    {
      name: 'trackQuantity',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'quantity',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'lowStockThreshold',
      type: 'number',
      min: 0,
      defaultValue: 5,
    },
    {
      name: 'allowBackorder',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'soldIndividually',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'collections',
      type: 'relationship',
      relationTo: 'collections',
      hasMany: true,
      admin: {
        description: 'Curated editorial collections this product belongs to',
      },
    },
  ],
  timestamps: true,
}
