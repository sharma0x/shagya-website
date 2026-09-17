import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'

export type ApplicableCoupon = {
  id: string | number
  code: string
  description: string
  type: 'percentage' | 'fixed_amount' | 'free_shipping'
  value: number | null
  minCartValue: number
  maxDiscount: number | null
  endDate: string | null
}

/**
 * Resolve coupons applicable to a product and (optionally) the signed-in
 * customer. Uses Payload's Local API so callers never depend on an HTTP
 * round-trip to the public server URL (which Vercel SSO protection would
 * intercept on preview deployments).
 */
export async function getApplicableCoupons(
  productId?: string,
  headers?: Headers,
): Promise<ApplicableCoupon[]> {
  const payload = await getPayload({ config })

  const now = new Date().toISOString()

  const { docs: coupons } = await payload.find({
    collection: 'coupons',
    where: {
      and: [
        { isActive: { equals: true } },
        {
          or: [
            { startDate: { less_than: now } },
            { startDate: { exists: false } },
          ],
        },
        {
          or: [
            { endDate: { greater_than: now } },
            { endDate: { exists: false } },
          ],
        },
      ],
    },
    depth: 1,
    limit: 50,
    pagination: false,
  })

  let filtered: any[] = coupons

  if (productId) {
    const product = await payload.findByID({
      collection: 'products',
      id: productId,
      depth: 1,
    })

    const productCollections =
      (product as any).collections?.map((c: any) =>
        typeof c === 'object' ? c.id : c,
      ) || []

    filtered = coupons.filter((c: any) => {
      const productConditions = c.productsConditions || []
      const collectionConditions = c.collectionsConditions || []

      if (productConditions.length === 0 && collectionConditions.length === 0) {
        return true
      }

      const productMatch = productConditions.some(
        (p: any) =>
          String(typeof p === 'object' ? p.id : p) === String(productId),
      )

      const collectionMatch = collectionConditions.some((col: any) =>
        productCollections
          .map(String)
          .includes(String(typeof col === 'object' ? col.id : col)),
      )

      return productMatch || collectionMatch
    })
  }

  if (headers) {
    const session = await auth.api.getSession({ headers })
    if (session?.user) {
      const customers = await payload.find({
        collection: 'customers',
        where: { betterAuthUserId: { equals: session.user.id } },
        limit: 1,
        overrideAccess: true,
      })
      if (customers.docs.length > 0) {
        const customerId = String(customers.docs[0].id)
        filtered = filtered.filter((c: any) => {
          const customerConditions = c.customersConditions || []
          if (customerConditions.length === 0) return true
          return customerConditions.some(
            (cust: any) =>
              String(typeof cust === 'object' ? cust.id : cust) === customerId,
          )
        })
      }
    }
  }

  return filtered.map((c: any) => ({
    id: c.id,
    code: c.code,
    description: c.description || '',
    type: c.type,
    value: c.value,
    minCartValue: c.minCartValue || 0,
    maxDiscount: c.maxDiscount || null,
    endDate: c.endDate || null,
  }))
}

export async function validateCouponForCart(
  payload: any,
  code: string,
  subtotal: number,
  productIds: string[],
  user?: any,
): Promise<{ valid: boolean; error?: string; coupon?: any }> {
  const normalizedCode = code.trim().toUpperCase()

  const coupons = await payload.find({
    collection: 'coupons',
    where: { code: { equals: normalizedCode } },
    limit: 1,
  })

  if (coupons.docs.length === 0) {
    return { valid: false, error: 'Invalid coupon code' }
  }

  const coupon = coupons.docs[0] as any

  if (!coupon.isActive) {
    return { valid: false, error: 'This coupon is no longer active' }
  }

  const now = new Date()
  if (coupon.startDate && new Date(coupon.startDate) > now) {
    return { valid: false, error: 'This coupon is not yet active' }
  }
  if (coupon.endDate && new Date(coupon.endDate) < now) {
    return { valid: false, error: 'This coupon has expired' }
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return { valid: false, error: 'This coupon has reached its usage limit' }
  }

  if (coupon.perUserUsageLimit && user) {
    const customers = await payload.find({
      collection: 'customers',
      where: { betterAuthUserId: { equals: user.id } },
      limit: 1,
    })
    if (customers.docs.length > 0) {
      const customerEmail = customers.docs[0].email
      const pastOrders = await payload.count({
        collection: 'orders',
        where: {
          and: [
            { customerEmail: { equals: customerEmail } },
            { coupon: { equals: coupon.id } },
            { status: { not_equals: 'cancelled' } },
          ],
        },
      })
      if (pastOrders.totalDocs >= coupon.perUserUsageLimit) {
        return {
          valid: false,
          error: 'You have already reached the usage limit for this coupon',
        }
      }
    }
  }

  if (coupon.minCartValue && subtotal < coupon.minCartValue) {
    const shortage = coupon.minCartValue - subtotal
    return {
      valid: false,
      error: `Add items worth ₹${shortage.toLocaleString('en-IN')} more to apply ${normalizedCode}`,
    }
  }

  if (coupon.customersConditions?.length > 0) {
    if (!user) {
      return {
        valid: false,
        error: 'Please log in to use this exclusive offer',
      }
    }

    const customers = await payload.find({
      collection: 'customers',
      where: { betterAuthUserId: { equals: user.id } },
      limit: 1,
    })
    if (customers.docs.length === 0) {
      return { valid: false, error: 'Customer not found' }
    }
    const customerId = String(customers.docs[0].id)
    const allowedIds = coupon.customersConditions.map((c: any) =>
      String(typeof c === 'object' ? c.id : c),
    )
    if (!allowedIds.includes(customerId)) {
      return {
        valid: false,
        error: `${normalizedCode} is an exclusive offer — not available for your account`,
      }
    }
  }

  const hasProductConditions = coupon.productsConditions?.length > 0
  const hasCollectionConditions = coupon.collectionsConditions?.length > 0

  if ((hasProductConditions || hasCollectionConditions) && productIds?.length) {
    const conditionProductIds = hasProductConditions
      ? coupon.productsConditions.map((p: any) =>
          String(typeof p === 'object' ? p.id : p),
        )
      : []

    const conditionCollectionIds = hasCollectionConditions
      ? coupon.collectionsConditions.map((c: any) =>
          String(typeof c === 'object' ? c.id : c),
        )
      : []

    const productMatch = hasProductConditions
      ? productIds.some((pid: string) =>
          conditionProductIds.includes(String(pid)),
        )
      : false

    let collectionMatch = false
    if (hasCollectionConditions && !productMatch) {
      const cartProducts = await payload.find({
        collection: 'products',
        where: { id: { in: productIds.map((id: string) => Number(id)) } },
        depth: 0,
        limit: 100,
        pagination: false,
      })
      collectionMatch = (cartProducts.docs as any[]).some((p: any) => {
        const colIds =
          p.collections?.map((c: any) =>
            String(typeof c === 'object' ? c.id : c),
          ) || []
        return colIds.some((cid: string) =>
          conditionCollectionIds.includes(cid),
        )
      })
    }

    if (!productMatch && !collectionMatch) {
      let hint = ''
      if (hasProductConditions) {
        const productDocs = await payload.find({
          collection: 'products',
          where: { id: { in: conditionProductIds.map(Number) } },
          depth: 0,
          limit: 3,
          pagination: false,
        })
        const names = (productDocs.docs as any[]).map((p: any) => p.name)
        if (names.length === 1) {
          hint = `Add '${names[0]}' to your cart`
        } else if (names.length > 1) {
          hint = `Add products like '${names[0]}' or '${names[1]}'`
        }
      } else if (hasCollectionConditions) {
        const collectionDocs = await payload.find({
          collection: 'collections',
          where: { id: { in: conditionCollectionIds.map(Number) } },
          depth: 0,
          limit: 3,
          pagination: false,
        })
        const names = (collectionDocs.docs as any[]).map((c: any) => c.name)
        if (names.length === 1) {
          hint = `Add ${names[0].toLowerCase()} products to your cart`
        } else if (names.length > 1) {
          hint = `Add ${names.map((n: string) => n.toLowerCase()).join(' or ')} products`
        }
      }
      return {
        valid: false,
        error: hint || `${normalizedCode} does not apply to items in your cart`,
      }
    }
  }

  let discount = 0
  if (coupon.type === 'percentage') {
    discount = Math.round((subtotal * coupon.value) / 100)
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount
    }
  } else if (coupon.type === 'fixed_amount') {
    discount = coupon.value
  } else if (coupon.type === 'free_shipping') {
    discount = 0
  }

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      maxDiscount: coupon.maxDiscount,
      discount,
      usedCount: coupon.usedCount || 0,
    },
  }
}
