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
    // Super-admin and admin can create users
    create: ({ req: { user } }) =>
      user?.role === 'super-admin' || user?.role === 'admin',
    // Super-admin and admin can read all; others read own profile only
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin' || user.role === 'admin') return true
      return { id: { equals: user.id } }
    },
    // Super-admin and admin can update all; others update own profile only
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin' || user.role === 'admin') return true
      return { id: { equals: user.id } }
    },
    // Only super-admin and admin can delete users
    delete: ({ req: { user } }) =>
      user?.role === 'super-admin' || user?.role === 'admin',
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
        { label: 'Super Admin', value: 'super-admin' },
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Content Manager', value: 'content-manager' },
      ],
      access: {
        // Only super-admin can change roles
        update: ({ req: { user } }) => user?.role === 'super-admin',
      },
    },
  ],
  timestamps: true,
}
