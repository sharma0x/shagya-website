import type { CollectionConfig } from 'payload'

export const Addresses: CollectionConfig = {
  slug: 'addresses',
  admin: {
    useAsTitle: 'fullName',
    group: 'Customers',
  },
  access: {
    // Authenticated users can CRUD their own addresses; super-admin can manage all
    create: ({ req: { user } }) => {
      if (!user) return false
      return true
    },
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      return true
    },
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      return true
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      return true
    },
  },
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      hasMany: false,
    },
    {
      name: 'fullName',
      type: 'text',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'line1',
      type: 'text',
      required: true,
    },
    {
      name: 'line2',
      type: 'text',
    },
    {
      name: 'city',
      type: 'text',
      required: true,
    },
    {
      name: 'state',
      type: 'text',
      required: true,
    },
    {
      name: 'pincode',
      type: 'text',
      required: true,
      validate: (value?: string | string[] | null) => {
        const val = Array.isArray(value) ? value[0] : value
        if (!val || val.length === 0) return true
        if (!/^[1-9][0-9]{5}$/.test(val)) {
          return 'Pincode must be a 6-digit Indian pincode starting with 1–9'
        }
        return true
      },
    },
    {
      name: 'country',
      type: 'text',
      defaultValue: 'India',
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
  timestamps: true,
}
