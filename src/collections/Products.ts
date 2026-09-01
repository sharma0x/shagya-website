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
      async ({ data, req }) => {
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
            ((data.compareAtPrice - data.basePrice) / data.compareAtPrice) *
              100,
          )
        } else {
          data.discountPercentage = 0
        }
        // Variant-only stock model: when color variants exist, the top-level
        // quantity is derived as the sum of enabled variant stocks so every
        // product-level UI keeps working without manual dual bookkeeping.
        const variants = Array.isArray(data?.colorVariants)
          ? data.colorVariants
          : null
        if (variants && variants.length > 0) {
          data.quantity = variants
            .filter((v: any) => v?.enabled !== false)
            .reduce((sum: number, v: any) => sum + (Number(v?.stock) || 0), 0)
        }

        // --- Smart Collections Evaluation ---
        try {
          const automatedCollections = await req.payload.find({
            collection: 'collections',
            where: { isAutomated: { equals: true } },
            limit: 1000,
            pagination: false,
            depth: 0,
          })

          if (automatedCollections.docs.length > 0) {
            const { evaluateProductAgainstRules } =
              await import('../lib/smartCollections')

            let currentCollections = Array.isArray(data.collections)
              ? data.collections.map((c: any) =>
                  String(typeof c === 'object' ? c.id : c),
                )
              : []

            for (const collection of automatedCollections.docs as any[]) {
              const colId = String(collection.id)
              const matches = evaluateProductAgainstRules(
                data, // evaluating the incoming data payload
                (collection.matchType as 'all' | 'any') || 'all',
                collection.rules || [],
              )
              const hasCol = currentCollections.includes(colId)

              if (matches && !hasCol) {
                currentCollections.push(colId)
              } else if (!matches && hasCol) {
                currentCollections = currentCollections.filter(
                  (id: string) => id !== colId,
                )
              }
            }

            data.collections = currentCollections
          }
        } catch (error) {
          console.error(
            'Error in Product beforeChange smart collections sync:',
            error,
          )
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
            const wishlists = await req.payload.find({
              collection: 'wishlist',
              where: {
                'items.product': { equals: (doc as any).id },
              },
              depth: 1,
              limit: 100,
            })

            const notifiedCustomers = new Set<string>()
            for (const wishlist of wishlists.docs as any[]) {
              const customerEmail = wishlist.customer?.email

              if (!customerEmail || notifiedCustomers.has(customerEmail))
                continue
              notifiedCustomers.add(customerEmail)

              // Fire-and-forget: do not await per-recipient sends.
              // The product save must not block on SMTP.
              const { sendBackInStockEmail } = await import('@/email/send')
              void sendBackInStockEmail(
                req.payload,
                customerEmail,
                doc as any,
              ).catch(() => {
                // Skip failed notifications
              })
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
        description:
          'The city/region where this saree originates (e.g., Varanasi, Kanchipuram)',
      },
    },
    {
      name: 'occasions',
      type: 'relationship',
      relationTo: 'occasions',
      hasMany: true,
      admin: {
        description:
          'Occasions this saree is suited for (e.g., Bridal, Festive)',
      },
    },
    {
      name: 'tags',
      type: 'text',
      label: 'Tags',
      admin: {
        description:
          'Comma-separated tags (e.g., Zari Work, Handwoven, Eco Friendly)',
      },
    },
    {
      name: 'features',
      type: 'array',
      label: 'Product Badges',
      admin: {
        description:
          'Feature badges shown on product page (e.g., Handloom Verified, Premium Fabric)',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'colorVariants',
      type: 'array',
      label: 'Color Variants',
      minRows: 1,
      admin: {
        description:
          'Each color variant has its own gallery, price, and stock.',
      },
      fields: [
        {
          name: 'color',
          type: 'relationship',
          relationTo: 'colors',
          required: true,
        },
        {
          name: 'gallery',
          type: 'array',
          label: 'Variant Images',
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
          name: 'priceOverride',
          type: 'number',
          min: 0,
          admin: {
            description:
              'Overrides basePrice for this color. Leave empty to use basePrice.',
          },
        },
        {
          name: 'stock',
          type: 'number',
          min: 0,
          defaultValue: 0,
        },
        {
          name: 'sku',
          type: 'text',
          admin: { description: 'Optional per-variant SKU' },
        },
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
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
      admin: {
        description:
          'Auto-computed as the sum of color-variant stock when variants exist. Edit only for variant-less products.',
      },
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
        description:
          'Auto-incremented on confirmed orders. Used for trending/popular ranking.',
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
    {
      name: 'brand',
      type: 'relationship',
      relationTo: 'brands',
      hasMany: false,
      admin: {
        description: 'Brand associated with this product',
      },
    },
  ],
  timestamps: true,
}
