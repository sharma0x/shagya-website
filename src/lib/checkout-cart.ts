import type { BasePayload } from 'payload'

export interface CheckoutCartSnapshot {
  cartId: string | number | null
  items: any[]
  updatedAt?: string | null
}

type PayloadClient = Pick<BasePayload, 'find'>

export async function resolveCheckoutCart(
  payload: PayloadClient,
  customerId: string | number | null | undefined,
  requestItems: unknown,
): Promise<CheckoutCartSnapshot | null> {
  if (customerId != null) {
    const carts = await payload.find({
      collection: 'carts',
      where: { customer: { equals: customerId } },
      limit: 1,
      depth: 2,
      overrideAccess: true,
    } as any)
    const cart = carts.docs[0] as any

    if (Array.isArray(cart?.items) && cart.items.length > 0) {
      return {
        cartId: cart.id as string | number,
        items: cart.items,
        updatedAt: cart.updatedAt ?? null,
      }
    }
  }

  if (Array.isArray(requestItems) && requestItems.length > 0) {
    return {
      cartId: null,
      items: requestItems,
      updatedAt: null,
    }
  }

  return null
}
