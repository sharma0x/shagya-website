import type { BasePayload } from 'payload'

export interface CheckoutCartSnapshot {
  cartId: string | number | null
  items: any[]
  updatedAt?: string | null
}

type PayloadClient = Pick<BasePayload, 'find'>

export class CheckoutCartValidationError extends Error {
  statusCode = 400
}

function normalizeCartItems(items: unknown[]): any[] {
  return items.map((item: any) => {
    if (
      typeof item?.quantity !== 'number' ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 10
    ) {
      throw new CheckoutCartValidationError(
        'Cart quantities must be whole numbers between 1 and 10',
      )
    }
    return item
  })
}

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
        items: normalizeCartItems(cart.items),
        updatedAt: cart.updatedAt ?? null,
      }
    }
  }

  if (Array.isArray(requestItems) && requestItems.length > 0) {
    return {
      cartId: null,
      items: normalizeCartItems(requestItems),
      updatedAt: null,
    }
  }

  return null
}
