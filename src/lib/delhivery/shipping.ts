import { delhiveryFetch } from './client'
import type {
  PincodeServiceabilityResponse,
  ShipmentRequest,
  ShipmentResponse,
  WaybillResponse,
} from './types'

export async function pincodeServiceability(
  pincodes: string[],
): Promise<PincodeServiceabilityResponse> {
  if (pincodes.length === 0) {
    throw new Error('At least one pincode is required')
  }
  return delhiveryFetch<PincodeServiceabilityResponse>(
    `/c/api/pin-codes/json/?filter_codes=${pincodes.join(',')}`,
  )
}

export async function fetchWaybill(count = 1): Promise<string[]> {
  if (count < 1) {
    throw new Error('Waybill count must be at least 1')
  }
  const res = await delhiveryFetch<WaybillResponse>(
    `/waybill/api/bulk/json/?count=${count}`,
  )
  if (typeof res === 'string') {
    return res
      .split(',')
      .map((w) => w.trim())
      .filter(Boolean)
  }
  if (Array.isArray(res)) {
    return res.map(String)
  }
  const list = Array.isArray(res?.data) ? res.data : []
  return list.map(String)
}

export async function createShipment(
  shipment: ShipmentRequest,
): Promise<ShipmentResponse> {
  const body = new URLSearchParams({
    format: 'json',
    data: JSON.stringify({ shipments: [shipment] }),
  })
  return delhiveryFetch<ShipmentResponse>('/api/cmu/create.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
}
