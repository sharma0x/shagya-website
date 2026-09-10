import type { Payload } from 'payload'
import { DelhiveryError } from './client'
import { getDelhiveryConfig, type DelhiveryConfig } from './config'
import { createShipment, fetchWaybill } from './shipping'
import type { ShipmentRequest } from './types'

const DEFAULT_UNIT_WEIGHT_GRAMS = 500
const EWAYBILL_THRESHOLD_RUPEES = 50000
const MAX_PRODUCTS_DESC_LENGTH = 200

export interface ShipOrderItem {
  product?: { name?: string; title?: string } | string | number | null
  quantity?: number
}

export interface ShipOrderAddress {
  fullName?: string
  phone?: string
  line1?: string
  line2?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
}

export interface ShipOrderInput {
  id: string | number
  orderNumber: string
  status: string
  paymentId?: string | null
  total: number
  shippingAddress?: ShipOrderAddress | null
  items?: ShipOrderItem[] | null
  delhivery?: { waybill?: string } | null
}

export type ShipOrderResult =
  | { ok: true; orderId: string; orderNumber: string; waybill: string }
  | { ok: false; reason: string; status: number }

export function buildShipmentRequest(
  order: ShipOrderInput,
  waybill: string,
  config: DelhiveryConfig,
): ShipmentRequest {
  const address = order.shippingAddress
  const line2 = address?.line2?.trim()
  const add = [address?.line1?.trim(), line2].filter(Boolean).join(' ')
  const quantity = (order.items ?? []).reduce(
    (sum, item) => sum + (item.quantity ?? 1),
    0,
  )
  const weight = (order.items ?? []).reduce(
    (sum, item) => sum + (item.quantity ?? 1) * DEFAULT_UNIT_WEIGHT_GRAMS,
    0,
  )
  const descriptions = (order.items ?? [])
    .map((item) => {
      const product = item.product
      const name =
        typeof product === 'object' && product !== null
          ? (product.name ?? product.title ?? 'Item')
          : 'Item'
      return `${name} x${item.quantity ?? 1}`
    })
    .join(', ')
  const productsDesc = descriptions.slice(0, MAX_PRODUCTS_DESC_LENGTH)

  return {
    name: address?.fullName?.trim() ?? '',
    order: order.orderNumber,
    phone: address?.phone?.trim() ?? '',
    add,
    pin: address?.pincode?.trim() ?? '',
    city: address?.city?.trim() ?? '',
    state: address?.state?.trim() ?? '',
    country: address?.country?.trim() || 'India',
    payment_mode: 'Prepaid',
    pickup_location: config.pickupLocation,
    weight,
    quantity,
    total_amount: order.total,
    products_desc: productsDesc,
    seller_name: config.sellerName,
    seller_add: config.sellerAddress,
    seller_phone: config.sellerPhone,
    seller_email: config.sellerEmail || undefined,
    return_name: config.sellerName,
    return_add: config.sellerAddress,
    return_city: 'Mumbai',
    return_state: 'Maharashtra',
    return_pin: config.pickupPin,
    return_phone: config.sellerPhone,
    waybill,
    cod_amount: 0,
  }
}

export async function shipOrderWithDelhivery(
  payload: Payload,
  orderId: string,
): Promise<ShipOrderResult> {
  const order = (await payload.findByID({
    collection: 'orders',
    id: orderId,
    depth: 1,
    overrideAccess: true,
  })) as ShipOrderInput | null

  if (!order) return { ok: false, reason: 'Order not found', status: 404 }

  const guard = validateOrderForShipment(order)
  if (!guard.ok) return guard

  const config = getDelhiveryConfig()
  const [waybill] = await fetchWaybill(1)
  if (!waybill) {
    return {
      ok: false,
      reason: 'No waybill returned by Delhivery',
      status: 502,
    }
  }

  const shipment = buildShipmentRequest(order, waybill, config)

  let response
  try {
    response = await createShipment(shipment)
  } catch (error) {
    const reason =
      error instanceof DelhiveryError
        ? `Delhivery manifest failed (${error.status}): ${error.body}`
        : 'Delhivery manifest failed'
    await logShipmentFailure(payload, order, reason)
    return { ok: false, reason, status: 502 }
  }

  const failedPackages = (response?.packages ?? []).filter(
    (pkg) => (pkg.status ?? '').toLowerCase() === 'fail',
  )
  if (response?.success === false || failedPackages.length > 0) {
    const remarks = failedPackages.flatMap((pkg) => pkg.remarks ?? [])
    const reason =
      remarks.join('; ') || response?.rmk || 'Delhivery rejected the shipment'
    await logShipmentFailure(
      payload,
      order,
      `Delhivery manifest failed: ${reason}`,
    )
    return { ok: false, reason, status: 502 }
  }

  const returnedWaybill =
    response?.packages?.[0]?.waybill ||
    response?.shipments?.[0]?.waybill ||
    waybill
  const orderIdValue = String(order.id)

  await payload.update({
    collection: 'orders',
    id: orderIdValue,
    data: {
      status: 'shipped',
      trackingId: returnedWaybill,
      trackingUrl: `https://www.delhivery.com/track/package/${returnedWaybill}`,
      delhivery: {
        waybill: returnedWaybill,
        status: 'Manifested',
        shippedViaDelhivery: true,
        manifestResponse: response as unknown as Record<string, unknown>,
      },
    },
  })

  await payload.create({
    collection: 'event-logs',
    data: {
      event: 'order.shipped_via_delhivery',
      orderId: order.orderNumber,
      status: 'shipped',
      payload: { orderId: orderIdValue, waybill: returnedWaybill },
      response: response as unknown as Record<string, unknown>,
    },
    overrideAccess: true,
  })

  return {
    ok: true,
    orderId: orderIdValue,
    orderNumber: order.orderNumber,
    waybill: returnedWaybill,
  }
}

function validateOrderForShipment(
  order: ShipOrderInput,
): ShipOrderResult | { ok: true } {
  if (order.status !== 'confirmed') {
    return {
      ok: false,
      reason: `Order must be confirmed before shipping (current: ${order.status})`,
      status: 400,
    }
  }
  if (!order.paymentId || order.paymentId === 'COD') {
    return {
      ok: false,
      reason: 'Only prepaid orders can be shipped with Delhivery',
      status: 400,
    }
  }
  if (order.total >= EWAYBILL_THRESHOLD_RUPEES) {
    return {
      ok: false,
      reason: 'Ewaybill required — manifest via One Panel',
      status: 400,
    }
  }
  if (order.delhivery?.waybill) {
    return {
      ok: false,
      reason: 'Order already has a Delhivery waybill',
      status: 400,
    }
  }
  const address = order.shippingAddress
  if (
    !address?.fullName ||
    !address?.phone ||
    !address?.line1 ||
    !address?.pincode
  ) {
    return { ok: false, reason: 'Shipping address is incomplete', status: 400 }
  }
  return { ok: true }
}

async function logShipmentFailure(
  payload: Payload,
  order: ShipOrderInput,
  reason: string,
): Promise<void> {
  try {
    await payload.create({
      collection: 'event-logs',
      data: {
        event: 'delhivery.ship_failed',
        orderId: order.orderNumber,
        status: order.status,
        payload: { orderId: String(order.id), reason },
      },
      overrideAccess: true,
    })
  } catch {
    // audit failure must not mask the original error
  }
}
