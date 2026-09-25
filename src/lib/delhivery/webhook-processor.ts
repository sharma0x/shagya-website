import type { Payload } from 'payload'
import {
  mapScanToOrderStatus,
  normaliseScan,
  shouldApplyOrderStatusUpdate,
} from './mapping'
import type { DelhiveryScan } from './types'

export interface WebhookOutcome {
  action: 'none' | 'update' | 'orphan'
  message: string
}

export async function processDelhiveryWebhook(
  payload: Payload,
  rawBody: string,
): Promise<WebhookOutcome> {
  const scan = normaliseScan(JSON.parse(rawBody))
  const mapped = mapScanToOrderStatus(scan)

  if (!scan.waybill) {
    await logWebhookEvent(payload, 'delhivery.webhook', scan, {
      note: 'no waybill in payload',
    })
    return { action: 'none', message: 'no waybill in payload' }
  }

  const { docs } = await payload.find({
    collection: 'orders',
    where: { 'delhivery.waybill': { equals: scan.waybill } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })

  const order = docs[0] as (typeof docs)[number] & {
    status?: string
    orderNumber?: string
  }

  if (!order) {
    await logWebhookEvent(payload, 'delhivery.webhook_orphan', scan, {
      note: 'no order matches waybill',
    })
    return { action: 'orphan', message: 'no order matches waybill' }
  }

  if (
    mapped.action === 'update' &&
    shouldApplyOrderStatusUpdate(order.status, mapped.status)
  ) {
    await payload.update({
      collection: 'orders',
      id: String(order.id),
      overrideAccess: true,
      data: {
        status: mapped.status,
        delhivery: { status: scan.status ?? '' },
      },
    })
  }

  await logWebhookEvent(payload, 'delhivery.webhook', scan, {
    mapped,
    orderId: order.orderNumber,
  })

  return {
    action: mapped.action,
    message: `scan ${scan.status_type}/${scan.status} -> ${mapped.action}`,
  }
}

async function logWebhookEvent(
  payload: Payload,
  event: string,
  scan: object,
  extra: Record<string, unknown>,
): Promise<void> {
  try {
    await payload.create({
      collection: 'event-logs',
      data: {
        event,
        orderId:
          (extra.orderId as string) ?? (scan as DelhiveryScan).waybill ?? '',
        payload: { ...(scan as Record<string, unknown>), ...extra },
      },
      overrideAccess: true,
    })
  } catch {
    // audit failure must not mask the webhook result
  }
}
