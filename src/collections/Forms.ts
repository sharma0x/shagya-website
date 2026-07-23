import type { CollectionConfig } from 'payload'

export const Forms: CollectionConfig = {
  slug: 'forms',
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if ((operation === 'create' || operation === 'update') && data?.title) {
          data.slug = data.title
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
      name: 'title',
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
      name: 'emailTo',
      type: 'email',
      label: 'Notification Email',
      admin: {
        description:
          'Form submissions will be forwarded to this email address.',
      },
    },
    {
      name: 'submitButtonText',
      type: 'text',
      defaultValue: 'Submit',
    },
    {
      name: 'successMessage',
      type: 'text',
      defaultValue: 'Thank you for your submission!',
    },
    {
      name: 'fields',
      type: 'array',
      labels: {
        singular: 'Form Field',
        plural: 'Form Fields',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'text',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Email', value: 'email' },
            { label: 'Phone', value: 'tel' },
            { label: 'Textarea', value: 'textarea' },
            { label: 'Select', value: 'select' },
            { label: 'Checkbox', value: 'checkbox' },
          ],
        },
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'options',
          type: 'textarea',
          admin: {
            description:
              'One option per line. Only used when type is "Select".',
            condition: (data, siblingData) =>
              (siblingData as Record<string, unknown>)?.type === 'select',
          },
        },
      ],
    },
  ],
  timestamps: true,
}
