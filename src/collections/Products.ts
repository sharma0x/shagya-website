import type { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    group: 'Products',
  },
  access: {
    read: ({ req: { user } }) => {
      // Authenticated users (admins in the iframe) see both drafts and published.
      // Anonymous users only see published content.
      return user ? true : { _status: { equals: 'published' } }
    },
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
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
        if (
          data?.compareAtPrice != null &&
          data?.basePrice != null &&
          data.compareAtPrice > 0 &&
          data.compareAtPrice > data.basePrice
        ) {
          data.discountPercentage = Math.round(
            ((data.compareAtPrice - data.basePrice) /
              data.compareAtPrice) *
              100,
          )
        } else {
          data.discountPercentage = 0
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, req }) => {
        // Trigger back-in-stock notifications when product goes from OOS to in-stock
        const wasOOS =
          (previousDoc as any)?.quantity === 0 &&
          (previousDoc as any)?.trackQuantity
        const nowInStock =
          (doc as any)?.quantity > 0 && (doc as any)?.trackQuantity

        if (wasOOS && nowInStock) {
          try {
            const requests = await req.payload.find({
              collection: 'back-in-stock-requests',
              where: {
                product: { equals: (doc as any).id },
                notified: { equals: false },
              },
              limit: 100,
            } as any)

            for (const r of requests.docs as any[]) {
              try {
                const { sendBackInStockEmail } = await import(
                  '@/email/send'
                )
                await sendBackInStockEmail(
                  req.payload,
                  r.email,
                  doc as any,
                )
                await req.payload.update({
                  collection: 'back-in-stock-requests',
                  id: r.id,
                  data: { notified: true },
                } as any)
              } catch {
                // Skip failed notifications — don't block the hook
              }
            }
          } catch {
            // Hook failure must not block product save
          }
        }

        return doc
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
      name: 'cityOfOrigin',
      type: 'text',
      label: 'City of Origin',
      admin: {
        description: 'The city/region where this saree originates (e.g., Varanasi, Kanchipuram)',
      },
    },
    {
      name: 'occasion',
      type: 'text',
    },
    {
      name: 'color',
      type: 'select',
      required: true,
      options: [
        { label: 'Red', value: 'red' },
        { label: 'Burgundy', value: 'burgundy' },
        { label: 'Gold', value: 'gold' },
        { label: 'Green', value: 'green' },
        { label: 'Blue', value: 'blue' },
        { label: 'Ivory', value: 'ivory' },
        { label: 'Pink', value: 'pink' },
        { label: 'Purple', value: 'purple' },
        { label: 'Orange', value: 'orange' },
        { label: 'Black', value: 'black' },
        { label: 'White', value: 'white' },
        { label: 'Multicolor', value: 'multicolor' },
      ],
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
      name: 'discountPercentage',
      type: 'number',
      min: 0,
      max: 100,
      admin: {
        readOnly: true,
        hidden: true,
        description: 'Auto-computed from basePrice and compareAtPrice',
      },
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
      name: 'deliveryTime',
      type: 'select',
      label: 'Estimated Delivery Time',
      options: [
        { label: 'By Tomorrow', value: 'by-tomorrow' },
        { label: 'Within 2 Days', value: 'within-2-days' },
        { label: 'Within 5 Days', value: 'within-5-days' },
        { label: 'Within 7 Days', value: 'within-7-days' },
        { label: '7+ Days', value: '7-plus-days' },
      ],
      admin: {
        description: 'Estimated delivery time displayed to customers',
      },
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
      name: 'purchaseCount',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Auto-incremented on confirmed orders. Used for trending/popular ranking.',
      },
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
