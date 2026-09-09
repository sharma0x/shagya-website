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
  if ((type === 'DL' && status === 'RTO') || type === 'CN') {
    return { action: 'update', status: 'cancelled' }
  }
  if (type === 'UD' && SHIPPED_STATUSES.has(status)) {
    return { action: 'update', status: 'shipped' }
  }
  return { action: 'none' }
}

export function normaliseScan(raw: unknown): DelhiveryScan {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error('Invalid webhook payload: expected a JSON object')
  }
  const body = raw as Record<string, any>
  const data =
    typeof body.data === 'object' && body.data !== null
      ? (body.data as Record<string, any>)
      : null

  return {
    status_type: firstDefined(data?.status_type, body.status_type),
    status: firstDefined(data?.status, body.status),
    description: firstDefined(data?.description, body.description),
    scanned_date: firstDefined(data?.scanned_date, body.scanned_date),
    waybill: firstDefined(data?.waybill, data?.AWB, body.waybill, body.AWB),
    order_id: firstDefined(data?.order_id, body.order_id),
  }
}

function firstDefined(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value
    if (typeof value === 'number') return String(value)
  }
  return undefined
}
