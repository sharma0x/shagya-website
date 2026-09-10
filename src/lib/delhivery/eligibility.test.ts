import { describe, expect, it } from 'vitest'
import { getShipEligibility, shipEligibilityForOrder } from './eligibility'

const COMPLETE_INPUT = {
  status: 'confirmed',
  paymentId: 'pay_123',
  total: 1800,
  fullName: 'Aisha Khan',
  phone: '9876543210',
  line1: '12 Marine Drive',
  pincode: '400001',
}

describe('getShipEligibility', () => {
  it('allows a confirmed prepaid order with a complete address', () => {
    expect(getShipEligibility(COMPLETE_INPUT)).toEqual({ canShip: true })
  })

  it('requires the order to be confirmed', () => {
    const result = getShipEligibility({ ...COMPLETE_INPUT, status: 'pending' })
    expect(result.canShip).toBe(false)
    expect(result.reason).toMatch(/must be Confirmed before shipping/i)
  })

  it('rejects COD and missing payment ids', () => {
    expect(
      getShipEligibility({ ...COMPLETE_INPUT, paymentId: 'COD' }).canShip,
    ).toBe(false)
    expect(
      getShipEligibility({ ...COMPLETE_INPUT, paymentId: null }).canShip,
    ).toBe(false)
  })

  it('rejects totals at the ewaybill threshold', () => {
    const result = getShipEligibility({ ...COMPLETE_INPUT, total: 50000 })
    expect(result.canShip).toBe(false)
    expect(result.reason).toMatch(/One Panel/i)
  })

  it('rejects incomplete addresses', () => {
    const result = getShipEligibility({ ...COMPLETE_INPUT, pincode: '' })
    expect(result.canShip).toBe(false)
    expect(result.reason).toMatch(/incomplete/i)
  })
})

describe('shipEligibilityForOrder', () => {
  const ORDER = {
    id: 1,
    status: 'confirmed',
    paymentId: 'pay_123',
    total: 1800,
    shippingAddress: {
      fullName: 'Aisha Khan',
      phone: '9876543210',
      line1: '12 Marine Drive',
      pincode: '400001',
    },
  }

  it('reads eligibility from a raw order document', () => {
    expect(shipEligibilityForOrder(ORDER)).toEqual({ canShip: true })
  })

  it('handles missing nested address and null orders', () => {
    expect(
      shipEligibilityForOrder({ ...ORDER, shippingAddress: undefined }).canShip,
    ).toBe(false)
    expect(shipEligibilityForOrder(null).canShip).toBe(false)
  })
})
