import type { BasePayload } from 'payload'

interface OrderPlacementCart {
  cartId: string | number | null
  updatedAt?: string | null
}

interface OrderPlacementInput {
  orderData: Record<string, unknown>
  cart: OrderPlacementCart | null
}

type TransactionalPayload = Pick<BasePayload, 'db' | 'create' | 'update'>

export async function placeOrderAndConsumeCart(
  payload: TransactionalPayload,
  { orderData, cart }: OrderPlacementInput,
) {
  const transactionId = await payload.db.beginTransaction()
  if (transactionId == null) {
    throw new Error('Database transactions are unavailable')
  }

  const req = { transactionID: transactionId }

  try {
    const order = await payload.create({
      collection: 'orders',
      data: orderData,
      overrideAccess: true,
      req,
    } as any)

    if (cart?.cartId != null) {
      const where = cart.updatedAt
        ? {
            and: [
              { id: { equals: cart.cartId } },
              { updatedAt: { equals: cart.updatedAt } },
            ],
          }
        : { id: { equals: cart.cartId } }
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
