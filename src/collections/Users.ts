import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    // Payload's built-in email + password auth for admin users
    tokenExpiration: 7200, // 2 hours
    verify: false, // No email verification for admin users
    maxLoginAttempts: 5,
    lockTime: 600000, // 10 minutes lockout
  },
  admin: {
    useAsTitle: 'email',
    group: 'Admin',
  },
  access: {
    // Only admins can create new admin users
    create: ({ req: { user } }) => user?.role === 'admin',
    // Users can read their own profile; admins can read all
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return { id: { equals: user?.id } }
    },
    // Users can update their own profile; admins can update all
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return { id: { equals: user?.id } }
    },
    // Only admins can delete users
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Content Manager', value: 'content-manager' },
      ],
      access: {
        // Only admins can change roles
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
  ],
  timestamps: true,
}
