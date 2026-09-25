import type { DelhiveryScan } from './types'

export type MappedOrderStatus = 'shipped' | 'delivered' | 'cancelled'

export type MappedTarget =
  | { action: 'none' }
  | { action: 'update'; status: MappedOrderStatus }

const SHIPPED_STATUSES = new Set(['IN TRANSIT', 'PENDING', 'DISPATCHED'])

export function mapScanToOrderStatus(scan: DelhiveryScan): MappedTarget {
  const type = (scan.status_type ?? '').toUpperCase()
  const status = (scan.status ?? '').toUpperCase()

  if (type === 'DL' && status === 'DELIVERED') {
    return { action: 'update', status: 'delivered' }
  }
  if (type === 'CN') {
    return { action: 'update', status: 'cancelled' }
  }
  if (type === 'UD' && SHIPPED_STATUSES.has(status)) {
    return { action: 'update', status: 'shipped' }
  }
  return { action: 'none' }
}

export function shouldApplyOrderStatusUpdate(
  currentStatus: string | null | undefined,
  nextStatus: MappedOrderStatus,
): boolean {
  if (currentStatus === nextStatus) return false
  if (currentStatus === 'delivered') return false
  if (currentStatus === 'cancelled' || currentStatus === 'refunded') {
    return false
  }
  return true
}

export function normaliseScan(raw: unknown): DelhiveryScan {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    throw new Error('Invalid webhook payload: expected a JSON object')
  }
  const body = raw as Record<string, any>
  const data =
    typeof body.data === 'object' && body.data !== null
      ? (body.data as Record<string, any>)
      : null
  const shipmentData = Array.isArray(body.ShipmentData)
    ? body.ShipmentData[0]
    : undefined
  const shipment =
    body.Shipment ??
    body.shipment ??
    shipmentData?.Shipment ??
    shipmentData?.shipment
  const shipmentStatus = shipment?.Status ?? shipment?.status
  const scanDetail =
    shipment?.Scans?.[0]?.ScanDetail ??
    shipment?.scans?.[0]?.scanDetail ??
    body.ScanDetail ??
    body.scanDetail
  const status = shipmentStatus ?? scanDetail

  return {
    status_type: firstDefined(
      data?.status_type,
      data?.StatusType,
      status?.StatusType,
      status?.status_type,
      status?.ScanType,
      status?.scan_type,
      body.status_type,
      body.StatusType,
    ),
    status: firstDefined(
      data?.status,
      data?.Status,
      status?.Status,
      status?.status,
      status?.Scan,
      status?.scan,
      body.status,
      body.Status,
    ),
    description: firstDefined(
      data?.description,
      data?.Instructions,
      status?.Instructions,
      status?.description,
      body.description,
    ),
    scanned_date: firstDefined(
      data?.scanned_date,
      data?.StatusDateTime,
      status?.StatusDateTime,
      status?.scanned_date,
      status?.ScanDateTime,
      status?.scan_date_time,
      body.scanned_date,
      body.StatusDateTime,
    ),
    waybill: firstDefined(
      data?.waybill,
      data?.AWB,
      shipment?.AWB,
      shipment?.awb,
      body.waybill,
      body.AWB,
    ),
    order_id: firstDefined(
      data?.order_id,
      data?.ReferenceNo,
      shipment?.ReferenceNo,
      body.order_id,
      body.ReferenceNo,
    ),
  }
}

function firstDefined(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value
    if (typeof value === 'number') return String(value)
  }
  return undefined
}
