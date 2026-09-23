export const COD_MAX_ORDER_TOTAL = 4000

export const COD_LIMIT_ERROR =
  'Cash on Delivery is available only for orders up to ₹4,000.'

export function isCodEligible(orderTotal: number): boolean {
  return (
    Number.isFinite(orderTotal) &&
    orderTotal >= 0 &&
    orderTotal <= COD_MAX_ORDER_TOTAL
  )
}
