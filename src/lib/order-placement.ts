import type { BasePayload } from 'payload'

interface OrderPlacementCart {
  cartId: string | number | null
  updatedAt?: string | null
}

interface CouponUsage {
  id: string | number
  usedCount: number
  usageLimit: number | null
  perUserUsageLimit: number | null
  customerEmail: string
}

interface OrderPlacementInput {
  orderData: Record<string, unknown>
  cart: OrderPlacementCart | null
  couponUsage?: CouponUsage | null
}

type TransactionalPayload = Pick<
  BasePayload,
  'db' | 'count' | 'create' | 'update'
> & {
  find?: BasePayload['find']
}

export async function placeOrderAndConsumeCart(
  payload: TransactionalPayload,
  { orderData, cart, couponUsage }: OrderPlacementInput,
) {
  const transactionId = await payload.db.beginTransaction()
  if (transactionId == null) {
    throw new Error('Database transactions are unavailable')
  }

  const req = { transactionID: transactionId }

  try {
    if (couponUsage) {
      if (couponUsage.perUserUsageLimit) {
        const pastOrders = await payload.count({
          collection: 'orders',
          where: {
            and: [
              { customerEmail: { equals: couponUsage.customerEmail } },
              { coupon: { equals: couponUsage.id } },
              { status: { not_equals: 'cancelled' } },
            ],
          },
          req,
        })
        if (pastOrders.totalDocs >= couponUsage.perUserUsageLimit) {
          throw new Error('Coupon per-user usage limit reached')
        }
      }

      let currentUsedCount = couponUsage.usedCount
      if (typeof payload.find === 'function') {
        const couponDoc = await payload.find({
          collection: 'coupons',
          where: { id: { equals: couponUsage.id } },
          limit: 1,
          overrideAccess: true,
          req,
        })
        if (couponDoc?.docs?.[0]) {
          currentUsedCount =
            (couponDoc.docs[0] as any).usedCount ?? couponUsage.usedCount
        }
      }

      if (
        couponUsage.usageLimit &&
        currentUsedCount >= couponUsage.usageLimit
      ) {
        throw new Error('Coupon usage limit reached')
      }

      const couponConditions: Array<Record<string, any>> = [
        { id: { equals: couponUsage.id } },
      ]
      if (couponUsage.usageLimit) {
        couponConditions.push({
          usedCount: { less_than: couponUsage.usageLimit },
        })
      }
      const couponWhere = { and: couponConditions }
      const couponUpdate = await payload.update({
        collection: 'coupons',
        where: couponWhere,
        data: { usedCount: currentUsedCount + 1 },
        overrideAccess: true,
        req,
      } as any)

      if (!couponUpdate?.docs || couponUpdate.docs.length === 0) {
        throw new Error('Coupon usage limit reached')
      }
    }

    const order = await payload.create({
      collection: 'orders',
      data: orderData,
      overrideAccess: true,
      req,
    } as any)

    if (cart?.cartId != null) {
      if (!cart.updatedAt) {
        throw new Error('Cart changed while the order was being placed')
      }

      const where = {
        and: [
          { id: { equals: cart.cartId } },
          { updatedAt: { equals: cart.updatedAt } },
        ],
      }
      const result = await payload.update({
        collection: 'carts',
        where,
        data: { items: [], subtotal: 0, coupon: null },
        overrideAccess: true,
        req,
      } as any)

      if (!result?.docs || result.docs.length === 0) {
        throw new Error('Cart changed while the order was being placed')
      }
    }

    await payload.db.commitTransaction(transactionId)
    return order
  } catch (error) {
    await payload.db.rollbackTransaction(transactionId)
    throw error
  }
}
