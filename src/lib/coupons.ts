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

    const productCategories =
      (product as any).categories?.map((c: any) =>
        typeof c === 'object' ? c.id : c,
      ) || []

    filtered = coupons.filter((c: any) => {
      const productConditions = c.productsConditions || []
      const categoryConditions = c.categoriesConditions || []

      if (productConditions.length === 0 && categoryConditions.length === 0) {
        return true
      }

      const productMatch = productConditions.some(
        (p: any) =>
          String(typeof p === 'object' ? p.id : p) === String(productId),
      )

      const categoryMatch = categoryConditions.some((cat: any) =>
        productCategories
          .map(String)
          .includes(String(typeof cat === 'object' ? cat.id : cat)),
      )

      return productMatch || categoryMatch
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
