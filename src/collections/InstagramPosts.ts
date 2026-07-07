import type { CollectionConfig } from 'payload'

export const InstagramPosts: CollectionConfig = {
  slug: 'instagram-posts',
  admin: {
    useAsTitle: 'caption',
    group: 'Content',
    defaultColumns: ['caption', 'mediaType', 'updatedAt'],
    description: 'Cached Instagram posts fetched from the Instagram Graph API',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      name: 'instagramId',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'mediaUrl',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'thumbnailUrl',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'permalink',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'caption',
      type: 'textarea',
      maxLength: 500,
      admin: { readOnly: true },
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
      admin: { readOnly: true },
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { readOnly: true },
    },
  ],
  timestamps: true,
}
