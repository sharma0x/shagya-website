import type { CollectionConfig } from 'payload'
import { sendWebhook } from '@/lib/webhooks'
import { sendOrderPlacedEmails, sendOrderStatusEmails } from '@/email/send'

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
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        // Only fire webhooks on status changes during updates
        if (operation !== 'update') return doc

        const prevStatus = (previousDoc as Record<string, unknown> | undefined)
          ?.status as string | undefined
        const newStatus = (doc as Record<string, unknown>).status as
          | string
          | undefined

        if (!newStatus || prevStatus === newStatus) return doc

        // Send transactional emails for the new status (fire-and-forget)
        const docId = (doc as Record<string, unknown>).id as string
        sendOrderStatusEmails(req.payload, docId, newStatus).catch((err) =>
          req.payload.logger.error(
            `[Email] sendOrderStatusEmails failed: ${err}`,
          ),
        )

        const orderId = (doc as Record<string, unknown>).orderNumber as string
        const webhookUrl = process.env.WEBHOOK_URL

        const payload: Record<string, unknown> = {
          event: 'order.status_changed',
          orderId,
          previousStatus: prevStatus ?? null,
          newStatus,
          order: {
            orderNumber: (doc as Record<string, unknown>).orderNumber,
            customerEmail: (doc as Record<string, unknown>).customerEmail,
            status: newStatus,
            total: (doc as Record<string, unknown>).total,
            updatedAt: (doc as Record<string, unknown>).updatedAt,
          },
        }

        let webhookResult = null

        if (webhookUrl) {
          webhookResult = await sendWebhook(webhookUrl, payload)
        }

        // Always log the event to the audit trail
        try {
          await req.payload.create({
            collection: 'event-logs',
            data: {
              event: 'order.status_changed',
              orderId,
              status: newStatus,
              payload,
              response: webhookResult ?? {
                note: 'WEBHOOK_URL not configured — skipped',
              },
            },
          } as any)
        } catch (err) {
          req.payload.logger.error(
            `[orders.afterChange] Failed to create EventLog: ${String(err)}`,
          )
        }

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
