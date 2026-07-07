import type { CollectionConfig } from 'payload'

export const InstagramPosts: CollectionConfig = {
  slug: 'instagram-posts',
  admin: {
    useAsTitle: 'caption',
    group: 'Content',
    defaultColumns: ['caption', 'source', 'mediaType', 'updatedAt'],
    description:
      'Instagram posts shown on the homepage gallery. Synced automatically from the Instagram Graph API when configured, or added manually as fallback.',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'API sync', value: 'api' },
        { label: 'Manual upload', value: 'manual' },
      ],
      defaultValue: 'api',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'instagramId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        condition: (_, siblingData) => siblingData?.source === 'manual',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'manual',
      },
    },
    {
      name: 'mediaUrl',
      type: 'text',
      admin: {
        readOnly: true,
        condition: (_, siblingData) => siblingData?.source === 'manual',
      },
    },
    {
      name: 'thumbnailUrl',
      type: 'text',
      admin: {
        condition: (_, siblingData) => siblingData?.source === 'manual',
      },
    },
    {
      name: 'permalink',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'textarea',
      maxLength: 500,
    },
    {
      name: 'mediaType',
      type: 'select',
      options: [
        { label: 'Image', value: 'IMAGE' },
        { label: 'Video', value: 'VIDEO' },
        { label: 'Carousel', value: 'CAROUSEL_ALBUM' },
      ],
      defaultValue: 'IMAGE',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
  ],
  timestamps: true,
}
