import { describe, expect, it } from 'vitest'
import { COD_MAX_ORDER_TOTAL, isCodEligible } from './cod-eligibility'

describe('isCodEligible', () => {
  it('allows COD at the order limit', () => {
    expect(isCodEligible(COD_MAX_ORDER_TOTAL)).toBe(true)
  })

  it('rejects COD above the order limit', () => {
    expect(isCodEligible(COD_MAX_ORDER_TOTAL + 0.01)).toBe(false)
  })

  it('rejects invalid totals', () => {
    expect(isCodEligible(Number.NaN)).toBe(false)
    expect(isCodEligible(-1)).toBe(false)
  })
})
