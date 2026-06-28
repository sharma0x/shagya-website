import type { CollectionConfig } from 'payload'

export const EmailLogs: CollectionConfig = {
  slug: 'email-logs',
  admin: {
    useAsTitle: 'subject',
    group: 'System',
    defaultColumns: ['to', 'subject', 'status', 'label', 'createdAt'],
  },
  access: {
    create: () => false,
    read: ({ req: { user } }) => !!user,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'to',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
      ],
      required: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'label',
      type: 'text',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'error',
      type: 'textarea',
      admin: {
        readOnly: true,
        condition: (data) => data?.status === 'failed',
      },
    },
    {
      name: 'html',
      type: 'code',
      admin: {
        readOnly: true,
        language: 'html',
      },
    },
    {
      name: 'preview',
      type: 'ui',
      admin: {
        components: {
          Field: '@/collections/components/EmailPreview#EmailPreview',
        },
      },
    },
  ],
  timestamps: true,
}
