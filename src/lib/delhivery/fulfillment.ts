import { delhiveryFetch } from './client'
import { getDelhiveryConfig } from './config'
import type { PickupRequestResponse, TrackingResponse } from './types'

export type LabelSize = '4R' | 'A4'

export interface LabelPackage {
  pdf_download_link?: string
  link?: string
  pdf_url?: string
}

export interface LabelResponse {
  link?: string
  pdf_url?: string
  files?: { link?: string; pdf_url?: string }[]
  packages?: LabelPackage[]
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
  if (fromFiles) return fromFiles.link ?? fromFiles.pdf_url
  const fromPackages = res?.packages?.find(
    (p) => p.pdf_download_link || p.link || p.pdf_url,
  )
  return (
    fromPackages?.pdf_download_link ??
    fromPackages?.link ??
    fromPackages?.pdf_url
  )
}

export interface PickupRequestInput {
  pickupTime: string
  pickupDate: string
  expectedPackageCount: number
}

export function nextPickupSlotIST(): {
  pickupDate: string
  pickupTime: string
} {
  const later = new Date(Date.now() + 60 * 60 * 1000)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(later)
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '00'
  return {
    pickupDate: `${get('year')}-${get('month')}-${get('day')}`,
    pickupTime: `${get('hour')}:00:00`,
  }
}

export function defaultPickupSlotIST(): {
  pickupDate: string
  pickupTime: string
} {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(tomorrow)
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? '00'
  return {
    pickupDate: `${get('year')}-${get('month')}-${get('day')}`,
    pickupTime: '10:00:00',
  }
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
  const id = res?.pickup_id ?? res?.pickup_request_id
  return { pickupRequestId: id != null ? String(id) : undefined }
}

export async function trackShipment(
  waybill: string,
): Promise<TrackingResponse> {
  return delhiveryFetch<TrackingResponse>(
    `/api/v1/packages/json/?waybill=${encodeURIComponent(waybill)}`,
  )
}
