import type { CollectionConfig } from 'payload'

const addressGroup = {
  name: 'address',
  type: 'group' as const,
  fields: [
    {
      name: 'fullName',
      type: 'text' as const,
    },
    {
      name: 'phone',
      type: 'text' as const,
    },
    {
      name: 'line1',
      type: 'text' as const,
    },
    {
      name: 'line2',
      type: 'text' as const,
    },
    {
      name: 'city',
      type: 'text' as const,
    },
    {
      name: 'state',
      type: 'text' as const,
    },
    {
      name: 'pincode',
      type: 'text' as const,
    },
    {
      name: 'country',
      type: 'text' as const,
      defaultValue: 'India',
    },
  ],
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'orderNumber',
    group: 'Orders',
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation === 'create' && !data?.orderNumber) {
          try {
            const existing = await req.payload.find({
              collection: 'orders',
              limit: 1,
              sort: '-orderNumber',
            } as any)

            const lastOrder = existing.docs?.[0] as any
            if (lastOrder?.orderNumber) {
              const lastNum = parseInt(
                String(lastOrder.orderNumber).replace('ORD-', ''),
                10,
              )
              const nextNum = isNaN(lastNum) ? 1 : lastNum + 1
              data.orderNumber = `ORD-${String(nextNum).padStart(5, '0')}`
            } else {
              data.orderNumber = 'ORD-00001'
            }
          } catch {
            data.orderNumber = 'ORD-00001'
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      unique: true,
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'customerEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'shipping',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'tax',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'discount',
      type: 'number',
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
    },
    {
      name: 'paymentId',
      type: 'text',
    },
    {
      name: 'shippingAddress',
      type: 'group',
      fields: addressGroup.fields,
    },
    {
      name: 'billingAddress',
      type: 'group',
      fields: addressGroup.fields,
    },
    {
      name: 'items',
      type: 'array',
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'variant',
          type: 'relationship',
          relationTo: 'variants' as any,
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 1,
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          min: 0,
        },
        {
          name: 'totalPrice',
          type: 'number',
          required: true,
          min: 0,
        },
      ],
    },
  ],
  timestamps: true,
}
