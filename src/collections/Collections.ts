import type { CollectionConfig } from 'payload'
import {
  BrandRule,
  FabricRule,
  PriceRule,
  TagRule,
  OccasionRule,
} from '../lib/smartCollections'

export const Collections: CollectionConfig = {
  slug: 'collections',
  admin: {
    useAsTitle: 'name',
    group: 'Taxonomy',
  },
  access: {
    read: () => true,
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
        return data
      },
    ],
  },
  endpoints: [
    {
      path: '/:id/sync',
      method: 'post',
      handler: async (req) => {
        try {
          const collectionId = req.routeParams?.id as string
          if (!collectionId) {
            return Response.json({ error: 'Missing ID' }, { status: 400 })
          }

          const collection = await req.payload.findByID({
            collection: 'collections',
            id: collectionId,
          })

          if (!collection || !collection.isAutomated) {
            return Response.json(
              { error: 'Not an automated collection' },
              { status: 400 },
            )
          }

          const { evaluateProductAgainstRules } =
            await import('../lib/smartCollections')

          const products = await req.payload.find({
            collection: 'products',
            limit: 1000,
            pagination: false,
            depth: 0,
          })

          let syncedCount = 0

          for (const product of products.docs as any[]) {
            const matches = evaluateProductAgainstRules(
              product,
              (collection.matchType as 'all' | 'any') || 'all',
              collection.rules || [],
            )

            let currentCollections = Array.isArray(product.collections)
              ? product.collections.map((c: any) =>
                  String(typeof c === 'object' ? c.id : c),
                )
              : []

            const collectionIdStr = String(collection.id)
            const hasCollection = currentCollections.includes(collectionIdStr)

            if (matches && !hasCollection) {
              currentCollections.push(collectionIdStr)
              await req.payload.update({
                collection: 'products',
                id: product.id,
                data: { collections: currentCollections },
              })
              syncedCount++
            } else if (!matches && hasCollection) {
              currentCollections = currentCollections.filter(
                (id: string) => id !== collectionIdStr,
              )
              await req.payload.update({
                collection: 'products',
                id: product.id,
                data: { collections: currentCollections },
              })
              syncedCount++
            }
          }

          return Response.json({ success: true, syncedCount })
        } catch (error) {
          console.error('Error auto-syncing smart collection:', error)
          return Response.json({ error: 'Internal error' }, { status: 500 })
        }
      },
    },
  ],
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
      type: 'textarea',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'isAutomated',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Automatically include products based on specific rules.',
      },
    },
    {
      name: 'matchType',
      type: 'select',
      options: [
        { label: 'All conditions (AND)', value: 'all' },
        { label: 'Any condition (OR)', value: 'any' },
      ],
      defaultValue: 'all',
      admin: {
        condition: (data) => data.isAutomated,
      },
    },
    {
      name: 'rules',
      type: 'blocks',
      blocks: [BrandRule, FabricRule, PriceRule, TagRule, OccasionRule],
      admin: {
        condition: (data) => data.isAutomated,
      },
    },
    {
      name: 'syncButton',
      type: 'ui',
      admin: {
        components: {
          Field:
            '@/components/SyncSmartCollectionButton#SyncSmartCollectionButton',
        },
        condition: (data) => data.isAutomated,
      },
    },
  ],
  timestamps: true,
}
