import type { CollectionConfig } from 'payload'
import { sendWebhook } from '@/lib/webhooks'
import { sendOrderPlacedEmails, sendOrderStatusEmails } from '@/email/send'

/**
 * Runs email, webhook, event-log, and purchaseCount side-effects detached
 * from the request transaction. This prevents Neon's idle-in-transaction
 * timeout from killing the connection and rolling back the order save.
 */
function scheduleSideEffects(
  payload: any,
  docId: string,
  orderId: string,
  prevStatus: string | null,
  newStatus: string,
  items?: Array<{ product?: string | number; quantity?: number }>,
) {
  Promise.resolve().then(async () => {
    try {
      sendOrderStatusEmails(payload, docId, newStatus).catch(() => {})
    } catch {}

    try {
      const webhookUrl = process.env.WEBHOOK_URL
      if (webhookUrl) {
        await sendWebhook(webhookUrl, {
          event: 'order.status_changed',
          orderId,
          previousStatus: prevStatus ?? null,
          newStatus,
        })
      }
    } catch {}

    try {
      await payload.create({
        collection: 'event-logs',
        data: {
          event: 'order.status_changed',
          orderId,
          status: newStatus,
          payload: { orderId, previousStatus: prevStatus, newStatus },
          response: { note: 'WEBHOOK_URL not configured — skipped' },
        },
        overrideAccess: true,
      })
    } catch {}

    if (newStatus === 'confirmed' && prevStatus !== 'confirmed' && items?.length) {
      for (const item of items) {
        if (!item.product) continue
        try {
          const product = await payload.findByID({
            collection: 'products',
            id: typeof item.product === 'string' ? item.product : String(item.product),
            overrideAccess: true,
          })
          if (product) {
            await payload.update({
              collection: 'products',
              id: product.id,
              data: {
                purchaseCount: ((product as any).purchaseCount || 0) + (item.quantity || 1),
              },
              overrideAccess: true,
            })
          }
        } catch {}
      }
    }
  })
}

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
    afterOperation: [
      async ({ operation, result, req }) => {
        if (operation !== 'create') return result
        const id = (result as Record<string, unknown>)?.id as string | undefined
        if (!id) return result
        // Fire-and-forget — email failure must never affect the order response
        sendOrderPlacedEmails(req.payload, id).catch((err) =>
          req.payload.logger.error(
            `[Email] sendOrderPlacedEmails failed: ${err}`,
          ),
        )
        return result
      },
    ],
    beforeChange: [
      async ({ data, operation, originalDoc, req }) => {
        // Auto-set status timestamps on update
        if (operation === 'update' && originalDoc) {
          const prevStatus = (originalDoc as any)?.status
          const nextStatus = data?.status
          if (prevStatus !== nextStatus) {
            if (nextStatus === 'confirmed' && !data?.confirmedAt) {
              data.confirmedAt = new Date().toISOString()
            }
            if (nextStatus === 'shipped' && !data?.shippedAt) {
              data.shippedAt = new Date().toISOString()
            }
            if (nextStatus === 'delivered' && !data?.deliveredAt) {
              data.deliveredAt = new Date().toISOString()
            }
          }
        }

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
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        if (operation !== 'update') return doc

        const prevStatus = (previousDoc as Record<string, unknown> | undefined)
          ?.status as string | undefined
        const newStatus = (doc as Record<string, unknown>).status as
          | string
          | undefined

        if (!newStatus || prevStatus === newStatus) return doc

        const docId = (doc as Record<string, unknown>).id as string
        const orderId = (doc as Record<string, unknown>).orderNumber as string
        const items = (doc as Record<string, unknown>).items as
          | Array<{ product?: string | number; quantity?: number }>
          | undefined

        scheduleSideEffects(
          req.payload, docId, orderId, prevStatus ?? null, newStatus, items,
        )

        return doc
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
      name: 'notes',
      type: 'text',
      label: 'Delivery Instructions',
      admin: {
        description: 'Customer notes or delivery instructions',
      },
    },
    {
      name: 'confirmedAt',
      type: 'date',
      admin: { readOnly: true, description: 'Set when status changes to confirmed' },
    },
    {
      name: 'shippedAt',
      type: 'date',
      admin: { readOnly: true, description: 'Set when status changes to shipped' },
    },
    {
      name: 'deliveredAt',
      type: 'date',
      admin: { readOnly: true, description: 'Set when status changes to delivered' },
    },
    {
      name: 'trackingId',
      type: 'text',
      label: 'Tracking Number',
      admin: { description: 'Enter tracking ID from shipping provider (e.g. Shiprocket, Delhivery, India Post)' },
    },
    {
      name: 'trackingUrl',
      type: 'text',
      label: 'Tracking URL',
      admin: { description: 'Direct link to track this package' },
    },
    {
      name: 'shippingType',
      type: 'select',
      defaultValue: 'standard',
      required: true,
      options: [
        { label: 'Standard', value: 'standard' },
        { label: 'Express', value: 'express' },
      ],
      admin: { description: 'Shipping method chosen at checkout' },
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
          relationTo: 'variants',
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
