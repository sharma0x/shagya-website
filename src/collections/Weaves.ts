import type { CollectionConfig } from 'payload'

export const Weaves: CollectionConfig = {
  slug: 'weaves',
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
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description:
          'Show this weave as a "Quick:" chip on category pages (up to 5 shown, ordered by sortOrder).',
      },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      index: true,
      admin: {
        description:
          'Lower numbers appear first among featured weaves. Only used when featured is checked.',
        step: 1,
      },
    },
  ],
  timestamps: true,
}
