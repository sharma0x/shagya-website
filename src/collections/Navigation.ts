import type { CollectionConfig } from 'payload'

export const Navigation: CollectionConfig = {
  slug: 'navigation',
  admin: {
    useAsTitle: 'name',
    group: 'Content',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'location',
      type: 'select',
      required: true,
      defaultValue: 'header',
      options: [
        { label: 'Header', value: 'header' },
        { label: 'Footer', value: 'footer' },
        { label: 'Sidebar', value: 'sidebar' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'custom_url',
          options: [
            { label: 'Page', value: 'page' },
            { label: 'Category', value: 'category' },
            { label: 'Custom URL', value: 'custom_url' },
            { label: 'External', value: 'external' },
          ],
        },
        {
          name: 'page',
          type: 'relationship',
          relationTo: 'pages',
          admin: {
            condition: (data) => data?.type === 'page',
          },
        },
        {
          name: 'category',
          type: 'relationship',
          relationTo: 'categories',
          admin: {
            condition: (data) => data?.type === 'category',
          },
        },
        {
          name: 'url',
          type: 'text',
          admin: {
            condition: (data) =>
              data?.type !== 'page' && data?.type !== 'category',
          },
        },
        {
          name: 'openInNewTab',
          type: 'checkbox',
        },
      ],
    },
  ],
  timestamps: true,
}
