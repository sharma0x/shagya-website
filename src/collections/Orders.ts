import type { CollectionConfig } from 'payload'
import { revalidatePath, revalidateTag } from 'next/cache'
import { sendWebhook } from '@/lib/webhooks'
import { sendOrderPlacedEmails, sendOrderStatusEmails } from '@/email/send'
import {
  applyStockDecrement,
  applyStockRestore,
  type StockOrderItem,
} from '@/lib/stock'
import { shipOrderWithDelhivery } from '@/lib/delhivery/ship-order'
import {
  createPickupRequest,
  generateLabel,
  nextPickupSlotIST,
  trackShipment,
} from '@/lib/delhivery/fulfillment'
import { getDelhiverySettings } from '@/lib/delhivery/settings'
import { mapScanToOrderStatus } from '@/lib/delhivery/mapping'

// ─────────────────────────────────────────────────────────────────────────────
// Inventory transactions (synchronous + idempotent)
//
// Industry-grade inventory handling requires stock to be committed at the exact
// moment an order is confirmed and restored when it is cancelled/refunded:
//   - Synchronous: runs awaited inside `afterChange`, never fire-and-forget, so
//     a failed write is visible in logs instead of silently leaving inventory
//     out of sync.
//   - Atomic: the decrement is a conditional update (`quantity >= requested`),
//     so two concurrent confirmations cannot oversell the last unit.
//   - Idempotent: `stockDeducted` / `stockRestored` flags on the order guarantee
//     a replayed webhook or admin re-save never double-applies a movement.
//   - Auditable: every movement is appended to the `stock-movements` ledger.
// ─────────────────────────────────────────────────────────────────────────────

function groupItemsByProduct(
  items: Array<{
    product?: string | number | { id?: string | number }
    quantity?: number | null
    color?: StockOrderItem['color']
  }>,
): Map<string, StockOrderItem[]> {
  const map = new Map<string, StockOrderItem[]>()
  for (const item of items) {
    if (!item.product) continue
    const productVal =
      typeof item.product === 'object' && item.product !== null
        ? item.product.id
        : item.product
    if (!productVal) continue
    const pid = String(productVal)
    const bucket = map.get(pid) ?? []
    bucket.push({ color: item.color, quantity: item.quantity })
    map.set(pid, bucket)
  }
  return map
}

async function writeStockMovement(
  payload: any,
  req: any,
  data: {
    product: string | number
    variant?: StockOrderItem['color'] | null
    order: string | number
    type: 'committed' | 'restored' | 'reserved' | 'released' | 'manual'
    delta: number
    quantityAfter?: number
  },
): Promise<void> {
  await payload.create({
    collection: 'stock-movements',
    data: {
      product: data.product,
      variant: data.variant ?? undefined,
      order: data.order,
      type: data.type,
      delta: data.delta,
      quantityAfter: data.quantityAfter,
    },
    overrideAccess: true,
    // Join the caller's transaction so ledger writes never block on the
    // order row lock held by the outer save (avoids a self-deadlock).
    req,
  })
}

function invalidateProductPages(payload: any, product: any): void {
  try {
    // Purges every ISR page that rendered product docs tagged with `products`
    // (PDP, category, collections) so shoppers immediately see the new stock.
    // Next 16 requires a cache-life profile — `{ expire: 300 }` mirrors the
    // pages' 5-minute revalidation window.
    revalidateTag('products', { expire: 300 })
    if (product?.slug && product?.id) {
      revalidatePath(`/products/${product.slug}/${product.id}`)
    }
  } catch (err) {
    payload.logger.error(`[Stock] Cache revalidation failed: ${err}`)
  }
}

async function deductStockForOrder(
  payload: any,
  req: any,
  doc: any,
  ledgerType: 'committed' | 'reserved',
): Promise<void> {
  const orderId = doc.id
  const orderNumber = doc.orderNumber
  const byProduct = groupItemsByProduct((doc?.items || []) as any[])

  for (const [pidStr, productItems] of byProduct) {
    const pid = /^\d+$/.test(pidStr) ? Number(pidStr) : pidStr
    const product = await payload.findByID({
      collection: 'products',
      id: pid,
      overrideAccess: true,
      depth: 0,
      req,
    })
    if (!product) {
      throw new Error(`Product ${pid} not found for order ${orderNumber}`)
    }

    const update = applyStockDecrement(product, productItems)
    if (!update) {
      throw new Error(
        `No decrement computed for product ${pid} (order ${orderNumber})`,
      )
    }

    const totalQty = productItems.reduce((sum, i) => sum + (i.quantity || 0), 0)

    // Atomic conditional update. Only guard on tracked quantity when the
    // update actually changes stock (purchaseCount-only updates skip the
    // guard so non-tracked products are not blocked).
    const touchesStock =
      update.quantity !== undefined || update.colorVariants !== undefined
    const where: Record<string, any> = { id: { equals: pid } }
    if (touchesStock && totalQty > 0) {
      where.and = [{ quantity: { greater_than_equal: totalQty } }]
    }

    const res = await payload.update({
      collection: 'products',
      where,
      data: update,
      limit: 1,
      overrideAccess: true,
      req,
    })

    if (!res.docs || res.docs.length === 0) {
      throw new Error(
        `Insufficient stock for product ${pid}. Cannot fulfill ${totalQty} units.`,
      )
    }

    const updated = res.docs[0]
    const variant =
      productItems.length === 1 ? (productItems[0].color ?? null) : null

    await writeStockMovement(payload, req, {
      product: pid,
      variant,
      order: orderId,
      type: ledgerType,
      delta: -totalQty,
      quantityAfter: updated?.quantity ?? undefined,
    })
    invalidateProductPages(payload, updated)
  }
}

async function restoreStockForOrder(
  payload: any,
  req: any,
  doc: any,
  ledgerType: 'restored' | 'released',
): Promise<void> {
  const orderId = doc.id
  const orderNumber = doc.orderNumber
  const byProduct = groupItemsByProduct((doc?.items || []) as any[])

  for (const [pidStr, productItems] of byProduct) {
    const pid = /^\d+$/.test(pidStr) ? Number(pidStr) : pidStr
    const product = await payload.findByID({
      collection: 'products',
      id: pid,
      overrideAccess: true,
      depth: 0,
      req,
    })

    // For restores, if product is deleted, we just skip. We shouldn't block order cancellation.
    if (!product) {
      payload.logger.warn(
        `[Stock] Product ${pid} not found for restore (order ${orderNumber}). Skipping.`,
      )
      continue
    }

    const update = applyStockRestore(product, productItems)
    if (!update) {
      payload.logger.warn(
        `[Stock] No restore computed for product ${pid} (order ${orderNumber}). Skipping.`,
      )
      continue
    }

    const totalQty = productItems.reduce((sum, i) => sum + (i.quantity || 0), 0)

    const res = await payload.update({
      collection: 'products',
      where: { id: { equals: pid } },
      data: update,
      limit: 1,
      overrideAccess: true,
      req,
    })

    if (!res.docs || res.docs.length === 0) {
      payload.logger.error(
        `[Stock] Failed to restore stock for product ${pid}.`,
      )
      continue
    }

    const updated = res.docs[0]
    const variant =
      productItems.length === 1 ? (productItems[0].color ?? null) : null

    await writeStockMovement(payload, req, {
      product: pid,
      variant,
      order: orderId,
      type: ledgerType,
      delta: totalQty,
      quantityAfter: updated?.quantity ?? undefined,
    })
    invalidateProductPages(payload, updated)
  }
}

/**
 * Synchronous, idempotent inventory transactions keyed off the order status
 * transition. Awaited inside `afterChange` — never fire-and-forget — so a
 * stock failure surfaces in the request and logs.
 */
async function runStockTransactions(
  payload: any,
  req: any,
  doc: any,
  prevStatus: string | null,
  newStatus: string,
): Promise<void> {
  const isCreate = prevStatus === null
  const wasHeld = Boolean(doc?.stockDeducted)

  // Commit on confirmation (prepaid orders are created confirmed; legacy COD
  // orders are committed the first time they are confirmed).
  if (newStatus === 'confirmed' && prevStatus !== 'confirmed' && !wasHeld) {
    await deductStockForOrder(payload, req, doc, 'committed')
    await payload.update({
      collection: 'orders',
      id: String(doc.id),
      data: { stockDeducted: true },
      overrideAccess: true,
      req,
    })
  }
  // Reserve on order creation for COD (status `pending`) — closes the
  // oversell window between checkout and admin confirmation. Stock is held
  // here and released if the order is cancelled before confirmation.
  else if (isCreate && newStatus === 'pending' && !wasHeld) {
    await deductStockForOrder(payload, req, doc, 'reserved')
    await payload.update({
      collection: 'orders',
      id: String(doc.id),
      data: { stockDeducted: true },
      overrideAccess: true,
      req,
    })
  }
  // Release / restore on cancellation or refund. Works for both reserved
  // (pending → cancelled) and committed (confirmed → cancelled) orders.
  else if (
    (newStatus === 'cancelled' || newStatus === 'refunded') &&
    wasHeld &&
    !doc?.stockRestored
  ) {
    const wasConfirmed = Boolean(doc?.confirmedAt)
    await restoreStockForOrder(
      payload,
      req,
      doc,
      wasConfirmed ? 'restored' : 'released',
    )
    await payload.update({
      collection: 'orders',
      id: String(doc.id),
      data: { stockRestored: true },
      overrideAccess: true,
      req,
    })
  }
}

/**
 * Runs email, webhook, and event-log side-effects for a status transition.
 * Kept background (Next.js `after`) — these must never block the order save.
 */
async function runOrderNotifications(
  payload: any,
  docId: string,
  orderId: string,
  prevStatus: string | null,
  newStatus: string,
): Promise<void> {
  try {
    await sendOrderStatusEmails(payload, docId, newStatus).catch((err) => {
      payload.logger.error(`[Email] sendOrderStatusEmails failed: ${err}`)
    })
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
    defaultColumns: [
      'orderNumber',
      'customerEmail',
      'paymentMethod',
      'status',
      'total',
      'fulfilmentPanel',
      'updatedAt',
    ],
  },
  access: {
    read: () => true, // Allow all reads (admin panel is already protected by auth)
    create: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
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
        const payload = req.payload
        payload.logger.info(
          `[Email] afterChange triggered — operation=${operation} docId=${(doc as any)?.id}`,
        )

        if (operation === 'create') {
          const docId = (doc as Record<string, unknown>).id as string
          const initialStatus = (doc as Record<string, unknown>).status as
            | string
            | undefined

          // Synchronous stock transaction at order creation:
          //   - prepaid (`confirmed`) → commit inventory immediately
          //   - COD (`pending`)      → reserve inventory immediately, so the
          //     product stops being shown as available while the order awaits
          //     admin confirmation (closes the COD oversell window).
          // Awaited so the checkout response never returns before inventory is
          // held — eliminating the fire-and-forget failure mode.
          if (
            docId &&
            (initialStatus === 'confirmed' || initialStatus === 'pending')
          ) {
            await runStockTransactions(
              payload,
              req,
              doc,
              null,
              initialStatus as string,
            )
          }

          if (docId) {
            const backgroundTask = async () => {
              await sendOrderPlacedEmails(
                payload,
                String(docId),
                doc as Record<string, unknown>,
              ).catch((err) =>
                payload.logger.error(
                  `[Email] sendOrderPlacedEmails failed: ${err}`,
                ),
              )

              if (initialStatus && initialStatus !== 'pending') {
                const orderId = (doc as Record<string, unknown>)
                  .orderNumber as string
                await runOrderNotifications(
                  payload,
                  docId,
                  orderId,
                  null,
                  initialStatus,
                )
              }
            }

            try {
              const { after } = await import('next/server')
              after(backgroundTask)
            } catch {
              void backgroundTask()
            }
          }
          return doc
        }

        if (operation !== 'update') return doc

        const prevStatus = (previousDoc as Record<string, unknown> | undefined)
          ?.status as string | undefined
        const newStatus = (doc as Record<string, unknown>).status as
          | string
          | undefined

        if (!newStatus || prevStatus === newStatus) return doc

        const docId = (doc as Record<string, unknown>).id as string
        const orderId = (doc as Record<string, unknown>).orderNumber as string

        // Synchronous inventory commit/restore — awaited so failures are visible.
        await runStockTransactions(
          payload,
          req,
          doc,
          prevStatus ?? null,
          newStatus,
        )

        const backgroundTask = async () => {
          await runOrderNotifications(
            payload,
            docId,
            orderId,
            prevStatus ?? null,
            newStatus,
          )
        }

        try {
          const { after } = await import('next/server')
          after(backgroundTask)
        } catch {
          void backgroundTask()
        }

        return doc
      },
    ],
  },
  endpoints: [
    {
      path: '/:id/delhivery/ship',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: 'Unauthorized' }, { status: 403 })
        }
        const orderId = req.routeParams?.id as string
        if (!orderId) {
          return Response.json({ error: 'Missing order id' }, { status: 400 })
        }
        try {
          const result = await shipOrderWithDelhivery(req.payload, orderId)
          if (!result.ok) {
            return Response.json(
              { error: result.reason },
              { status: result.status },
            )
          }
          return Response.json(result)
        } catch (error) {
          req.payload.logger.error(
            `[Delhivery] ship failed for order ${orderId}: ${error}`,
          )
          return Response.json({ error: 'Internal error' }, { status: 500 })
        }
      },
    },
    {
      path: '/:id/delhivery/label',
      method: 'get',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: 'Unauthorized' }, { status: 403 })
        }
        const orderId = req.routeParams?.id as string
        if (!orderId) {
          return Response.json({ error: 'Missing order id' }, { status: 400 })
        }
        try {
          const order = await req.payload.findByID({
            collection: 'orders',
            id: orderId,
            depth: 0,
          })
          const waybill = (order as any)?.delhivery?.waybill as
            | string
            | undefined
          if (!waybill) {
            return Response.json(
              { error: 'Order has no Delhivery waybill' },
              { status: 400 },
            )
          }
          const { pdfUrl } = await generateLabel(waybill)
          await req.payload.update({
            collection: 'orders',
            id: orderId,
            data: { delhivery: { labelUrl: pdfUrl } },
          })
          return Response.json({ ok: true, labelUrl: pdfUrl })
        } catch (error) {
          req.payload.logger.error(
            `[Delhivery] label failed for order ${orderId}: ${error}`,
          )
          return Response.json({ error: 'Internal error' }, { status: 500 })
        }
      },
    },
    {
      path: '/:id/delhivery/pickup',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: 'Unauthorized' }, { status: 403 })
        }
        const orderId = req.routeParams?.id as string
        if (!orderId) {
          return Response.json({ error: 'Missing order id' }, { status: 400 })
        }
        try {
          const body = (await req.json?.()) ?? {}
          const { pickupDate, pickupTime } = nextPickupSlotIST()
          const settings = await getDelhiverySettings(req.payload)
          const response = await createPickupRequest({
            pickupTime: body.pickupTime ?? pickupTime,
            pickupDate: body.pickupDate ?? pickupDate,
            expectedPackageCount: Number(body.expectedPackageCount ?? 1),
            pickupLocation: settings.pickupLocation,
          })
          if (response.pickupRequestId) {
            await req.payload.update({
              collection: 'orders',
              id: orderId,
              data: {
                delhivery: { pickupRequestId: response.pickupRequestId },
              },
            })
          }
          return Response.json({ ok: true, ...response })
        } catch (error: any) {
          if (String(error?.message ?? '').includes('open')) {
            return Response.json(
              { error: 'A pickup request is already open for this location' },
              { status: 409 },
            )
          }
          req.payload.logger.error(
            `[Delhivery] pickup failed for order ${orderId}: ${error}`,
          )
          return Response.json({ error: 'Internal error' }, { status: 500 })
        }
      },
    },
    {
      path: '/:id/delhivery/track',
      method: 'get',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: 'Unauthorized' }, { status: 403 })
        }
        const orderId = req.routeParams?.id as string
        if (!orderId) {
          return Response.json({ error: 'Missing order id' }, { status: 400 })
        }
        try {
          const order = await req.payload.findByID({
            collection: 'orders',
            id: orderId,
            depth: 0,
          })
          const waybill = (order as any)?.delhivery?.waybill as
            | string
            | undefined
          if (!waybill) {
            return Response.json(
              { error: 'Order has no Delhivery waybill' },
              { status: 400 },
            )
          }
          const tracking = await trackShipment(waybill)
          const latestStatus = tracking?.shipments?.[0]?.Shipment_Status
          if (latestStatus) {
            await req.payload.update({
              collection: 'orders',
              id: orderId,
              data: { delhivery: { status: latestStatus } },
            })
          }
          return Response.json({ ok: true, status: latestStatus, ...tracking })
        } catch (error) {
          req.payload.logger.error(
            `[Delhivery] track failed for order ${orderId}: ${error}`,
          )
          return Response.json({ error: 'Internal error' }, { status: 500 })
        }
      },
    },
    {
      path: '/:id/delhivery/sync',
      method: 'post',
      handler: async (req) => {
        if (!req.user) {
          return Response.json({ error: 'Unauthorized' }, { status: 403 })
        }
        const orderId = req.routeParams?.id as string
        if (!orderId) {
          return Response.json({ error: 'Missing order id' }, { status: 400 })
        }
        try {
          const order = await req.payload.findByID({
            collection: 'orders',
            id: orderId,
            depth: 0,
          })
          const waybill = (order as any)?.delhivery?.waybill as
            | string
            | undefined
          if (!waybill) {
            return Response.json(
              { error: 'Order has no Delhivery waybill' },
              { status: 400 },
            )
          }
          const tracking = await trackShipment(waybill)
          const latestStatus = tracking?.shipments?.[0]?.Shipment_Status
          if (!latestStatus) {
            return Response.json({ ok: true, action: 'none' })
          }
          const mapped = mapScanToOrderStatus({
            status_type: 'DL',
            status: latestStatus,
          })
          if (mapped.action === 'update' && order.status !== mapped.status) {
            await req.payload.update({
              collection: 'orders',
              id: orderId,
              data: {
                status: mapped.status,
                delhivery: { status: latestStatus },
              },
            })
          }
          return Response.json({ ok: true, action: mapped.action })
        } catch (error) {
          req.payload.logger.error(
            `[Delhivery] sync failed for order ${orderId}: ${error}`,
          )
          return Response.json({ error: 'Internal error' }, { status: 500 })
        }
      },
    },
  ],
  fields: [
    {
      name: 'fulfilmentPanel',
      label: 'Fulfilment',
      type: 'ui',
      admin: {
        position: 'sidebar',
        components: {
          Field:
            '@/components/payload/OrderFulfilmentPanel#OrderFulfilmentPanel',
          Cell: '@/components/payload/OrderFulfilmentCell#OrderFulfilmentCell',
        },
      },
    },
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
      name: 'codFee',
      type: 'number',
      label: 'COD Fee',
      min: 0,
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Cash on Delivery fee charged at checkout.',
      },
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
      name: 'coupon',
      type: 'relationship',
      relationTo: 'coupons',
      admin: {
        description: 'The coupon applied to this order',
      },
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
      admin: {
        hidden: true,
      },
    },
    {
      name: 'paymentMethod',
      label: 'Payment',
      type: 'ui',
      admin: {
        components: {
          Cell: '@/components/payload/OrderPaymentMethodCell#OrderPaymentMethodCell',
        },
      },
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
      admin: {
        readOnly: true,
        description: 'Set when status changes to confirmed',
      },
    },
    {
      name: 'shippedAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Set when status changes to shipped',
      },
    },
    {
      name: 'deliveredAt',
      type: 'date',
      admin: {
        readOnly: true,
        description: 'Set when status changes to delivered',
      },
    },
    {
      name: 'stockDeducted',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        hidden: true,
        description:
          'Idempotency guard — true once inventory has been held for this order (reserved on COD creation, committed on confirmation).',
      },
    },
    {
      name: 'stockRestored',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        hidden: true,
        description:
          'Idempotency guard — true once held inventory has been released/restored after cancellation/refund.',
      },
    },
    {
      name: 'trackingId',
      type: 'text',
      label: 'Tracking Number',
      admin: {
        description:
          'Enter tracking ID from shipping provider (e.g. Shiprocket, Delhivery, India Post)',
      },
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
      name: 'delhivery',
      type: 'group',
      admin: {
        description:
          'Delhivery fulfilment details (managed by the ship endpoint)',
      },
      fields: [
        {
          name: 'waybill',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Delhivery waybill / AWB number',
          },
        },
        {
          name: 'status',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Last known Delhivery scan status',
          },
        },
        {
          name: 'labelUrl',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'URL of the generated shipping label PDF',
          },
        },
        {
          name: 'pickupRequestId',
          type: 'text',
          admin: {
            readOnly: true,
            description: 'Delhivery pickup request id',
          },
        },
        {
          name: 'manifestResponse',
          type: 'json',
          admin: {
            readOnly: true,
            description: 'Raw create.json response for debugging',
          },
        },
        {
          name: 'shippedViaDelhivery',
          type: 'checkbox',
          admin: {
            readOnly: true,
            description: 'Set when the order was manifested with Delhivery',
          },
        },
      ],
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
          name: 'productCode',
          type: 'text',
          admin: {
            readOnly: true,
            description:
              'Product code snapshot at purchase time for unique identification',
          },
        },
        {
          name: 'variant',
          type: 'relationship',
          relationTo: 'variants',
          admin: {
            hidden: true,
            description: 'Legacy — superseded by color/colorName',
          },
        },
        {
          name: 'color',
          type: 'relationship',
          relationTo: 'colors',
          admin: {
            description: 'Color variant purchased',
          },
        },
        {
          name: 'colorName',
          type: 'text',
          admin: {
            description: 'Color name snapshot at purchase time',
          },
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
