export const DELHIVERY_TRACK_URL = 'https://www.delhivery.com/track/package/'
export const EWAYBILL_THRESHOLD_RUPEES = 50000

export type ShipEligibilityInput = {
  status?: string | null
  paymentId?: string | null
  total?: number | null
  fullName?: string | null
  phone?: string | null
  line1?: string | null
  pincode?: string | null
}

export type ShipEligibility = { canShip: boolean; reason?: string }

export function getShipEligibility(
  input: ShipEligibilityInput,
): ShipEligibility {
  const status = input.status?.trim() ?? ''
  const paymentId = input.paymentId?.trim() ?? ''
  const total = input.total ?? 0

  if (status !== 'confirmed') {
    return {
      canShip: false,
      reason: `Order must be Confirmed before shipping (current: ${status || '—'}). Save the status change, then ship.`,
    }
  }
  if (!paymentId || paymentId === 'COD') {
    return {
      canShip: false,
      reason:
        'Prepaid only — Delhivery shipping is unavailable for COD orders.',
    }
  }
  if (total >= EWAYBILL_THRESHOLD_RUPEES) {
    return {
      canShip: false,
      reason:
        'Order total is ₹50,000 or more — manifest it via Delhivery One Panel (ewaybill applies).',
    }
  }

  const fullName = input.fullName?.trim() ?? ''
  const phone = input.phone?.trim() ?? ''
  const line1 = input.line1?.trim() ?? ''
  const pincode = input.pincode?.trim() ?? ''
  if (!fullName || !phone || !line1 || !pincode) {
    return {
      canShip: false,
      reason:
        'Shipping address incomplete — fill full name, phone, line 1 and pincode first.',
    }
  }

  return { canShip: true }
}

export function shipEligibilityForOrder(
  order: Record<string, unknown> | null | undefined,
): ShipEligibility {
  if (!order) return { canShip: false, reason: 'Order not found' }
  const address = (order.shippingAddress ?? {}) as Record<string, unknown>
  return getShipEligibility({
    status: typeof order.status === 'string' ? order.status : null,
    paymentId: typeof order.paymentId === 'string' ? order.paymentId : null,
    total: typeof order.total === 'number' ? order.total : null,
    fullName: typeof address.fullName === 'string' ? address.fullName : null,
    phone: typeof address.phone === 'string' ? address.phone : null,
    line1: typeof address.line1 === 'string' ? address.line1 : null,
    pincode: typeof address.pincode === 'string' ? address.pincode : null,
  })
}
