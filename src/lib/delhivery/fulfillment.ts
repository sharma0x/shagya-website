import { delhiveryFetch } from './client'
import { getDelhiveryConfig } from './config'
import type { PickupRequestResponse, TrackingResponse } from './types'

export type LabelSize = '4R' | 'A4'

export interface LabelResponse {
  link?: string
  pdf_url?: string
  files?: { link?: string; pdf_url?: string }[]
}

export async function generateLabel(
  waybill: string,
  size: LabelSize = '4R',
): Promise<{ pdfUrl?: string }> {
  const res = await delhiveryFetch<LabelResponse | string>(
    `/api/p/packing_slip?wbns=${encodeURIComponent(waybill)}&pdf=true&pdf_size=${size}`,
  )
  return { pdfUrl: extractLabelUrl(res) }
}

function extractLabelUrl(
  res: LabelResponse | string | undefined,
): string | undefined {
  if (typeof res === 'string') return res.trim() || undefined
  const direct = res?.link ?? res?.pdf_url
  if (direct) return direct
  const fromFiles = res?.files?.find((f) => f.link || f.pdf_url)
  return fromFiles?.link ?? fromFiles?.pdf_url
}

export interface PickupRequestInput {
  pickupTime: string
  pickupDate: string
  expectedPackageCount: number
}

export async function createPickupRequest(
  input: PickupRequestInput,
): Promise<{ pickupRequestId?: string }> {
  if (input.expectedPackageCount < 1) {
    throw new Error('expectedPackageCount must be at least 1')
  }
  const config = getDelhiveryConfig()
  const res = await delhiveryFetch<PickupRequestResponse>('/fm/request/new/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pickup_time: input.pickupTime,
      pickup_date: input.pickupDate,
      pickup_location: config.pickupLocation,
      expected_package_count: input.expectedPackageCount,
    }),
  })
  return { pickupRequestId: res?.pickup_request_id }
}

export async function trackShipment(
  waybill: string,
): Promise<TrackingResponse> {
  return delhiveryFetch<TrackingResponse>(
    `/api/v1/packages/json/?waybill=${encodeURIComponent(waybill)}`,
  )
}
