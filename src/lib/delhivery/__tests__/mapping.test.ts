import { describe, it, expect } from 'vitest'

// @vitest-environment node

import { mapScanToOrderStatus, normaliseScan } from '../mapping'

describe('mapScanToOrderStatus', () => {
  it.each([
    ['UD', 'MANIFESTED', 'none'],
    ['UD', 'NOT PICKED', 'none'],
    ['UD', 'IN TRANSIT', 'shipped'],
    ['UD', 'PENDING', 'shipped'],
    ['UD', 'DISPATCHED', 'shipped'],
    ['DL', 'DELIVERED', 'delivered'],
    ['DL', 'RTO', 'cancelled'],
    ['CN', 'CANCELED', 'cancelled'],
    ['CN', 'CLOSED', 'cancelled'],
    ['RT', 'IN TRANSIT', 'none'],
  ])('maps %s/%s to %s', (status_type, status, expected) => {
    const result = mapScanToOrderStatus({ status_type, status })
    if (expected === 'none') {
      expect(result.action).toBe('none')
      return
    }
    expect(result).toEqual({ action: 'update', status: expected })
  })

  it('is case-insensitive', () => {
    expect(
      mapScanToOrderStatus({ status_type: 'dl', status: 'delivered' }),
    ).toEqual({ action: 'update', status: 'delivered' })
  })

  it('ignores unknown status types', () => {
    expect(
      mapScanToOrderStatus({ status_type: 'XX', status: 'In Transit' }).action,
    ).toBe('none')
  })
})

describe('normaliseScan', () => {
  it('flattens nested data block', () => {
    const scan = normaliseScan({
      data: { waybill: '70351234567', status_type: 'UD', status: 'In Transit' },
    })
    expect(scan).toEqual(
      expect.objectContaining({
        waybill: '70351234567',
        status_type: 'UD',
        status: 'In Transit',
      }),
    )
  })

  it('reads top-level fields when data is absent', () => {
    const scan = normaliseScan({
      waybill: 'AWB-1',
      status_type: 'DL',
      status: 'Delivered',
    })
    expect(scan.waybill).toBe('AWB-1')
    expect(scan.status).toBe('Delivered')
  })

  it('prefers AWB key when waybill is missing', () => {
    const scan = normaliseScan({ AWB: 'AWB-2' })
    expect(scan.waybill).toBe('AWB-2')
  })

  it('throws on non-object payloads', () => {
    expect(() => normaliseScan('not-json-object')).toThrow(
      'Invalid webhook payload',
    )
    expect(() => normaliseScan(null)).toThrow('Invalid webhook payload')
  })
})
